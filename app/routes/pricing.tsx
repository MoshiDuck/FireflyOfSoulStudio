// Todo : app/routes/pricing.tsx
import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";
import { useState } from "react";
import { API_ENDPOINTS } from '~/config/api';

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

// Composant modal de réservation
function BookingModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        date: "",
        time: "",
        service: "portrait"
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const response = await fetch(API_ENDPOINTS.RESERVATIONS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json() as ApiResponse;

            if (response.ok) {
                // Type guard pour vérifier que c'est une réponse de succès
                if ('success' in result && result.success) {
                    setMessage({ type: 'success', text: result.message || 'Reservation confirmed!' });
                    setFormData({ name: "", email: "", date: "", time: "", service: "portrait" });
                    setTimeout(() => {
                        onClose();
                    }, 2000);
                } else {
                    setMessage({ type: 'error', text: 'Unexpected response format' });
                }
            } else {
                // Type guard pour vérifier que c'est une réponse d'erreur
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Générer les créneaux horaires
    const timeSlots = [];
    for (let hour = 9; hour < 18; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-cinzel text-2xl text-amber-500">Book Your Session</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Service Type</label>
                            <select
                                name="service"
                                value={formData.service}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            >
                                <option value="portrait">Portrait Session - $450</option>
                                <option value="artistic">Artistic Series - $850</option>
                                <option value="editorial">Editorial Project - $1,200</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">Time</label>
                            <select
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                            >
                                <option value="">Select a time</option>
                                {timeSlots.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg ${
                                message.type === 'success'
                                    ? 'bg-green-900 text-green-200'
                                    : 'bg-red-900 text-red-200'
                            }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-500 transition-all duration-300 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-amber-500 text-gray-900 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
                            >
                                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function Pricing() {
    const [isBooking, setIsBooking] = useState(false);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <header className="pricing-hero min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="pricing-hero-content text-center">
                    <h1 className="font-cinzel text-4xl md:text-6xl text-amber-500 mb-4">
                        Investment in Art
                    </h1>
                    <p className="text-gray-300 text-xl">Each photograph tells a story, each story has its value</p>

                    {/* Bouton pour ouvrir le formulaire de réservation */}
                    <button
                        onClick={() => setIsBooking(true)}
                        className="mt-8 bg-amber-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-all duration-300 transform hover:scale-105"
                    >
                        Book Your Session
                    </button>
                </div>
            </header>

            {/* Modal de réservation */}
            {isBooking && (
                <BookingModal onClose={() => setIsBooking(false)} />
            )}

            {/* Section des tarifs existante */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="font-cinzel text-3xl text-amber-500 text-center mb-12">
                        Photography Services
                    </h2>
                    {/* Vos cartes de prix existantes ici */}
                </div>
            </section>
        </div>
    );
}