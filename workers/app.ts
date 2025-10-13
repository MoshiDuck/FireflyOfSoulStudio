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
app.post('/api/reservations', async (c) => {
    const db = c.env.DB;

    try {
        const { firstName, lastName, email, phone, service, date, time } = await c.req.json();

        // Validation des données
        if (!firstName || !lastName || !email || !service || !date || !time) {
            return c.json({ error: "All required fields must be filled" }, 400);
        }

        // Validation du format de date
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return c.json({ error: "Invalid date format" }, 400);
        }

        // Validation du format de temps
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(time)) {
            return c.json({ error: "Invalid time format" }, 400);
        }

        // Vérification des créneaux disponibles
        const existing = await db.prepare(
            "SELECT id FROM reservations WHERE reservation_date = ? AND reservation_time = ?"
        ).bind(date, time).first();

        if (existing) {
            return c.json({ error: "This time slot is already booked" }, 409);
        }

        // Insertion de la réservation
        const result = await db.prepare(
            "INSERT INTO reservations (customer_name, customer_email, customer_phone, reservation_date, reservation_time, service_type) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(
            `${firstName} ${lastName}`,
            email,
            phone || null,
            date,
            time,
            service
        ).run();

        return c.json({
            success: true,
            id: result.meta.last_row_id,
            message: "Booking confirmed! We'll contact you soon."
        }, 201);

    } catch (error) {
        console.error('API Error:', error);
        return c.json({
            error: "Server error: " + getErrorMessage(error)
        }, 500);
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