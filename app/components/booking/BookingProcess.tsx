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

    // CORRECTION : Utilisation unique de useFormDataManager sans état local en double
    const { updateField, getFormData, reset } = useFormDataManager({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    });

    // Calcul du nombre total d'étapes selon le type
    const TOTAL_STEPS = type === 'session' ? 4 : 3; // +1 pour l'étape paiement

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

    // CORRECTION : Gestion simplifiée du changement de champ
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

    // Fonction pour générer le commentaire détaillé pour Stripe
    const generateStripeComment = (formData: ReturnType<typeof getFormData>) => {
        const customerInfo = `Client: ${formData.firstName} ${formData.lastName} - Email: ${formData.email}`;
        const phoneInfo = formData.phone ? ` - Tél: ${formData.phone}` : '';
        const serviceInfo = `Service: ${service.name} (${service.description}) - Prix: ${service.price}€`;

        let bookingInfo = '';
        if (type === 'session') {
            const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : '';
            bookingInfo = ` - Réservation: ${formattedDate} à ${selectedTime}`;
        } else {
            bookingInfo = ' - Achat produit en ligne';
        }

        const messageInfo = formData.message ? ` - Message: ${formData.message.substring(0, 200)}` : '';

        // Construction du commentaire final (limité à 500 caractères pour Stripe)
        const fullComment = `${customerInfo}${phoneInfo} | ${serviceInfo}${bookingInfo}${messageInfo}`;

        return fullComment.substring(0, 500);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const currentFormData = getFormData();

            // VALIDATION UNIFIÉE
            const validationError = validateForm(currentFormData);
            if (validationError) {
                setMessage({ type: 'error', text: validationError });
                setIsSubmitting(false);
                return;
            }

            // Passer à l'étape paiement
            goToNextStep();

        } catch (error) {
            console.error('Erreur validation:', error);
            setMessage({
                type: 'error',
                text: 'Erreur lors de la validation du formulaire'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // CORRECTION : Fonction pour gérer le succès du paiement - RETIRER stripeComment de l'API de réservations
    const handlePaymentSuccess = async (paymentIntentId: string) => {
        try {
            const currentFormData = getFormData();

            const requestData = type === 'session' ? {
                firstName: currentFormData.firstName.trim(),
                lastName: currentFormData.lastName.trim(),
                email: currentFormData.email.trim(),
                phone: currentFormData.phone?.trim() || '',
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
                // CORRECTION : NE PAS envoyer stripeComment à l'API de réservations
            } : {
                firstName: currentFormData.firstName.trim(),
                lastName: currentFormData.lastName.trim(),
                email: currentFormData.email.trim(),
                phone: currentFormData.phone?.trim() || '',
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
                // CORRECTION : NE PAS envoyer stripeComment à l'API de réservations
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
                    setStep(1);
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
        goToPreviousStep(); // Revenir au formulaire
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    // ÉTAPE 1 : SÉLECTION DE LA DATE (SESSIONS UNIQUEMENT)
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

    // ÉTAPE 2 : SÉLECTION DE L'HEURE (SESSIONS UNIQUEMENT)
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

    // ÉTAPE 3 : FORMULAIRE D'INFORMATIONS PERSONNELLES
    const Step3 = () => {
        const stepConfig = getCurrentStepConfig();
        // CORRECTION : Récupération des données actuelles pour les valeurs par défaut
        const currentFormData = getFormData();

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

                <form onSubmit={handleFormSubmit} className="booking-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Prénom *</label>
                            <UncontrolledInput
                                type="text"
                                name="firstName"
                                defaultValue={currentFormData.firstName}
                                onValueChange={handleFieldChange}
                                required
                                className="form-input"
                                placeholder="Marie"
                                autoComplete="given-name"
                                autoFocus={true} // CORRECTION : Focus automatique sur le premier champ
                            />
                        </div>
                        <div className="form-group">
                            <label>Nom *</label>
                            <UncontrolledInput
                                type="text"
                                name="lastName"
                                defaultValue={currentFormData.lastName}
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
                            defaultValue={currentFormData.email}
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
                            defaultValue={currentFormData.phone}
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
                            defaultValue={currentFormData.message}
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
                        {isSubmitting ? 'Validation...' : `Procéder au Paiement - ${service.price}€`}
                    </motion.button>
                </form>
            </div>
        );
    };

    // ÉTAPE 4 : PAIEMENT
    const Step4 = () => {
        const stepConfig = getCurrentStepConfig();
        const currentFormData = getFormData();

        // Générer le commentaire pour Stripe
        const stripeComment = generateStripeComment(currentFormData);

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

                <div className="payment-section">
                    <StripePayment
                        amount={service.price}
                        serviceName={service.name}
                        bookingData={getFormData()}
                        onSuccess={handlePaymentSuccess}
                        onError={(error) => setMessage({ type: 'error', text: error })}
                        onCancel={handlePaymentCancel}
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        type={type}
                    />
                </div>

                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>
        );
    };

    // Configuration des étapes mise à jour
    const steps = type === 'session'
        ? [
            { number: 1, label: 'Date', title: 'Choisissez une date pour votre séance', backLabel: '← Retour aux séances' },
            { number: 2, label: 'Heure', title: 'Choisissez un horaire', backLabel: '← Retour' },
            { number: 3, label: 'Informations', title: 'Vos informations', backLabel: '← Retour' },
            { number: 4, label: 'Paiement', title: 'Paiement sécurisé', backLabel: '← Retour aux informations' }
        ]
        : [
            { number: 1, label: 'Votre Commande', title: 'Votre commande', backLabel: '← Retour aux produits' },
            { number: 2, label: 'Informations', title: 'Vos informations', backLabel: '← Retour' },
            { number: 3, label: 'Paiement', title: 'Paiement sécurisé', backLabel: '← Retour aux informations' }
        ];

    // RENDU CONDITIONNEL DES ÉTAPES
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
                case 1: return <Step3 />; // Pour les produits, on commence directement au formulaire
                case 2: return <Step4 />; // Puis paiement
                default: return <Step3 />;
            }
        }
    };

    return (
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
    );
}