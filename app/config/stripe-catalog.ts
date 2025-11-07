// app/config/stripe-catalog.ts
export const STRIPE_CATALOG = {
    // Produits pour les séances photo
    sessions: {
        portrait: {
            productId: 'prod_TN2TE7HoJCcoHX',
            priceId: 'price_1SQIOmA1gXfljeb0EoyUbpMR',
            depositPriceId: 'price_1SQIRuA1gXfljeb0koTQCxbN'
        },
        artistic: {
            productId: 'prod_TN2YNMiYUNFo7X',
            priceId: 'price_1SQITJA1gXfljeb0BxAQ9YZS',
            depositPriceId: 'price_1SQIU0A1gXfljeb0gvXKB5GU'
        },
        creative: {
            productId: 'prod_TN2k84MH3Li6jW',
            priceId: 'price_1SQIekA1gXfljeb0u92N5ON4',
            depositPriceId: 'price_1SQIfFA1gXfljeb0gr2PzBkA'
        }
    },
    // Produits physiques
    products: {
        print_small: {
            productId: 'prod_QBGWPBdS6W3E5Z',
            priceId: 'price_1PLbQzPJHHPSgwMo2J2pLMNO'
        },
        print_medium: {
            productId: 'prod_QBGWPBdS6W3E60',
            priceId: 'price_1PLbQzPJHHPSgwMo2J2pPQR'
        },
        print_large: {
            productId: 'prod_QBGWPBdS6W3E61',
            priceId: 'price_1PLbQzPJHHPSgwMo2J2pSTU'
        },
        album: {
            productId: 'prod_QBGWPBdS6W3E62',
            priceId: 'price_1PLbQzPJHHPSgwMo2J2pVWX'
        }
    }
} as const;

export type StripeProductType = keyof typeof STRIPE_CATALOG.sessions | keyof typeof STRIPE_CATALOG.products;