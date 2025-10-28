// app/routes/public/service/store/store.tsx
import React, { useState } from "react";
import { PageLayout } from "~/components/layout/PageLayout";
import { HeroSection } from "~/components/ui/HeroSection";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { CTASection } from "~/components/ui/CTASection";
import { AnimatedSection } from "~/components/ui/AnimatedSection";
import { BookingProcess } from "~/components/booking/BookingProcess";
import { StoreCart } from "~/components/booking/StoreCart";
import { motion } from "motion/react";
import { API_ENDPOINTS, STORE_PRODUCTS } from "~/config/api";
import type { Service, Capacity, CartItemComponent } from "~/types/api";
import "../../../../components/components.css";
import "./store.css";
import "../pricing-common.css";

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
                    {product.features?.map((feature, idx) => (
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

export default function Store() {
    const [cart, setCart] = useState<CartItemComponent[]>([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // ✅ TOUTES les fonctions définies :
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

    const handleBackToProducts = () => {
        setIsCheckingOut(false);
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

            {isCheckingOut ? (
                <div id="booking-section">
                    <BookingProcess
                        cart={cart}
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