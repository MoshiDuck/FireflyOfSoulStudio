// app/components/payment/StripePayment.tsx
import React, { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { API_ENDPOINTS } from "~/config/api";
import type { StripePaymentProps } from "~/types/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

// NOUVEAU : Compteur global pour suivre les instances
let paymentInstanceCounter = 0;

function CheckoutForm({ clientSecret, ...props }: StripePaymentProps & { clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [paymentProcessed, setPaymentProcessed] = useState(false); // NOUVEAU : État local
    const formSubmitted = useRef(false); // NOUVEAU : Référence pour éviter les doubles soumissions

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // PROTECTION CONTRE LES DOUBLES SOUMISSIONS
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
                formSubmitted.current = false; // Permettre de réessayer
            } else {
                // PAIEMENT RÉUSSI
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
            formSubmitted.current = false; // Permettre de réessayer
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-payment-form">
            <div className="payment-header">
                <h3>{props.paymentType === 'deposit' ? 'Paiement de l\'acompte' : 'Paiement complet'}</h3>
                <div className="payment-amount">
                    Montant: <strong>{props.amount}€</strong>
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
                                ? `Payer l'acompte de ${props.amount}€`
                                : `Payer ${props.amount}€`}
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
    const instanceId = useRef(paymentInstanceCounter++); // NOUVEAU : ID unique par instance
    const paymentIntentCreated = useRef(false); // NOUVEAU : Pour éviter de créer plusieurs Payment Intents

    console.log(`🔄 Instance StripePayment #${instanceId.current} montée`);

    useEffect(() => {
        const createPaymentIntent = async () => {
            // ÉVITER DE CRÉER PLUSIEURS PAYMENT INTENTS
            if (paymentIntentCreated.current) {
                console.log(`⏸️  Instance #${instanceId.current} - Payment Intent déjà créé`);
                return;
            }

            try {
                setLoading(true);
                setError("");
                paymentIntentCreated.current = true;

                console.log(`💰 Instance #${instanceId.current} - Création Payment Intent pour ${props.amount}€`);

                const metadata = {
                    customer_email: props.bookingData.email,
                    customer_name: `${props.bookingData.firstName} ${props.bookingData.lastName}`,
                    service_type: props.type,
                    service_name: props.serviceName,
                    Service: props.serviceName,
                    Prix: `${props.amount}€`,
                    payment_type: props.paymentType,
                    ...(props.type === 'session' && props.selectedDate && {
                        reservation_date: props.selectedDate,
                        reservation_time: props.selectedTime
                    }),
                    booking_details: props.stripeComment,
                    instance_id: instanceId.current, // NOUVEAU : Pour le débogage
                    timestamp: Date.now()
                };

                const response = await fetch(API_ENDPOINTS.CREATE_PAYMENT_INTENT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: props.amount,
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
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error(`❌ Instance #${instanceId.current} - Erreur:`, err);
                const message = err instanceof Error ? err.message : "Erreur inconnue";
                setError(message);
                props.onError(message);
                paymentIntentCreated.current = false; // Permettre de réessayer en cas d'erreur
            } finally {
                setLoading(false);
            }
        };

        if (props.amount > 0 && !clientSecret) {
            createPaymentIntent();
        }

        // NETTOYAGE : Réinitialiser si le composant est démonté
        return () => {
            console.log(`🧹 Instance StripePayment #${instanceId.current} démontée`);
        };
    }, [props.amount, props.serviceName, props.bookingData, props.type, props.selectedDate, props.selectedTime, props.paymentType, props.stripeComment]);

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