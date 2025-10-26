// Todo : app/components/booking/BookingProcess.tsx
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useFormDataManager } from "~/hooks/useFormDataManager";
import {UncontrolledTextArea} from "~/components/ui/UncontrolledTextArea";
import {UncontrolledInput} from "~/components/ui/UncontrolledInput";

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

    const handleFieldChange = (value: string, fieldName: string) => {
        updateField(fieldName as keyof ReturnType<typeof getFormData>, value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const formData = getFormData();

            // Validation des champs
            if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim()) {
                setMessage({
                    type: 'error',
                    text: 'Veuillez remplir tous les champs obligatoires'
                });
                setIsSubmitting(false);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setMessage({
                    type: 'error',
                    text: 'Veuillez entrer une adresse email valide'
                });
                setIsSubmitting(false);
                return;
            }

            if (type === 'session' && (!selectedDate || !selectedTime)) {
                setMessage({
                    type: 'error',
                    text: 'Veuillez sélectionner une date et une heure'
                });
                setIsSubmitting(false);
                return;
            }

            if (type === 'session') {
                const selectedSlot = availableTimes.find(slot => slot.time === selectedTime);
                if (selectedSlot && !selectedSlot.available) {
                    setMessage({
                        type: 'error',
                        text: 'Ce créneau a été réservé entre-temps. Veuillez choisir un autre horaire.'
                    });
                    setIsSubmitting(false);
                    return;
                }
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
                // Données pour les produits
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

            // ✅ CORRECTION : Typer explicitement la réponse
            const result = await response.json() as ApiResponse;

            if (response.ok) {
                // ✅ CORRECTION : Vérifier le type avec un garde de type
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
                // ✅ CORRECTION : Vérifier le type avec un garde de type
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

    // Étape 1: Sélection de la date (seulement pour les sessions)
    const Step1 = () => (
        <div className="booking-step">
            <div className="booking-step-header">
                <button onClick={onBack} className="back-button">
                    ← Retour aux séances
                </button>
                <h3 className="booking-step-title">Choisissez une date pour votre séance</h3>
                <div className="spacer"></div>
            </div>

            <div className="selected-service-info">
                <div className="service-name">{service.name}</div>
                <div className="service-details">
                    {service.description} • {service.price}€
                </div>
            </div>

            <div className="date-selection-grid">
                {availableDates.map(date => (
                    <motion.button
                        key={date}
                        onClick={() => {
                            setSelectedDate(date);
                            setStep(2);
                        }}
                        className="date-option"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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

    // Étape 2: Sélection de l'heure (seulement pour les sessions)
    const Step2 = () => (
        <div className="booking-step">
            <div className="booking-step-header">
                <button onClick={() => setStep(1)} className="back-button">
                    ← Retour
                </button>
                <h3 className="booking-step-title">Choisissez un horaire</h3>
                <div className="spacer"></div>
            </div>

            <div className="selected-service-info">
                <div className="service-name">{service.name}</div>
                <div className="service-details">
                    {formatDate(selectedDate)} • {service.price}€
                </div>
            </div>

            <div className="time-selection-grid">
                {availableTimes.map(slot => (
                    <motion.button
                        key={slot.time}
                        onClick={() => {
                            if (slot.available) {
                                setSelectedTime(slot.time);
                                setStep(3);
                            }
                        }}
                        disabled={!slot.available}
                        className={`time-option ${slot.available ? 'available' : 'booked'}`}
                        whileHover={slot.available ? { scale: 1.05 } : {}}
                        whileTap={slot.available ? { scale: 0.95 } : {}}
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

    // Étape 3: Informations personnelles
    const Step3 = () => (
        <div className="booking-step">
            <div className="booking-step-header">
                <button onClick={() => setStep(type === 'session' ? 2 : 1)} className="back-button">
                    ← Retour
                </button>
                <h3 className="booking-step-title">Vos informations</h3>
                <div className="spacer"></div>
            </div>

            <div className="booking-summary">
                <div className="summary-service">Votre {type === 'session' ? 'Réservation' : 'Commande'}</div>
                {type === 'session' ? (
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
                >
                    {isSubmitting ? 'Confirmation...' : `Confirmer la ${type === 'session' ? 'Réservation' : 'Commande'}`}
                </motion.button>
            </form>
        </div>
    );

    const getSteps = () => {
        if (type === 'session') {
            return [
                { number: 1, label: 'Date' },
                { number: 2, label: 'Heure' },
                { number: 3, label: 'Informations' }
            ];
        } else {
            return [
                { number: 1, label: 'Votre Commande' },
                { number: 2, label: 'Informations' }
            ];
        }
    };

    const steps = getSteps();

    return (
        <motion.section
            className="booking-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="container">
                <div className="booking-process">
                    <div className="booking-progress">
                        {steps.map((stepItem, index) => (
                            <div key={stepItem.number} className={`progress-step ${step >= stepItem.number ? 'active' : ''}`}>
                                <div className="step-number">{stepItem.number}</div>
                                <span>{stepItem.label}</span>
                            </div>
                        ))}
                    </div>

                    {type === 'session' ? (
                        <>
                            {step === 1 && <Step1 />}
                            {step === 2 && <Step2 />}
                            {step === 3 && <Step3 />}
                        </>
                    ) : (
                        <>
                            {step === 1 && <Step3 />} {/* Pour les produits, on saute directement aux infos */}
                        </>
                    )}
                </div>
            </div>
        </motion.section>
    );
}