// Todo : app/components/booking/BookingProcess.tsx
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useFormDataManager } from "~/hooks/useFormDataManager";
import { UncontrolledTextArea } from "~/components/ui/UncontrolledTextArea";
import { UncontrolledInput } from "~/components/ui/UncontrolledInput";

interface TimeSlot {
    time: string;
    available: boolean;
}

interface BookedSlot {
    reservation_time: string;
}

interface Service {
    id: string;
    name: string;
    price: number;
    description: string;
    duration: string;
    type: 'session' | 'product';
}

// ✅ Types pour l'API
interface ApiSuccessResponse {
    success: boolean;
    id: number;
    message: string;
}

interface ApiErrorResponse {
    error: string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

interface BookingProcessProps {
    service: Service;
    onBack: () => void;
    onComplete: () => void;
    apiEndpoint: string;
    type: 'session' | 'product';
}

// ✅ COMPOSANTS PARTAGÉS POUR ÉVITER LA DUPLICATION
interface StepHeaderProps {
    onBack: () => void;
    title: string;
    backLabel?: string;
}

const StepHeader = ({ onBack, title, backLabel = "← Retour" }: StepHeaderProps) => (
    <div className="booking-step-header">
        <button onClick={onBack} className="back-button">
            {backLabel}
        </button>
        <h3 className="booking-step-title">{title}</h3>
        <div className="spacer"></div>
    </div>
);

interface ServiceInfoProps {
    service: Service;
    additionalInfo?: string;
}

const ServiceInfo = ({ service, additionalInfo }: ServiceInfoProps) => (
    <div className="selected-service-info">
        <div className="service-name">{service.name}</div>
        <div className="service-details">
            {service.description} • {service.price}€
            {additionalInfo && ` • ${additionalInfo}`}
        </div>
    </div>
);

interface BookingSummaryProps {
    type: 'session' | 'product';
    service: Service;
    selectedDate?: string;
    selectedTime?: string;
    formatDate: (date: string) => string;
}

const BookingSummary = ({ type, service, selectedDate, selectedTime, formatDate }: BookingSummaryProps) => (
    <div className="booking-summary">
        <div className="summary-service">Votre {type === 'session' ? 'Réservation' : 'Commande'}</div>
        {type === 'session' && selectedDate && selectedTime ? (
            <div className="summary-details">
                {formatDate(selectedDate)} à {selectedTime}
            </div>
        ) : (
            <div className="summary-details">
                {service.name}
            </div>
        )}
        <div className="summary-price">{service.price}€</div>

        <div className="cart-summary">
            <div className="cart-summary-item">
                <span>{service.name}</span>
                <span>{service.price}€</span>
            </div>
        </div>
    </div>
);

export function BookingProcess({ service, onBack, onComplete, apiEndpoint, type }: BookingProcessProps) {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const { updateField, getFormData, reset } = useFormDataManager({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    });

    // ✅ CONSTANTES POUR ÉVITER LA DUPLICATION
    const TOTAL_STEPS = type === 'session' ? 3 : 2;
    const STEP_CONFIG = {
        session: [
            { number: 1, label: 'Date', title: 'Choisissez une date pour votre séance', backLabel: '← Retour aux séances' },
            { number: 2, label: 'Heure', title: 'Choisissez un horaire', backLabel: '← Retour' },
            { number: 3, label: 'Informations', title: 'Vos informations', backLabel: '← Retour' }
        ],
        product: [
            { number: 1, label: 'Votre Commande', title: 'Votre commande', backLabel: '← Retour aux produits' },
            { number: 2, label: 'Informations', title: 'Vos informations', backLabel: '← Retour' }
        ]
    };

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

    // ✅ LOGIQUE DE GESTION DES ÉTAPES REFACTORISÉE
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

    // ✅ VALIDATION UNIFIÉE
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

            // ✅ VALIDATION UNIFIÉE
            const validationError = validateForm(formData);
            if (validationError) {
                setMessage({ type: 'error', text: validationError });
                setIsSubmitting(false);
                return;
            }

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
                type: 'session'
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
                type: 'product'
            };

            console.log('📤 Envoi des données:', requestData);

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const result = await response.json() as ApiResponse;

            if (response.ok) {
                if ('success' in result && result.success) {
                    setMessage({
                        type: 'success',
                        text: result.message || '✅ Réservation confirmée ! Nous vous contactons rapidement.'
                    });

                    setTimeout(() => {
                        onComplete();
                        reset();
                        setSelectedDate("");
                        setSelectedTime("");
                    }, 3000);
                } else {
                    setMessage({
                        type: 'error',
                        text: '❌ Réponse inattendue du serveur'
                    });
                    setIsSubmitting(false);
                }
            } else {
                const errorMessage = 'error' in result ? result.error : 'Erreur lors de la réservation';
                setMessage({
                    type: 'error',
                    text: errorMessage
                });
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Erreur de réservation:', error);
            setMessage({
                type: 'error',
                text: 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.'
            });
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    // ✅ ÉTAPES SIMPLIFIÉES AVEC COMPOSANTS PARTAGÉS
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

    // ✅ FORMULAIRE UNIFIÉ POUR TOUS LES TYPES
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
                        {isSubmitting ? 'Confirmation...' : `Confirmer la ${type === 'session' ? 'Réservation' : 'Commande'}`}
                    </motion.button>
                </form>
            </div>
        );
    };

    const steps = STEP_CONFIG[type];

    // ✅ RENDU CONDITIONNEL DES ÉTAPES SIMPLIFIÉ
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