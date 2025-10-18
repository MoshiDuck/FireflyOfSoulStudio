// app/routes/pricing.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from "./+types/home";
import "../styles/pricing.css";
import { Navbar } from "~/components/navbar";
import { AnimatedSection } from "~/components/AnimatedSection";
import { PageTransition } from "~/components/PageTransition";
import { motion, AnimatePresence } from "motion/react";
import { API_ENDPOINTS } from "~/config/api";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Pricing | Firefly of Soul Studio" },
        {
            name: "description",
            content: "Investment in art - Professional photography services and transparent pricing for portraits, artistic series, and editorial projects",
        },
    ];
}

// ✅ Types
interface Service {
    id: string;
    name: string;
    price: number;
    description: string;
    duration: string;
    features: string[];
}

interface TimeSlot {
    time: string;
    available: boolean;
}

interface AdditionalService {
    title: string;
    desc: string;
    price: string;
    icon: string;
}

// Types pour la réponse API
interface ApiSuccessResponse {
    success: boolean;
    id: number;
    message: string;
}

interface ApiErrorResponse {
    error: string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

// Services disponibles
const SERVICES: Service[] = [
    {
        id: "portrait",
        name: "Portrait Session",
        price: 450,
        description: "Individual & Couples",
        duration: "2 hours",
        features: [
            "30 professionally edited images",
            "Online gallery",
            "Print release",
            "2 outfit changes",
            "Private viewing session",
            "Digital delivery"
        ],
    },
    {
        id: "artistic",
        name: "Artistic Series",
        price: 850,
        description: "Conceptual & Fine Art",
        duration: "4 hours",
        features: [
            "50 professionally edited images",
            "Concept development",
            "Premium retouching",
            "Online gallery + USB delivery",
            "2 large format prints (16x24)",
            "Creative direction"
        ],
    },
    {
        id: "editorial",
        name: "Editorial Project",
        price: 1200,
        description: "Commercial & Publication",
        duration: "8 hours",
        features: [
            "80+ professionally edited images",
            "Creative direction",
            "Advanced retouching",
            "Commercial usage rights",
            "Priority delivery",
            "Dedicated project manager"
        ],
    },
];

const additionalServices: AdditionalService[] = [
    {
        title: "Print Collections",
        desc: "Fine art prints on premium archival paper with museum-quality framing",
        price: "Starting at $150",
        icon: "🖼️"
    },
    {
        title: "Digital Enhancement",
        desc: "Advanced retouching and artistic editing for existing images",
        price: "$75/image",
        icon: "✨"
    },
    {
        title: "Album Design",
        desc: "Custom designed photo books with premium materials and binding",
        price: "Starting at $300",
        icon: "📖"
    },
];

// Composants partagés
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

function useFormDataManager(initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
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

// Booking Wizard modernisé
function BookingWizard({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const { updateField, getFormData, reset } = useFormDataManager({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
    });

    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);

    useEffect(() => {
        if (selectedService) {
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
        }
    }, [selectedService]);

    useEffect(() => {
        if (selectedDate) {
            const times: TimeSlot[] = [];
            for (let hour = 9; hour < 18; hour++) {
                const available = Math.random() > 0.3;
                times.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    available
                });
            }
            setAvailableTimes(times);
        }
    }, [selectedDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const formData = getFormData();
            const response = await fetch(API_ENDPOINTS.RESERVATIONS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    service: selectedService?.id,
                    date: selectedDate,
                    time: selectedTime
                }),
            });

            const result = await response.json() as ApiResponse;

            if (response.ok) {
                if ('success' in result && result.success) {
                    setMessage({ type: 'success', text: result.message || 'Reservation confirmed!' });
                    setTimeout(() => {
                        onClose();
                    }, 3000);
                } else {
                    setMessage({ type: 'error', text: 'Unexpected response format' });
                }
            } else {
                if ('error' in result) {
                    setMessage({ type: 'error', text: result.error || 'An error occurred' });
                } else {
                    setMessage({ type: 'error', text: 'An error occurred' });
                }
            }
        } catch (error) {
            console.error('Booking error:', error);
            setMessage({
                type: 'error',
                text: error instanceof Error ? `Network error: ${error.message}` : 'Network error. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFieldChange = useCallback((value: string, fieldName: string) => {
        updateField(fieldName, value);
    }, [updateField]);

    const formatDate = useCallback((dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    const resetSelection = useCallback(() => {
        setSelectedService(null);
        setSelectedDate("");
        setSelectedTime("");
        reset();
        setStep(1);
    }, [reset]);

    // Étape 1: Sélection du service
    const Step1 = () => (
        <div className="booking-step">
            <h3 className="booking-step-title">Choose Your Session</h3>
            <div className="service-selection-grid">
                {SERVICES.map(service => (
                    <motion.div
                        key={service.id}
                        className={`service-option ${selectedService?.id === service.id ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedService(service);
                            setStep(2);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="service-option-header">
                            <h4>{service.name}</h4>
                            <div className="service-price">${service.price}</div>
                        </div>
                        <p className="service-description">{service.description}</p>
                        <p className="service-duration">{service.duration}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    // Étape 2: Sélection de la date
    const Step2 = () => (
        <div className="booking-step">
            <div className="booking-step-header">
                <button onClick={() => setStep(1)} className="back-button">
                    ← Back
                </button>
                <h3 className="booking-step-title">Choose a Date</h3>
                <div className="spacer"></div>
            </div>

            <div className="selected-service-info">
                <div className="service-name">{selectedService?.name}</div>
                <div className="service-details">${selectedService?.price} • {selectedService?.duration}</div>
            </div>

            <div className="date-selection-grid">
                {availableDates.map(date => (
                    <motion.button
                        key={date}
                        onClick={() => {
                            setSelectedDate(date);
                            setStep(3);
                        }}
                        className="date-option"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="date-day">{new Date(date).getDate()}</div>
                        <div className="date-weekday">
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="date-month">
                            {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );

    // Étape 3: Sélection de l'heure
    const Step3 = () => (
        <div className="booking-step">
            <div className="booking-step-header">
                <button onClick={() => setStep(2)} className="back-button">
                    ← Back
                </button>
                <h3 className="booking-step-title">Choose a Time</h3>
                <div className="spacer"></div>
            </div>

            <div className="selected-service-info">
                <div className="service-name">{selectedService?.name}</div>
                <div className="service-details">
                    {formatDate(selectedDate)} • ${selectedService?.price}
                </div>
            </div>

            <div className="time-selection-grid">
                {availableTimes.map(slot => (
                    <motion.button
                        key={slot.time}
                        onClick={() => {
                            if (slot.available) {
                                setSelectedTime(slot.time);
                                setStep(4);
                            }
                        }}
                        disabled={!slot.available}
                        className={`time-option ${slot.available ? 'available' : 'booked'}`}
                        whileHover={slot.available ? { scale: 1.05 } : {}}
                        whileTap={slot.available ? { scale: 0.95 } : {}}
                    >
                        <div className="time-slot">{slot.time}</div>
                        <div className="time-status">
                            {slot.available ? 'Available' : 'Booked'}
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );

    // Étape 4: Informations personnelles
    const Step4 = () => (
        <div className="booking-step">
            <div className="booking-step-header">
                <button onClick={() => setStep(3)} className="back-button">
                    ← Back
                </button>
                <h3 className="booking-step-title">Your Information</h3>
                <div className="spacer"></div>
            </div>

            <div className="booking-summary">
                <div className="summary-service">{selectedService?.name}</div>
                <div className="summary-details">
                    {formatDate(selectedDate)} at {selectedTime}
                </div>
                <div className="summary-price">${selectedService?.price}</div>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>First Name</label>
                        <UncontrolledInput
                            type="text"
                            name="firstName"
                            defaultValue=""
                            onValueChange={handleFieldChange}
                            required
                            className="form-input"
                            placeholder="John"
                            autoComplete="given-name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name</label>
                        <UncontrolledInput
                            type="text"
                            name="lastName"
                            defaultValue=""
                            onValueChange={handleFieldChange}
                            required
                            className="form-input"
                            placeholder="Doe"
                            autoComplete="family-name"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <UncontrolledInput
                        type="email"
                        name="email"
                        defaultValue=""
                        onValueChange={handleFieldChange}
                        required
                        className="form-input"
                        placeholder="your.email@example.com"
                        autoComplete="email"
                    />
                </div>

                <div className="form-group">
                    <label>Phone (Optional)</label>
                    <UncontrolledInput
                        type="tel"
                        name="phone"
                        defaultValue=""
                        onValueChange={handleFieldChange}
                        className="form-input"
                        placeholder="+1 (555) 123-4567"
                        autoComplete="tel"
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
                    {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </motion.button>
            </form>
        </div>
    );

    return (
        <motion.div
            className="booking-wizard-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="booking-wizard-container"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <div className="booking-wizard-header">
                    <button onClick={onClose} className="close-button">
                        ×
                    </button>
                    <div className="progress-indicators">
                        {[1, 2, 3, 4].map(s => (
                            <div
                                key={s}
                                className={`progress-dot ${step >= s ? 'active' : ''}`}
                            />
                        ))}
                    </div>
                    <button onClick={resetSelection} className="reset-button">
                        Restart
                    </button>
                </div>

                <div className="booking-wizard-content">
                    {step === 1 && <Step1 />}
                    {step === 2 && <Step2 />}
                    {step === 3 && <Step3 />}
                    {step === 4 && <Step4 />}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function Pricing() {
    const [isBooking, setIsBooking] = useState(false);

    return (
        <PageTransition>
            <div className="pricing-page">
                <Navbar />

                {/* Hero Section avec même hauteur que Gallery et Home */}
                <header className="pricing-hero-modern">
                    <div className="pricing-hero-background">
                        <div
                            className="hero-background-image"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
                            }}
                        ></div>
                        <div className="hero-overlay"></div>
                    </div>
                    <div className="container">
                        <div className="pricing-hero-content">
                            <motion.h1
                                className="pricing-hero-title"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                            >
                                Investment in <span className="text-accent">Art</span>
                            </motion.h1>
                            <motion.p
                                className="pricing-hero-subtitle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                Each photograph tells a story, each story has its value.
                                Transparent pricing for exceptional artistic experiences.
                            </motion.p>
                            <motion.div
                                className="pricing-hero-actions"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <motion.button
                                    onClick={() => setIsBooking(true)}
                                    className="btn btn-primary"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Book Your Session
                                </motion.button>
                                <Link to="/gallery" className="btn btn-secondary">
                                    View Our Work
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                    {/* Flèche de défilement ajoutée */}
                    <div className="scroll-indicator">
                        <div className="scroll-arrow"></div>
                    </div>
                </header>

                {/* Pricing Cards */}
                <AnimatedSection className="pricing-section-modern">
                    <div className="container">
                        <div className="pricing-section-header">
                            <div className="section-badge">Services</div>
                            <h2 className="section-title-modern">
                                Photography <span className="text-accent">Experiences</span>
                            </h2>
                            <p className="section-subtitle">
                                Choose the perfect session that matches your vision and creative needs
                            </p>
                        </div>
                        <div className="pricing-cards-modern">
                            {SERVICES.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    className={`pricing-card-modern ${service.id === "artistic" ? "featured" : ""}`}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: index * 0.15, duration: 0.6 }}
                                    whileHover={{
                                        y: -10,
                                        transition: { duration: 0.3 }
                                    }}
                                    onClick={() => setIsBooking(true)}
                                >
                                    {service.id === "artistic" && (
                                        <motion.div
                                            className="featured-badge-modern"
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{
                                                delay: 0.5,
                                                type: "spring",
                                                stiffness: 200,
                                            }}
                                        >
                                            Most Popular
                                        </motion.div>
                                    )}
                                    <div className="pricing-header-modern">
                                        <h3>{service.name}</h3>
                                        <div className="price-modern">${service.price}</div>
                                        <p className="price-description-modern">{service.description}</p>
                                        <p className="service-duration-modern">{service.duration}</p>
                                    </div>
                                    <div className="pricing-features-modern">
                                        <ul>
                                            {service.features.map((feature, idx) => (
                                                <motion.li
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: index * 0.15 + idx * 0.05 }}
                                                >
                                                    <span className="feature-icon">✓</span>
                                                    {feature}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                    <motion.button
                                        className={`pricing-btn-modern ${service.id === "artistic" ? "featured-btn" : ""}`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        Book Session
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* Additional Services */}
                <AnimatedSection className="additional-services-modern">
                    <div className="container">
                        <div className="pricing-section-header">
                            <div className="section-badge">Add-ons</div>
                            <h2 className="section-title-modern">
                                Additional <span className="text-accent">Services</span>
                            </h2>
                            <p className="section-subtitle">
                                Enhance your experience with our premium additional services
                            </p>
                        </div>
                        <div className="services-grid-modern">
                            {additionalServices.map((service, index) => (
                                <motion.div
                                    key={index}
                                    className="service-item-modern"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="service-icon">{service.icon}</div>
                                    <h3>{service.title}</h3>
                                    <p>{service.desc}</p>
                                    <div className="service-price-modern">
                                        {service.price}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* CTA Section */}
                <AnimatedSection className="cta-section-modern">
                    <div className="container">
                        <div className="cta-content-modern">
                            <motion.h2
                                className="cta-title"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                Ready to Create Timeless Art?
                            </motion.h2>
                            <motion.p
                                className="cta-description"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.6 }}
                            >
                                Let's discuss your vision and create something extraordinary together.
                                Your timeless art awaits.
                            </motion.p>
                            <motion.div
                                className="cta-actions-modern"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                            >
                                <motion.button
                                    onClick={() => setIsBooking(true)}
                                    className="btn btn-primary btn-large"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Start Your Project
                                </motion.button>
                                <motion.a
                                    href="mailto:hello@fireflyofsoul.com"
                                    className="btn btn-secondary btn-large"
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Email Inquiry
                                </motion.a>
                            </motion.div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Footer */}
                <motion.footer
                    className="footer-pricing-modern"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="container">
                        <div className="footer-content-modern">
                            <div className="footer-brand">
                                <div className="footer-logo">Firefly of Soul</div>
                                <p className="footer-tagline">
                                    Capturing the poetry of light and shadow since 2024
                                </p>
                            </div>
                            <div className="footer-links">
                                <div className="footer-column">
                                    <h4>Navigation</h4>
                                    <Link to="/">Home</Link>
                                    <Link to="/gallery">Gallery</Link>
                                    <Link to="/pricing">Pricing</Link>
                                </div>
                                <div className="footer-column">
                                    <h4>Connect</h4>
                                    <a href="mailto:hello@fireflyofsoul.com">Email</a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                                </div>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p>&copy; 2025 Firefly of Soul Studio. All moments preserved with artistic integrity.</p>
                        </div>
                    </div>
                </motion.footer>

                {/* Booking Wizard */}
                <AnimatePresence>
                    {isBooking && <BookingWizard onClose={() => setIsBooking(false)} />}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}