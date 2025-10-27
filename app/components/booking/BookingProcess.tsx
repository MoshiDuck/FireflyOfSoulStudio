// Info : app/components/booking/BookingProcess.tsx
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useFormDataManager } from "~/hooks/useFormDataManager";
import { UncontrolledTextArea } from "~/components/ui/UncontrolledTextArea";
import { UncontrolledInput } from "~/components/ui/UncontrolledInput";
import StripePayment from "~/components/payment/StripePayment";

// Import des types et configurations centralisés
import type {
    Service,
    TimeSlot,
    BookedSlot,
    ApiResponse,
    BookingProcessProps,
    CartItem
} from "~/types/api";
import { STEP_CONFIG } from "~/config/booking";

// Import des composants partagés
import { StepHeader } from "~/components/booking/StepHeader";
import { ServiceInfo } from "~/components/booking/ServiceInfo";
import { BookingSummary } from "~/components/booking/BookingSummary";

export function BookingProcess({ service, onBack, onComplete, apiEndpoint, type }: BookingProcessProps) {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'form' | 'payment'>('form');

    const { updateField, getFormData, reset } = useFormDataManager({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    });

    const TOTAL_STEPS = type === 'session' ? 3 : 2;

    // Générer les dates disponibles (14 prochains jours ouvrés)
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

    // Récupérer les créneaux réservés pour la date sélectionnée
    useEffect(() => {
        const fetchBookedSlots = async () => {
            if (selectedDate) {
                try {
                    const response = await fetch(`${apiEndpoint}?date=${selectedDate}`);
                    if (response.ok) {
                        const bookedSlots = await response.json() as BookedSlot[];
                        const bookedTimes = bookedSlots.map(slot => slot.reservation_time);

                        const allTimeSlots: TimeSlot[] = [];
                        for (let hour = 9; hour < 18; hour++) {
                            const time = `${hour.toString().padStart(2, '0')}:00`;
                            allTimeSlots.push({
                                time,
                                available: !bookedTimes.includes(time)
                            });
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
                times.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    available: true
                });
            }
            setAvailableTimes(times);
        };

        if (type === 'session') {
            fetchBookedSlots();
        }
    }, [selectedDate, apiEndpoint, type]);

    // LOGIQUE DE GESTION DES ÉTAPES
    const goToNextStep = () => {
        if (step < TOTAL_STEPS) {
            setStep(step + 1);
        }
    };

    const goToPreviousStep = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            onBack();
        }
    };

    const getCurrentStepConfig = () => {
        const steps = STEP_CONFIG[type];
        return steps[step - 1] || steps[0];
    };

    const handleFieldChange = (value: string, fieldName: string) => {
        updateField(fieldName as keyof ReturnType<typeof getFormData>, value);
    };

    // VALIDATION UNIFIÉE
    const validateForm = (formData: ReturnType<typeof getFormData>) => {
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const formData = getFormData();

            // VALIDATION UNIFIÉE
            const validationError = validateForm(formData);
            if (validationError) {
                setMessage({ type: 'error', text: validationError });
                setIsSubmitting(false);
                return;
            }

            // Passer au paiement
            setPaymentStep('payment');
            setShowPayment(true);
            setIsSubmitting(false);

        } catch (error) {
            console.error('Erreur validation:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la validation du formulaire'
            });
            setIsSubmitting(false);
        }
    };

    // Nouvelle fonction pour gérer le succès du paiement
    const handlePaymentSuccess = async (paymentIntentId: string) => {
        try {
            const formData = getFormData();

            const requestData = type === 'session' ? {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phone: formData.phone?.trim() || '',
                cart: [{
                    productId: service.id,
                    productName: service.name,
                    productType: service.type,
                    quantity: 1,
                    price: service.price
                }],
                total: service.price,
                date: selectedDate,
                time: selectedTime,
                type: 'session',
                paymentIntentId: paymentIntentId,
                paymentStatus: 'paid'
            } : {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phone: formData.phone?.trim() || '',
                cart: [{
                    productId: service.id,
                    productName: service.name,
                    productType: service.type,
                    quantity: 1,
                    price: service.price
                }],
                total: service.price,
                date: null,
                time: null,
                type: 'product',
                paymentIntentId: paymentIntentId,
                paymentStatus: 'paid'
            };

            // Envoyer les données de réservation avec l'ID de paiement
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            const result = await response.json() as ApiResponse;

            if (response.ok && 'success' in result && result.success) {
                setMessage({
                    type: 'success',
                    text: '✅ Paiement confirmé ! Votre réservation est validée.'
                });

                setTimeout(() => {
                    onComplete();
                    reset();
                    setSelectedDate("");
                    setSelectedTime("");
                    setShowPayment(false);
                    setPaymentStep('form');
                }, 3000);
            } else {
                throw new Error('Erreur lors de la confirmation de la réservation');
            }
        } catch (error) {
            console.error('Erreur confirmation réservation:', error);
            setMessage({
                type: 'error',
                text: 'Paiement réussi mais erreur lors de la confirmation. Contactez-nous.'
            });
        }
    };

    // Fonction pour annuler le paiement
    const handlePaymentCancel = () => {
        setShowPayment(false);
        setPaymentStep('form');
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    // ÉTAPES SIMPLIFIÉES AVEC COMPOSANTS PARTAGÉS
    const Step1 = () => {
        const stepConfig = getCurrentStepConfig();
        return (
            <div className="booking-step">
                <StepHeader
                    onBack={goToPreviousStep}
                    title={stepConfig.title}
                    backLabel={stepConfig.backLabel}
                />
                <ServiceInfo service={service} />
                <div className="date-selection-grid">
                    {availableDates.map(date => (
                        <motion.button
                            key={date}
                            onClick={() => {
                                setSelectedDate(date);
                                goToNextStep();
                            }}
                            className="date-option"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
            </div>
        );
    };

    const Step2 = () => {
        const stepConfig = getCurrentStepConfig();
        return (
            <div className="booking-step">
                <StepHeader
                    onBack={goToPreviousStep}
                    title={stepConfig.title}
                    backLabel={stepConfig.backLabel}
                />
                <ServiceInfo
                    service={service}
                    additionalInfo={formatDate(selectedDate)}
                />
                <div className="time-selection-grid">
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
                            className={`time-option ${slot.available ? 'available' : 'booked'}`}
                            whileHover={slot.available ? { scale: 1.05 } : {}}
                            whileTap={slot.available ? { scale: 0.95 } : {}}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            <div className="time-slot">{slot.time}</div>
                            <div className="time-status">
                                {slot.available ? 'Disponible' : 'Réservé'}
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    };

    // FORMULAIRE UNIFIÉ POUR TOUS LES TYPES
    const BookingForm = () => {
        const stepConfig = getCurrentStepConfig();
        return (
            <div className="booking-step">
                <StepHeader
                    onBack={goToPreviousStep}
                    title={stepConfig.title}
                    backLabel={stepConfig.backLabel}
                />

                <BookingSummary
                    type={type}
                    service={service}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    formatDate={formatDate}
                />

                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Prénom *</label>
                            <UncontrolledInput
                                type="text"
                                name="firstName"
                                defaultValue=""
                                onValueChange={handleFieldChange}
                                required
                                className="form-input"
                                placeholder="Marie"
                                autoComplete="given-name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom *</label>
                            <UncontrolledInput
                                type="text"
                                name="lastName"
                                defaultValue=""
                                onValueChange={handleFieldChange}
                                required
                                className="form-input"
                                placeholder="Dupont"
                                autoComplete="family-name"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <UncontrolledInput
                            type="email"
                            name="email"
                            defaultValue=""
                            onValueChange={handleFieldChange}
                            required
                            className="form-input"
                            placeholder="votre.email@example.com"
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label>Téléphone (Optionnel)</label>
                        <UncontrolledInput
                            type="tel"
                            name="phone"
                            defaultValue=""
                            onValueChange={handleFieldChange}
                            className="form-input"
                            placeholder="+33 6 12 34 56 78"
                            autoComplete="tel"
                        />
                    </div>

                    <div className="form-group">
                        <label>Message (Optionnel)</label>
                        <UncontrolledTextArea
                            name="message"
                            defaultValue=""
                            onValueChange={handleFieldChange}
                            rows={4}
                            className="form-input"
                            placeholder={`Des informations supplémentaires sur votre ${type === 'session' ? 'projet' : 'commande'}...`}
                        />
                    </div>

                    {message && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="submit-button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        {isSubmitting ? 'Confirmation...' : `Procéder au Paiement - ${service.price}€`}
                    </motion.button>
                </form>
            </div>
        );
    };

    const steps = STEP_CONFIG[type];

    // RENDU CONDITIONNEL DES ÉTAPES SIMPLIFIÉ
    const renderCurrentStep = () => {
        if (type === 'session') {
            switch (step) {
                case 1: return <Step1 />;
                case 2: return <Step2 />;
                case 3: return <BookingForm />;
                default: return <Step1 />;
            }
        } else {
            // Pour les produits, on affiche directement le formulaire
            return <BookingForm />;
        }
    };

    return (
        <>
            <motion.section
                className="booking-section"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="container">
                    <div className="booking-process">
                        <div className="booking-progress">
                            {steps.map((stepItem) => (
                                <div key={stepItem.number} className={`progress-step ${step >= stepItem.number ? 'active' : ''}`}>
                                    <div className="step-number">{stepItem.number}</div>
                                    <span>{stepItem.label}</span>
                                </div>
                            ))}
                        </div>

                        {renderCurrentStep()}
                    </div>
                </div>
            </motion.section>

            {/* Modal de paiement */}
            {showPayment && (
                <div className="payment-overlay">
                    <div className="payment-modal">
                        <StripePayment
                            amount={service.price}
                            serviceName={service.name}
                            bookingData={getFormData()}
                            onSuccess={handlePaymentSuccess}
                            onError={(error) => setMessage({ type: 'error', text: error })}
                            onCancel={handlePaymentCancel}
                        />
                    </div>
                </div>
            )}
        </>
    );
}