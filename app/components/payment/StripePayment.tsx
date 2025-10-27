// Info : app/components/payment/StripePayment.tsx
import React, { useState, useEffect } from 'react';
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'motion/react';
import { API_ENDPOINTS, apiRequest } from '~/config/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripePaymentProps {
    amount: number;
    serviceName: string;
    bookingData: any;
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: string) => void;
    onCancel: () => void;
}

interface PaymentIntentResponse {
    clientSecret: string;
    paymentIntentId: string;
    error?: string;
}

function CheckoutForm({
                          clientSecret,
                          amount,
                          serviceName,
                          bookingData,
                          onSuccess,
                          onError,
                          onCancel
                      }: StripePaymentProps & { clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    console.log('🔍 CheckoutForm - Props reçues:', {
        clientSecret: clientSecret ? `${clientSecret.substring(0, 20)}...` : 'empty',
        amount,
        hasStripe: !!stripe,
        hasElements: !!elements
    });

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        console.log('🖱️  Soumission du formulaire de paiement');

        if (!stripe || !elements) {
            const errorMsg = 'Stripe non initialisé';
            console.error('❌', errorMsg);
            setErrorMessage(errorMsg);
            return;
        }

        if (!clientSecret) {
            const errorMsg = 'Client secret manquant';
            console.error('❌', errorMsg);
            setErrorMessage(errorMsg);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            console.log('🔐 Confirmation du paiement...');

            const { error: submitError } = await elements.submit();
            if (submitError) {
                console.error('❌ Erreur soumission formulaire:', submitError);
                setErrorMessage(submitError.message || 'Erreur lors de la soumission du formulaire');
                setIsLoading(false);
                return;
            }

            console.log('✅ Formulaire soumis, confirmation Stripe...');

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                },
                redirect: 'if_required',
            });

            console.log('📊 Résultat confirmation:', { error, paymentIntent });

            if (error) {
                console.error('❌ Erreur paiement:', error);
                setErrorMessage(error.message || 'Une erreur est survenue');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('✅ Paiement réussi, ID:', paymentIntent.id);
                onSuccess(paymentIntent.id);
            } else {
                console.warn('⚠️ Statut paiement inattendu:', paymentIntent?.status);
            }
        } catch (error) {
            console.error('❌ Erreur traitement paiement:', error);
            setErrorMessage('Erreur lors du traitement du paiement');
        } finally {
            setIsLoading(false);
        }
    };

    if (!clientSecret) {
        console.log('❌ Client secret manquant dans CheckoutForm');
        return (
            <div className="payment-error">
                <p>Impossible d'initialiser le paiement. Veuillez réessayer.</p>
            </div>
        );
    }

    console.log('🎉 Rendu du formulaire de paiement avec clientSecret');

    return (
        <motion.div
            className="stripe-payment-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <form onSubmit={handleSubmit} className="payment-form">
                <div className="payment-header">
                    <h3>Paiement Sécurisé</h3>
                    <div className="payment-amount">
                        Montant: <strong>{amount}€</strong>
                    </div>
                    <div className="payment-debug">
                        <small>ClientSecret: {clientSecret ? '✓ Présent' : '✗ Manquant'}</small>
                    </div>
                </div>

                <div className="payment-element-wrapper">
                    <PaymentElement
                        options={{
                            layout: {
                                type: 'tabs',
                                defaultCollapsed: false,
                            },
                        }}
                    />
                </div>

                {errorMessage && (
                    <motion.div
                        className="payment-error-message"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        {errorMessage}
                    </motion.div>
                )}

                <div className="payment-actions">
                    <motion.button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-outline"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                    >
                        Annuler
                    </motion.button>

                    <motion.button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!stripe || isLoading || !clientSecret}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <>
                                <div className="loading-spinner-small"></div>
                                Traitement...
                            </>
                        ) : (
                            `Payer ${amount}€`
                        )}
                    </motion.button>
                </div>

                <div className="payment-security">
                    <div className="security-badges">
                        <span>🔒 Paiement sécurisé par</span>
                        <div className="stripe-logo">Stripe</div>
                    </div>
                </div>
            </form>
        </motion.div>
    );
}

export default function StripePayment(props: StripePaymentProps) {
    const [clientSecret, setClientSecret] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    console.log('🔍 StripePayment Parent - Props:', {
        amount: props.amount,
        serviceName: props.serviceName,
        hasBookingData: !!props.bookingData
    });

    // Création du Payment Intent dans le parent
    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                setIsLoading(true);
                setError('');

                console.log('🔄 Début création Payment Intent dans le parent');
                console.log('💰 Montant:', props.amount);
                console.log('📡 Endpoint:', API_ENDPOINTS.CREATE_PAYMENT_INTENT);

                // Validation du montant
                if (!props.amount || props.amount <= 0) {
                    throw new Error(`Montant invalide: ${props.amount}`);
                }

                const requestBody = {
                    amount: props.amount,
                    currency: 'eur',
                    metadata: {
                        serviceName: props.serviceName,
                        customerEmail: props.bookingData.email,
                        customerName: `${props.bookingData.firstName} ${props.bookingData.lastName}`,
                        type: 'booking',
                    },
                };

                console.log('📤 Requête API:', requestBody);

                const data: PaymentIntentResponse = await apiRequest(
                    API_ENDPOINTS.CREATE_PAYMENT_INTENT,
                    {
                        method: 'POST',
                        body: JSON.stringify(requestBody),
                    }
                );

                console.log('✅ Réponse API Payment Intent:', {
                    hasClientSecret: !!data.clientSecret,
                    clientSecretLength: data.clientSecret?.length,
                    paymentIntentId: data.paymentIntentId,
                    error: data.error
                });

                if (data.error) {
                    throw new Error(data.error);
                }

                if (!data.clientSecret) {
                    throw new Error('Client secret manquant dans la réponse');
                }

                // Validation du format du clientSecret
                if (!data.clientSecret.includes('_secret_')) {
                    console.error('❌ Format clientSecret invalide:', data.clientSecret);
                    throw new Error('Format de client secret invalide');
                }

                setClientSecret(data.clientSecret);

                console.log('🎯 ClientSecret défini avec succès dans le parent');

            } catch (error) {
                console.error('❌ Erreur création Payment Intent:', error);
                const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                setError(`Erreur: ${errorMessage}`);
                props.onError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        if (props.amount > 0 && !clientSecret) {
            console.log('🚀 Lancement création Payment Intent dans le parent');
            createPaymentIntent();
        } else {
            console.log('⏸️  Création Payment Intent ignorée dans le parent:', {
                amount: props.amount,
                hasClientSecret: !!clientSecret
            });
            setIsLoading(false);
        }
    }, [props.amount, props.serviceName, props.bookingData, props.onError, clientSecret]);

    const options = {
        clientSecret,
        appearance: {
            theme: 'night' as const,
            variables: {
                colorPrimary: '#FFD580',
                colorBackground: '#1a1a1a',
                colorText: '#e0e0e0',
                colorDanger: '#ff3860',
                fontFamily: 'Inter, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
            },
            rules: {
                '.Input': {
                    border: '1px solid #333',
                    backgroundColor: '#1a1a1a',
                    color: '#e0e0e0',
                },
                '.Input:focus': {
                    borderColor: '#FFD580',
                    boxShadow: '0 0 0 1px #FFD580',
                },
            },
        },
    };

    console.log('🔍 StripePayment Parent - Options:', {
        hasClientSecret: !!options.clientSecret,
        clientSecret: options.clientSecret ? `${options.clientSecret.substring(0, 20)}...` : 'none'
    });

    if (isLoading) {
        console.log('⏳ Affichage état chargement initial dans le parent');
        return (
            <div className="payment-loading">
                <div className="loading-spinner"></div>
                <p>Initialisation du paiement...</p>
            </div>
        );
    }

    if (error) {
        console.log('❌ Affichage erreur initiale dans le parent:', error);
        return (
            <div className="payment-error">
                <p>Erreur: {error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!clientSecret) {
        console.log('❌ Client secret toujours manquant après chargement dans le parent');
        return (
            <div className="payment-error">
                <p>Impossible d'initialiser le paiement. Veuillez réessayer.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <Elements stripe={stripePromise} options={options}>
            <CheckoutForm clientSecret={clientSecret} {...props} />
        </Elements>
    );
}