// Todo : app/routes/pricing.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from "./+types/home";
import "../styles/pricing.css";
import { Navbar } from "~/components/navbar";
import { AnimatedSection } from "~/components/AnimatedSection";
import { PageTransition } from "~/components/PageTransition";
import { motion, AnimatePresence } from "motion/react";
import {API_ENDPOINTS} from "~/config/api";


export function meta({}: Route.MetaArgs) {
    return [
        { title: "Pricing | Firefly of Soul Studio" },
        {
            name: "description",
            content: "Investment in art - photography services and pricing",
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

interface AdditionalService {  // ✅ Nouveau type
    title: string;
    desc: string;
    price: string;
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

interface TimeSlot {
    time: string;
    available: boolean;
}

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
        ],
    },
];

const additionalServices: AdditionalService[] = [
    {
        title: "Print Collections",
        desc: "Fine art prints on premium archival paper",
        price: "Starting at $150",
    },
    {
        title: "Digital Enhancement",
        desc: "Advanced retouching for existing images",
        price: "$75/image",
    },
    {
        title: "Album Design",
        desc: "Custom designed photo books",
        price: "Starting at $300",
    },
];

/**
 * Input COMPLÈTEMENT uncontrolled avec synchronisation manuelle
 * C'est la seule façon de garantir ZERO perte de focus
 */
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
    }, [defaultValue]);  // ✅ Ajout de defaultValue dans les dépendances

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


/**
 * FormDataManager - Gère l'état du formulaire SANS causer de re-rendus
 */
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
// Composant principal de réservation en étapes
function BookingWizard({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Gestionnaire de formulaire SANS état React pour les champs
    const { updateField, getFormData, reset } = useFormDataManager({
        firstName: "",
        lastName: "",
        email: "",
        phone: ""
    });

    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);

    // Simuler la récupération des dates disponibles
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

    // Simuler la récupération des créneaux horaires disponibles
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
        <div className="space-y-6">
            <h3 className="font-cinzel text-2xl text-amber-500 text-center mb-8">Choose Your Session</h3>
            <div className="grid gap-6">
                {SERVICES.map(service => (
                    <div
                        key={service.id}
                        className={`pricing-card cursor-pointer transition-all duration-300 ${
                            selectedService?.id === service.id
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-amber-500/20 bg-gray-800/50 hover:border-amber-500/40'
                        }`}
                        onClick={() => {
                            setSelectedService(service);
                            setStep(2);
                        }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-cinzel text-xl text-amber-500">{service.name}</h4>
                                <p className="text-amber-200 font-inter">{service.description}</p>
                            </div>
                            <div className="text-right">
                                <div className="font-cinzel text-2xl text-white">${service.price}</div>
                                <div className="text-amber-200 text-sm font-inter">{service.duration}</div>
                            </div>
                        </div>
                        <div className="pricing-features">
                            <ul>
                                {service.features.map((feature, index) => (
                                    <li key={index} className="text-gray-300 font-inter flex items-center">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-3"></span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Étape 2: Sélection de la date
    const Step2 = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setStep(1)}
                    className="text-amber-400 hover:text-amber-300 font-inter flex items-center"
                >
                    ← Back
                </button>
                <h3 className="font-cinzel text-2xl text-amber-500">Choose a Date</h3>
                <div className="w-6"></div>
            </div>

            <div className="text-center mb-6">
                <div className="font-cinzel text-lg text-amber-500 mb-2">{selectedService?.name}</div>
                <div className="text-amber-200 font-inter">${selectedService?.price} • {selectedService?.duration}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {availableDates.map(date => (
                    <button
                        key={date}
                        onClick={() => {
                            setSelectedDate(date);
                            setStep(3);
                        }}
                        className="p-4 rounded-xl border border-amber-500/20 bg-gray-800/50 hover:border-amber-500/40 hover:bg-amber-500/10 transition-all duration-300 text-center backdrop-blur-sm"
                    >
                        <div className="font-cinzel text-amber-500 text-lg">
                            {new Date(date).getDate()}
                        </div>
                        <div className="text-amber-200 font-inter text-sm">
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-gray-400 font-inter text-xs mt-1">
                            {new Date(date).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // Étape 3: Sélection de l'heure
    const Step3 = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setStep(2)}
                    className="text-amber-400 hover:text-amber-300 font-inter flex items-center"
                >
                    ← Back
                </button>
                <h3 className="font-cinzel text-2xl text-amber-500">Choose a Time</h3>
                <div className="w-6"></div>
            </div>

            <div className="text-center mb-6">
                <div className="font-cinzel text-lg text-amber-500 mb-2">{selectedService?.name}</div>
                <div className="text-amber-200 font-inter">
                    {formatDate(selectedDate)} • ${selectedService?.price}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {availableTimes.map(slot => (
                    <button
                        key={slot.time}
                        onClick={() => {
                            if (slot.available) {
                                setSelectedTime(slot.time);
                                setStep(4);
                            }
                        }}
                        disabled={!slot.available}
                        className={`p-4 rounded-xl border transition-all duration-300 text-center backdrop-blur-sm ${
                            slot.available
                                ? 'border-amber-500/20 bg-gray-800/50 hover:border-amber-500/40 hover:bg-amber-500/10 text-amber-200'
                                : 'border-gray-600/30 bg-gray-900/30 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <div className="font-cinzel text-lg">{slot.time}</div>
                        <div className="font-inter text-sm mt-1">
                            {slot.available ? 'Available' : 'Booked'}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // Étape 4: Informations personnelles - COMPLÈTEMENT uncontrolled
    const Step4 = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => setStep(3)}
                    className="text-amber-400 hover:text-amber-300 font-inter flex items-center"
                >
                    ← Back
                </button>
                <h3 className="font-cinzel text-2xl text-amber-500">Your Information</h3>
                <div className="w-6"></div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 mb-6 border border-amber-500/20 backdrop-blur-sm">
                <div className="text-center">
                    <div className="font-cinzel text-amber-500 text-lg mb-2">{selectedService?.name}</div>
                    <div className="text-amber-200 font-inter">
                        {formatDate(selectedDate)} at {selectedTime}
                    </div>
                    <div className="text-gray-300 font-inter mt-2">${selectedService?.price}</div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-amber-200 mb-2 font-inter text-sm">First Name</label>
                        <UncontrolledInput
                            type="text"
                            name="firstName"
                            defaultValue=""
                            onValueChange={handleFieldChange}
                            required
                            className="w-full bg-gray-700/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 backdrop-blur-sm"
                            placeholder="John"
                            autoComplete="given-name"
                        />
                    </div>
                    <div>
                        <label className="block text-amber-200 mb-2 font-inter text-sm">Last Name</label>
                        <UncontrolledInput
                            type="text"
                            name="lastName"
                            defaultValue=""
                            onValueChange={handleFieldChange}
                            required
                            className="w-full bg-gray-700/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 backdrop-blur-sm"
                            placeholder="Doe"
                            autoComplete="family-name"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-amber-200 mb-2 font-inter text-sm">Email</label>
                    <UncontrolledInput
                        type="email"
                        name="email"
                        defaultValue=""
                        onValueChange={handleFieldChange}
                        required
                        className="w-full bg-gray-700/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 backdrop-blur-sm"
                        placeholder="your.email@example.com"
                        autoComplete="email"
                    />
                </div>

                <div>
                    <label className="block text-amber-200 mb-2 font-inter text-sm">Phone (Optional)</label>
                    <UncontrolledInput
                        type="tel"
                        name="phone"
                        defaultValue=""
                        onValueChange={handleFieldChange}
                        className="w-full bg-gray-700/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 backdrop-blur-sm"
                        placeholder="+1 (555) 123-4567"
                        autoComplete="tel"
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-lg backdrop-blur-sm ${
                        message.type === 'success'
                            ? 'bg-green-900/50 text-green-200 border border-green-500/30'
                            : 'bg-red-900/50 text-red-200 border border-red-500/30'
                    }`}>
                        {message.text}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 text-gray-900 py-4 rounded-lg font-semibold font-inter hover:bg-amber-400 transition-all duration-300 disabled:opacity-50 transform hover:scale-105 backdrop-blur-sm"
                >
                    {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </button>
            </form>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-amber-500/20">
                <div className="p-6">
                    {/* Header avec progression */}
                    <div className="flex justify-between items-center mb-8">
                        <button
                            onClick={onClose}
                            className="text-amber-400 hover:text-amber-300 text-xl transition-colors"
                        >
                            ×
                        </button>
                        <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4].map(s => (
                                <div
                                    key={s}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        step >= s ? 'bg-amber-500' : 'bg-amber-500/30'
                                    }`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={resetSelection}
                            className="text-amber-400 hover:text-amber-300 font-inter text-sm"
                        >
                            Restart
                        </button>
                    </div>

                    {/* Contenu des étapes */}
                    {step === 1 && <Step1 />}
                    {step === 2 && <Step2 />}
                    {step === 3 && <Step3 />}
                    {step === 4 && <Step4 />}
                </div>
            </div>
        </div>
    );
}

export default function Pricing() {
    const [isBooking, setIsBooking] = useState(false);

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
                <Navbar />

                {/* Hero Section */}
                <header className="pricing-hero">
                    <div className="pricing-hero-content">
                        <motion.h1
                            className="font-cinzel"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                        >
                            Investment in Art
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            Each photograph tells a story, each story has its value
                        </motion.p>

                        <motion.button
                            onClick={() => setIsBooking(true)}
                            className="booking-btn primary mt-8"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Book Your Session
                        </motion.button>
                    </div>
                    <div className="section-overlay absolute inset-0"></div>
                </header>

                {/* Pricing Cards */}
                <AnimatedSection className="pricing-section">
                    <div className="container">
                        <motion.h2
                            className="section-title font-cinzel"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                        >
                            Photography Services
                        </motion.h2>

                        <div className="pricing-cards">
                            {SERVICES.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    className={`pricing-card ${
                                        service.id === "artistic" ? "featured" : ""
                                    }`}
                                    initial={{ opacity: 0, y: 50, rotateX: -10 }}
                                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ delay: index * 0.15, duration: 0.6 }}
                                    whileHover={{
                                        y: -15,
                                        scale: 1.03,
                                        boxShadow: "0 20px 60px rgba(245, 158, 11, 0.3)",
                                    }}
                                    onClick={() => setIsBooking(true)}
                                >
                                    {service.id === "artistic" && (
                                        <motion.div
                                            className="featured-badge"
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
                                    <div className="pricing-header">
                                        <h3 className="font-cinzel">{service.name}</h3>
                                        <motion.div
                                            className="price font-cinzel"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                delay: index * 0.15 + 0.2,
                                                type: "spring",
                                                stiffness: 150,
                                            }}
                                        >
                                            ${service.price}
                                        </motion.div>
                                        <p className="price-description">{service.description}</p>
                                    </div>
                                    <div className="pricing-features">
                                        <ul>
                                            {service.features.map((feature, idx) => (
                                                <motion.li
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: index * 0.15 + idx * 0.05 }}
                                                >
                                                    {feature}
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </div>
                                    <motion.button
                                        className={`pricing-btn ${
                                            service.id === "artistic" ? "featured-btn" : ""
                                        }`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Book Session
                                    </motion.button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* Additional Services */}
                <AnimatedSection className="additional-services">
                    <div className="container">
                        <motion.h2
                            className="section-title font-cinzel"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                        >
                            Additional Services
                        </motion.h2>
                        <div className="services-grid">
                            {additionalServices.map((service, index) => (
                                <motion.div
                                    key={index}
                                    className="service-item"
                                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -10, scale: 1.03 }}
                                >
                                    <h3 className="font-cinzel">{service.title}</h3>
                                    <p>{service.desc}</p>
                                    <div className="service-price font-cinzel">
                                        {service.price}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* CTA Section */}
                <AnimatedSection className="booking-section">
                    <div className="container">
                        <motion.div
                            className="booking-content"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-cinzel">Ready to Create Magic?</h2>
                            <p>
                                Let's discuss your vision and create something extraordinary
                                together.
                            </p>
                            <div className="booking-buttons">
                                <motion.button
                                    onClick={() => setIsBooking(true)}
                                    className="booking-btn primary"
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Start Your Project
                                </motion.button>
                                <motion.a
                                    href="mailto:hello@fireflyofsoul.com"
                                    className="booking-btn secondary"
                                    whileHover={{ scale: 1.05, y: -3 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Email Inquiry
                                </motion.a>
                            </div>
                        </motion.div>
                    </div>
                </AnimatedSection>

                {/* Footer */}
                <motion.footer
                    className="footer-pricing"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="logo font-cinzel">Firefly of Soul</div>
                    <p>&copy; 2025 Firefly of Soul Studio. All moments preserved.</p>
                </motion.footer>

                {/* Booking Wizard */}
                {isBooking && <BookingWizard onClose={() => setIsBooking(false)} />}
            </div>
        </PageTransition>
    );
}