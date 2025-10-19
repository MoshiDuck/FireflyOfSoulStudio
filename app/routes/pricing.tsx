// Todo : app/routes/pricing.tsx
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
        { title: "Tarifs & Réservation | Firefly of Soul Studio" },
        {
            name: "description",
            content: "Séances photo professionnelles et produits premium. Réservez votre expérience artistique directement en ligne.",
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
    type: 'session' | 'product';
    capacities?: Capacity[];
}

interface Capacity {
    size: string;
    price: number;
    description: string;
}

interface TimeSlot {
    time: string;
    available: boolean;
}

interface CartItem {
    service: Service;
    quantity: number;
    selectedCapacity?: Capacity;
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

// ✅ NOUVELLE INTERFACE pour les créneaux réservés
interface BookedSlot {
    reservation_time: string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

// ✅ Tous les services et produits unifiés
const ALL_SERVICES: Service[] = [
    // Séances photo
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
        name: "Série Artistique",
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
    // Produits digitaux
    {
        id: "raw-files",
        name: "Collection Fichiers RAW",
        price: 299,
        description: "Set complet des fichiers bruts",
        duration: "Livraison digitale",
        type: 'product',
        features: [
            "Tous les fichiers RAW originaux",
            "Pleine résolution",
            "Droits d'usage commercial",
            "Accès archive à vie",
            "Métadonnées techniques incluses"
        ],
    },
    // Produits physiques
    {
        id: "fine-art-print",
        name: "Impression Fine Art",
        price: 150,
        description: "Tirage qualité musée",
        duration: "2-3 semaines",
        type: 'product',
        features: [
            "Papier archive premium",
            "Édition numérotée",
            "Certificat d'authenticité",
            "Encadrement sur mesure disponible",
            "Format: 16x24 pouces"
        ],
    },
    {
        id: "premium-album",
        name: "Album Premium",
        price: 350,
        description: "Album relié cuir artisanat",
        duration: "3-4 semaines",
        type: 'product',
        features: [
            "Couverture cuir italien",
            "50 pages premium",
            "Relure à plat",
            "Gravure personnalisée",
            "Boîtier de présentation"
        ],
    },
    {
        id: "premium-usb",
        name: "Clé USB Édition Premium",
        price: 199, // Prix par défaut pour 32Go
        description: "Clé USB gravée avec votre collection",
        duration: "1-2 semaines",
        type: 'product',
        features: [
            "Gravure personnalisée gratuite",
            "Toutes vos photos en haute résolution",
            "Formats JPEG + PNG inclus",
            "Boîtier de présentation premium",
            "Sauvegarde cloud incluse (1 an)"
        ],
        capacities: [
            { size: "8Go", price: 99, description: "Parfait pour les séances courtes" },
            { size: "16Go", price: 149, description: "Idéal pour les portraits" },
            { size: "32Go", price: 199, description: "Recommandé - Convient à la plupart des séances" },
            { size: "64Go", price: 299, description: "Parfait pour les séances longues" },
            { size: "128Go", price: 449, description: "Ultime - Pour les projets complets" }
        ]
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

// ✅ Composant Panier
function Cart({ cart, onUpdateQuantity, onRemoveItem, onCheckout }: {
    cart: CartItem[];
    onUpdateQuantity: (index: number, quantity: number) => void;
    onRemoveItem: (index: number) => void;
    onCheckout: () => void;
}) {
    const total = cart.reduce((sum, item) => {
        const price = item.selectedCapacity?.price || item.service.price;
        return sum + (price * item.quantity);
    }, 0);

    if (cart.length === 0) {
        return null;
    }

    return (
        <motion.div
            className="cart-sidebar"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="cart-header">
                <h3>Votre Panier</h3>
                <span className="cart-count">{cart.length} article{cart.length > 1 ? 's' : ''}</span>
            </div>

            <div className="cart-items">
                {cart.map((item, index) => {
                    const price = item.selectedCapacity?.price || item.service.price;
                    return (
                        <div key={index} className="cart-item">
                            <div className="cart-item-info">
                                <div className="cart-item-name">{item.service.name}</div>
                                {item.selectedCapacity && (
                                    <div className="cart-item-capacity">{item.selectedCapacity.size}</div>
                                )}
                                <div className="cart-item-price">{price}€</div>
                            </div>

                            <div className="cart-item-controls">
                                <div className="quantity-controls">
                                    <button
                                        onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                                        className="quantity-btn"
                                    >
                                        −
                                    </button>
                                    <span className="quantity">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                        className="quantity-btn"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    onClick={() => onRemoveItem(index)}
                                    className="remove-btn"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="cart-footer">
                <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-price">{total}€</span>
                </div>
                <motion.button
                    onClick={onCheckout}
                    className="checkout-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Commander ({total}€)
                </motion.button>
            </div>
        </motion.div>
    );
}

// ✅ Composant de réservation intégré à la page
function BookingSection({
                            cart,
                            onBack,
                            onBookingComplete
                        }: {
    cart: CartItem[];
    onBack: () => void;
    onBookingComplete: () => void;
}) {
    const [step, setStep] = useState(1);
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

    // Vérifier si le panier contient des séances (nécessitent date/heure)
    const hasSessions = cart.some(item => item.service.type === 'session');

    useEffect(() => {
        if (hasSessions) {
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
        } else {
            // Si pas de séances, passer directement aux infos personnelles
            setStep(3);
        }
    }, [hasSessions]);

    // ✅ CORRECTION : Récupération des créneaux réservés depuis l'API avec typage correct
    useEffect(() => {
        const fetchBookedSlots = async () => {
            if (selectedDate && hasSessions) {
                try {
                    console.log('🔍 Fetching booked slots for date:', selectedDate);

                    const response = await fetch(`${API_ENDPOINTS.RESERVATIONS}?date=${selectedDate}`);

                    if (response.ok) {
                        const bookedSlots = await response.json() as BookedSlot[];
                        console.log('📅 Créneaux réservés:', bookedSlots);

                        // Extraire les heures réservées
                        const bookedTimes = bookedSlots.map((slot: BookedSlot) => slot.reservation_time);
                        console.log('⏰ Heures réservées:', bookedTimes);

                        // Générer tous les créneaux possibles (9h-18h)
                        const allTimeSlots: TimeSlot[] = [];
                        for (let hour = 9; hour < 18; hour++) {
                            const time = `${hour.toString().padStart(2, '0')}:00`;
                            allTimeSlots.push({
                                time,
                                available: !bookedTimes.includes(time)
                            });
                        }

                        console.log('🗓️ Créneaux générés:', allTimeSlots);
                        setAvailableTimes(allTimeSlots);
                    } else {
                        console.error('❌ Erreur lors du fetch des créneaux réservés');
                        // En cas d'erreur, on considère tous les créneaux comme disponibles
                        generateFallbackTimeSlots();
                    }
                } catch (error) {
                    console.error('❌ Erreur réseau:', error);
                    generateFallbackTimeSlots();
                }
            }
        };

        const generateFallbackTimeSlots = () => {
            const times: TimeSlot[] = [];
            for (let hour = 9; hour < 18; hour++) {
                times.push({
                    time: `${hour.toString().padStart(2, '0')}:00`,
                    available: true // Par défaut, tout est disponible
                });
            }
            setAvailableTimes(times);
        };

        fetchBookedSlots();
    }, [selectedDate, hasSessions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        try {
            const formData = getFormData();

            // ✅ VALIDATION RENFORCÉE AVANT ENVOI
            console.log('🔍 VALIDATION FRONTEND:', {
                firstName: formData.firstName?.trim(),
                lastName: formData.lastName?.trim(),
                email: formData.email?.trim(),
                cartLength: cart.length,
                hasSessions: cart.some(item => item.service.type === 'session'),
                selectedDate: selectedDate,
                selectedTime: selectedTime
            });

            // Validation des champs obligatoires
            const missingFields = [];
            if (!formData.firstName?.trim()) missingFields.push('Prénom');
            if (!formData.lastName?.trim()) missingFields.push('Nom');
            if (!formData.email?.trim()) missingFields.push('Email');

            if (missingFields.length > 0) {
                setMessage({
                    type: 'error',
                    text: `Champs obligatoires manquants: ${missingFields.join(', ')}`
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

            // Validation pour les séances
            const hasSessions = cart.some(item => item.service.type === 'session');
            if (hasSessions && (!selectedDate || !selectedTime)) {
                setMessage({
                    type: 'error',
                    text: 'Veuillez sélectionner une date et une heure pour votre séance photo'
                });
                setIsSubmitting(false);
                return;
            }

            // ✅ CORRECTION : Vérification supplémentaire que le créneau est toujours disponible
            if (hasSessions) {
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

            // ✅ STRUCTURE FINALE DES DONNÉES
            const requestData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phone: formData.phone?.trim() || '',
                cart: cart.map(item => ({
                    productId: item.service.id,
                    productName: item.service.name,
                    productType: item.service.type,
                    quantity: item.quantity,
                    capacity: item.selectedCapacity?.size,
                    price: item.selectedCapacity?.price || item.service.price
                })),
                total: cart.reduce((sum, item) => sum + ((item.selectedCapacity?.price || item.service.price) * item.quantity), 0),
                // ✅ CORRECTION : utiliser les mêmes noms que dans l'API
                date: selectedDate,
                time: selectedTime,
                type: hasSessions ? (cart.some(item => item.service.type === 'product') ? 'mixed' : 'session') : 'product'
            };

            console.log('📤 DONNÉES FINALES POUR API:', requestData);

            // ✅ APPEL API
            const response = await fetch(API_ENDPOINTS.RESERVATIONS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            // ✅ CORRECTION TYPE : Typage explicite de la réponse
            const result = await response.json() as ApiSuccessResponse | ApiErrorResponse;

            // ✅ GESTION DE LA RÉPONSE
            if (response.ok) {
                if ('success' in result && result.success) {
                    setMessage({
                        type: 'success',
                        text: result.message || '✅ Commande confirmée ! Nous vous contactons rapidement.'
                    });

                    // ✅ RÉINITIALISATION APRÈS SUCCÈS
                    setTimeout(() => {
                        onBookingComplete();
                        reset({
                            firstName: "",
                            lastName: "",
                            email: "",
                            phone: ""
                        });
                        setSelectedDate("");
                        setSelectedTime("");
                    }, 3000);
                } else {
                    setMessage({
                        type: 'error',
                        text: '❌ Réponse inattendue du serveur'
                    });
                }
            } else {
                // ✅ GESTION D'ERREURS SPÉCIFIQUES
                const errorMessage = 'error' in result ? result.error : 'Erreur lors de la réservation';
                setMessage({
                    type: 'error',
                    text: errorMessage
                });

                // Si erreur de créneau occupé, revenir à l'étape 1
                if (errorMessage.includes('créneau') || errorMessage.includes('réservé')) {
                    if (hasSessions) setStep(1);
                }
            }
        } catch (error) {
            console.error('❌ Erreur de réservation:', error);
            setMessage({
                type: 'error',
                text: 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.'
            });
            setIsSubmitting(false);
        }
    };

    const handleFieldChange = useCallback((value: string, fieldName: string) => {
        updateField(fieldName, value);
    }, [updateField]);

    const formatDate = useCallback((dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    const getTotalPrice = () => {
        return cart.reduce((sum, item) => {
            const price = item.selectedCapacity?.price || item.service.price;
            return sum + (price * item.quantity);
        }, 0);
    };

    // Étape 1: Sélection de la date (uniquement si séances)
    const Step1 = () => (
        <div className="booking-step">
            <div className="booking-step-header">
                <button onClick={onBack} className="back-button">
                    ← Retour au panier
                </button>
                <h3 className="booking-step-title">Choisissez une date pour votre séance</h3>
                <div className="spacer"></div>
            </div>

            <div className="selected-service-info">
                <div className="service-name">Votre Commande</div>
                <div className="service-details">
                    {cart.length} article{cart.length > 1 ? 's' : ''} • {getTotalPrice()}€
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

    // Étape 2: Sélection de l'heure (uniquement si séances)
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
                <div className="service-name">Votre Commande</div>
                <div className="service-details">
                    {formatDate(selectedDate)} • {getTotalPrice()}€
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

    // Étape 3: Informations personnelles (toujours)
    const Step3 = () => (
        <div className="booking-step">
            <div className="booking-step-header">
                <button onClick={() => hasSessions ? setStep(2) : onBack()} className="back-button">
                    ← Retour
                </button>
                <h3 className="booking-step-title">Vos informations</h3>
                <div className="spacer"></div>
            </div>

            <div className="booking-summary">
                <div className="summary-service">Votre Commande</div>
                <div className="summary-details">
                    {hasSessions
                        ? `${formatDate(selectedDate)} à ${selectedTime}`
                        : `${cart.length} produit${cart.length > 1 ? 's' : ''}`
                    }
                </div>
                <div className="summary-price">{getTotalPrice()}€</div>

                {/* Détails du panier */}
                <div className="cart-summary">
                    {cart.map((item, index) => (
                        <div key={index} className="cart-summary-item">
                            <span>{item.service.name}</span>
                            <span>{item.selectedCapacity?.price || item.service.price}€ × {item.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Prénom</label>
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
                        <label>Nom</label>
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
                    <label>Email</label>
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
                    {isSubmitting
                        ? 'Confirmation...'
                        : 'Confirmer la Commande'
                    }
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
                {step === 1 && hasSessions && <Step1 />}
                {step === 2 && hasSessions && <Step2 />}
                {step === 3 && <Step3 />}
            </div>
        </motion.section>
    );
}

// ✅ Composant Carte de Service avec sélecteur de capacité
function ServiceCard({
                         service,
                         onAddToCart
                     }: {
    service: Service;
    onAddToCart: (service: Service, capacity?: Capacity) => void;
}) {
    const [selectedCapacity, setSelectedCapacity] = useState<Capacity | undefined>(
        service.capacities ? service.capacities[2] : undefined
    );

    const displayPrice = selectedCapacity?.price || service.price;

    return (
        <motion.div
            className={`service-card ${service.type} ${service.id === "artistic" ? "featured" : ""}`}
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
                {service.type === 'session' ? '📸 Séance' : '🎁 Produit'}
            </div>

            <div className="service-header">
                <h3>{service.name}</h3>
                <div className="service-price">{displayPrice}€</div>
            </div>

            <p className="service-description">{service.description}</p>
            <p className="service-duration">{service.duration}</p>

            {/* Sélecteur de capacité pour les produits qui en ont */}
            {service.capacities && (
                <div className="capacity-selector">
                    <div className="capacity-label">Choisissez la capacité :</div>
                    <div className="capacity-options">
                        {service.capacities.map((capacity, index) => (
                            <motion.button
                                key={capacity.size}
                                className={`capacity-option ${selectedCapacity?.size === capacity.size ? 'selected' : ''} ${capacity.size === "32Go" ? 'recommended' : ''}`}
                                onClick={() => setSelectedCapacity(capacity)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="capacity-size">{capacity.size}</div>
                                <div className="capacity-price">{capacity.price}€</div>
                                {capacity.size === "32Go" && (
                                    <div className="recommended-badge">Recommandé</div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                    {selectedCapacity && (
                        <div className="capacity-description">
                            {selectedCapacity.description}
                        </div>
                    )}
                </div>
            )}

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
                className={`service-btn ${service.type === 'session' ? 'session-btn' : 'product-btn'}`}
                onClick={() => onAddToCart(service, selectedCapacity)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
            >
                {service.type === 'session' ? 'Ajouter au Panier' : 'Ajouter au Panier'}
            </motion.button>
        </motion.div>
    );
}

export default function Tarifs() {
    const [activeFilter, setActiveFilter] = useState<'all' | 'session' | 'product'>('all');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const filteredServices = ALL_SERVICES.filter(service =>
        activeFilter === 'all' || service.type === activeFilter
    );

    const handleAddToCart = (service: Service, capacity?: Capacity) => {
        const existingItemIndex = cart.findIndex(
            item => item.service.id === service.id && item.selectedCapacity?.size === capacity?.size
        );

        if (existingItemIndex !== -1) {
            // Incrémenter la quantité si le même produit avec la même capacité existe déjà
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += 1;
            setCart(newCart);
        } else {
            // Ajouter un nouvel item
            setCart([...cart, { service, quantity: 1, selectedCapacity: capacity }]);
        }

        // Feedback visuel
        const button = document.querySelector(`[data-service="${service.id}"]`);
        if (button) {
            button.classList.add('added-to-cart');
            setTimeout(() => button.classList.remove('added-to-cart'), 1000);
        }
    };

    const handleUpdateQuantity = (index: number, quantity: number) => {
        const newCart = [...cart];
        if (quantity <= 0) {
            newCart.splice(index, 1);
        } else {
            newCart[index].quantity = quantity;
        }
        setCart(newCart);
    };

    const handleRemoveItem = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;

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
        setCart([]);
        // Scroll vers le haut
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                            <motion.h1
                                className="tarifs-hero-title"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                            >
                                Investissement <span className="text-accent">Artistique</span>
                            </motion.h1>
                            <motion.p
                                className="tarifs-hero-subtitle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                Séances photo sur mesure et produits d'exception.
                                Réservez votre expérience créative directement en ligne.
                            </motion.p>
                        </div>
                    </div>
                    <div className="scroll-indicator">
                        <div className="scroll-arrow"></div>
                    </div>
                </header>

                {/* Filtres */}
                {!isCheckingOut && (
                    <AnimatedSection className="filters-section">
                        <div className="container">
                            <div className="filters">
                                <motion.button
                                    className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                                    onClick={() => setActiveFilter('all')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Tout Voir
                                </motion.button>
                                <motion.button
                                    className={`filter-btn ${activeFilter === 'session' ? 'active' : ''}`}
                                    onClick={() => setActiveFilter('session')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Séances Photo
                                </motion.button>
                                <motion.button
                                    className={`filter-btn ${activeFilter === 'product' ? 'active' : ''}`}
                                    onClick={() => setActiveFilter('product')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Produits
                                </motion.button>
                            </div>
                        </div>
                    </AnimatedSection>
                )}

                {/* Services Grid - Caché pendant la réservation */}
                {!isCheckingOut && (
                    <AnimatedSection className="services-section">
                        <div className="container">
                            <div className="services-grid">
                                {filteredServices.map((service, index) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>
                )}

                {/* Panier - Caché pendant la réservation */}
                {!isCheckingOut && (
                    <Cart
                        cart={cart}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                        onCheckout={handleCheckout}
                    />
                )}

                {/* Section Réservation Dynamique */}
                {isCheckingOut && (
                    <div id="booking-section">
                        <BookingSection
                            cart={cart}
                            onBack={() => {
                                setIsCheckingOut(false);
                            }}
                            onBookingComplete={handleBookingComplete}
                        />
                    </div>
                )}

                {/* CTA Section - Caché pendant la réservation */}
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
                                    Prêt à Créer des Œuvres Intemporelles ?
                                </motion.h2>
                                <motion.p
                                    className="cta-description"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                >
                                    Discutons de votre vision et créons quelque chose d'extraordinaire ensemble.
                                    Votre art intemporel vous attend.
                                </motion.p>
                                <motion.div
                                    className="cta-actions"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                >
                                    <Link to="/gallery" className="btn btn-primary btn-large">
                                        Voir Notre Travail
                                    </Link>
                                    <motion.a
                                        href="mailto:hello@fireflyofsoul.com"
                                        className="btn btn-secondary btn-large"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Contact par Email
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
                                    <Link to="/gallery">Galerie</Link>
                                    <Link to="/tarifs">Tarifs</Link>
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