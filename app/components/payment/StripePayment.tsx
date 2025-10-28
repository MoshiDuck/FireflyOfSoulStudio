// app/components/payment/StripePayment.tsx
import React, { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { API_ENDPOINTS } from "~/config/api";
import type { StripePaymentProps } from "~/types/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

// FONCTION : Calcul des détails financiers
const calculateFinancialDetails = (amountToPay: number, totalAmount: number, paymentType: 'deposit' | 'full') => {
    const tauxTVA = 0; // 20%
    const tauxCotisations = 40; // 40%
    const tauxIR = 11; // 11%

    let prixTTC = amountToPay;
    let prixHT = prixTTC / (1 + tauxTVA/100);

    const tvaCollectee = prixHT * (tauxTVA/100);
    const cotisationsSociales = prixHT * (tauxCotisations/100);
    const baseImposable = prixHT - cotisationsSociales;
    const impotRevenu = baseImposable * (tauxIR/100);
    const netReelPourMoi = prixHT - cotisationsSociales - impotRevenu;

    // Calcul pour le total (100%)
    const prixTTCTotal = totalAmount;
    const prixHTTotal = prixTTCTotal / (1 + tauxTVA/100);
    const tvaCollecteeTotal = prixHTTotal * (tauxTVA/100);
    const cotisationsSocialesTotal = prixHTTotal * (tauxCotisations/100);
    const baseImposableTotal = prixHTTotal - cotisationsSocialesTotal;
    const impotRevenuTotal = baseImposableTotal * (tauxIR/100);
    const netReelPourMoiTotal = prixHTTotal - cotisationsSocialesTotal - impotRevenuTotal;

    return {
        // Champs pour le paiement actuel (acompte ou total)
        prix_ttc_acompte: prixTTC.toFixed(2),
        prix_ttc_total: prixTTCTotal.toFixed(2),
        tva_collectee_acompte: tvaCollectee.toFixed(2),
        tva_collectee_total: tvaCollecteeTotal.toFixed(2),
        cotisations_sociales_acompte: cotisationsSociales.toFixed(2),
        cotisations_sociales_total: cotisationsSocialesTotal.toFixed(2),
        impot_revenu_acompte: impotRevenu.toFixed(2),
        impot_revenu_total: impotRevenuTotal.toFixed(2),
        net_reel_pour_moi_acompte: netReelPourMoi.toFixed(2),
        net_reel_pour_moi_total: netReelPourMoiTotal.toFixed(2),

        // Taux et informations générales
        taux_tva: `${tauxTVA}%`,
        taux_cotisations: `${tauxCotisations}%`,
        taux_ir: `${tauxIR}%`,
        devise: "EUR",
        date_facturation: new Date().toISOString().split('T')[0],
        booking_id: `SEANCE${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        calcul_auto_version: "v1.1",
        transaction_type: paymentType === 'deposit' ? 'acompte' : 'total'
    };
};

function CheckoutForm({ clientSecret, ...props }: StripePaymentProps & { clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [paymentProcessed, setPaymentProcessed] = useState(false);
    const formSubmitted = useRef(false);

    // CORRECTION : Utiliser le montant approprié (acompte pour sessions, total pour produits)
    const amountToDisplay = props.amount;
    const amountToUse = props.amount;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (formSubmitted.current || paymentProcessed) {
            console.log('⏸️  Soumission bloquée - déjà en cours ou terminée');
            return;
        }

        if (!stripe || !elements) {
            return;
        }

        formSubmitted.current = true;
        setIsLoading(true);
        setErrorMessage("");

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setErrorMessage(submitError.message || "Erreur lors de la soumission du formulaire");
                formSubmitted.current = false;
                setIsLoading(false);
                return;
            }

            console.log('🔐 Début de la confirmation du paiement...');

            const { error } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment/success`,
                    payment_method_data: {
                        billing_details: {
                            name: `${props.bookingData.firstName} ${props.bookingData.lastName}`,
                            email: props.bookingData.email,
                            phone: props.bookingData.phone,
                        },
                    },
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error('❌ Erreur de paiement Stripe:', error);
                setErrorMessage(error.message || "Une erreur est survenue lors du paiement");
                props.onError(error.message || "Erreur de paiement");
                formSubmitted.current = false;
            } else {
                console.log('✅ Paiement réussi - récupération du Payment Intent');
                setPaymentProcessed(true);

                try {
                    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
                    console.log('📋 Payment Intent status:', paymentIntent?.status);

                    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
                        console.log('🎉 Appel de onSuccess avec ID:', paymentIntent.id);
                        props.onSuccess(paymentIntent.id);
                    } else {
                        console.log('⚠️  Statut inattendu, appel de onSuccess quand même');
                        props.onSuccess('payment_successful_' + Date.now());
                    }
                } catch (retrieveError) {
                    console.error('❌ Erreur récupération Payment Intent:', retrieveError);
                    props.onSuccess('payment_successful_' + Date.now());
                }
            }
        } catch (error) {
            console.error('❌ Erreur inattendue lors du paiement:', error);
            setErrorMessage("Une erreur inattendue est survenue");
            props.onError("Erreur inattendue lors du paiement");
            formSubmitted.current = false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-payment-form">
            <div className="payment-header">
                <h3>{props.paymentType === 'deposit' ? 'Paiement de l\'acompte' : 'Paiement complet'}</h3>
                <div className="payment-amount">
                    Montant: <strong>{amountToDisplay}€</strong>
                    {props.paymentType === 'deposit' && (
                        <div className="payment-type-badge">Acompte 30%</div>
                    )}
                </div>
            </div>

            <div className="payment-element-container">
                <PaymentElement />
            </div>

            {errorMessage && (
                <div className="payment-error">
                    {errorMessage}
                </div>
            )}

            <div className="payment-actions">
                <button
                    type="button"
                    onClick={props.onCancel}
                    className="cancel-button"
                    disabled={isLoading || paymentProcessed}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={!stripe || isLoading || paymentProcessed}
                    className="submit-payment-button"
                >
                    {isLoading ? "Traitement en cours..." :
                        paymentProcessed ? "Paiement confirmé ✓" :
                            props.paymentType === 'deposit'
                                ? `Payer l'acompte de ${amountToDisplay}€`
                                : `Payer ${amountToDisplay}€`}
                </button>
            </div>

            {props.paymentType === 'deposit' && (
                <div className="deposit-info">
                    <p>💡 <strong>Paiement en deux temps :</strong></p>
                    <p>Vous payez un acompte de 30% maintenant. Le solde sera à régler après votre séance photo.</p>
                </div>
            )}

            <style>{`
                .stripe-payment-form {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                }
                
                .payment-header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                
                .payment-header h3 {
                    color: #FFD580;
                    margin-bottom: 10px;
                }
                
                .payment-amount {
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }
                
                .payment-type-badge {
                    background: #FFD580;
                    color: #0D0D0D;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .payment-element-container {
                    margin-bottom: 20px;
                }
                
                .payment-error {
                    background: rgba(198, 40, 40, 0.1);
                    color: #ff6b6b;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(198, 40, 40, 0.3);
                    margin-bottom: 15px;
                    text-align: center;
                }
                
                .payment-actions {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }
                
                .cancel-button {
                    flex: 1;
                    padding: 12px;
                    background: transparent;
                    color: #e0e0e0;
                    border: 1px solid #666;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .cancel-button:hover:not(:disabled) {
                    background: #333;
                }
                
                .cancel-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .submit-payment-button {
                    flex: 2;
                    padding: 12px;
                    background: #FFD580;
                    color: #0D0D0D;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .submit-payment-button:hover:not(:disabled) {
                    background: #FFCA28;
                    transform: translateY(-1px);
                }
                
                .submit-payment-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .deposit-info {
                    background: rgba(255, 213, 128, 0.1);
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 213, 128, 0.3);
                    font-size: 14px;
                }
                
                .deposit-info p {
                    margin: 0;
                }
            `}</style>
        </form>
    );
}

export default function StripePayment(props: StripePaymentProps) {
    const [clientSecret, setClientSecret] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const instanceId = useRef(paymentInstanceCounter++);
    const paymentIntentCreated = useRef(false);

    console.log(`🔄 Instance StripePayment #${instanceId.current} montée`);

    useEffect(() => {
        const createPaymentIntent = async () => {
            if (paymentIntentCreated.current) {
                console.log(`⏸️  Instance #${instanceId.current} - Payment Intent déjà créé`);
                return;
            }

            try {
                setLoading(true);
                setError("");
                paymentIntentCreated.current = true;

                // CORRECTION : Utiliser le montant approprié selon le contexte
                // - Pour les sessions : props.amount = acompte (30%)
                // - Pour les produits : props.amount = total
                const amountToUse = props.amount;
                console.log(`💰 Instance #${instanceId.current} - Création Payment Intent pour ${amountToUse}€`);

                // CORRECTION : Passer à la fois le montant à payer et le montant total
                const financialDetails = calculateFinancialDetails(amountToUse, props.totalServicePrice, props.paymentType);

                const metadata = {
                    // Informations client
                    customer_email: props.bookingData.email,
                    customer_name: `${props.bookingData.firstName} ${props.bookingData.lastName}`,

                    // Informations service
                    service_type: props.type,
                    service_name: props.serviceName,
                    payment_type: props.paymentType,

                    // Informations de réservation si session
                    ...(props.type === 'session' && props.selectedDate && {
                        reservation_date: props.selectedDate,
                        reservation_time: props.selectedTime
                    }),

                    // Détails financiers complets
                    ...financialDetails,

                    // Informations techniques
                    instance_id: instanceId.current,
                    timestamp: Date.now()
                };

                const response = await fetch(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: amountToUse, // CORRECTION : Utiliser le montant approprié
                        currency: "eur",
                        metadata: metadata,
                        paymentType: props.paymentType
                    }),
                });

                type PaymentIntentResponse = {
                    clientSecret?: string;
                    error?: string;
                    details?: string;
                };

                const data = await response.json() as PaymentIntentResponse;

                if (!response.ok) {
                    throw new Error(data.error || "Erreur lors de la création du paiement");
                }

                if (!data.clientSecret) {
                    throw new Error("Réponse invalide du serveur : clientSecret manquant");
                }

                console.log(`✅ Instance #${instanceId.current} - Payment Intent créé avec succès`);
                console.log('📊 Métadonnées financières:', financialDetails);
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error(`❌ Instance #${instanceId.current} - Erreur:`, err);
                const message = err instanceof Error ? err.message : "Erreur inconnue";
                setError(message);
                props.onError(message);
                paymentIntentCreated.current = false;
            } finally {
                setLoading(false);
            }
        };

        if (props.amount > 0 && !clientSecret) { // CORRECTION : Vérifier props.amount (montant à payer)
            createPaymentIntent();
        }

        return () => {
            console.log(`🧹 Instance StripePayment #${instanceId.current} démontée`);
        };
    }, [props.amount, props.serviceName, props.bookingData, props.type, props.selectedDate, props.selectedTime, props.paymentType, props.totalServicePrice]);

    if (loading) {
        return (
            <div className="payment-loading">
                <div className="spinner"></div>
                <div>Initialisation du paiement sécurisé...</div>

                <style>{`
                    .payment-loading {
                        text-align: center;
                        padding: 40px 20px;
                    }
                    
                    .spinner {
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #FFD580;
                        border-radius: 50%;
                        width: 30px;
                        height: 30px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px;
                    }
                    
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-error-container">
                <div className="error-message">Erreur: {error}</div>
                <button onClick={() => window.location.reload()} className="retry-button">
                    Réessayer
                </button>

                <style>{`
                    .payment-error-container {
                        text-align: center;
                        padding: 30px 20px;
                    }
                    
                    .error-message {
                        background: rgba(198, 40, 40, 0.1);
                        color: #ff6b6b;
                        padding: 15px;
                        border-radius: 8px;
                        border: 1px solid rgba(198, 40, 40, 0.3);
                        margin-bottom: 15px;
                    }
                    
                    .retry-button {
                        padding: 10px 20px;
                        background: #FFD580;
                        color: #0D0D0D;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    
                    .retry-button:hover {
                        background: #FFCA28;
                    }
                `}</style>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="payment-error-container">
                <div className="error-message">Impossible d'initialiser le paiement</div>
                <button onClick={() => window.location.reload()} className="retry-button">
                    Réessayer
                </button>
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'night' as const,
            variables: {
                colorPrimary: '#FFD580',
                colorBackground: '#0D0D0D',
                colorText: '#e0e0e0',
                colorDanger: '#df1b41',
                fontFamily: 'Inter, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
            },
        },
    };

    return (
        <div className="stripe-payment-container">
            <Elements stripe={stripePromise} options={options} key={clientSecret}>
                <CheckoutForm clientSecret={clientSecret} {...props} />
            </Elements>
        </div>
    );
}

// Compteur global pour suivre les instances
let paymentInstanceCounter = 0;