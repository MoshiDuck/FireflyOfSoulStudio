// Todo : app/functions/api/reservations.js
export async function onRequestPost(context) {
    const db = context.env.DB;

    // Gestion CORS
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Gérer les requêtes OPTIONS pour CORS
    if (context.request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders
        });
    }

    try {
        const { name, email, date, time, service } = await context.request.json();

        // Validation des données
        if (!name || !email || !date || !time || !service) {
            return new Response(JSON.stringify({ error: "Tous les champs sont requis" }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // Validation du format de date
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return new Response(JSON.stringify({ error: "Format de date invalide" }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // Validation du format de temps
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(time)) {
            return new Response(JSON.stringify({ error: "Format de temps invalide" }), {
                status: 400,
                headers: corsHeaders
            });
        }

        // Vérification des créneaux disponibles
        const existing = await db.prepare(
            "SELECT id FROM reservations WHERE reservation_date = ? AND reservation_time = ?"
        ).bind(date, time).first();

        if (existing) {
            return new Response(JSON.stringify({ error: "Créneau déjà réservé" }), {
                status: 409,
                headers: corsHeaders
            });
        }

        // Insertion de la réservation
        const result = await db.prepare(
            "INSERT INTO reservations (customer_name, customer_email, reservation_date, reservation_time, service_type) VALUES (?, ?, ?, ?, ?)"
        ).bind(name, email, date, time, service).run();

        return new Response(JSON.stringify({
            success: true,
            id: result.meta.last_row_id,
            message: "Réservation confirmée !"
        }), {
            status: 201,
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Erreur API:', error);
        return new Response(JSON.stringify({
            error: "Erreur serveur: " + (error.message || 'Erreur inconnue')
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}

export async function onRequestGet(context) {
    const db = context.env.DB;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const result = await db.prepare(
            "SELECT * FROM reservations ORDER BY reservation_date, reservation_time"
        ).all();

        return new Response(JSON.stringify(result.results), {
            headers: corsHeaders
        });

    } catch (error) {
        console.error('Erreur API:', error);
        return new Response(JSON.stringify({ error: "Erreur serveur" }), {
            status: 500,
            headers: corsHeaders
        });
    }
}