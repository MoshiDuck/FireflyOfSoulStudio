// Info : app/components/payment/StripePayment.tsx
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { API_ENDPOINTS } from "~/config/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

interface StripePaymentProps {
    amount: number;
    serviceName: string;
    bookingData: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        message?: string;
    };
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: string) => void;
    onCancel: () => void;
    selectedDate?: string;
    selectedTime?: string;
    type: 'session' | 'product';
}

function CheckoutForm({ clientSecret, ...props }: StripePaymentProps & { clientSecret: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        try {
            const { error: submitError } = await elements.submit();
            if (submitError) {
                setErrorMessage(submitError.message || "Erreur lors de la soumission du formulaire");
                setIsLoading(false);
                return;
            }

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
                setErrorMessage(error.message || "Une erreur est survenue lors du paiement");
                props.onError(error.message || "Erreur de paiement");
            } else {
                const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

                if (paymentIntent && paymentIntent.status === 'succeeded') {
                    props.onSuccess(paymentIntent.id);
                }
            }
        } catch (error) {
            console.error('Erreur paiement:', error);
            setErrorMessage("Une erreur inattendue est survenue");
            props.onError("Erreur inattendue lors du paiement");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-payment-form">
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
                    disabled={isLoading}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={!stripe || isLoading}
                    className="submit-payment-button"
                >
                    {isLoading ? "Traitement..." : `Payer ${props.amount}€`}
                </button>
            </div>
        </form>
    );
}

export default function StripePayment(props: StripePaymentProps) {
    const [clientSecret, setClientSecret] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                setLoading(true);
                setError("");

                // MÉTADONNÉES SIMPLIFIÉES - uniquement les champs demandés
                const metadata = {
                    // Informations client
                    customer_email: props.bookingData.email,
                    customer_name: `${props.bookingData.firstName} ${props.bookingData.lastName}`,

                    // Informations service
                    service_type: props.type,
                    service_name: props.serviceName,
                    Service: props.serviceName, // Duplication pour correspondre à la demande
                    Prix: `${props.amount}€`,

                    // Informations de réservation si session
                    ...(props.type === 'session' && props.selectedDate && {
                        reservation_date: props.selectedDate,
                        reservation_time: props.selectedTime
                    })
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
                    }),
                });

                type PaymentIntentResponse = {
                    clientSecret?: string;
                    error?: string;
                    details?: string;
                };

                const data = (await response.json()) as PaymentIntentResponse;

                if (!response.ok) {
                    throw new Error(data.error || "Erreur lors de la création du paiement");
                }

                if (!data.clientSecret) {
                    throw new Error("Réponse invalide du serveur : clientSecret manquant");
                }

                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error("Erreur création Payment Intent:", err);
                const message =
                    err instanceof Error ? err.message : "Erreur inconnue";
                setError(message);
                props.onError(message);
            } finally {
                setLoading(false);
            }
        };

        if (props.amount > 0) {
            createPaymentIntent();
        }
    }, [props.amount, props.serviceName, props.bookingData, props.type, props.selectedDate, props.selectedTime]);

    if (loading) {
        return (
            <div className="payment-loading">
                <div>Initialisation du paiement sécurisé...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-error-container">
                <div>Erreur: {error}</div>
                <button onClick={() => window.location.reload()} className="retry-button">
                    Réessayer
                </button>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="payment-error-container">
                <div>Impossible d'initialiser le paiement</div>
            </div>
        );
    }

    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#0066cc',
                borderRadius: '8px',
            },
        },
    };

    return (
        <div className="stripe-payment-container">
            <Elements stripe={stripePromise} options={options}>
                <CheckoutForm clientSecret={clientSecret} {...props} />
            </Elements>
        </div>
    );
}