// workers/app.ts
import {Hono} from "hono";
import {createRequestHandler} from "react-router";
import {cors} from 'hono/cors';
import type {ApiErrorResponse} from "~/types/api";

interface Bindings {
    DB: D1Database;
    STRIPE_SECRET_KEY: string;
    PHOTO_ALBUMS: R2Bucket;
    R2_PUBLIC_DOMAIN: string;
}

interface StripePaymentIntentResponse {
    id: string;
    client_secret: string;
    status: string;
    error?: {
        message: string;
        type?: string;
    };
}

interface StripeErrorResponse {
    error: {
        message: string;
        type?: string;
    };
}

interface CreatePaymentIntentRequest {
    amount: number;
    priceId?: string;
    paymentType: 'deposit' | 'full';
    serviceName: string;
    type: 'session' | 'product';
}

interface CreatePaymentIntentSuccessResponse {
    clientSecret: string;
    paymentIntentId: string;
    status: string;
    usedCatalog: boolean;
}

interface CreatePaymentIntentErrorResponse {
    error: string;
    details?: string;
}

interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    details?: string;
}

interface UploadResponse {
    success: boolean;
    message: string;
    key: string;
    url: string;
    size: number;
    contentType: string;
}

interface AlbumResponse {
    id: string;
    name: string;
    description?: string;
    clientEmail?: string;
    shootDate?: string;
    createdAt: string;
}

interface PaymentStatus {
    hasPaidDeposit: boolean;
    hasPaidFull: boolean;
    albumId: string;
}

interface MultipartInitResponse {
    uploadId: string;
    key: string;
}

interface MultipartPart {
    partNumber: number;
    etag: string;
}

interface MultipartCompleteRequest {
    parts: MultipartPart[];
}

interface AlbumStats {
    totalAlbums: number;
    totalPhotos: number;
    totalSizeFormatted: string;
    monthlyCost: string;
    recentAlbums: any[];
}

interface StripeCustomerResponse {
    id?: string;
    error?: {
        message: string;
        type?: string;
    };
}

interface StripeInvoiceItemResponse {
    id?: string;
    error?: { message: string };
}

interface StripeInvoiceResponse {
    id?: string;
    hosted_invoice_url?: string;
    invoice_pdf?: string;
    status?: string;
    error?: { message: string };
}

interface StripeProduct {
    id: string;
    name: string;
    description: string | null;
    metadata: Record<string, any>;
}

interface StripePrice {
    id: string;
    unit_amount: number | null;
    currency: string;
    type: string;
    recurring?: {
        interval: string;
        interval_count: number;
    };
    metadata: Record<string, any>;
}

interface StripeProductsResponse {
    data: StripeProduct[];
    error?: { message: string };
}

interface StripePricesResponse {
    data: StripePrice[];
    error?: { message: string };
}

interface R2Objects {
    objects: R2Object[];
    truncated: boolean;
    cursor?: string;
}

interface CreateInvoicePaymentRequest {
    amount: number;
    customerEmail: string;
    customerName: string;
    description: string;
    metadata?: Record<string, any>;
    phone?: string;
    paymentType: 'deposit' | 'full';
    serviceName: string;
    type: 'session' | 'product';
}

function normalizeFolderName(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
}

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}))

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

// Fonction utilitaire pour les erreurs Stripe
async function handleStripeError(response: Response): Promise<{ error: string; details?: string }> {
    try {
        const data = await response.json() as StripeErrorResponse;
        console.error('❌ Erreur Stripe:', data);
        return {
            error: data.error?.message || 'Erreur Stripe inconnue',
            details: data.error?.type
        };
    } catch {
        return {
            error: `Erreur HTTP ${response.status}`,
            details: 'Impossible de parser la réponse Stripe'
        };
    }
}

app.post('/api/create-invoice-payment', async (c) => {
    try {
        const {
            amount,
            customerEmail,
            customerName,
            description,
            metadata,
            phone,
            paymentType,
            serviceName,
            type
        } = await c.req.json() as CreateInvoicePaymentRequest;

        console.log('🧾 Création paiement avec facture automatique:', {
            customerEmail,
            customerName,
            amount,
            description,
            paymentType
        });

        // Validation
        if (!amount || amount <= 0) {
            return c.json({
                success: false,
                error: "Montant invalide"
            }, 400);
        }

        if (!customerEmail || !customerName) {
            return c.json({
                success: false,
                error: "Email et nom du client sont requis"
            }, 400);
        }

        // 1. Créer ou récupérer le client Stripe
        console.log('👤 Création/récupération du client Stripe...');
        const customerParams = new URLSearchParams({
            email: customerEmail.trim(),
            name: customerName.trim(),
            ...(phone && {phone: phone.trim()}),
        });

        // Ajouter les métadonnées au client
        if (metadata && typeof metadata === 'object') {
            for (const [key, value] of Object.entries(metadata)) {
                if (value !== undefined && value !== null) {
                    const stringValue = String(value).substring(0, 500);
                    customerParams.append(`metadata[${key}]`, stringValue);
                }
            }
        }

        const customerResponse = await fetch('https://api.stripe.com/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: customerParams,
        });

        const customerData = await customerResponse.json() as StripeCustomerResponse;

        if (!customerResponse.ok || !customerData.id) {
            console.error('❌ Erreur création client Stripe:', customerData);
            const errorMessage = customerData.error?.message || 'Erreur lors de la création du client Stripe';
            return c.json({
                success: false,
                error: errorMessage
            }, 400);
        }

        const customerId = customerData.id;
        console.log('✅ Client Stripe créé:', customerId);

        // 2. Créer l'item de facture
        console.log('📦 Création de l\'item de facture...');
        const invoiceItemParams = new URLSearchParams({
            customer: customerId,
            amount: Math.round(amount * 100).toString(),
            currency: 'eur',
            description: description || `${serviceName} - ${paymentType === 'deposit' ? 'Acompte' : 'Paiement complet'}`,
        });

        const invoiceMetadata = {
            ...metadata,
            service_name: serviceName,
            payment_type: paymentType,
            product_type: type,
            invoice_auto_generated: 'true',
            auto_send_email: 'true'
        };

        for (const [key, value] of Object.entries(invoiceMetadata)) {
            if (value !== undefined && value !== null) {
                const stringValue = String(value).substring(0, 500);
                invoiceItemParams.append(`metadata[${key}]`, stringValue);
            }
        }

        const invoiceItemResponse = await fetch('https://api.stripe.com/v1/invoiceitems', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: invoiceItemParams,
        });

        if (!invoiceItemResponse.ok) {
            const errorData = await handleStripeError(invoiceItemResponse);
            return c.json({
                success: false,
                error: "Erreur création item de facture",
                details: errorData.error
            }, 400);
        }

        const invoiceItem = await invoiceItemResponse.json() as StripeInvoiceItemResponse;
        console.log('✅ Item de facture créé:', invoiceItem.id);

        // 3. Créer la facture
        console.log('📄 Création de la facture...');
        const invoiceParams = new URLSearchParams({
            customer: customerId,
            auto_advance: 'true',
            collection_method: 'charge_automatically',
            'automatic_tax[enabled]': 'true',
            'metadata[auto_send_email]': 'true',
        });

        for (const [key, value] of Object.entries(invoiceMetadata)) {
            if (value !== undefined && value !== null) {
                const stringValue = String(value).substring(0, 500);
                invoiceParams.append(`metadata[${key}]`, stringValue);
            }
        }

        const invoiceResponse = await fetch('https://api.stripe.com/v1/invoices', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: invoiceParams,
        });

        const invoice = await invoiceResponse.json() as StripeInvoiceResponse;

        if (!invoiceResponse.ok || !invoice.id) {
            console.error('❌ Erreur création facture:', invoice);
            const errorMessage = invoice.error?.message || 'Erreur création facture';
            return c.json({
                success: false,
                error: errorMessage
            }, 400);
        }

        console.log('✅ Facture créée (non finalisée):', invoice.id);

        // 4. Créer le PaymentIntent
        console.log('💳 Création du Payment Intent...');
        const stripeAmount = Math.round(amount * 100);

        const paymentIntentParams = new URLSearchParams({
            amount: stripeAmount.toString(),
            currency: 'eur',
            customer: customerId,
            'automatic_payment_methods[enabled]': 'true',
            description: description || `${serviceName} - ${paymentType === 'deposit' ? 'Acompte' : 'Paiement complet'}`,
            'metadata[invoice_id]': invoice.id,
            'metadata[auto_send_invoice]': 'true',
        });

        paymentIntentParams.append('metadata[service_name]', serviceName);
        paymentIntentParams.append('metadata[payment_type]', paymentType);
        paymentIntentParams.append('metadata[product_type]', type);
        paymentIntentParams.append('metadata[customer_id]', customerId);
        paymentIntentParams.append('metadata[customer_email]', customerEmail);

        const paymentIntentResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: paymentIntentParams,
        });

        if (!paymentIntentResponse.ok) {
            const errorData = await handleStripeError(paymentIntentResponse);
            return c.json({
                success: false,
                error: "Erreur création paiement",
                details: errorData.error
            }, 400);
        }

        const paymentIntent = await paymentIntentResponse.json() as StripePaymentIntentResponse;

        if (!paymentIntent.client_secret) {
            return c.json({
                success: false,
                error: "Client secret manquant dans la réponse Stripe"
            }, 500);
        }

        console.log('✅ Payment Intent créé avec succès, facture liée:', invoice.id);

        return c.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            invoiceId: invoice.id,
            customerId: customerId,
            status: 'invoice_created_pending_payment'
        });

    } catch (error) {
        console.error('❌ Erreur création paiement avec facture:', error);
        return c.json({
            success: false,
            error: "Erreur lors de la création du paiement avec facture",
            details: getErrorMessage(error)
        }, 500);
    }
});

// ✅ HEALTH CHECK
app.get('/api/health', (c) => {
    return c.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        hasStripeKey: !!c.env.STRIPE_SECRET_KEY,
        stripeKeyLength: c.env.STRIPE_SECRET_KEY?.length || 0,
        hasR2Bucket: !!c.env.PHOTO_ALBUMS
    });
});

app.get('/api/albums/stats', async (c) => {
    const db = c.env.DB;

    try {
        // Compter le nombre total d'albums
        const albumsCountResult = await db.prepare(
            "SELECT COUNT(*) as count FROM reservations WHERE service_type = 'photo_album'"
        ).first() as { count: number } | null;

        const totalAlbums = albumsCountResult?.count || 0;

        // Fonction pour lister récursivement tous les objets
        const listAllObjects = async (prefix: string): Promise<{ objects: R2Object[] }> => {
            let allObjects: R2Object[] = [];
            let cursor: string | undefined;

            do {
                const listed: R2Objects = await c.env.PHOTO_ALBUMS.list({
                    prefix,
                    limit: 1000
                });

                allObjects = allObjects.concat(listed.objects);
                cursor = listed.truncated ? listed.cursor : undefined;
            } while (cursor);

            return {objects: allObjects};
        };

        // Lister tous les objets avec le préfixe albums/
        const {objects: allObjects} = await listAllObjects('albums/');

        const totalPhotos = allObjects.length;
        const totalSize = allObjects.reduce((sum, obj) => sum + (obj.size || 0), 0);

        // Formater la taille
        const formatBytes = (bytes: number): string => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const totalSizeFormatted = formatBytes(totalSize);

        // Calculer le coût mensuel estimé
        const costPerGBPerMonth = 0.015;
        const totalSizeInGB = totalSize / (1024 * 1024 * 1024);
        const monthlyCost = (totalSizeInGB * costPerGBPerMonth).toFixed(2) + ' €';

        // Récupérer les albums récents
        const recentAlbumsResult = await db.prepare(
            "SELECT * FROM reservations WHERE service_type = 'photo_album' ORDER BY created_at DESC LIMIT 5"
        ).all();

        const recentAlbums = await Promise.all(
            (recentAlbumsResult.results || []).map(async (album: any) => {
                const albumName = album.customer_name || '';
                const albumFolderName = normalizeFolderName(albumName);
                const prefix = `albums/${albumFolderName}/`;

                // Compter les photos et la taille pour cet album
                let albumPhotos = 0;
                let albumSize = 0;

                try {
                    const {objects: albumObjects} = await listAllObjects(prefix);
                    albumPhotos = albumObjects.length;
                    albumSize = albumObjects.reduce((sum, obj) => sum + (obj.size || 0), 0);
                } catch (error) {
                    console.warn(`❌ Erreur listing album ${albumFolderName}:`, error);
                }

                return {
                    id: String(album.id || ''),
                    name: albumName,
                    photoCount: albumPhotos,
                    sizeFormatted: formatBytes(albumSize),
                    createdAt: album.created_at || new Date().toISOString()
                };
            })
        );

        const response: ApiResponse<AlbumStats> = {
            success: true,
            data: {
                totalAlbums,
                totalPhotos,
                totalSizeFormatted,
                monthlyCost,
                recentAlbums
            }
        };

        return c.json(response);

    } catch (error) {
        console.error('❌ Erreur statistiques albums:', error);
        return c.json({
            success: false,
            error: "Erreur lors de la récupération des statistiques",
            details: getErrorMessage(error)
        }, 500);
    }
});

app.post('/api/create-customer', async (c) => {
    try {
        const {email, name, phone, metadata} = await c.req.json() as {
            email: string;
            name: string;
            phone?: string;
            metadata?: Record<string, any>;
        };

        // Validation des données requises
        if (!email || !name) {
            return c.json({
                success: false,
                error: "Email et nom sont requis"
            }, 400);
        }

        console.log('👤 Création client Stripe pour:', email);

        const stripeParams = new URLSearchParams({
            email: email.trim(),
            name: name.trim(),
            ...(phone && {phone: phone.trim()}),
        });

        // Ajouter les métadonnées une par une
        if (metadata && typeof metadata === 'object') {
            for (const [key, value] of Object.entries(metadata)) {
                if (value !== undefined && value !== null) {
                    const stringValue = String(value).substring(0, 500);
                    stripeParams.append(`metadata[${key}]`, stringValue);
                }
            }
        }

        console.log('📤 Envoi requête à Stripe pour créer le client...');

        const response = await fetch('https://api.stripe.com/v1/customers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: stripeParams,
        });

        const data = await response.json() as StripeCustomerResponse;

        console.log('📡 Réponse Stripe création client:', {
            status: response.status,
            hasId: !!data.id,
            error: data.error
        });

        if (!response.ok) {
            console.error('❌ Erreur Stripe création client:', data.error);
            const errorMessage = data.error?.message || 'Erreur lors de la création du client Stripe';
            return c.json({
                success: false,
                error: errorMessage,
                stripeError: data.error
            }, 400);
        }

        if (!data.id) {
            console.error('❌ ID client manquant dans la réponse Stripe');
            return c.json({
                success: false,
                error: 'ID client manquant dans la réponse Stripe'
            }, 500);
        }

        console.log('✅ Client Stripe créé avec succès:', data.id);
        return c.json({
            success: true,
            id: data.id
        });

    } catch (error) {
        console.error('❌ Erreur inattendue création client:', error);
        return c.json({
            success: false,
            error: "Erreur interne lors de la création du client",
            details: getErrorMessage(error)
        }, 500);
    }
});

app.post('/api/create-payment-intent', async (c) => {
    console.log('🔔 Début création Payment Intent');

    try {
        const {amount, priceId, paymentType, serviceName, type} = await c.req.json() as CreatePaymentIntentRequest;

        console.log('💰 Données reçues:', {
            amount,
            priceId,
            paymentType,
            serviceName,
            type
        });

        // Validation
        if (!c.env.STRIPE_SECRET_KEY) {
            return c.json({
                error: "STRIPE_SECRET_KEY manquante",
                details: "Configuration Stripe manquante"
            }, 500);
        }

        if (!amount || amount <= 0) {
            return c.json({
                error: "Montant invalide",
                details: "Le montant doit être supérieur à 0"
            }, 400);
        }

        const stripeAmount = Math.round(amount * 100);
        console.log('🎯 Création Payment Intent avec montant:', stripeAmount);

        // SI on a un priceId valide, utiliser le catalogue Stripe
        if (priceId && priceId.startsWith('price_')) {
            console.log('🎯 Utilisation du catalogue Stripe avec priceId:', priceId);

            const stripeParams = new URLSearchParams({
                amount: stripeAmount.toString(),
                currency: 'eur',
                'automatic_payment_methods[enabled]': 'true',
            });

            // Ajouter le price comme metadata pour référence
            stripeParams.append('metadata[price_id]', priceId);
            stripeParams.append('metadata[service_name]', serviceName);
            stripeParams.append('metadata[payment_type]', paymentType);
            stripeParams.append('metadata[product_type]', type);

            const response = await fetch('https://api.stripe.com/v1/payment_intents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: stripeParams,
            });

            if (response.ok) {
                const data = await response.json() as StripePaymentIntentResponse;

                if (data.client_secret) {
                    console.log('✅ Payment Intent créé avec catalogue Stripe');
                    const successResponse: CreatePaymentIntentSuccessResponse = {
                        clientSecret: data.client_secret,
                        paymentIntentId: data.id,
                        status: data.status,
                        usedCatalog: true
                    };
                    return c.json(successResponse);
                }
            }

            // Si on arrive ici, il y a eu une erreur avec le catalogue
            console.warn('⚠️ Erreur avec catalogue, fallback vers méthode standard');
        }

        // MÉTHODE STANDARD (fallback)
        console.log('🔄 Utilisation méthode standard (sans catalogue)');

        const stripeParams = new URLSearchParams({
            amount: stripeAmount.toString(),
            currency: 'eur',
            'automatic_payment_methods[enabled]': 'true',
        });

        // Ajouter les métadonnées
        stripeParams.append('metadata[service_name]', serviceName);
        stripeParams.append('metadata[payment_type]', paymentType);
        stripeParams.append('metadata[product_type]', type);
        if (priceId) {
            stripeParams.append('metadata[original_price_id]', priceId);
        }

        const response = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: stripeParams,
        });

        if (!response.ok) {
            const errorData = await handleStripeError(response);
            return c.json({
                error: "Erreur création paiement",
                details: errorData.error
            }, 400);
        }

        const data = await response.json() as StripePaymentIntentResponse;

        if (!data.client_secret) {
            return c.json({
                error: "Client secret manquant dans la réponse Stripe"
            }, 500);
        }

        console.log('✅ Payment Intent créé (méthode standard)');
        const successResponse: CreatePaymentIntentSuccessResponse = {
            clientSecret: data.client_secret,
            paymentIntentId: data.id,
            status: data.status,
            usedCatalog: false
        };
        return c.json(successResponse);

    } catch (error) {
        console.error('❌ Erreur création Payment Intent:', error);
        const errorResponse: CreatePaymentIntentErrorResponse = {
            error: "Erreur lors de la création du paiement",
            details: getErrorMessage(error)
        };
        return c.json(errorResponse, 500);
    }
});

app.get('/api/stripe-products', async (c) => {
    try {
        const response = await fetch('https://api.stripe.com/v1/products?active=true&limit=100', {
            headers: {
                'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
            },
        });

        if (!response.ok) {
            const errorData = await handleStripeError(response);
            return c.json({
                success: false,
                error: errorData.error
            }, 400);
        }

        const products = await response.json() as StripeProductsResponse;

        // Récupérer les prix pour chaque produit
        const productsWithPrices = await Promise.all(
            (products.data || []).map(async (product) => {
                const pricesResponse = await fetch(`https://api.stripe.com/v1/prices?product=${product.id}&active=true`, {
                    headers: {
                        'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
                    },
                });

                if (!pricesResponse.ok) {
                    return {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        metadata: product.metadata,
                        prices: []
                    };
                }

                const prices = await pricesResponse.json() as StripePricesResponse;

                return {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    metadata: product.metadata,
                    prices: (prices.data || []).map((price) => ({
                        id: price.id,
                        unit_amount: (price.unit_amount || 0) / 100,
                        currency: price.currency,
                        type: price.type,
                        recurring: price.recurring,
                        metadata: price.metadata
                    }))
                };
            })
        );

        return c.json({
            success: true,
            data: productsWithPrices
        });

    } catch (error) {
        console.error('❌ Erreur récupération produits Stripe:', error);
        return c.json({
            success: false,
            error: getErrorMessage(error)
        }, 500);
    }
});

app.post('/api/multipart/init/:albumName/:filename', async (c) => {
    try {
        const albumName = c.req.param('albumName');
        const filename = c.req.param('filename');

        console.log('🔍 Multipart Init - albumName:', albumName, 'filename:', filename);

        if (!albumName || !filename) {
            return c.json({
                error: "Paramètres manquants",
                details: "albumName et filename sont requis"
            }, 400);
        }

        // Utiliser directement le nom d'album comme dossier
        const key = `albums/${albumName}/${filename}`;

        const fileExtension = filename.toLowerCase().split('.').pop();
        const mimeTypes: { [key: string]: string } = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'webp': 'image/webp',
            'heic': 'image/heic',
            'heif': 'image/heif',
            'tiff': 'image/tiff',
            'bmp': 'image/bmp'
        };

        const contentType = mimeTypes[fileExtension || ''] || 'application/octet-stream';

        console.log('📁 Création multipart upload:', {key, contentType});

        const multipartUpload = await c.env.PHOTO_ALBUMS.createMultipartUpload(key, {
            httpMetadata: {
                contentType: contentType,
                cacheControl: 'public, max-age=31536000',
            }
        });

        const response: MultipartInitResponse = {
            uploadId: multipartUpload.uploadId,
            key: multipartUpload.key
        };

        console.log('✅ Multipart init réussi:', response.uploadId);
        return c.json(response);

    } catch (error) {
        console.error('❌ Erreur initiation multipart:', error);
        return c.json({
            error: "Erreur lors de l'initialisation de upload multipart",
            details: getErrorMessage(error)
        }, 500);
    }
});

app.put('/api/multipart/upload/:albumName/:filename', async (c) => {
    try {
        const albumName = c.req.param('albumName');
        const filename = c.req.param('filename');
        const uploadId = c.req.query('uploadId');
        const partNumber = c.req.query('partNumber');

        console.log('🔍 Multipart Upload - albumName:', albumName, 'filename:', filename, 'uploadId:', uploadId, 'partNumber:', partNumber);

        if (!albumName || !filename || !uploadId || !partNumber) {
            return c.json({
                error: "Paramètres manquants",
                details: "albumName, filename, uploadId et partNumber sont requis"
            }, 400);
        }

        const partNumberInt = parseInt(partNumber);
        if (isNaN(partNumberInt) || partNumberInt < 1 || partNumberInt > 10000) {
            return c.json({
                error: "PartNumber invalide",
                details: "Le partNumber doit être entre 1 et 10000"
            }, 400);
        }

        const key = `albums/${albumName}/${filename}`;
        const body = await c.req.arrayBuffer();

        console.log('📦 Upload partie:', {partNumber: partNumberInt, size: body.byteLength});

        // Vérification de la taille de la partie
        if (body.byteLength < 5 * 1024 * 1024 && body.byteLength > 0) {
            console.warn(`⚠️ Part ${partNumberInt} de taille ${body.byteLength} bytes - attention au minimum 5MB recommandé`);
        }

        const multipartUpload = c.env.PHOTO_ALBUMS.resumeMultipartUpload(key, uploadId);
        const uploadedPart = await multipartUpload.uploadPart(partNumberInt, body);

        console.log('✅ Partie upload:', {partNumber: partNumberInt, etag: uploadedPart.etag});

        return c.json({
            partNumber: partNumberInt,
            etag: uploadedPart.etag,
            size: body.byteLength
        });

    } catch (error) {
        console.error('❌ Erreur upload partie:', error);
        return c.json({
            error: "Erreur lors de upload de la partie",
            details: getErrorMessage(error)
        }, 500);
    }
});

app.post('/api/multipart/complete/:albumName/:filename', async (c) => {
    try {
        const albumName = c.req.param('albumName');
        const filename = c.req.param('filename');
        const uploadId = c.req.query('uploadId');

        console.log('🔍 Multipart Complete - albumName:', albumName, 'filename:', filename, 'uploadId:', uploadId);

        if (!albumName || !filename || !uploadId) {
            return c.json({
                error: "Paramètres manquants",
                details: "albumName, filename et uploadId sont requis"
            }, 400);
        }

        const {parts}: MultipartCompleteRequest = await c.req.json();

        if (!parts || !Array.isArray(parts) || parts.length === 0) {
            return c.json({
                error: "Parts manquantes",
                details: "La liste des parts est requise"
            }, 400);
        }

        const key = `albums/${albumName}/${filename}`;
        const multipartUpload = c.env.PHOTO_ALBUMS.resumeMultipartUpload(key, uploadId);

        // Convertir vers le format R2UploadedPart
        const uploadedParts: R2UploadedPart[] = parts.map(part => ({
            partNumber: part.partNumber,
            etag: part.etag
        }));

        console.log('🎯 Finalisation avec parts:', uploadedParts.length);

        const object = await multipartUpload.complete(uploadedParts);

        // Génération de l'URL publique
        const publicUrl = `${c.env.R2_PUBLIC_DOMAIN}/${key}`;

        console.log('✅ Multipart complet réussi:', {key, size: object.size});

        return c.json({
            success: true,
            message: "Upload multipart terminé avec succès",
            key: key,
            url: publicUrl,
            etag: object.httpEtag,
            size: object.size
        });

    } catch (error) {
        console.error('❌ Erreur finalisation multipart:', error);
        return c.json({
            error: "Erreur lors de la finalisation de upload multipart",
            details: getErrorMessage(error)
        }, 500);
    }
});

// Annuler un upload multipart
app.delete('/api/multipart/abort/:albumName/:filename', async (c) => {
    try {
        const albumName = c.req.param('albumName');
        const filename = c.req.param('filename');
        const uploadId = c.req.query('uploadId');

        console.log('🔍 Multipart Abort - albumName:', albumName, 'filename:', filename, 'uploadId:', uploadId);

        if (!albumName || !filename || !uploadId) {
            return c.json({
                error: "Paramètres manquants",
                details: "albumName, filename et uploadId sont requis"
            }, 400);
        }

        const key = `albums/${albumName}/${filename}`;
        const multipartUpload = c.env.PHOTO_ALBUMS.resumeMultipartUpload(key, uploadId);

        await multipartUpload.abort();

        console.log('✅ Multipart annulé:', uploadId);

        return c.json({
            success: true,
            message: "Upload multipart annulé"
        });

    } catch (error) {
        console.error('❌ Erreur annulation multipart:', error);
        return c.json({
            error: "Erreur lors de l'annulation de upload multipart",
            details: getErrorMessage(error)
        }, 500);
    }
});

// ✅ ROUTE DE DEBUG UPLOAD
app.post('/api/debug-upload', async (c) => {
    try {
        const body = await c.req.text();
        const headers = Object.fromEntries(c.req.raw.headers);

        return c.json({
            success: true,
            debug: {
                headers: {
                    'content-type': headers['content-type'] || '',
                    'content-length': headers['content-length'] || '',
                    'user-agent': headers['user-agent'] || ''
                },
                bodyLength: body.length,
                bodyPreview: body.substring(0, 200) + '...',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        return c.json({
            error: "Debug failed",
            details: getErrorMessage(error)
        }, 500);
    }
});

app.put('/api/upload/:albumId/*', async (c) => {
    console.log('📤 Début upload photo R2');

    try {
        const albumId = c.req.param('albumId');
        const filename = c.req.param('*');

        // Validation des paramètres
        if (!albumId || !filename) {
            return c.json({
                error: "Paramètres manquants",
                details: "albumId et filename sont requis"
            }, 400);
        }

        // Récupération du body AVANT la validation
        const body = await c.req.arrayBuffer();

        if (!body || body.byteLength === 0) {
            return c.json({
                error: "Fichier vide",
                details: "Le corps de la requête est vide"
            }, 400);
        }

        // Validation du type de fichier - PLUS FLEXIBLE
        const contentType = c.req.header('content-type') || '';
        console.log('📄 Content-Type reçu:', contentType);
        console.log('📁 Nom du fichier:', filename);
        console.log('📦 Taille du fichier:', body.byteLength, 'bytes');

        // Types autorisés élargis
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
            'image/tiff',
            'image/bmp',
            'application/octet-stream',
            'binary/octet-stream'
        ];

        // Vérification par extension de fichier comme fallback
        const fileExtension = filename.toLowerCase().split('.').pop();
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'tiff', 'bmp', 'tif'];

        const hasValidExtension = fileExtension ? allowedExtensions.includes(fileExtension) : false;
        const hasValidContentType = allowedTypes.includes(contentType);

        console.log('🔍 Validation:', {
            contentType,
            fileExtension,
            hasValidContentType,
            hasValidExtension
        });

        if (!hasValidContentType && !hasValidExtension) {
            return c.json({
                error: "Type de fichier non autorisé",
                details: `Type: ${contentType}, Extension: .${fileExtension}. Types autorisés: ${allowedTypes.join(', ')}`,
                received: {
                    contentType,
                    fileExtension,
                    filename
                }
            }, 400);
        }

        // Construction de la clé R2
        const key = `albums/${albumId}/${filename}`;
        console.log('🗂️  Clé R2:', key);

        // Déterminer le content-type final
        const finalContentType = hasValidContentType ? contentType :
            fileExtension === 'jpg' || fileExtension === 'jpeg' ? 'image/jpeg' :
                fileExtension === 'png' ? 'image/png' :
                    fileExtension === 'webp' ? 'image/webp' :
                        fileExtension === 'heic' ? 'image/heic' :
                            fileExtension === 'heif' ? 'image/heif' :
                                fileExtension === 'tiff' || fileExtension === 'tif' ? 'image/tiff' :
                                    fileExtension === 'bmp' ? 'image/bmp' :
                                        'application/octet-stream';

        console.log('🎯 Content-Type final:', finalContentType);

        try {
            // Upload vers R2
            await c.env.PHOTO_ALBUMS.put(key, body, {
                httpMetadata: {
                    contentType: finalContentType,
                    cacheControl: 'public, max-age=31536000',
                },
                customMetadata: {
                    albumId: albumId,
                    originalFilename: filename,
                    uploadedAt: new Date().toISOString(),
                    size: body.byteLength.toString(),
                    detectedContentType: contentType,
                    finalContentType: finalContentType
                }
            });

            console.log('✅ Fichier uploadé avec succès:', {
                key,
                size: body.byteLength,
                type: finalContentType
            });

            // Génération de l'URL publique
            const publicUrl = `${c.env.R2_PUBLIC_DOMAIN}/${key}`;

            const response: UploadResponse = {
                success: true,
                message: `Fichier ${filename} uploadé avec succès`,
                key: key,
                url: publicUrl,
                size: body.byteLength,
                contentType: finalContentType
            };

            return c.json(response);

        } catch (r2Error) {
            console.error('❌ Erreur R2:', r2Error);
            return c.json({
                error: "Erreur lors de l'écriture dans R2",
                details: getErrorMessage(r2Error),
                r2Error: true
            }, 500);
        }

    } catch (error) {
        console.error('❌ Erreur upload R2:', error);

        return c.json({
            error: "Erreur lors de upload",
            details: getErrorMessage(error),
            timestamp: new Date().toISOString()
        }, 500);
    }
});

app.get('/api/albums/:albumId/payment-status', async (c) => {
    const db = c.env.DB;
    const albumId = c.req.param('albumId');

    try {
        // Récupérer l'album depuis la table reservations
        const album = await db.prepare(
            "SELECT * FROM reservations WHERE id = ? AND service_type = 'photo_album'"
        ).bind(albumId).first() as Record<string, any> | null;

        if (!album) {
            return c.json({
                error: "Album non trouvé",
                details: `L'album avec l'ID ${albumId} n'existe pas`
            }, 404);
        }

        // Déterminer le statut de paiement
        const totalAmount = album.total_amount || 0;
        const amountPaid = album.amount_paid || 0;
        const paymentStatus = album.payment_status || 'pending';

        const hasPaidDeposit = amountPaid > 0;
        const hasPaidFull = paymentStatus === 'paid' || amountPaid >= totalAmount;

        const response: ApiResponse<PaymentStatus> = {
            success: true,
            data: {
                hasPaidDeposit,
                hasPaidFull,
                albumId: albumId
            }
        };

        return c.json(response);

    } catch (error) {
        console.error('❌ Erreur statut paiement album:', error);
        return c.json({
            error: "Erreur lors de la récupération du statut de paiement",
            details: getErrorMessage(error)
        }, 500);
    }
});

app.get('/api/albums/:albumId/photos', async (c) => {
    try {
        const albumId = c.req.param('albumId');
        const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;

        // Récupérer l'album pour obtenir son nom ET les montants
        const db = c.env.DB;
        const album = await db.prepare(
            "SELECT * FROM reservations WHERE id = ? AND service_type = 'photo_album'"
        ).bind(albumId).first() as Record<string, any> | null;

        if (!album) {
            return c.json({
                success: false,
                error: "Album non trouvé",
                details: `L'album avec l'ID ${albumId} n'existe pas`
            } as ApiErrorResponse, 404);
        }

        // Utiliser le nom de l'album pour le dossier R2
        const albumName = album.customer_name || '';
        const albumFolderName = normalizeFolderName(albumName);
        const prefix = `albums/${albumFolderName}/`;

        console.log('🔍 Recherche photos avec prefix:', prefix);

        const listed = await c.env.PHOTO_ALBUMS.list({
            prefix: prefix,
            include: ['customMetadata', 'httpMetadata'],
            limit: limit
        });

        console.log('📊 Photos trouvées:', listed.objects.length);

        const photos = listed.objects.map(obj => ({
            key: obj.key,
            size: obj.size,
            uploaded: obj.uploaded,
            url: `${c.env.R2_PUBLIC_DOMAIN}/${obj.key}`,
            metadata: {
                ...obj.customMetadata,
                contentType: obj.httpMetadata?.contentType
            }
        }));

        // Extraire les infos client
        const customerName = album.customer_name || '';
        const nameParts = customerName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const customerInfo = {
            firstName,
            lastName,
            email: album.customer_email || '',
            phone: album.customer_phone || ''
        };

        // Retourner avec la structure ApiSuccessResponse
        const response: ApiResponse = {
            success: true,
            message: "Album récupéré avec succès",
            data: {
                albumId: albumId,
                albumName: albumName,
                totalAmount: album.total_amount || 0,
                amountPaid: album.amount_paid || 0,
                customerInfo: customerInfo,
                photos: photos,
                total: photos.length
            }
        };

        console.log('💰 Données retournées:', {
            totalAmount: album.total_amount,
            amountPaid: album.amount_paid,
            customerInfo: customerInfo
        });

        return c.json(response);

    } catch (error) {
        console.error('❌ Erreur liste photos:', error);
        return c.json({
            success: false,
            error: "Erreur lors de la récupération des photos",
            details: getErrorMessage(error)
        } as ApiErrorResponse, 500);
    }
});

app.delete('/api/albums/:albumId', async (c) => {
    const db = c.env.DB;
    const albumId = c.req.param('albumId');

    try {
        // Récupérer l'album pour obtenir son nom
        const album = await db.prepare(
            "SELECT * FROM reservations WHERE id = ? AND service_type = 'photo_album'"
        ).bind(albumId).first() as Record<string, any> | null;

        if (!album) {
            return c.json({
                error: "Album non trouvé",
                details: `L'album avec l'ID ${albumId} n'existe pas ou n'est pas un album photo`
            }, 404);
        }

        // Supprimer toutes les photos de l'album dans R2 (en utilisant le nom de l'album)
        const albumName = album.customer_name || '';
        const albumFolderName = normalizeFolderName(albumName);
        const prefix = `albums/${albumFolderName}/`;

        console.log(`🗑️ Recherche photos à supprimer avec prefix: ${prefix}`);
        const listed = await c.env.PHOTO_ALBUMS.list({prefix});

        let deletedPhotosCount = 0;
        if (listed.objects.length > 0) {
            await Promise.all(
                listed.objects.map(obj => {
                    deletedPhotosCount++;
                    return c.env.PHOTO_ALBUMS.delete(obj.key);
                })
            );
            console.log(`🗑️ Supprimé ${deletedPhotosCount} photos de l'album ${albumId}`);
        }
        await db.prepare(
            `UPDATE reservations
             SET service_type  = 'completed_album',
                 order_details = JSON_SET(
                         COALESCE(order_details, '{}'),
                         '$.album_completed_at', ?,
                         '$.photos_deleted', ?,
                         '$.album_original_data', JSON_EXTRACT(COALESCE(order_details, '{}'), '$')
                                 )
             WHERE id = ?`
        ).bind(
            new Date().toISOString(),
            deletedPhotosCount,
            albumId
        ).run();

        console.log(`✅ Album "${albumName}" marqué comme terminé, ${deletedPhotosCount} photos supprimées de R2`);

        const response: ApiResponse = {
            success: true,
            message: `Album "${albumName}" archivé avec succès. ${deletedPhotosCount} photos supprimées. Les données de réservation sont conservées.`
        };

        return c.json(response);

    } catch (error) {
        console.error('❌ Erreur suppression album:', error);
        return c.json({
            error: "Erreur lors de la suppression de l'album",
            details: getErrorMessage(error)
        }, 500);
    }
});

app.post('/api/albums', async (c) => {
    const db = c.env.DB;

    try {
        const {reservationId} = await c.req.json() as { reservationId: string };

        console.log('📝 Création album à partir de réservation:', reservationId);

        // Validation
        if (!reservationId) {
            return c.json({error: "L'ID de réservation est requis"}, 400);
        }

        // Récupérer la réservation existante
        const reservation = await db.prepare(
            "SELECT * FROM reservations WHERE id = ?"
        ).bind(reservationId).first() as Record<string, any> | null;

        if (!reservation) {
            return c.json({error: "Réservation non trouvée"}, 404);
        }

        console.log('📊 Réservation trouvée:', reservation);

        const createdAt = new Date().toISOString();

        // Extraire les informations de la réservation
        const customerName = reservation.customer_name || '';
        const customerEmail = reservation.customer_email || '';

        // Utiliser les détails de commande existants ou créer un nouveau
        let orderDetails = {};
        try {
            orderDetails = reservation.order_details ? JSON.parse(reservation.order_details) : {};
        } catch (e) {
            console.warn('❌ Erreur parsing order_details existant');
        }

        // Mettre à jour la réservation pour la marquer comme album photo
        const update = await db.prepare(
            `UPDATE reservations
             SET service_type  = 'photo_album',
                 order_details = ?
             WHERE id = ?`
        ).bind(
            JSON.stringify({
                ...orderDetails,
                albumCreatedAt: createdAt,
                albumType: 'photo_album',
                originalReservation: true
            }),
            reservationId
        ).run();

        console.log('✅ Réservation convertie en album, ID:', reservationId);

        // Créer la réponse
        const albumResponse: AlbumResponse = {
            id: String(reservationId),
            name: customerName,
            description: `Album photo pour ${customerName}`,
            clientEmail: customerEmail,
            shootDate: reservation.reservation_date || undefined,
            createdAt: createdAt
        };

        const response: ApiResponse<{ album: AlbumResponse }> = {
            success: true,
            data: {album: albumResponse},
            message: "Album créé avec succès à partir de la réservation"
        };

        return c.json(response, 201);

    } catch (error) {
        console.error('❌ Erreur création album:', error);

        let errorMessage = "Erreur lors de la création de l'album";
        let errorDetails = getErrorMessage(error);

        if (errorDetails.includes('no such table')) {
            errorMessage = "Table reservations non trouvée. La base de données n'est pas initialisée.";
            errorDetails = "La table reservations n'existe pas. Vérifiez que votre base D1 est configurée.";
        }

        return c.json({
            error: errorMessage,
            details: errorDetails
        }, 500);
    }
});

app.get('/api/reservations/for-albums', async (c) => {
    const db = c.env.DB;

    try {
        const result = await db.prepare(
            `SELECT *
             FROM reservations
             WHERE (service_type != 'photo_album' OR service_type IS NULL)
               AND customer_name IS NOT NULL
               AND customer_name != ''
             ORDER BY created_at DESC`
        ).all();

        console.log('📊 Réservations disponibles pour albums:', result.results?.length || 0);

        // Formater les réservations
        const reservations = (result.results || []).map((reservation: any) => {
            let orderDetails = {};
            try {
                orderDetails = reservation.order_details ? JSON.parse(reservation.order_details) : {};
            } catch (e) {
                console.warn('❌ Erreur parsing order_details:', reservation.order_details);
            }

            return {
                id: String(reservation.id || ''),
                customerName: String(reservation.customer_name || ''),
                customerEmail: reservation.customer_email || undefined,
                serviceType: reservation.service_type || undefined,
                reservationDate: reservation.reservation_date || undefined,
                reservationTime: reservation.reservation_time || undefined,
                createdAt: String(reservation.created_at || reservation.reservation_date || new Date().toISOString()),
                orderDetails: orderDetails,
                totalAmount: reservation.total_amount || 0,
                // Ajouter un indicateur si c'est une réservation précédemment utilisée
                wasUsed: reservation.service_type === 'completed_album'
            };
        });

        const response: ApiResponse<{ reservations: any[] }> = {
            success: true,
            data: {reservations}
        };

        return c.json(response);

    } catch (error) {
        console.error('❌ Erreur liste réservations:', error);

        if (getErrorMessage(error).includes('no such table')) {
            return c.json({
                success: true,
                data: {reservations: []},
                message: "Table reservations non trouvée"
            });
        }

        return c.json({
            error: "Erreur lors de la récupération des réservations",
            details: getErrorMessage(error)
        }, 500);
    }
});

app.get('/api/albums', async (c) => {
    const db = c.env.DB;

    try {
        // Récupérer seulement les entrées de type photo_album (albums actifs)
        const result = await db.prepare(
            "SELECT * FROM reservations WHERE service_type = 'photo_album' ORDER BY created_at DESC"
        ).all();

        console.log('📊 Albums actifs from reservations:', result.results?.length || 0);

        // Transformation des données
        const albums = (result.results || []).map((reservation: any) => {
            let orderDetails = {};
            try {
                orderDetails = reservation.order_details ? JSON.parse(reservation.order_details) : {};
            } catch (e) {
                console.warn('❌ Erreur parsing order_details:', reservation.order_details);
            }

            return {
                id: String(reservation.id || ''),
                name: String(reservation.customer_name || ''),
                description: (orderDetails as any).description || undefined,
                clientEmail: reservation.customer_email || undefined,
                shootDate: (orderDetails as any).shootDate || undefined,
                createdAt: String(reservation.created_at || reservation.reservation_date || new Date().toISOString())
            };
        });

        const response: ApiResponse<{ albums: any[] }> = {
            success: true,
            data: {albums}
        };

        return c.json(response);

    } catch (error) {
        console.error('❌ Erreur liste albums:', error);

        // Retourner un tableau vide si la table n'existe pas ou erreur
        if (getErrorMessage(error).includes('no such table')) {
            return c.json({
                success: true,
                data: {albums: []},
                message: "Table reservations non trouvée"
            });
        }

        return c.json({
            error: "Erreur lors de la récupération des albums",
            details: getErrorMessage(error)
        }, 500);
    }
});

// ✅ ROUTE: Supprimer un album (depuis la table reservations)
app.delete('/api/albums/:albumId', async (c) => {
    const db = c.env.DB;
    const albumId = c.req.param('albumId');

    try {
        // Récupérer l'album pour obtenir son nom
        const album = await db.prepare(
            "SELECT * FROM reservations WHERE id = ? AND service_type = 'photo_album'"
        ).bind(albumId).first() as Record<string, any> | null;

        if (!album) {
            return c.json({
                error: "Album non trouvé",
                details: `L'album avec l'ID ${albumId} n'existe pas ou n'est pas un album photo`
            }, 404);
        }

        // Supprimer toutes les photos de l'album dans R2
        const prefix = `albums/${albumId}/`;
        const listed = await c.env.PHOTO_ALBUMS.list({prefix});

        if (listed.objects.length > 0) {
            await Promise.all(
                listed.objects.map(obj => c.env.PHOTO_ALBUMS.delete(obj.key))
            );
            console.log(`🗑️ Supprimé ${listed.objects.length} photos de l'album ${albumId}`);
        }

        // Supprimer l'album de la base de données
        await db.prepare(
            "DELETE FROM reservations WHERE id = ? AND service_type = 'photo_album'"
        ).bind(albumId).run();

        const response: ApiResponse = {
            success: true,
            message: `Album "${album.customer_name}" et ${listed.objects.length} photos supprimés avec succès`
        };

        return c.json(response);

    } catch (error) {
        console.error('❌ Erreur suppression album:', error);
        return c.json({
            error: "Erreur lors de la suppression de l'album",
            details: getErrorMessage(error)
        }, 500);
    }
});

app.get('/api/check-db', async (c) => {
    const db = c.env.DB;

    try {
        // Test simple pour vérifier que la table reservations existe
        const test = await db.prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='reservations'"
        ).first();

        if (!test) {
            return c.json({
                success: false,
                error: "Table reservations non trouvée",
                details: "La table reservations n'existe pas dans la base de données"
            }, 500);
        }

        // Compter les albums existants
        const albumsCount = await db.prepare(
            "SELECT COUNT(*) as count FROM reservations WHERE service_type = 'photo_album'"
        ).first() as { count: number } | null;

        return c.json({
            success: true,
            data: {
                tableExists: true,
                albumsCount: albumsCount?.count || 0
            },
            message: "Base de données opérationnelle"
        });

    } catch (error) {
        console.error('❌ Erreur vérification DB:', error);
        return c.json({
            success: false,
            error: "Erreur de base de données",
            details: getErrorMessage(error)
        }, 500);
    }
});

// ✅ TEST STRIPE
app.get('/api/test-stripe', async (c) => {
    try {
        if (!c.env.STRIPE_SECRET_KEY) {
            return c.json({error: 'STRIPE_SECRET_KEY non définie'}, 500);
        }

        // Test simple de connexion à Stripe
        const response = await fetch('https://api.stripe.com/v1/balance', {
            headers: {
                'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
            },
        });

        if (response.ok) {
            return c.json({
                status: 'Stripe connecté avec succès',
                hasKey: true,
                keyPrefix: c.env.STRIPE_SECRET_KEY?.substring(0, 7) + '...'
            });
        } else {
            const errorData = await handleStripeError(response);
            return c.json({
                error: 'Erreur Stripe',
                details: errorData.error,
                status: response.status
            }, 500);
        }
    } catch (error) {
        return c.json({
            error: 'Erreur de connexion à Stripe',
            details: getErrorMessage(error)
        }, 500);
    }
});

// ✅ ROUTE OPTIONS POUR CORS PREFLIGHT
app.options('/api/create-payment-intent', () => {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
});

app.put('/api/reservations/:id', async (c) => {
    const db = c.env.DB;
    const reservationId = c.req.param('id');

    try {
        const {
            paymentIntentId,
            amountPaid,
            paymentStatus
        } = await c.req.json() as {
            paymentIntentId?: string;
            amountPaid?: number;
            paymentStatus?: string;
        };

        console.log('📝 Mise à jour réservation existante:', {
            reservationId,
            paymentIntentId,
            amountPaid,
            paymentStatus
        });

        // Vérifier que la réservation existe
        const existingReservation = await db.prepare(
            "SELECT * FROM reservations WHERE id = ?"
        ).bind(reservationId).first() as Record<string, any> | null;

        if (!existingReservation) {
            return c.json({
                success: false,
                error: "Réservation non trouvée",
                details: `La réservation avec l'ID ${reservationId} n'existe pas`
            }, 404);
        }

        // Préparer les champs de mise à jour
        const updates: string[] = [];
        const values: any[] = [];

        if (paymentIntentId) {
            updates.push("payment_intent_id = ?");
            values.push(paymentIntentId);
        }

        if (amountPaid !== undefined) {
            updates.push("amount_paid = ?");
            values.push(amountPaid);
        }

        if (paymentStatus) {
            updates.push("payment_status = ?");
            values.push(paymentStatus);
        }

        if (updates.length === 0) {
            return c.json({
                success: false,
                error: "Aucune donnée à mettre à jour"
            }, 400);
        }

        // Ajouter l'ID à la fin pour la clause WHERE
        values.push(reservationId);

        const updateQuery = `
            UPDATE reservations
            SET ${updates.join(', ')}
            WHERE id = ?
        `;

        console.log('📝 Requête de mise à jour:', updateQuery, values);

        const result = await db.prepare(updateQuery).bind(...values).run();

        const response: ApiResponse = {
            success: true,
            message: "Réservation mise à jour avec succès",
            data: {
                id: reservationId,
                updated: result.meta?.changes ? result.meta.changes > 0 : false
            }
        };

        console.log('✅ Réservation mise à jour:', reservationId);
        return c.json(response);

    } catch (error) {
        console.error('❌ Erreur mise à jour réservation:', error);
        return c.json({
            success: false,
            error: "Erreur lors de la mise à jour de la réservation",
            details: getErrorMessage(error)
        }, 500);
    }
});

// ✅ ROUTE RESERVATIONS
app.post('/api/reservations', async (c) => {
    const db = c.env.DB;

    try {
        const raw = await c.req.text();

        let payload: any = {};
        if (raw) {
            try {
                payload = JSON.parse(raw);
            } catch (parseErr: unknown) {
                const parseMsg = getErrorMessage(parseErr);
                return c.json({error: 'Payload JSON invalide', details: parseMsg}, 400);
            }
        }

        let {
            firstName,
            lastName,
            email,
            phone,
            cart,
            total,
            amountPaid,
            paymentType,
            date,
            time,
            type,
            service,
            paymentIntentId,
            paymentStatus
        } = payload as any;

        // Compatibilité: si legacy 'service' fourni sans cart
        if (!cart && service) {
            cart = [
                {
                    productId: null,
                    productName: service,
                    productType: 'session',
                    price: payload.price ?? 0,
                    quantity: 1
                }
            ];
            type = type || 'session';
        }

        // Si cart est string JSON, tenter de parser
        if (typeof cart === 'string') {
            try {
                cart = JSON.parse(cart);
            } catch (e: unknown) {
                cart = null;
            }
        }

        // Validations de base
        if (!firstName || !lastName || !email) {
            return c.json({error: 'All required fields must be filled'}, 400);
        }

        if (!Array.isArray(cart) || cart.length === 0) {
            return c.json({error: 'Le panier est invalide ou vide (cart attendu)'}, 400);
        }

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(email).trim())) {
            return c.json({error: 'Invalid email format'}, 400);
        }

        // Has session/product
        const hasSessions = cart.some((it: any) => it?.productType === 'session');
        const hasProducts = cart.some((it: any) => it?.productType === 'product');

        // serviceType / orderType
        let serviceType;
        let orderType = type || 'product';

        if (hasSessions && hasProducts) {
            serviceType = 'mixte';
            orderType = 'mixed';
        } else if (hasSessions) {
            serviceType = cart.find((it: any) => it?.productType === 'session')?.productName || 'séance photo';
            orderType = 'session';
        } else {
            serviceType = 'produits';
            orderType = orderType || 'product';
        }
        serviceType = String(serviceType).trim() || 'produits';
        orderType = String(orderType).trim() || 'product';

        // Si séance, date/time obligatoires
        if (hasSessions) {
            if (!date || !time) return c.json({error: 'Date et heure sont requises pour les séances photo'}, 400);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
                return c.json({error: 'Invalid date or time format'}, 400);
            }
        }

        // Calcul du total
        let calculatedTotal = Number(total ?? 0);
        if (!calculatedTotal || isNaN(calculatedTotal)) {
            calculatedTotal = cart.reduce((s: number, it: any) => {
                const price = Number(it?.price ?? it?.unitPrice ?? 0) || 0;
                const qty = Number(it?.quantity ?? 1) || 1;
                return s + price * qty;
            }, 0);
        }
        if (isNaN(calculatedTotal)) calculatedTotal = 0;
        calculatedTotal = Math.max(0, calculatedTotal);

        // order_details
        let orderDetails ;
        try {
            orderDetails = JSON.stringify(cart || []);
        } catch {
            orderDetails = '[]';
        }

        // Variables pour l'insertion
        const customerName = `${String(firstName).trim()} ${String(lastName).trim()}`.trim();
        const customerEmail = String(email).trim();
        const customerPhone = phone ? String(phone).trim() : null;
        const reservationDate = hasSessions ? date : null;
        const reservationTime = hasSessions ? time : null;

        // Vérifier créneau
        if (hasSessions && reservationDate && reservationTime) {
            const existing = await db.prepare(
                'SELECT id FROM reservations WHERE reservation_date = ? AND reservation_time = ?'
            ).bind(reservationDate, reservationTime).first();
            if (existing) return c.json({error: 'This time slot is already booked'}, 409);
        }

        // Déterminer le statut de paiement final
        let finalPaymentStatus = paymentStatus;
        if (!finalPaymentStatus) {
            if (paymentType === 'deposit') {
                finalPaymentStatus = 'deposit_paid';
            } else if (paymentIntentId) {
                finalPaymentStatus = 'paid';
            } else {
                finalPaymentStatus = 'pending';
            }
        }

        // INSERT avec amount_paid et payment_type
        const insert = await db.prepare(
            `INSERT INTO reservations (customer_name, customer_email, customer_phone,
                                       reservation_date, reservation_time, service_type,
                                       order_type, total_amount, amount_paid, payment_type,
                                       order_details, payment_intent_id, payment_status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            customerName,
            customerEmail,
            customerPhone,
            reservationDate,
            reservationTime,
            serviceType,
            orderType,
            calculatedTotal,
            amountPaid || calculatedTotal,
            paymentType || 'full',
            orderDetails,
            paymentIntentId || null,
            finalPaymentStatus
        ).run();

        // Message de confirmation adapté
        let confirmationMessage = "✅ Commande confirmée ! Nous vous contactons rapidement.";
        if (finalPaymentStatus === 'deposit_paid') {
            confirmationMessage = "✅ Acompte confirmé ! Votre séance est réservée. Le solde sera à régler après la séance.";
        } else if (finalPaymentStatus === 'paid') {
            confirmationMessage = "✅ Paiement confirmé ! Votre réservation est validée.";
        }

        const response: ApiResponse = {
            success: true,
            message: confirmationMessage,
            data: {
                id: insert.meta?.last_row_id || 0,
                paymentStatus: finalPaymentStatus,
                paymentIntentId: paymentIntentId || null
            }
        };

        return c.json(response, 201);

    } catch (err: unknown) {
        const errMsg = getErrorMessage(err);
        console.error('API Error:', errMsg);
        return c.json({error: 'Server error', details: errMsg}, 500);
    }
});

// Route GET pour les réservations
app.get('/api/reservations', async (c) => {
    const db = c.env.DB;

    try {
        const {searchParams} = new URL(c.req.url);
        const date = searchParams.get('date');

        let result;
        if (date) {
            result = await db.prepare(
                "SELECT reservation_time FROM reservations WHERE reservation_date = ? AND reservation_time IS NOT NULL"
            ).bind(date).all();
        } else {
            result = await db.prepare(
                "SELECT * FROM reservations ORDER BY reservation_date, reservation_time"
            ).all();
        }

        return c.json(result.results || []);

    } catch (error) {
        console.error('API Error:', error);
        return c.json({
            error: "Server error: " + getErrorMessage(error)
        }, 500);
    }
});

app.get('/api/images/*', async (c) => {
    try {
        const path = c.req.path.replace('/api/images/', '');

        console.log('🖼️ Tentative de récupération image:', path);

        // Récupérer l'objet depuis R2
        const object = await c.env.PHOTO_ALBUMS.get(path);

        if (!object) {
            console.error('❌ Image non trouvée dans R2:', path);
            return c.json({error: 'Image non trouvée'}, 404);
        }

        // Déterminer le content-type
        const contentType = object.httpMetadata?.contentType || 'image/jpeg';

        console.log('✅ Image trouvée:', {path, contentType, size: object.size});

        // Retourner l'image avec les bons headers
        return new Response(object.body, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('❌ Erreur récupération image:', error);
        return c.json({
            error: "Erreur lors de la récupération de l'image",
            details: getErrorMessage(error)
        }, 500);
    }
});

// Route OPTIONS pour CORS preflight
app.options('/api/reservations', () => {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
});

// Toutes les autres routes vont à React Router
app.get("*", (c) => {
    const requestHandler = createRequestHandler(
        () => import("virtual:react-router/server-build"),
        import.meta.env.MODE,
    );

    return requestHandler(c.req.raw, {
        cloudflare: {env: c.env, ctx: c.executionCtx},
    });
});

export default app;