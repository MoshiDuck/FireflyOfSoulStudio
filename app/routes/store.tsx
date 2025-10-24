// Todo : app/routes/store.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import "../styles/store.css";
import { PageLayout } from "~/components/PageLayout";
import { HeroSection } from "~/components/HeroSection";
import { SectionHeader } from "~/components/SectionHeader";
import { CTASection } from "~/components/CTASection";
import { AnimatedSection } from "~/components/AnimatedSection";
import { motion } from "motion/react";
import { Link } from "react-router";

// ✅ COMPOSANTS NON-CONTRÔLÉS RÉTABLIS
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
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
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

interface Capacity {
    size: string;
    price: number;
    description: string;
}

interface Service {
    id: string;
    name: string;
    price: number;
    description: string;
    duration: string;
    features: string[];
    type: 'product';
    capacities?: Capacity[];
}

interface CartItem {
    service: Service;
    quantity: number;
    selectedCapacity?: Capacity;
}

const STORE_PRODUCTS: Service[] = [
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
        price: 199,
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

// Composant Carte de Produit avec sélecteur de capacité
function ProductCard({ product, onAddToCart }: {
    product: Service;
    onAddToCart: (product: Service, capacity?: Capacity) => void;
}) {
    const [selectedCapacity, setSelectedCapacity] = useState<Capacity | undefined>(
        product.capacities ? product.capacities[2] : undefined
    );

    const displayPrice = selectedCapacity?.price || product.price;

    return (
        <motion.div
            className="service-card product"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8 }}
        >
            <div className="service-type-badge">
                🎁 Produit
            </div>

            <div className="service-header">
                <h3>{product.name}</h3>
                <div className="service-price">{displayPrice}€</div>
            </div>

            <p className="service-description">{product.description}</p>
            <p className="service-duration">{product.duration}</p>

            {/* Sélecteur de capacité */}
            {product.capacities && (
                <div className="capacity-selector">
                    <div className="capacity-label">Choisissez la capacité :</div>
                    <div className="capacity-options">
                        {product.capacities.map((capacity) => (
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
                    {product.features.map((feature, idx) => (
                        <li key={idx}>
                            <span className="feature-icon">✓</span>
                            {feature}
                        </li>
                    ))}
                </ul>
            </div>

            <motion.button
                className="service-btn product-btn"
                onClick={() => onAddToCart(product, selectedCapacity)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                data-service={product.id}
            >
                Ajouter au Panier
            </motion.button>
        </motion.div>
    );
}

// Composant Panier pour la boutique
function StoreCart({ cart, onUpdateQuantity, onRemoveItem, onCheckout }: {
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

// Composant Processus de Commande pour la boutique
function StoreCheckoutProcess({ cart, onBack, onComplete }: {
    cart: CartItem[];
    onBack: () => void;
    onComplete: () => void;
}) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ CORRECTION : Retour à l'approche non-contrôlée
    const { updateField, getFormData, reset } = useFormDataManager({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        message: ''
    });

    // ✅ CORRECTION : Gestionnaire de changement de champ non-contrôlé
    const handleFieldChange = useCallback((value: string, fieldName: string) => {
        updateField(fieldName, value);
    }, [updateField]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = getFormData();

        // Validation
        if (!formData.name?.trim() || !formData.email?.trim() || !formData.phone?.trim() ||
            !formData.address?.trim() || !formData.city?.trim() || !formData.postalCode?.trim()) {
            alert('Veuillez remplir tous les champs obligatoires');
            setIsSubmitting(false);
            return;
        }

        // Simulation d'envoi de commande
        console.log('Données de commande:', { cart, formData });

        try {
            // await fetch('/api/orders', { method: 'POST', body: JSON.stringify({ cart, formData }) });
            setTimeout(() => {
                alert('Votre commande a été envoyée ! Nous vous contacterons pour finaliser les détails.');
                onComplete();
                reset({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    city: '',
                    postalCode: '',
                    message: ''
                });
            }, 1000);
        } catch (error) {
            alert('Une erreur est survenue. Veuillez nous contacter directement.');
            setIsSubmitting(false);
        }
    };

    const total = cart.reduce((sum, item) => {
        const price = item.selectedCapacity?.price || item.service.price;
        return sum + (price * item.quantity);
    }, 0);

    return (
        <AnimatedSection className="booking-process-section">
            <div className="container">
                <div className="booking-process">
                    {/* Étapes de progression */}
                    <div className="booking-progress">
                        <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                            <div className="step-number">1</div>
                            <span>Votre Commande</span>
                        </div>
                        <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                            <div className="step-number">2</div>
                            <span>Livraison</span>
                        </div>
                        <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                            <div className="step-number">3</div>
                            <span>Confirmation</span>
                        </div>
                    </div>

                    {/* Étape 1: Récapitulatif */}
                    {step === 1 && (
                        <motion.div
                            className="booking-step"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h2>Votre Commande</h2>
                            <div className="booking-summary">
                                {cart.map((item, index) => {
                                    const price = item.selectedCapacity?.price || item.service.price;
                                    return (
                                        <div key={index} className="summary-item">
                                            <div className="item-info">
                                                <h4>{item.service.name}</h4>
                                                <p>{item.service.description}</p>
                                                {item.selectedCapacity && (
                                                    <p className="item-quantity">Capacité: {item.selectedCapacity.size}</p>
                                                )}
                                                <span className="item-quantity">Quantité: {item.quantity}</span>
                                            </div>
                                            <div className="item-price">
                                                {price}€
                                            </div>
                                        </div>
                                    );
                                })}
                                <div className="summary-total">
                                    <strong>Total: {total}€</strong>
                                </div>
                            </div>
                            <div className="booking-actions">
                                <button onClick={onBack} className="btn btn-secondary">
                                    ← Modifier ma commande
                                </button>
                                <button onClick={() => setStep(2)} className="btn btn-primary">
                                    Continuer →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Étape 2: Formulaire */}
                    {step === 2 && (
                        <motion.div
                            className="booking-step"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h2>Informations de Livraison</h2>
                            <form onSubmit={handleSubmit} className="booking-form">
                                <div className="form-group">
                                    <label htmlFor="name">Nom complet *</label>
                                    <UncontrolledInput
                                        type="text"
                                        id="name"
                                        name="name"
                                        defaultValue=""
                                        onValueChange={handleFieldChange}
                                        required
                                        className="form-input"
                                        placeholder="Votre nom complet"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <UncontrolledInput
                                        type="email"
                                        id="email"
                                        name="email"
                                        defaultValue=""
                                        onValueChange={handleFieldChange}
                                        required
                                        className="form-input"
                                        placeholder="votre.email@example.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Téléphone *</label>
                                    <UncontrolledInput
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        defaultValue=""
                                        onValueChange={handleFieldChange}
                                        required
                                        className="form-input"
                                        placeholder="+33 6 12 34 56 78"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="address">Adresse *</label>
                                    <UncontrolledInput
                                        type="text"
                                        id="address"
                                        name="address"
                                        defaultValue=""
                                        onValueChange={handleFieldChange}
                                        required
                                        className="form-input"
                                        placeholder="Votre adresse complète"
                                    />
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="city">Ville *</label>
                                        <UncontrolledInput
                                            type="text"
                                            id="city"
                                            name="city"
                                            defaultValue=""
                                            onValueChange={handleFieldChange}
                                            required
                                            className="form-input"
                                            placeholder="Votre ville"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="postalCode">Code Postal *</label>
                                        <UncontrolledInput
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            defaultValue=""
                                            onValueChange={handleFieldChange}
                                            required
                                            className="form-input"
                                            placeholder="Code postal"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Message (optionnel)</label>
                                    <UncontrolledTextArea
                                        id="message"
                                        name="message"
                                        defaultValue=""
                                        onValueChange={handleFieldChange}
                                        rows={4}
                                        className="form-input"
                                        placeholder="Instructions spéciales pour la livraison..."
                                    />
                                </div>
                                <div className="booking-actions">
                                    <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                                        ← Retour
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                                        {isSubmitting ? 'Envoi en cours...' : 'Confirmer la commande'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            </div>
        </AnimatedSection>
    );
}

export default function Store() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleAddToCart = (product: Service, capacity?: Capacity) => {
        const existingItemIndex = cart.findIndex(
            item => item.service.id === product.id && item.selectedCapacity?.size === capacity?.size
        );

        if (existingItemIndex !== -1) {
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, { service: product, quantity: 1, selectedCapacity: capacity }]);
        }

        // Feedback visuel
        const button = document.querySelector(`[data-service="${product.id}"]`);
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
        if (cart.length === 0) {
            alert("Veuillez d'abord ajouter des produits à votre panier");
            return;
        }

        setIsCheckingOut(true);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleOrderComplete = () => {
        setIsCheckingOut(false);
        setCart([]);
    };

    return (
        <PageLayout className="store-page">
            {/* Hero Section avec composant */}
            <HeroSection
                backgroundImage="https://images.unsplash.com/photo-1589994965851-a8f479c573a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                title="Boutique Premium"
                accentWord="Premium"
                subtitle="Des produits d'exception pour mettre en valeur vos photos. Albums luxueux, impressions qualité musée et collections digitales complètes."
                buttons={[
                    { text: "Réserver un Shooting", url: "/shootings", type: "secondary" }
                ]}
                className="store-hero"
                showScrollIndicator={!isCheckingOut}
            />

            {/* Afficher le processus de commande ou les produits */}
            {isCheckingOut ? (
                <StoreCheckoutProcess
                    cart={cart}
                    onBack={() => setIsCheckingOut(false)}
                    onComplete={handleOrderComplete}
                />
            ) : (
                <>
                    {/* Products Grid avec SectionHeader */}
                    <AnimatedSection className="services-section">
                        <div className="container">
                            <SectionHeader
                                badge="Nos Produits"
                                title="Excellence Matérielle & Digitale"
                                accentWord="Digitale"
                                subtitle="Chaque produit est conçu avec le plus grand soin pour préserver et magnifier vos souvenirs photographiques."
                            />
                            <div className="services-grid">
                                {STORE_PRODUCTS.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Quality Section avec SectionHeader */}
                    <AnimatedSection className="quality-section">
                        <div className="container">
                            <SectionHeader
                                badge="Notre Engagement"
                                title="Qualité Exceptionnelle"
                                accentWord="Exceptionnelle"
                            />
                            <div className="quality-features">
                                <div className="quality-feature">
                                    <div className="quality-icon">🛠️</div>
                                    <h3>Artisanat</h3>
                                    <p>Matériaux premium et finitions impeccables pour une durabilité exceptionnelle</p>
                                </div>
                                <div className="quality-feature">
                                    <div className="quality-icon">🎨</div>
                                    <h3>Esthétique</h3>
                                    <p>Design épuré et élégant qui met parfaitement en valeur vos images</p>
                                </div>
                                <div className="quality-feature">
                                    <div className="quality-icon">📦</div>
                                    <h3>Livraison</h3>
                                    <p>Emballage soigné et livraison sécurisée pour une expérience complète</p>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </>
            )}

            {/* Panier - Seulement visible quand on ne checkoute pas */}
            {!isCheckingOut && cart.length > 0 && (
                <StoreCart
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={handleCheckout}
                />
            )}

            {/* CTA Section avec composant - Seulement visible quand on ne checkoute pas */}
            {!isCheckingOut && (
                <CTASection
                    title="Prêt à Magnifier Vos Photos ?"
                    description="Choisissez les produits qui correspondent à votre style et donnez vie à vos images. Chaque création mérite un écrin à sa hauteur."
                    buttons={[
                        { text: "Réserver un Shooting", url: "/shootings", type: "primary" },
                        { text: "Questions sur les Produits", url: "mailto:hello@fireflyofsoul.com", type: "outline" }
                    ]}
                    className="cta-section-store"
                />
            )}
        </PageLayout>
    );
}