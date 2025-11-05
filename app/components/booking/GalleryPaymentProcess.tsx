// app/components/booking/GalleryPaymentProcess.tsx
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import StripePayment from "~/components/payment/StripePayment";
import type { Service, ApiResponse, CustomerInfo } from "~/types/api";

interface GalleryPaymentProcessProps {
    service: Service;
    onBack: () => void;
    onComplete: () => void;
    apiEndpoint: string;
    customerInfo: CustomerInfo;
    totalAmount?: number;
    amountPaid?: number;
}

export function GalleryPaymentProcess({
                                          service,
                                          onBack,
                                          onComplete,
                                          apiEndpoint,
                                          customerInfo,
                                          totalAmount = 850,
                                          amountPaid = 255
                                      }: GalleryPaymentProcessProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const paymentInProgress = useRef(false);

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (paymentInProgress.current) return;
        paymentInProgress.current = true;
        setPaymentCompleted(true);

        try {
            const requestData = {
                firstName: customerInfo.firstName.trim(),
                lastName: customerInfo.lastName.trim(),
                email: customerInfo.email.trim(),
                phone: customerInfo.phone?.trim() || '',
                cart: [{
                    productId: service.id,
                    productName: service.name,
                    productType: 'album',
                    quantity: 1,
                    price: service.price
                }],
                total: service.price,
                amountPaid: service.price,
                paymentType: 'full',
                date: null,
                time: null,
                type: 'product',
                paymentIntentId: paymentIntentId,
                paymentStatus: 'paid'
            };

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            const result = await response.json() as ApiResponse<{ id: number }>;

            if (response.ok && result.success === true) {
                setMessage({
                    type: 'success',
                    text: 'Paiement confirmé ! Déverrouillage de votre album...'
                });

                setTimeout(() => {
                    onComplete();
                    setPaymentCompleted(false);
                    paymentInProgress.current = false;
                }, 2000);
            } else {
                const errorMessage = result.success === false
                    ? result.error
                    : 'Erreur lors de la confirmation';
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Erreur confirmation:', error);
            setMessage({
                type: 'error',
                text: error instanceof Error
                    ? `Paiement réussi mais erreur de confirmation: ${error.message}`
                    : 'Paiement réussi mais erreur de confirmation. Contactez-nous.'
            });
            paymentInProgress.current = false;
        }
    };

    const handlePaymentCancel = () => {
        if (!paymentCompleted) onBack();
    };

    const generateStripeComment = () => {
        const customerInfoText = `Client: ${customerInfo.firstName} ${customerInfo.lastName} - Email: ${customerInfo.email}`;
        const phoneInfo = customerInfo.phone ? ` - Tél: ${customerInfo.phone}` : '';
        const serviceInfo = `Album: ${service.name} - Solde: ${service.price}€`;
        return `${customerInfoText}${phoneInfo} | ${serviceInfo}`.substring(0, 500);
    };

    const remainingAmount = service.price;

    return (
        <motion.section
            className="gallery-payment-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            <div className="payment-container">
                {/* Header minimaliste */}
                <div className="payment-header">
                    <button
                        className="back-btn-minimal"
                        onClick={handlePaymentCancel}
                    >
                        <span className="back-icon">←</span>
                    </button>
                    <div className="payment-title">
                        <h2>Paiement du solde</h2>
                        <p>Finalisez votre album</p>
                    </div>
                </div>

                <div className="payment-content">
                    {/* Carte récapitulative */}
                    <div className="summary-card">
                        <div className="summary-header">
                            <div className="album-icon">📸</div>
                            <div className="album-info">
                                <h3>{service.name}</h3>
                                <p>{service.description}</p>
                            </div>
                        </div>

                        <div className="amount-breakdown">
                            <div className="amount-line">
                                <span>Total séance</span>
                                <span>{totalAmount}€</span>
                            </div>
                            <div className="amount-line">
                                <span>Acompte payé</span>
                                <span>-{amountPaid}€</span>
                            </div>
                            <div className="amount-divider"></div>
                            <div className="amount-line total">
                                <span>Solde à régler</span>
                                <span>{remainingAmount}€</span>
                            </div>
                        </div>
                    </div>

                    {/* Informations client compactes */}
                    <div className="client-card">
                        <h4>Informations</h4>
                        <div className="client-details-grid">
                            <div className="client-detail">
                                <span className="detail-label">Nom</span>
                                <span className="detail-value">{customerInfo.firstName} {customerInfo.lastName}</span>
                            </div>
                            <div className="client-detail">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{customerInfo.email}</span>
                            </div>
                            {customerInfo.phone && (
                                <div className="client-detail">
                                    <span className="detail-label">Téléphone</span>
                                    <span className="detail-value">{customerInfo.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Zone de paiement */}
                    <div className="payment-widget">
                        <AnimatePresence mode="wait">
                            {paymentCompleted ? (
                                <motion.div
                                    className="payment-success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <div className="success-check">✓</div>
                                    <h3>Paiement accepté</h3>
                                    <p>Redirection vers votre album...</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <StripePayment
                                        amount={remainingAmount}
                                        serviceName={service.name}
                                        bookingData={customerInfo}
                                        onSuccess={handlePaymentSuccess}
                                        onError={(error) => setMessage({ type: 'error', text: error })}
                                        onCancel={handlePaymentCancel}
                                        type="product"
                                        paymentType="full"
                                        stripeComment={generateStripeComment()}
                                        totalServicePrice={remainingAmount}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Messages */}
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                className={`status-message ${message.type}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.section>
    );
}