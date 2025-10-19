// Todo : workers/app.ts
import { Hono } from "hono";
import { createRequestHandler } from "react-router";
import { cors } from 'hono/cors'

interface Bindings {
    DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>();

// Middleware CORS pour toutes les routes API
app.use('/api/*', cors())

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}

// Route API pour les réservations
// Remplacer le handler POST existant par ceci dans workers/app.ts

// workers/app.ts — handler POST /api/reservations (TypeScript-friendly)

app.post('/api/reservations', async (c) => {
    const db = c.env.DB;

    // petit wrapper pour éviter les inférences TS trop profondes sur c.json
    function resp(body: any, status = 200) {
        // cast to any to silence TS overload mismatch (safe: body we build nous-mêmes)
        return c.json(body as any, status as any);
    }

    try {
        // Lire le body brut
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

        // Extraire (façon permissive)
        let {
            firstName,
            lastName,
            email,
            phone,
            cart,
            total,
            date,
            time,
            type,
            service // legacy
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

        // Si cart est string JSON (double-serialisation), tenter de parser
        if (typeof cart === 'string') {
            try {
                cart = JSON.parse(cart);
            } catch (e: unknown) {
                // on transforme en null pour laisser la validation échouer proprement
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

        // serviceType / orderType (conformes au PRAGMA)
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

        // Calcul du total (défensif)
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

        // Insert (conforme au PRAGMA)
        const insert = await db.prepare(
            `INSERT INTO reservations (
                customer_name, customer_email, customer_phone,
                reservation_date, reservation_time, service_type,
                order_type, total_amount, order_details
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            customerName,
            customerEmail,
            customerPhone,
            reservationDate,
            reservationTime,
            serviceType,
            orderType,
            calculatedTotal,
            orderDetails
        ).run();

        return resp({
            success: true,
            id: insert.meta.last_row_id,
            message: "Booking confirmed! We'll contact you soon."
        }, 201);

    } catch (err: unknown) {
        // Gestion sûre d'une erreur inconnue
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error('API Error:', errMsg);
        return resp({ error: 'Server error', details: errMsg }, 500);
    }
});

// Route GET pour les réservations
app.get('/api/reservations', async (c) => {
    const db = c.env.DB;

    try {
        const result = await db.prepare(
            "SELECT * FROM reservations ORDER BY reservation_date, reservation_time"
        ).all();

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