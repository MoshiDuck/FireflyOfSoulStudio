// workers/app.ts - CORRECTION DES MÉTADONNÉES
import { Hono } from "hono";
import { createRequestHandler } from "react-router";
import { cors } from 'hono/cors'

interface Bindings {
    DB: D1Database;
    STRIPE_SECRET_KEY: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// Middleware CORS pour toutes les routes API
app.use('/api/*', cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
}))

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

// ✅ HEALTH CHECK
app.get('/api/health', (c) => {
    return c.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        hasStripeKey: !!c.env.STRIPE_SECRET_KEY,
        stripeKeyLength: c.env.STRIPE_SECRET_KEY?.length || 0
    });
});

// ✅ ROUTE POST POUR CREATE-PAYMENT-INTENT (CORRIGÉE AVEC TOUTES LES MÉTADONNÉES)
app.post('/api/create-payment-intent', async (c) => {
    console.log('🔔 Début création Payment Intent');

    try {
        const { amount, currency = 'eur', metadata = {} } = await c.req.json() as {
            amount: number;
            currency?: string;
            metadata?: Record<string, any>; // NOUVEAU : Accepte tous les champs
        };

        console.log('💰 Données reçues:', {
            amount,
            currency,
            metadata,
            hasStripeKey: !!c.env.STRIPE_SECRET_KEY
        });

        // ✅ Validation robuste du montant
        if (typeof amount !== 'number' || amount < 1) {
            console.error('❌ Montant invalide:', amount);
            return c.json({
                error: "Montant invalide",
                details: `Le montant doit être un nombre supérieur à 0. Reçu: ${amount}`
            }, 400);
        }

        // ✅ Vérification de la clé Stripe
        if (!c.env.STRIPE_SECRET_KEY) {
            console.error('❌ STRIPE_SECRET_KEY manquante dans les variables d\'environnement');
            return c.json({
                error: 'Configuration Stripe manquante',
                details: 'La clé secrète Stripe n\'est pas configurée',
            }, 500);
        }

        // Vérification du format de la clé Stripe
        if (!c.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
            console.error('❌ Format de clé Stripe invalide');
            return c.json({
                error: 'Clé Stripe invalide',
                details: 'La clé Stripe ne commence pas par sk_'
            }, 500);
        }

        console.log('🔑 Clé Stripe validée, longueur:', c.env.STRIPE_SECRET_KEY.length);

        const stripeAmount = Math.round(amount * 100);
        console.log('💶 Montant converti en cents:', stripeAmount);

        // ✅ PRÉPARATION DES PARAMÈTRES STRIPE AVEC TOUTES LES MÉTADONNÉES
        const stripeParams = new URLSearchParams({
            amount: stripeAmount.toString(),
            currency,
            'automatic_payment_methods[enabled]': 'true',
        });

        // NOUVEAU : Ajout dynamique de TOUTES les métadonnées
        if (metadata && typeof metadata === 'object') {
            for (const [key, value] of Object.entries(metadata)) {
                if (value !== undefined && value !== null) {
                    const stringValue = String(value).substring(0, 500);
                    stripeParams.append(`metadata[${key}]`, stringValue);
                    console.log(`📝 Métadonnée ajoutée: ${key} = ${stringValue.substring(0, 50)}...`);
                }
            }
        }

        console.log('📤 Envoi requête à Stripe avec métadonnées complètes...');

        // ✅ Requête Stripe avec timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: stripeParams,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await stripeResponse.json() as {
                id?: string;
                client_secret?: string;
                status?: string;
                error?: {
                    message?: string;
                    type?: string;
                    code?: string;
                };
            };

            console.log('📡 Réponse Stripe:', {
                status: stripeResponse.status,
                ok: stripeResponse.ok,
                hasClientSecret: !!data.client_secret,
                clientSecretLength: data.client_secret?.length,
                error: data.error,
                paymentIntentId: data.id
            });

            if (!stripeResponse.ok) {
                console.error('❌ Erreur Stripe API:', data);

                let errorMessage = "Erreur de paiement";
                if (data.error?.code === 'authentication_failed') {
                    errorMessage = "Clé API Stripe invalide";
                } else if (data.error?.code === 'invalid_request_error') {
                    errorMessage = "Requête Stripe invalide";
                } else if (data.error?.message) {
                    errorMessage = data.error.message;
                }

                return c.json({
                    error: "Erreur Stripe",
                    details: errorMessage,
                    code: data.error?.code,
                    type: data.error?.type
                }, 500);
            }

            if (!data.client_secret) {
                console.error('❌ Client secret manquant dans la réponse Stripe');
                return c.json({
                    error: "Client secret manquant",
                    details: "Stripe n'a pas retourné de client_secret",
                    stripeResponse: data
                }, 500);
            }

            if (!data.client_secret.includes('_secret_')) {
                console.error('❌ Format client_secret invalide reçu de Stripe');
                return c.json({
                    error: "Format de client secret invalide",
                    details: "Le client_secret ne correspond pas au format attendu par Stripe Elements",
                    clientSecretReceived: data.client_secret
                }, 500);
            }

            console.log('✅ Payment Intent créé avec succès:', {
                id: data.id,
                clientSecretPreview: `${data.client_secret.substring(0, 25)}...`,
                status: data.status
            });

            return c.json({
                clientSecret: data.client_secret,
                paymentIntentId: data.id,
                status: data.status,
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                throw new Error('Timeout de la requête Stripe (10s)');
            }
            throw fetchError;
        }

    } catch (error) {
        console.error('❌ Erreur inattendue:', error);

        return c.json({
            error: "Erreur lors de la création du paiement",
            details: getErrorMessage(error),
            timestamp: new Date().toISOString()
        }, 500);
    }
});

app.get('/api/test-stripe', async (c) => {
    try {
        if (!c.env.STRIPE_SECRET_KEY) {
            return c.json({ error: 'STRIPE_SECRET_KEY non définie' }, 500);
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
                keyPrefix: c.env.STRIPE_SECRET_KEY.substring(0, 7) + '...'
            });
        } else {
            const error = await response.json();
            return c.json({
                error: 'Erreur Stripe',
                details: error,
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
app.options('/api/create-payment-intent', (c) => {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
});

// ✅ ROUTE RESERVATIONS - VERSION CORRIGÉE AVEC ACOMPTE
app.post('/api/reservations', async (c) => {
    const db = c.env.DB;

    function resp(body: any, status = 200) {
        return c.json(body as any, status as any);
    }

    try {
        const raw = await c.req.text();

        let payload: any = {};
        if (raw) {
            try {
                payload = JSON.parse(raw);
            } catch (parseErr: unknown) {
                const parseMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
                return resp({ error: 'Payload JSON invalide', details: parseMsg }, 400);
            }
        }

        // NOUVEAUX CHAMPS : amountPaid et paymentType
        let {
            firstName,
            lastName,
            email,
            phone,
            cart,
            total,
            amountPaid, // Nouveau champ
            paymentType, // Nouveau champ : 'deposit' ou 'full'
            date,
            time,
            type,
            service,
            paymentIntentId,
            paymentStatus
        } = payload as any;

        // Compat: si legacy 'service' fourni sans cart
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
            return resp({ error: 'All required fields must be filled' }, 400);
        }

        if (!Array.isArray(cart) || cart.length === 0) {
            return resp({ error: 'Le panier est invalide ou vide (cart attendu)' }, 400);
        }

        // Email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(email).trim())) {
            return resp({ error: 'Invalid email format' }, 400);
        }

        // Has session/product
        const hasSessions = cart.some((it: any) => it?.productType === 'session');
        const hasProducts = cart.some((it: any) => it?.productType === 'product');

        // serviceType / orderType
        let serviceType = 'produits';
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
            if (!date || !time) return resp({ error: 'Date et heure sont requises pour les séances photo' }, 400);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
                return resp({ error: 'Invalid date or time format' }, 400);
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
        let orderDetails = '[]';
        try {
            orderDetails = JSON.stringify(cart || []);
        } catch {
            orderDetails = '[]';
        }

        // CORRECTION : Définition des variables manquantes
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
            if (existing) return resp({ error: 'This time slot is already booked' }, 409);
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
            `INSERT INTO reservations (
                customer_name, customer_email, customer_phone,
                reservation_date, reservation_time, service_type,
                order_type, total_amount, amount_paid, payment_type,
                order_details, payment_intent_id, payment_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            customerName,
            customerEmail,
            customerPhone,
            reservationDate,
            reservationTime,
            serviceType,
            orderType,
            calculatedTotal,
            amountPaid || calculatedTotal, // Utiliser amountPaid si fourni, sinon calculatedTotal
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

        return resp({
            success: true,
            id: insert.meta.last_row_id,
            message: confirmationMessage,
            paymentStatus: finalPaymentStatus,
            paymentIntentId: paymentIntentId || null
        }, 201);

    } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error('API Error:', errMsg);
        return resp({ error: 'Server error', details: errMsg }, 500);
    }
});

// Route GET pour les réservations
app.get('/api/reservations', async (c) => {
    const db = c.env.DB;

    try {
        const { searchParams } = new URL(c.req.url);
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

        return c.json(result.results);

    } catch (error) {
        console.error('API Error:', error);
        return c.json({
            error: "Server error: " + getErrorMessage(error)
        }, 500);
    }
});

// Route OPTIONS pour CORS preflight
app.options('/api/reservations', (c) => {
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
        cloudflare: { env: c.env, ctx: c.executionCtx },
    });
});

export default app;