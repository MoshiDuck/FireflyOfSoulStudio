// Todo : app/routes/api.check-ip.tsx
import type { LoaderFunction } from "react-router";

// IP autorisée - à définir dans vos variables d'environnement
const ALLOWED_IP = import.meta.env.VITE_ALLOWED_IP || "127.0.0.1";

interface CheckIPResponse {
    allowed: boolean;
    clientIP: string;
    error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
    console.log('🔍 API Check-IP [PROD] - Début de la requête');
    console.log('🔍 API Check-IP [PROD] - ALLOWED_IP:', ALLOWED_IP);

    try {
        // Récupération de l'IP réelle du client en production
        const url = new URL(request.url);
        const clientIP =
            // Headers standards pour les proxies/reverse proxies
            request.headers.get('CF-Connecting-IP') || // Cloudflare
            request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() || // Load balancers
            request.headers.get('X-Real-IP') || // Nginx
            request.headers.get('X-Client-IP') || // Apache
            request.headers.get('Fastly-Client-IP') || // Fastly
            request.headers.get('True-Client-IP') || // Akamai
            request.headers.get('Fly-Client-IP') || // Fly.io
            // Fallback: IP de la connexion directe
            request.headers.get('X-Forwarded') ||
            url.searchParams.get('ip') || // Pour debug
            'unknown';

        console.log('🔍 API Check-IP [PROD] - Tous les headers:', Object.fromEntries(request.headers));
        console.log('🔍 API Check-IP [PROD] - IP détectée:', clientIP);
        console.log('🔍 API Check-IP [PROD] - Comparaison:', {
            clientIP,
            ALLOWED_IP,
            allowed: clientIP === ALLOWED_IP
        });

        // Log supplémentaire pour debug
        console.log('🔍 API Check-IP [PROD] - URL complète:', request.url);
        console.log('🔍 API Check-IP [PROD] - Méthode:', request.method);

        const responseData: CheckIPResponse = {
            allowed: clientIP === ALLOWED_IP,
            clientIP
        };

        console.log('🔍 API Check-IP [PROD] - Réponse envoyée:', responseData);

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Pour les appels cross-origin
            },
        });
    } catch (error) {
        console.error('❌ API Check-IP [PROD] - Error checking IP:', error);
        const responseData: CheckIPResponse = {
            allowed: false,
            clientIP: 'unknown',
            error: 'Erreur de vérification IP'
        };
        return new Response(JSON.stringify(responseData), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
};