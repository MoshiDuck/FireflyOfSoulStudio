// app/components/booking/BookingProcess.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useFormDataManager } from "~/hooks/useFormDataManager";
import { UncontrolledTextArea } from "~/components/ui/UncontrolledTextArea";
import { UncontrolledInput } from "~/components/ui/UncontrolledInput";
import StripePayment from "~/components/payment/StripePayment";
import type { Service, TimeSlot, BookedSlot, ApiResponse, BookingProcessProps, CartItemComponent } from "~/types/api";
import { STEP_CONFIG } from "~/config/booking";
import { API_ENDPOINTS } from "~/config/api";

interface FinalizeInvoiceResponse {
    success: boolean;
    invoiceId: string;
    invoiceUrl: string;
    invoicePdf: string;
    status: string;
    message: string;
    error?: string;
}


export function BookingProcess({ service, cart, onBack, onComplete, apiEndpoint, type }: BookingProcessProps & { cart?: CartItemComponent[] }) {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const paymentInProgress = useRef(false);

    if (!service && (!cart || cart.length === 0)) {
        return (
            <div className="booking-error">
                <h3>Erreur de configuration</h3>
                <p>Service ou panier requis pour le processus de réservation.</p>
                <button onClick={onBack} className="back-btn-minimal">
                    ← Retour
                </button>
            </div>
        );
    }

    const { updateField, getFormData, reset } = useFormDataManager({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    });

    const calculatePaymentAmounts = useCallback(() => {
        if (cart && cart.length > 0) {
            const totalAmount = cart.reduce((total, item) => {
                const price = item.selectedCapacity?.price || item.service.price;
                return total + (price * item.quantity);
            }, 0);

            if (type === 'session') {
                const depositAmount = Math.round(totalAmount * 0.30);
                const remainingAmount = totalAmount - depositAmount;
                return { depositAmount, remainingAmount, totalAmount };
            } else {
                return { depositAmount: totalAmount, remainingAmount: 0, totalAmount };
            }
        } else if (service) {
            if (type === 'session') {
                const depositAmount = Math.round(service.price * 0.30);
                const remainingAmount = service.price - depositAmount;
                return { depositAmount, remainingAmount, totalAmount: service.price };
            } else {
                return { depositAmount: service.price, remainingAmount: 0, totalAmount: service.price };
            }
        }
        return { depositAmount: 0, remainingAmount: 0, totalAmount: 0 };
    }, [service, cart, type]);

    const paymentAmounts = calculatePaymentAmounts();
    const TOTAL_STEPS = type === 'session' ? 4 : 3;

    useEffect(() => {
        const dates: string[] = [];
        const today = new Date();
        for (let i = 1; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            if (date.getDay() !== 0 && date.getDay() !== 6) {
                dates.push(date.toISOString().split('T')[0]);
            }
        }
        setAvailableDates(dates);
    }, []);

    useEffect(() => {
        const fetchBookedSlots = async () => {
            if (selectedDate && type === 'session') {
                try {
                    const response = await fetch(`${apiEndpoint}?date=${selectedDate}`);
                    if (response.ok) {
                        const bookedSlots = await response.json() as BookedSlot[];
                        const bookedTimes = bookedSlots.map(slot => slot.reservation_time);
                        const allTimeSlots: TimeSlot[] = [];
                        for (let hour = 9; hour < 18; hour++) {
                            const time = `${hour.toString().padStart(2, '0')}:00`;
                            allTimeSlots.push({ time, available: !bookedTimes.includes(time) });
                        }
                        setAvailableTimes(allTimeSlots);
                    }
                } catch (error) {
                    console.error('Erreur réseau:', error);
                    generateFallbackTimeSlots();
                }
            }
        };

        const generateFallbackTimeSlots = () => {
            const times: TimeSlot[] = [];
            for (let hour = 9; hour < 18; hour++) {
                times.push({ time: `${hour.toString().padStart(2, '0')}:00`, available: true });
            }
            setAvailableTimes(times);
        };

        if (type === 'session') {
            fetchBookedSlots();
        }
    }, [selectedDate, apiEndpoint, type]);

    const goToNextStep = useCallback(() => {
        if (step < TOTAL_STEPS && !paymentCompleted) {
            setStep(step + 1);
        }
    }, [step, TOTAL_STEPS, paymentCompleted]);

    const goToPreviousStep = useCallback(() => {
        if (step > 1 && !paymentCompleted) {
            setStep(step - 1);
        } else {
            onBack();
        }
    }, [step, paymentCompleted, onBack]);

    const getCurrentStepConfig = useCallback(() => {
        const steps = STEP_CONFIG[type];
        return steps[step - 1] || steps[0];
    }, [step, type]);

    const handleFieldChange = useCallback((value: string, fieldName: string) => {
        updateField(fieldName as keyof ReturnType<typeof getFormData>, value);
    }, [updateField, getFormData]);

    const validateForm = useCallback((formData: ReturnType<typeof getFormData>) => {
        if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim()) {
            return 'Veuillez remplir tous les champs obligatoires';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            return 'Veuillez entrer une adresse email valide';
        }
        if (type === 'session' && (!selectedDate || !selectedTime)) {
            return 'Veuillez sélectionner une date et une heure';
        }
        if (type === 'session') {
            const selectedSlot = availableTimes.find(slot => slot.time === selectedTime);
            if (selectedSlot && !selectedSlot.available) {
                return 'Ce créneau a été réservé entre-temps. Veuillez choisir un autre horaire.';
            }
        }
        return null;
    }, [type, selectedDate, selectedTime, availableTimes]);

    const generateStripeComment = useCallback((formData: ReturnType<typeof getFormData>, paymentType: 'deposit' | 'full') => {
        const customerInfo = `Client: ${formData.firstName} ${formData.lastName} - Email: ${formData.email}`;
        const phoneInfo = formData.phone ? ` - Tél: ${formData.phone}` : '';
        let serviceInfo = '';

        if (cart && cart.length > 0) {
            const itemsDescription = cart.map(item =>
                `${item.service.name} (x${item.quantity})`
            ).join(', ');
            serviceInfo = `Panier: ${itemsDescription} - Total: ${paymentAmounts.totalAmount}€`;
        } else if (service) {
            serviceInfo = `Service: ${service.name} - Prix: ${service.price}€`;
        }

        let paymentInfo = '';
        if (type === 'session') {
            paymentInfo = paymentType === 'deposit'
                ? ` - Acompte: ${paymentAmounts.depositAmount}€ (30%)`
                : ` - Solde: ${paymentAmounts.remainingAmount}€ (70%)`;
        } else {
            paymentInfo = ` - Paiement complet: ${paymentAmounts.totalAmount}€`;
        }

        let bookingInfo = '';
        if (type === 'session') {
            const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : '';
            bookingInfo = ` - Réservation: ${formattedDate} à ${selectedTime}`;
        } else {
            bookingInfo = ' - Achat produit en ligne';
        }

        const messageInfo = formData.message ? ` - Message: ${formData.message.substring(0, 200)}` : '';
        const fullComment = `${customerInfo}${phoneInfo} | ${serviceInfo}${paymentInfo}${bookingInfo}${messageInfo}`;
        return fullComment.substring(0, 500);
    }, [service, cart, type, paymentAmounts, selectedDate, selectedTime]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentCompleted) {
            setMessage({ type: 'error', text: 'Le paiement a déjà été effectué. Veuillez patienter...' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            const currentFormData = getFormData();
            const validationError = validateForm(currentFormData);
            if (validationError) {
                setMessage({ type: 'error', text: validationError });
                setIsSubmitting(false);
                return;
            }
            goToNextStep();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la validation du formulaire' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string, paymentType: 'deposit' | 'full' = 'deposit') => {
        if (paymentInProgress.current) return;
        paymentInProgress.current = true;
        setPaymentCompleted(true);

        try {
            const currentFormData = getFormData();
            const cartItems = cart && cart.length > 0
                ? cart.map(item => ({
                    productId: item.service.id,
                    productName: item.service.name,
                    productType: item.service.type,
                    quantity: item.quantity,
                    price: item.selectedCapacity?.price || item.service.price
                }))
                : service
                    ? [{
                        productId: service.id,
                        productName: service.name,
                        productType: service.type,
                        quantity: 1,
                        price: service.price
                    }]
                    : [];

            const requestData = type === 'session' ? {
                firstName: currentFormData.firstName.trim(),
                lastName: currentFormData.lastName.trim(),
                email: currentFormData.email.trim(),
                phone: currentFormData.phone?.trim() || '',
                cart: cartItems,
                total: paymentAmounts.totalAmount,
                amountPaid: paymentType === 'deposit' ? paymentAmounts.depositAmount : paymentAmounts.totalAmount,
                paymentType: paymentType,
                date: selectedDate,
                time: selectedTime,
                type: 'session',
                paymentIntentId: paymentIntentId,
                paymentStatus: paymentType === 'deposit' ? 'deposit_paid' : 'paid'
            } : {
                firstName: currentFormData.firstName.trim(),
                lastName: currentFormData.lastName.trim(),
                email: currentFormData.email.trim(),
                phone: currentFormData.phone?.trim() || '',
                cart: cartItems,
                total: paymentAmounts.totalAmount,
                amountPaid: paymentAmounts.totalAmount,
                paymentType: 'full',
                date: null,
                time: null,
                type: 'product',
                paymentIntentId: paymentIntentId,
                paymentStatus: 'paid'
            };

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            const result = await response.json() as ApiResponse;

            if (response.ok && 'success' in result && result.success) {
                let successMessage = type === 'session' && paymentType === 'deposit'
                    ? '✅ Acompte de 30% confirmé ! Votre séance est réservée. Le solde sera à régler après la séance.'
                    : '✅ Paiement confirmé ! Votre commande est validée.';

                setMessage({ type: 'success', text: successMessage });

                setTimeout(() => {
                    onComplete();
                    reset();
                    setSelectedDate("");
                    setSelectedTime("");
                    setStep(1);
                    setPaymentCompleted(false);
                    paymentInProgress.current = false;
                }, 2000);
            } else {
                throw new Error('Erreur lors de la confirmation de la commande');
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Paiement réussi mais erreur lors de la confirmation. Contactez-nous.'
            });
            paymentInProgress.current = false;
        }
    };

    const handlePaymentCancel = useCallback(() => {
        if (!paymentCompleted) {
            goToPreviousStep();
        }
    }, [goToPreviousStep, paymentCompleted]);

    const formatDate = useCallback((dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    const StepHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
        <div className="booking-step-header-modern">
            <button className="back-btn-minimal" onClick={goToPreviousStep}>
                <span className="back-icon">←</span>
            </button>
            <div className="step-title-modern">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>
        </div>
    );

    const ServiceCard = () => (
        <div className="service-card-modern">
            <div className="service-icon">📸</div>
            <div className="service-info">
                <h3>{service?.name || 'Votre Commande'}</h3>
                <p>{service?.description || `${cart?.length} article${cart && cart.length > 1 ? 's' : ''} dans le panier`}</p>
            </div>
            <div className="service-price">{paymentAmounts.totalAmount}€</div>
        </div>
    );

    const Step1 = () => (
        <motion.div
            className="booking-step-modern"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <StepHeader
                title="Choisissez votre date"
                subtitle="Sélectionnez une date pour votre séance"
            />

            <div className="step-content-spacing">
                <ServiceCard />
            </div>

            <div className="date-grid-modern">
                {availableDates.map(date => (
                    <motion.button
                        key={date}
                        onClick={() => {
                            setSelectedDate(date);
                            goToNextStep();
                        }}
                        className="date-option-modern"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="date-day">{new Date(date).getDate()}</div>
                        <div className="date-weekday">
                            {new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </div>
                        <div className="date-month">
                            {new Date(date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );

    const Step2 = () => (
        <motion.div
            className="booking-step-modern"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <StepHeader
                title="Sélectionnez l'heure"
                subtitle={`Créneaux disponibles pour le ${formatDate(selectedDate)}`}
            />

            <div className="step-content-spacing">
                <ServiceCard />
            </div>

            <div className="time-grid-modern">
                {availableTimes.map(slot => (
                    <motion.button
                        key={slot.time}
                        onClick={() => {
                            if (slot.available) {
                                setSelectedTime(slot.time);
                                goToNextStep();
                            }
                        }}
                        disabled={!slot.available}
                        className={`time-option-modern ${slot.available ? 'available' : 'booked'}`}
                        whileHover={slot.available ? { scale: 1.02 } : {}}
                        whileTap={slot.available ? { scale: 0.98 } : {}}
                    >
                        <div className="time-slot">{slot.time}</div>
                        <div className="time-status">
                            {slot.available ? 'Disponible' : 'Réservé'}
                        </div>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );

    const Step3 = () => {
        const currentFormData = getFormData();

        return (
            <motion.div
                className="booking-step-modern"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <StepHeader
                    title="Vos informations"
                    subtitle="Nous utiliserons ces informations pour confirmer votre réservation"
                />

                <div className="summary-section">
                    <ServiceCard />

                    {type === 'session' && selectedDate && (
                        <div className="booking-details-modern">
                            <div className="detail-item">
                                <span>Date</span>
                                <span>{formatDate(selectedDate)}</span>
                            </div>
                            <div className="detail-item">
                                <span>Heure</span>
                                <span>{selectedTime}</span>
                            </div>
                        </div>
                    )}

                    <div className="payment-breakdown-modern">
                        {type === 'session' ? (
                            <>
                                <div className="amount-line">
                                    <span>Acompte (30%)</span>
                                    <span>{paymentAmounts.depositAmount}€</span>
                                </div>
                                <div className="amount-line">
                                    <span>Solde après séance</span>
                                    <span>{paymentAmounts.remainingAmount}€</span>
                                </div>
                                <div className="amount-divider"></div>
                                <div className="amount-line total">
                                    <span>Total</span>
                                    <span>{paymentAmounts.totalAmount}€</span>
                                </div>
                            </>
                        ) : (
                            <div className="amount-line total">
                                <span>Total</span>
                                <span>{paymentAmounts.totalAmount}€</span>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="booking-form-modern">
                    <div className="form-grid-modern">
                        <div className="form-group-modern">
                            <label>Prénom *</label>
                            <UncontrolledInput
                                type="text"
                                name="firstName"
                                defaultValue={currentFormData.firstName}
                                onValueChange={handleFieldChange}
                                required
                                className="form-input-modern"
                                placeholder="Marie"
                                autoComplete="given-name"
                                autoFocus={true}
                            />
                        </div>
                        <div className="form-group-modern">
                            <label>Nom *</label>
                            <UncontrolledInput
                                type="text"
                                name="lastName"
                                defaultValue={currentFormData.lastName}
                                onValueChange={handleFieldChange}
                                required
                                className="form-input-modern"
                                placeholder="Dupont"
                                autoComplete="family-name"
                            />
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <label>Email *</label>
                        <UncontrolledInput
                            type="email"
                            name="email"
                            defaultValue={currentFormData.email}
                            onValueChange={handleFieldChange}
                            required
                            className="form-input-modern"
                            placeholder="votre.email@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group-modern">
                        <label>Téléphone (Optionnel)</label>
                        <UncontrolledInput
                            type="tel"
                            name="phone"
                            defaultValue={currentFormData.phone}
                            onValueChange={handleFieldChange}
                            className="form-input-modern"
                            placeholder="+33 6 12 34 56 78"
                            autoComplete="tel"
                        />
                    </div>

                    <div className="form-group-modern">
                        <label>Message (Optionnel)</label>
                        <UncontrolledTextArea
                            name="message"
                            defaultValue={currentFormData.message}
                            onValueChange={handleFieldChange}
                            rows={3}
                            className="form-input-modern"
                            placeholder={`Informations supplémentaires sur votre ${type === 'session' ? 'projet' : 'commande'}...`}
                        />
                    </div>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                className={`status-message ${message.type}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        type="submit"
                        disabled={isSubmitting || paymentCompleted}
                        className="submit-btn-modern"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isSubmitting ? 'Validation...' : paymentCompleted ? 'Paiement confirmé...' :
                            type === 'session'
                                ? `Payer l'acompte - ${paymentAmounts.depositAmount}€`
                                : `Continuer vers le paiement - ${paymentAmounts.totalAmount}€`}
                    </motion.button>
                </form>
            </motion.div>
        );
    };

    const Step4 = () => {
        const currentFormData = getFormData();

        return (
            <motion.div
                className="booking-step-modern"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <StepHeader
                    title="Paiement sécurisé"
                    subtitle="Finalisez votre réservation avec Stripe"
                />

                <div className="summary-section">
                    <ServiceCard />
                    <div className="payment-breakdown-modern">
                        <div className="amount-line total">
                            <span>Montant à payer</span>
                            <span>
                {type === 'session' ? paymentAmounts.depositAmount : paymentAmounts.totalAmount}€
              </span>
                        </div>
                    </div>
                </div>

                <div className="payment-section-modern">
                    <AnimatePresence mode="wait">
                        {paymentCompleted ? (
                            <motion.div
                                className="payment-success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <div className="success-check">✓</div>
                                <h3>Paiement accepté</h3>
                                <p>Traitement de votre commande...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <StripePayment
                                    amount={type === 'session' ? paymentAmounts.depositAmount : paymentAmounts.totalAmount}
                                    serviceName={cart && cart.length > 0 ? `Panier (${cart.length} articles)` : service?.name || ''}
                                    onSuccess={(paymentIntentId) => handlePaymentSuccess(paymentIntentId, type === 'session' ? 'deposit' : 'full')}
                                    onError={(error) => setMessage({type: 'error', text: error})}
                                    onCancel={handlePaymentCancel}
                                    type={type}
                                    paymentType={type === 'session' ? 'deposit' : 'full'}
                                    stripePriceId={service?.stripePriceId}
                                    stripeDepositPriceId={service?.stripeDepositPriceId}
                                    totalServicePrice={paymentAmounts.totalAmount}
                                    useInvoice={true}
                                    customerEmail={currentFormData.email}
                                    customerName={`${currentFormData.firstName} ${currentFormData.lastName}`}
                                    description={generateStripeComment(currentFormData, type === 'session' ? 'deposit' : 'full')}
                                    phone={currentFormData.phone}
                                    bookingData={getFormData()}                               />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            className={`status-message ${message.type}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {message.text}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    const steps = type === 'session'
        ? [
            { number: 1, label: 'Date' },
            { number: 2, label: 'Heure' },
            { number: 3, label: 'Info' },
            { number: 4, label: 'Paiement' }
        ]
        : [
            { number: 1, label: 'Commande' },
            { number: 2, label: 'Paiement' }
        ];

    const renderCurrentStep = () => {
        if (type === 'session') {
            switch (step) {
                case 1: return <Step1 />;
                case 2: return <Step2 />;
                case 3: return <Step3 />;
                case 4: return <Step4 />;
                default: return <Step1 />;
            }
        } else {
            switch (step) {
                case 1: return <Step3 />;
                case 2: return <Step4 />;
                default: return <Step3 />;
            }
        }
    };

    return (
        <motion.section
            className="booking-section-modern"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="booking-container-modern">
                <div className="progress-bar-modern">
                    {steps.map((stepItem, index) => (
                        <div key={stepItem.number} className="progress-step-modern">
                            <div className={`step-indicator ${step >= stepItem.number ? 'active' : ''}`}>
                                {step > stepItem.number ? '✓' : stepItem.number}
                            </div>
                            <span className="step-label">{stepItem.label}</span>
                            {index < steps.length - 1 && (
                                <div className={`step-connector ${step > stepItem.number ? 'active' : ''}`}></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="step-content-modern">
                    <AnimatePresence mode="wait">
                        {renderCurrentStep()}
                    </AnimatePresence>
                </div>
            </div>
        </motion.section>
    );
}