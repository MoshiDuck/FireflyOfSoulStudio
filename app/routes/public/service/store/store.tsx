// Todo : app/routes/public/service/store/store.tsx
import React, { useState } from "react";
import { PageLayout } from "~/components/layout/PageLayout";
import { HeroSection } from "~/components/ui/HeroSection";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { CTASection } from "~/components/ui/CTASection";
import { AnimatedSection } from "~/components/ui/AnimatedSection";
import { BookingProcess } from "~/components/booking/BookingProcess";
import { motion } from "motion/react";
import { API_ENDPOINTS } from "~/config/api";
import "../../../../components/components.css";
import "./store.css";
import "../pricing-common.css";

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

export default function Store() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
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

        // Pour la démonstration, on prend le premier produit du panier
        // Dans une vraie application, vous voudriez peut-être gérer le panier complet
        setSelectedService(cart[0].service);
        setIsCheckingOut(true);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    const handleOrderComplete = () => {
        setIsCheckingOut(false);
        setSelectedService(null);
        setCart([]);
    };

    const handleBackToProducts = () => {
        setIsCheckingOut(false);
        setSelectedService(null);
    };

    return (
        <PageLayout className="store-page">
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

            {isCheckingOut && selectedService ? (
                <div id="booking-section">
                    <BookingProcess
                        service={selectedService}
                        onBack={handleBackToProducts}
                        onComplete={handleOrderComplete}
                        apiEndpoint={API_ENDPOINTS.RESERVATIONS}
                        type="product"
                    />
                </div>
            ) : (
                <>
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

            {!isCheckingOut && cart.length > 0 && (
                <StoreCart
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={handleCheckout}
                />
            )}

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