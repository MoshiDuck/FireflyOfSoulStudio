// Info : app/config/api.ts
import type {Service} from "~/types/api";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fireflyofsoulstudio.uk';

export const API_ENDPOINTS = {
    RESERVATIONS: `${API_BASE_URL}/api/reservations`,
    CONTACT: `${API_BASE_URL}/api/contact`,
    GALLERY: `${API_BASE_URL}/api/gallery`,
    CREATE_PAYMENT_INTENT: `${API_BASE_URL}/api/create-payment-intent`,
};

// Services prédéfinis (inchangé)
export const SHOOTING_SERVICES: Service[] = [
    {
        id: "portrait",
        name: "Séance Portrait",
        price: 450,
        description: "Individuel & Couples",
        duration: "2 heures",
        type: 'session' as const,
        features: [
            "30 images professionnellement retouchées",
            "Accès galerie en ligne",
            "Téléchargement digital inclus",
            "Droit d'impression",
            "2 changements de tenue",
            "Session de visionnage privée"
        ],
    },
    {
        id: "artistic",
        name: "Séance Artistique",
        price: 850,
        description: "Conceptuel & Fine Art",
        duration: "4 heures",
        type: 'session' as const,
        features: [
            "50 images professionnellement retouchées",
            "Développement du concept",
            "Retouche premium",
            "Galerie en ligne + stockage cloud",
            "2 impressions fine art (16x24)",
            "Direction artistique"
        ],
    },
    {
        id: "editorial",
        name: "Projet Éditorial",
        price: 1200,
        description: "Commercial & Publication",
        duration: "8 heures",
        type: 'session' as const,
        features: [
            "80+ images professionnellement retouchées",
            "Direction artistique",
            "Retouche avancée",
            "Droits d'usage commercial",
            "Livraison prioritaire",
            "Gestionnaire de projet dédié"
        ],
    },
];

export const STORE_PRODUCTS = [
    {
        id: "raw-files",
        name: "Collection Fichiers RAW",
        price: 299,
        description: "Set complet des fichiers bruts",
        duration: "Livraison digitale",
        type: 'product' as const,
        features: [
            "Tous les fichiers RAW originaux",
            "Pleine résolution",
            "Droits d'usage commercial",
            "Accès archive à vie",
            "Métadonnées techniques incluses"
        ],
    },
    {
        id: "fine-art-print",
        name: "Impression Fine Art",
        price: 150,
        description: "Tirage qualité musée",
        duration: "2-3 semaines",
        type: 'product' as const,
        features: [
            "Papier archive premium",
            "Édition numérotée",
            "Certificat d'authenticité",
            "Encadrement sur mesure disponible",
            "Format: 16x24 pouces"
        ],
    },
    {
        id: "premium-album",
        name: "Album Premium",
        price: 350,
        description: "Album relié cuir artisanat",
        duration: "3-4 semaines",
        type: 'product' as const,
        features: [
            "Couverture cuir italien",
            "50 pages premium",
            "Relure à plat",
            "Gravure personnalisée",
            "Boîtier de présentation"
        ],
    },
    {
        id: "premium-usb",
        name: "Clé USB Édition Premium",
        price: 199,
        description: "Clé USB gravée avec votre collection",
        duration: "1-2 semaines",
        type: 'product' as const,
        features: [
            "Gravure personnalisée gratuite",
            "Toutes vos photos en haute résolution",
            "Formats JPEG + PNG inclus",
            "Boîtier de présentation premium",
            "Sauvegarde cloud incluse (1 an)"
        ],
        capacities: [
            { size: "8Go", price: 99, description: "Parfait pour les séances courtes" },
            { size: "16Go", price: 149, description: "Idéal pour les portraits" },
            { size: "32Go", price: 199, description: "Recommandé - Convient à la plupart des séances" },
            { size: "64Go", price: 299, description: "Parfait pour les séances longues" },
            { size: "128Go", price: 449, description: "Ultime - Pour les projets complets" }
        ]
    },
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