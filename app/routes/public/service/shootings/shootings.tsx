// app/routes/public/service/shootings/shootings.tsx
import React, { useState } from "react";
import { PageLayout } from "~/components/layout/PageLayout";
import { HeroSection } from "~/components/ui/HeroSection";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { CTASection } from "~/components/ui/CTASection";
import { AnimatedSection } from "~/components/ui/AnimatedSection";
import { BookingProcess } from "~/components/booking/BookingProcess";
import { motion } from "motion/react";
import { API_ENDPOINTS, SHOOTING_SERVICES } from "~/config/api";
import type { Service } from "~/types/api";
import "../../../../components/components.css";
import "./shootings.css";
import "../pricing-common.css";

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
                    {service.features?.map((feature, idx) => (
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

export default function Shootings() {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // ✅ TOUTES les fonctions définies :
    const handleDirectBooking = (service: Service) => {
        setSelectedService(service);
        setIsCheckingOut(true);

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
        <PageLayout className="shootings-page">
            <HeroSection
                backgroundImage="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                title="Séances Photo Artistiques"
                accentWord="Artistiques"
                subtitle="Des expériences photographiques uniques et personnalisées. Capturons ensemble votre essence et créons des œuvres intemporelles."
                buttons={[
                    { text: "Voir la Boutique", url: "/store", type: "secondary" }
                ]}
                className="shootings-hero"
                showScrollIndicator={!isCheckingOut}
            />

            {isCheckingOut && selectedService ? (
                <div id="booking-section">
                    <BookingProcess
                        service={selectedService}
                        onBack={handleBackToServices}
                        onComplete={handleBookingComplete}
                        apiEndpoint={API_ENDPOINTS.RESERVATIONS}
                        type="session"
                    />
                </div>
            ) : (
                <>
                    <AnimatedSection className="services-section">
                        <div className="container">
                            <SectionHeader
                                badge="Nos Séances"
                                title="Expériences Photographiques"
                                accentWord="Photographiques"
                                subtitle="Chaque séance est une collaboration artistique unique, conçue pour révéler votre personnalité et créer des images exceptionnelles."
                            />
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

                    <AnimatedSection className="process-section">
                        <div className="container">
                            <SectionHeader
                                badge="Notre Processus"
                                title="Comment ça marche"
                                accentWord="marche"
                            />
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

            {!isCheckingOut && (
                <CTASection
                    title="Prêt à Créer des Images Mémorables ?"
                    description="Réservez votre séance photo et laissez-nous capturer votre histoire. Après le shooting, découvrez nos produits premium pour mettre en valeur vos images."
                    buttons={[
                        { text: "Découvrir la Boutique", url: "/store", type: "primary" },
                        { text: "Nous Contacter", url: "mailto:hello@fireflyofsoul.com", type: "outline" }
                    ]}
                    className="cta-section-shootings"
                />
            )}
        </PageLayout>
    );
}