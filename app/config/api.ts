// app/config/api.ts
import type {Service} from "~/types/api";
import {STRIPE_CATALOG} from "~/config/stripe-catalog";

export const API_ENDPOINTS = {
    CREATE_PAYMENT_INTENT: '/api/create-payment-intent',
    RESERVATIONS: '/api/reservations',
    CREATE_CUSTOMER: '/api/create-customer',
    CREATE_INVOICE: '/api/create-invoice',
    CREATE_INVOICE_PAYMENT: '/api/create-invoice-payment' // AJOUTÉ
} as const;

export const SHOOTING_SERVICES: Service[] = [
    {
        id: "portrait",
        name: "Séance Portrait",
        description: "Une séance photo mettant en valeur votre personnalité avec des portraits authentiques et naturels.",
        price: 250,
        duration: "1h30",
        type: "session",
        stripeProductId: STRIPE_CATALOG.sessions.portrait.productId,
        stripePriceId: STRIPE_CATALOG.sessions.portrait.priceId,
        stripeDepositPriceId: STRIPE_CATALOG.sessions.portrait.depositPriceId,
        features: [
            "15 photos retouchées numériquement",
            "Guide de pose inclus",
            "2 tenues différentes",
            "Accès à la galerie en ligne",
            "Téléchargement haute résolution"
        ]
    },
    {
        id: "artistic",
        name: "Séance Artistique",
        description: "Une expérience créative unique pour des images d'exception qui racontent votre histoire.",
        price: 450,
        duration: "3h",
        type: "session",
        stripeProductId: STRIPE_CATALOG.sessions.artistic.productId,
        stripePriceId: STRIPE_CATALOG.sessions.artistic.priceId,
        stripeDepositPriceId: STRIPE_CATALOG.sessions.artistic.depositPriceId,
        features: [
            "30 photos retouchées artistiquement",
            "Concept personnalisé",
            "3 tenues différentes",
            "Maquillage professionnel inclus",
            "Retouches avancées",
            "Galerie privée en ligne"
        ]
    },
    {
        id: "creative",
        name: "Séance Créative",
        description: "Exploration artistique poussée pour des images uniques et mémorables.",
        price: 650,
        duration: "4h",
        type: "session",
        stripeProductId: STRIPE_CATALOG.sessions.creative.productId,
        stripePriceId: STRIPE_CATALOG.sessions.creative.priceId,
        stripeDepositPriceId: STRIPE_CATALOG.sessions.creative.depositPriceId,
        features: [
            "50 photos retouchées premium",
            "Direction artistique complète",
            "4 tenues différentes",
            "Équipe pro (maquillage, coiffure)",
            "2 lieux de shooting",
            "Retouches créatives avancées",
            "Galerie VIP avec accès prioritaire"
        ]
    }
];

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(endpoint, defaultOptions);

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            error: 'An error occurred',
        })) as { error?: string };
        throw new Error(error.error || 'Network error');
    }

    return response.json();
}