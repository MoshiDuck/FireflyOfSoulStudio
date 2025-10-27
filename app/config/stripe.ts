// Info : app/config/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const STRIPE_CONFIG = {
    currency: 'eur',
    locale: 'fr' as const,
};