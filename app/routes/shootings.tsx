// Todo : app/routes/shootings.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from "./+types/home";
import "../styles/shootings.css";
import { Navbar } from "~/components/navbar";
import { AnimatedSection } from "~/components/AnimatedSection";
import { PageTransition } from "~/components/PageTransition";
import { motion } from "motion/react";
import { Link } from "react-router";
import { API_ENDPOINTS } from "~/config/api";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Séances Photo Professionnelles | Firefly of Soul Studio" },
        {
            name: "description",
            content: "Séances photo artistiques sur mesure. Portrait, série artistique et projets éditoriaux. Réservez votre expérience créative.",
        },
    ];
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

interface Service {
    id: string;
    name: string;
    price: number;
    description: string;
    duration: string;
    features: string[];
    type: 'session';
}

interface TimeSlot {
    time: string;
    available: boolean;
}

interface BookedSlot {
    reservation_time: string;
}

// ✅ COMPOSANTS PARTAGÉS POUR LE FOCUS
function UncontrolledInput({
                               name,
                               defaultValue = "",
                               onValueChange,
                               ...props
                           }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
    onValueChange?: (value: string, name: string) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const lastSyncedValue = useRef(defaultValue);

    useEffect(() => {
        if (ref.current) {
            ref.current.value = defaultValue as string;
            lastSyncedValue.current = defaultValue;
        }
    }, [defaultValue]);

    const handleInput = useCallback(
        (e: React.FormEvent<HTMLInputElement>) => {
            const value = (e.target as HTMLInputElement).value;
            if (value !== lastSyncedValue.current) {
                lastSyncedValue.current = value;
                onValueChange?.(value, name || "");
            }
        },
        [name, onValueChange]
    );

    return <input ref={ref} name={name} onInput={handleInput} {...props} />;
}

function UncontrolledTextArea({
                                  name,
                                  defaultValue = "",
                                  onValueChange,
                                  ...props
                              }: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> & {
    onValueChange?: (value: string, name: string) => void;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const lastSyncedValue = useRef(defaultValue);

    useEffect(() => {
        if (ref.current) {
            ref.current.value = defaultValue as string;
            lastSyncedValue.current = defaultValue;
        }
    }, [defaultValue]);

    const handleInput = useCallback(
        (e: React.FormEvent<HTMLTextAreaElement>) => {
            const value = (e.target as HTMLTextAreaElement).value;
            if (value !== lastSyncedValue.current) {
                lastSyncedValue.current = value;
                onValueChange?.(value, name || "");
            }
        },
        [name, onValueChange]
    );

    return <textarea ref={ref} name={name} onInput={handleInput} {...props} />;
}

function useFormDataManager(initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
}) {
    const formDataRef = useRef(initialData);
    const [, forceUpdate] = useState({});

    const updateField = useCallback((field: string, value: string) => {
        formDataRef.current = { ...formDataRef.current, [field]: value };
    }, []);

    const getFormData = useCallback(() => formDataRef.current, []);

    const reset = useCallback(
        (newData = initialData) => {
            formDataRef.current = newData;
            forceUpdate({});
        },
        [initialData]
    );

    return { updateField, getFormData, reset };
}

const SHOOTING_SERVICES: Service[] = [
    {
        id: "portrait",
        name: "Séance Portrait",
        price: 450,
        description: "Individuel & Couples",
        duration: "2 heures",
        type: 'session',
        features: [
            "30 images professionnellement retouchées",
            "Accès galerie en ligne",
            "Téléchargement digital inclus",
            "Droit d'impression",
            "2 changements de tenue",
            "Session de visionnage privée"
        ],
    },
    {
        id: "artistic",
        name: "Séance Artistique",
        price: 850,
        description: "Conceptuel & Fine Art",
        duration: "4 heures",
        type: 'session',
        features: [
            "50 images professionnellement retouchées",
            "Développement du concept",
            "Retouche premium",
            "Galerie en ligne + stockage cloud",
            "2 impressions fine art (16x24)",
            "Direction artistique"
        ],
    },
    {
        id: "editorial",
        name: "Projet Éditorial",
        price: 1200,
        description: "Commercial & Publication",
        duration: "8 heures",
        type: 'session',
        features: [
            "80+ images professionnellement retouchées",
            "Direction artistique",
            "Retouche avancée",
            "Droits d'usage commercial",
            "Livraison prioritaire",
            "Gestionnaire de projet dédié"
        ],
    },
];

// Composant Carte de Service pour shootings - BOUTON DIRECT VERS RÉSERVATION
function ShootingCard({ service, onDirectBooking }: {
    service: Service;
    onDirectBooking: (service: Service) => void;
}) {
    return (
        <motion.div
            className={`service-card session ${service.id === "artistic" ? "featured" : ""}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8 }}
        >
            {service.id === "artistic" && (
                <div className="featured-badge">Populaire</div>
            )}

            <div className="service-type-badge">
                📸 Séance Photo
            </div>

            <div className="service-header">
                <h3>{service.name}</h3>
                <div className="service-price">{service.price}€</div>
            </div>

            <p className="service-description">{service.description}</p>
            <p className="service-duration">{service.duration}</p>

            <div className="service-features">
                <ul>
                    {service.features.map((feature, idx) => (
                        <li key={idx}>
                            <span className="feature-icon">✓</span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <motion.button
                className="service-btn session-btn"
                onClick={() => onDirectBooking(service)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
            >
                Réserver maintenant
            </motion.button>
        </motion.div>
    );
}

// Composant Processus de Réservation avec date/heure
function BookingProcess({ service, onBack, onComplete }: {
    service: Service;
    onBack: () => void;
    onComplete: () => void;
}) {
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // ✅ CORRECTION : Utiliser l'approche non-contrôlée comme dans l'ancien code
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
            if (date.getDay() !== 0 && date.getDay() !== 6) { // Exclure samedi et dimanche
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
                    const response = await fetch(`${API_ENDPOINTS.RESERVATIONS}?date=${selectedDate}`);
                    if (response.ok) {
                        const bookedSlots = await response.json() as BookedSlot[];
                        const bookedTimes = bookedSlots.map(slot => slot.reservation_time);

                        // Générer tous les créneaux possibles (9h-18h)
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
                    // En cas d'erreur, générer des créneaux par défaut
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

        fetchBookedSlots();
    }, [selectedDate]);

    // ✅ CORRECTION : Gestionnaire de changement de champ
    const handleFieldChange = useCallback((value: string, fieldName: string) => {
        updateField(fieldName, value);
    }, [updateField]);

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

            // Validation email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                setMessage({
                    type: 'error',
                    text: 'Veuillez entrer une adresse email valide'
                });
                setIsSubmitting(false);
                return;
            }

            // Validation date/heure
            if (!selectedDate || !selectedTime) {
                setMessage({
                    type: 'error',
                    text: 'Veuillez sélectionner une date et une heure'
                });
                setIsSubmitting(false);
                return;
            }

            // Vérifier que le créneau est toujours disponible
            const selectedSlot = availableTimes.find(slot => slot.time === selectedTime);
            if (selectedSlot && !selectedSlot.available) {
                setMessage({
                    type: 'error',
                    text: 'Ce créneau a été réservé entre-temps. Veuillez choisir un autre horaire.'
                });
                setIsSubmitting(false);
                return;
            }

            // Préparer les données pour l'API
            const requestData = {
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
            };

            console.log('📤 Envoi des données:', requestData);

            // Appel API avec typage correct
            const response = await fetch(API_ENDPOINTS.RESERVATIONS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            // ✅ CORRECTION : Typage explicite de la réponse
            const result = await response.json() as ApiResponse;

            if (response.ok) {
                // ✅ Vérification de type pour ApiSuccessResponse
                if ('success' in result && result.success) {
                    setMessage({
                        type: 'success',
                        text: result.message || '✅ Réservation confirmée ! Nous vous contactons rapidement.'
                    });

                    setTimeout(() => {
                        onComplete();
                        reset({
                            firstName: '',
                            lastName: '',
                            email: '',
                            phone: '',
                            message: ''
                        });
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
                // ✅ Vérification de type pour ApiErrorResponse
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

    // Étape 1: Sélection de la date
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

    // Étape 2: Sélection de l'heure
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
                <button onClick={() => setStep(2)} className="back-button">
                    ← Retour
                </button>
                <h3 className="booking-step-title">Vos informations</h3>
                <div className="spacer"></div>
            </div>

            <div className="booking-summary">
                <div className="summary-service">Votre Réservation</div>
                <div className="summary-details">
                    {formatDate(selectedDate)} à {selectedTime}
                </div>
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
                        placeholder="Des informations supplémentaires sur votre projet..."
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
                    {isSubmitting ? 'Confirmation...' : 'Confirmer la Réservation'}
                </motion.button>
            </form>
        </div>
    );

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
                        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <span>Date</span>
                        </div>
                        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <span>Heure</span>
                        </div>
                        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <span>Informations</span>
                        </div>
                    </div>

                    {step === 1 && <Step1 />}
                    {step === 2 && <Step2 />}
                    {step === 3 && <Step3 />}
                </div>
            </div>
        </motion.section>
    );
}

export default function Shootings() {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleDirectBooking = (service: Service) => {
        setSelectedService(service);
        setIsCheckingOut(true);

        // Scroll vers la section réservation
        setTimeout(() => {
            document.getElementById('booking-section')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    const handleBookingComplete = () => {
        setIsCheckingOut(false);
        setSelectedService(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToServices = () => {
        setIsCheckingOut(false);
        setSelectedService(null);
    };

    return (
        <PageTransition>
            <div className="tarifs-page">
                <Navbar />

                {/* Hero Section */}
                <header className="tarifs-hero">
                    <div className="tarifs-hero-background">
                        <div
                            className="hero-background-image"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
                            }}
                        ></div>
                        <div className="hero-overlay"></div>
                    </div>
                    <div className="container">
                        <div className="tarifs-hero-content">
                            {!isCheckingOut ? (
                                <>
                                    <motion.h1
                                        className="tarifs-hero-title"
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                    >
                                        Séances Photo <span className="text-accent">Artistiques</span>
                                    </motion.h1>
                                    <motion.p
                                        className="tarifs-hero-subtitle"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 0.8 }}
                                    >
                                        Des expériences photographiques uniques et personnalisées.
                                        Capturons ensemble votre essence et créons des œuvres intemporelles.
                                    </motion.p>
                                    <motion.div
                                        className="hero-cta"
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6, duration: 0.8 }}
                                    >
                                        <Link to="/store" className="btn btn-secondary btn-large">
                                            Voir la Boutique →
                                        </Link>
                                    </motion.div>
                                </>
                            ) : selectedService ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <h1 className="tarifs-hero-title">
                                        Réservation <span className="text-accent">{selectedService.name}</span>
                                    </h1>
                                    <p className="tarifs-hero-subtitle">
                                        Complétez votre réservation pour confirmer votre séance photo.
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <h1 className="tarifs-hero-title">
                                        Réservation <span className="text-accent">en Cours</span>
                                    </h1>
                                    <p className="tarifs-hero-subtitle">
                                        Complétez votre réservation pour confirmer votre séance photo.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>
                    {!isCheckingOut && (
                        <div className="scroll-indicator">
                            <div className="scroll-arrow"></div>
                        </div>
                    )}
                </header>

                {/* Afficher le processus de réservation ou les services */}
                {isCheckingOut && selectedService ? (
                    <div id="booking-section">
                        <BookingProcess
                            service={selectedService}
                            onBack={handleBackToServices}
                            onComplete={handleBookingComplete}
                        />
                    </div>
                ) : (
                    <>
                        {/* Services Grid */}
                        <AnimatedSection className="services-section">
                            <div className="container">
                                <div className="section-header">
                                    <div className="section-badge">Nos Séances</div>
                                    <h2 className="section-title">Expériences Photographiques</h2>
                                    <p className="section-subtitle">
                                        Chaque séance est une collaboration artistique unique,
                                        conçue pour révéler votre personnalité et créer des images exceptionnelles.
                                    </p>
                                </div>
                                <div className="services-grid">
                                    {SHOOTING_SERVICES.map((service) => (
                                        <ShootingCard
                                            key={service.id}
                                            service={service}
                                            onDirectBooking={handleDirectBooking}
                                        />
                                    ))}
                                </div>
                            </div>
                        </AnimatedSection>

                        {/* Process Section */}
                        <AnimatedSection className="process-section">
                            <div className="container">
                                <div className="section-header">
                                    <div className="section-badge">Notre Processus</div>
                                    <h2 className="section-title">Comment ça marche</h2>
                                </div>
                                <div className="process-steps">
                                    <div className="process-step">
                                        <div className="step-number">01</div>
                                        <h3>Consultation</h3>
                                        <p>Nous discutons de votre vision, style et objectifs pour créer un concept unique</p>
                                    </div>
                                    <div className="process-step">
                                        <div className="step-number">02</div>
                                        <h3>Shooting</h3>
                                        <p>Séance photo professionnelle dans une ambiance détendue et créative</p>
                                    </div>
                                    <div className="process-step">
                                        <div className="step-number">03</div>
                                        <h3>Révision</h3>
                                        <p>Session de visionnage privée pour sélectionner vos images préférées</p>
                                    </div>
                                    <div className="process-step">
                                        <div className="step-number">04</div>
                                        <h3>Livraison</h3>
                                        <p>Reception de vos images retouchées et accès à la boutique pour les produits</p>
                                    </div>
                                </div>
                            </div>
                        </AnimatedSection>
                    </>
                )}

                {/* CTA Section - Seulement visible quand on ne checkoute pas */}
                {!isCheckingOut && (
                    <AnimatedSection className="cta-section">
                        <div className="container">
                            <div className="cta-content">
                                <motion.h2
                                    className="cta-title"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    Prêt à Créer des Images Mémorables ?
                                </motion.h2>
                                <motion.p
                                    className="cta-description"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                >
                                    Réservez votre séance photo et laissez-nous capturer votre histoire.
                                    Après le shooting, découvrez nos produits premium pour mettre en valeur vos images.
                                </motion.p>
                                <motion.div
                                    className="cta-actions"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                >
                                    <Link to="/store" className="btn btn-primary btn-large">
                                        Découvrir la Boutique
                                    </Link>
                                    <motion.a
                                        href="mailto:hello@fireflyofsoul.com"
                                        className="btn btn-secondary btn-large"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Nous Contacter
                                    </motion.a>
                                </motion.div>
                            </div>
                        </div>
                    </AnimatedSection>
                )}

                {/* Footer */}
                <motion.footer
                    className="footer-tarifs"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="container">
                        <div className="footer-content">
                            <div className="footer-brand">
                                <div className="footer-logo">Firefly of Soul</div>
                                <p className="footer-tagline">
                                    Capturer la poésie de la lumière et de l'ombre depuis 2024
                                </p>
                            </div>
                            <div className="footer-links">
                                <div className="footer-column">
                                    <h4>Navigation</h4>
                                    <Link to="/">Accueil</Link>
                                    <Link to="/shootings">Séances</Link>
                                    <Link to="/store">Boutique</Link>
                                    <Link to="/gallery">Galerie</Link>
                                </div>
                                <div className="footer-column">
                                    <h4>Contact</h4>
                                    <a href="mailto:hello@fireflyofsoul.com">Email</a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                                </div>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p>&copy; 2025 Firefly of Soul Studio. Tous les moments préservés avec intégrité artistique.</p>
                        </div>
                    </div>
                </motion.footer>
            </div>
        </PageTransition>
    );
}