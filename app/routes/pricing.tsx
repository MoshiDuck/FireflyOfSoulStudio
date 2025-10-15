// =========================
// File: app/routes/pricing.tsx (MODIFIE)
// =========================

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";
import { AnimatedLayout } from "~/components/AnimatedLayout";
import { API_ENDPOINTS } from '~/config/api';
import "~/styles/pricing.css";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Pricing | Firefly of Soul Studio" },
        { name: "description", content: "Investment in art - photography services and pricing" },
    ];
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
            "2 outfit changes"
        ]
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
            "2 large format prints (16x24)"
        ]
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
            "Priority delivery"
        ]
    }
];
function UncontrolledInput({
                               name,
                               defaultValue = "",
                               onValueChange,
                               ...props
                           }: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
    onValueChange?: (value: string, name: string) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const lastSyncedValue = useRef(defaultValue);

// Initialisation UNIQUEMENT au montage
    useEffect(() => {
        if (ref.current) {
            ref.current.value = defaultValue as string;
            lastSyncedValue.current = defaultValue;
        }
    }, []); // empty deps - only on mount

    const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        const value = (e.target as HTMLInputElement).value;
        if (value !== lastSyncedValue.current) {
            lastSyncedValue.current = value;
            onValueChange?.(value, name || "");
        }
    }, [name, onValueChange]);

    return (
        <input
            ref={ref}
            name={name}
            onInput={handleInput}
            {...props}
        />
    );
}
function useFormDataManager(initialData: { firstName: string; lastName: string; email: string; phone: string }) {
    const formDataRef = useRef(initialData);
    const [, forceUpdate] = useState({});

    const updateField = useCallback((field: string, value: string) => {
        formDataRef.current = { ...formDataRef.current, [field]: value };
    }, []);

    const getFormData = useCallback(() => formDataRef.current, []);

    const reset = useCallback((newData = initialData) => {
        formDataRef.current = newData;
        forceUpdate({});
    }, [initialData]);

    return {
        updateField,
        getFormData,
        reset
    };
}
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
        <AnimatedLayout>
            <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
                {/* Canvas pour les fireflies */}
                <div className="absolute inset-0 pointer-events-none" id="fireflyCanvas"></div>

                <Navbar/>

                {/* Hero Section with content preserved */}
                <header className="pricing-hero">
                    <div className="pricing-hero-content">
                        <h1 className="font-cinzel">Investment in Art</h1>
                        <p>Each photograph tells a story, each story has its value</p>

                        <button
                            onClick={() => setIsBooking(true)}
                            className="booking-btn primary mt-8"
                        >
                            Book Your Session
                        </button>
                    </div>
                    <div className="section-overlay absolute inset-0"></div>
                </header>
                {/* Section des tarifs */}
                <section className="pricing-section">
                    <div className="container">
                        <h2 className="section-title font-cinzel">Photography Services</h2>

                        <div className="pricing-cards">
                            {SERVICES.map(s => (
                                <div key={s.id} className={`pricing-card ${s.id === 'artistic' ? 'featured' : ''}`}
                                     onClick={() => setIsBooking(true)}>
                                    {s.id === 'artistic' && <div className="featured-badge">Most Popular</div>}
                                    <div className="pricing-header">
                                        <h3 className="font-cinzel">{s.name}</h3>
                                        <div className="price font-cinzel">${s.price}</div>
                                        <p className="price-description">{s.description}</p>
                                    </div>
                                    <div className="pricing-features">
                                        <ul>
                                            {s.features.map((f, i) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </div>
                                    <button className={`pricing-btn ${s.id === 'artistic' ? 'featured-btn' : ''}`}>Book
                                        Session
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                {/* Additional services */}
                <section className="additional-services">
                    <div className="container">
                        <h2 className="section-title font-cinzel">Additional Services</h2>
                        <div className="services-grid">
                            <div className="service-item">
                                <h3 className="font-cinzel">Print Collections</h3>
                                <p>Fine art prints on premium archival paper</p>
                                <div className="service-price font-cinzel">Starting at $150</div>
                            </div>
                            <div className="service-item">
                                <h3 className="font-cinzel">Digital Enhancement</h3>
                                <p>Advanced retouching for existing images</p>
                                <div className="service-price font-cinzel">$75/image</div>
                            </div>
                            <div className="service-item">
                                <h3 className="font-cinzel">Digital Enhancement</h3>
                                <p>Advanced retouching for existing images</p>
                                <div className="service-price font-cinzel">$75/image</div>
                            </div>
                            <div className="service-item">
                                <h3 className="font-cinzel">Album Design</h3>
                                <p>Custom designed photo books</p>
                                <div className="service-price font-cinzel">Starting at $300</div>
                            </div>
                        </div>
                        {/* fin .services-grid */}
                    </div>
                    {/* fin .container */}
                </section>
                {/* fin .additional-services */}
                {/* Booking section */}
                <section className="booking-section">
                    <div className="container">
                        <div className="booking-content">
                            <h2 className="font-cinzel">Ready to Create Magic?</h2>
                            <p>Let's discuss your vision and create something extraordinary together.</p>
                            <div className="booking-buttons">
                                <button
                                    onClick={() => setIsBooking(true)}
                                    className="booking-btn primary"
                                >
                                    Start Your Project
                                </button>
                                <a
                                    href="mailto:hello@fireflyofsoul.com"
                                    className="booking-btn secondary"
                                >
                                    Email Inquiry
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Footer */}
                <footer className="footer-pricing">
                    <div className="container">
                        <div className="logo font-cinzel">Firefly of Soul</div>
                        <p>&copy; 2025 Firefly of Soul Studio. All moments preserved.</p>
                    </div>
                </footer>

                {/* Wizard de réservation */}
                {isBooking && (
                    <BookingWizard onClose={() => setIsBooking(false)}/>
                )}
            </div>
            {/* fin du wrapper principal (.min-h-screen ...) */}
        </AnimatedLayout>
    );
}
