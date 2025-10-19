// app/functions/api/reservations.js
export async function onRequestPost(context) {
    const db = context.env.DB;

    // Gestion CORS
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Lire le corps brut (utile si double-serialisé ou contenu inattendu)
        const rawBody = await context.request.text();
        console.log('📥 RAW BODY:', rawBody);

        let requestData;
        try {
            requestData = rawBody ? JSON.parse(rawBody) : {};
        } catch (parseError) {
            console.log('❌ JSON PARSE ERROR:', parseError.message);
            return new Response(JSON.stringify({
                error: 'Payload JSON invalide',
                details: parseError.message
            }), { status: 400, headers: corsHeaders });
        }

        // Dump initial
        console.log('📦 DONNÉES REÇUES:', JSON.stringify(requestData, null, 2));

        // Extraire champs
        let { firstName, lastName, email, phone, cart, total, date, time, type } = requestData;

        // Logs de diagnostic demandés
        console.log('🧩 DUMP REQUEST:', JSON.stringify(requestData, null, 2));
        console.log('🧠 TYPE DE CART:', typeof cart, 'LENGTH:', cart?.length);
        console.log('🧠 PREMIER ÉLÉMENT CART:', cart?.[0]);

        // Si cart est une string JSON (double-serialisation possible), tenter de parser
        if (typeof cart === 'string') {
            console.log('🧨 CART EST UNE STRING ! Tentative de JSON.parse(cart)');
            try {
                cart = JSON.parse(cart);
                console.log('✅ CART PARSÉE DEPUIS STRING:', cart);
            } catch (e) {
                console.log('❌ Impossible de parser cart (double-serialisation) :', e.message);
                // on laisse la validation ci-dessous remonter l'erreur client-friendly
            }
        }

        // Vérifications basiques des champs utilisateur
        if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
            console.log('❌ Validation échouée: champs obligatoires manquants', {
                firstName, lastName, email
            });
            return new Response(JSON.stringify({
                error: "Prénom, nom et email sont obligatoires"
            }), { status: 400, headers: corsHeaders });
        }

        // Vérifier le panier
        if (!Array.isArray(cart) || cart.length === 0 || !cart[0]?.productType) {
            console.log('❌ Validation échouée: cart invalide ou vide', { cart });
            return new Response(JSON.stringify({
                error: "Le panier est invalide ou vide (structure incorrecte)",
                hint: "Vérifiez que `cart` est un tableau JSON et que chaque item contient `productType`."
            }), { status: 400, headers: corsHeaders });
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            console.log('❌ Email invalide:', email);
            return new Response(JSON.stringify({
                error: "Format d'email invalide"
            }), { status: 400, headers: corsHeaders });
        }

        // Déterminer le type de commande
        const hasSessions = cart.some(item => item.productType === 'session');
        const hasProducts = cart.some(item => item.productType === 'product');
        console.log('🔍 ANALYSE TYPE:', { hasSessions, hasProducts, type });

        // Calculer serviceType et orderType (doit satisfaire les colonnes NOT NULL)
        let serviceType = 'produits';
        let orderType = type || 'product';

        if (hasSessions && hasProducts) {
            serviceType = 'mixte';
            orderType = 'mixed';
        } else if (hasSessions) {
            serviceType = cart.find(item => item.productType === 'session')?.productName || 'séance photo';
            orderType = 'session';
        } else {
            serviceType = 'produits';
            orderType = orderType || 'product';
        }

        // Garantir que ces deux champs soient non vides (conformité au schéma)
        serviceType = (typeof serviceType === 'string' && serviceType.trim()) ? serviceType.trim() : 'produits';
        orderType = (typeof orderType === 'string' && orderType.trim()) ? orderType.trim() : 'product';

        // Validation date/heure pour séances
        if (hasSessions && (!date || !time)) {
            console.log('❌ Séance sans date/heure:', { date, time });
            return new Response(JSON.stringify({
                error: "Date et heure sont requises pour les séances photo"
            }), { status: 400, headers: corsHeaders });
        }

        // Calcul du total (défensif) — la colonne total_amount est NOT NULL DEFAULT 0
        let calculatedTotal = Number(total ?? 0);
        if (!calculatedTotal || isNaN(calculatedTotal)) {
            calculatedTotal = cart.reduce((sum, item) => {
                const price = Number(item?.price ?? item?.unitPrice ?? 0) || 0;
                const quantity = Number(item?.quantity ?? 1) || 1;
                return sum + (price * quantity);
            }, 0);
        }
        if (isNaN(calculatedTotal)) calculatedTotal = 0;
        calculatedTotal = Math.max(0, calculatedTotal); // sécurité

        // Préparer orderDetails (NOT NULL)
        let orderDetails;
        try {
            orderDetails = JSON.stringify(cart || []);
        } catch (e) {
            console.log('❌ Erreur stringify cart:', e.message);
            orderDetails = '[]';
        }
        if (!orderDetails || typeof orderDetails !== 'string') orderDetails = '[]';

        // Préparer customerName / customerEmail (NOT NULL)
        const customerName = `${firstName.trim()} ${lastName.trim()}`.trim();
        const customerEmail = email.trim();

        // Logs récapitulatifs — utile pour diagnostiquer contraintes NOT NULL
        console.log('💾 DONNÉES PRÉ-INSERTION:', {
            customerName,
            customerEmail,
            customerPhone: phone?.trim() || null,
            reservationDate: hasSessions ? date : null,
            reservationTime: hasSessions ? time : null,
            serviceType,
            orderType,
            calculatedTotal,
            orderDetailsLength: orderDetails.length
        });

        // Si hasSessions vérifier créneau
        if (hasSessions && date && time) {
            console.log('🔍 Vérification créneau:', { reservationDate: date, reservationTime: time });
            const existing = await db.prepare(
                "SELECT id FROM reservations WHERE reservation_date = ? AND reservation_time = ?"
            ).bind(date, time).first();

            if (existing) {
                console.log('❌ Créneau déjà réservé');
                return new Response(JSON.stringify({
                    error: "Ce créneau est déjà réservé. Veuillez choisir un autre horaire."
                }), { status: 409, headers: corsHeaders });
            }
        }

        // INSERTION – entourer d'un try/catch pour attraper les contraintes SQLite
        try {
            const result = await db.prepare(
                `INSERT INTO reservations (
                    customer_name, customer_email, customer_phone,
                    reservation_date, reservation_time, service_type,
                    order_type, total_amount, order_details
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
                customerName,
                customerEmail,
                phone?.trim() || null,
                hasSessions ? date : null,
                hasSessions ? time : null,
                serviceType,
                orderType,
                calculatedTotal,
                orderDetails
            ).run();

            console.log('✅ INSERTION RÉUSSIE, ID:', result.meta.last_row_id);

            return new Response(JSON.stringify({
                success: true,
                id: result.meta.last_row_id,
                message: "✅ Commande confirmée ! Nous vous contactons rapidement."
            }), { status: 201, headers: corsHeaders });
        } catch (dbError) {
            console.error('❌ ERREUR INSERTION DB:', dbError);

            // Si erreur de contrainte NOT NULL, retourner 400 avec colonne manquante (plus utile pour le front)
            const notNullMatch = dbError.message?.match(/NOT NULL constraint failed: reservations\.([a-zA-Z_]+)/);
            if (notNullMatch) {
                const column = notNullMatch[1];
                console.log('❌ NOT NULL FAILED ON COLUMN:', column);
                return new Response(JSON.stringify({
                    error: `Donnée requise manquante pour la colonne: ${column}`
                }), { status: 400, headers: corsHeaders });
            }

            // Si autre erreur (unique, etc.), propager info utile
            if (dbError.message?.includes('UNIQUE constraint failed')) {
                return new Response(JSON.stringify({
                    error: "Ce créneau est déjà réservé."
                }), { status: 409, headers: corsHeaders });
            }

            return new Response(JSON.stringify({
                error: "Erreur serveur lors de l'insertion en base"
            }), { status: 500, headers: corsHeaders });
        }
    } catch (error) {
        console.error('❌ ERREUR API DÉTAILLÉE:', error);
        return new Response(JSON.stringify({
            error: "Erreur lors de la réservation. Veuillez réessayer."
        }), { status: 500, headers: corsHeaders });
    }
}

// Nouvelle fonction pour récupérer les créneaux réservés
export async function onRequestGet(context) {
    const db = context.env.DB;
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    try {
        const { searchParams } = new URL(context.request.url);
        const date = searchParams.get('date');

        let result;
        if (date) {
            // Récupérer uniquement les créneaux réservés pour une date spécifique
            result = await db.prepare(
                "SELECT reservation_time FROM reservations WHERE reservation_date = ? AND reservation_time IS NOT NULL"
            ).bind(date).all();
        } else {
            // Récupérer toutes les réservations (pour l'admin)
            result = await db.prepare("SELECT * FROM reservations ORDER BY created_at DESC").all();
        }

        return new Response(JSON.stringify(result.results), { headers: corsHeaders });
    } catch (error) {
        console.error('❌ Erreur GET:', error);
        return new Response(JSON.stringify({ error: "Erreur serveur" }), {
            status: 500, headers: corsHeaders
        });
    }
}