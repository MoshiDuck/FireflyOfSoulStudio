// Todo : app/routes/dev.tsx
import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";
import { PageTransition } from "~/components/PageTransition";
import { AnimatedSection } from "~/components/AnimatedSection";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useDevAccess } from "~/hooks/useDevAccess";
import "../styles/dev.css";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Developer Panel | Firefly of Soul Studio" },
        {
            name: "description",
            content: "Developer tools and administration panel",
        },
    ];
}

interface SystemInfo {
    timestamp: string;
    userAgent: string;
    viewport: {
        width: number;
        height: number;
    };
    features: {
        cookies: boolean;
        javaScript: boolean;
        online: boolean;
    };
}

function DevPanel() {
    const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        // Simuler des données système
        setSystemInfo({
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            features: {
                cookies: navigator.cookieEnabled,
                javaScript: true,
                online: navigator.onLine
            }
        });

        // Simuler des commandes (à remplacer par votre vraie logique)
        setOrders([
            { id: 1, client: "Jean Dupont", status: "En attente", amount: "150€" },
            { id: 2, client: "Marie Martin", status: "Validée", amount: "200€" },
            { id: 3, client: "Pierre Lambert", status: "Expédiée", amount: "180€" }
        ]);
    }, []);

    const handleValidateOrder = (orderId: number) => {
        // Simulation de validation de commande
        setOrders(orders.map(order =>
            order.id === orderId
                ? { ...order, status: "Validée" }
                : order
        ));
        alert(`Commande #${orderId} validée !`);
    };

    const handleCancelOrder = (orderId: number) => {
        // Simulation d'annulation de commande
        setOrders(orders.map(order =>
            order.id === orderId
                ? { ...order, status: "Annulée" }
                : order
        ));
        alert(`Commande #${orderId} annulée !`);
    };

    return (
        <div className="dev-panel">
            <motion.div
                className="dev-panel-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1>🛠️ Panel Développeur</h1>
                <p>Gestion des commandes et outils de développement</p>
            </motion.div>

            <div className="dev-sections">
                {/* Section Commandes */}
                <AnimatedSection className="dev-section">
                    <h3>📦 Commandes en Cours</h3>
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className="order-item">
                                <div className="order-info">
                                    <strong>Commande #{order.id}</strong>
                                    <span>Client: {order.client}</span>
                                    <span>Montant: {order.amount}</span>
                                    <span className={`status status-${order.status.toLowerCase().replace(' ', '-')}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="order-actions">
                                    {order.status === "En attente" && (
                                        <>
                                            <motion.button
                                                onClick={() => handleValidateOrder(order.id)}
                                                className="btn-validate"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                ✅ Valider
                                            </motion.button>
                                            <motion.button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="btn-cancel"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                ❌ Annuler
                                            </motion.button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>

                <AnimatedSection className="dev-section">
                    <h3>📊 Informations Système</h3>
                    <div className="dev-info-grid">
                        {systemInfo && Object.entries(systemInfo).map(([key, value]) => (
                            <div key={key} className="info-item">
                                <strong>{key}:</strong>
                                <span>{JSON.stringify(value)}</span>
                            </div>
                        ))}
                    </div>
                </AnimatedSection>

                <AnimatedSection className="dev-section">
                    <h3>⚡ Actions Rapides</h3>
                    <div className="dev-actions">
                        <motion.button
                            onClick={() => window.location.reload()}
                            className="dev-action-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🔁 Recharger la Page
                        </motion.button>
                        <motion.button
                            onClick={() => console.clear()}
                            className="dev-action-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🧹 Clear Console
                        </motion.button>
                        <motion.button
                            onClick={() => alert('Statut: OK')}
                            className="dev-action-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            🔍 Vérifier Statut
                        </motion.button>
                    </div>
                </AnimatedSection>

                <AnimatedSection className="dev-section">
                    <h3>🔍 Diagnostics</h3>
                    <div className="dev-diagnostics">
                        <div className="diagnostic-item">
                            <span>Statut API:</span>
                            <span className="status-ok">✅ Opérationnel</span>
                        </div>
                        <div className="diagnostic-item">
                            <span>Base de données:</span>
                            <span className="status-ok">✅ Connectée</span>
                        </div>
                        <div className="diagnostic-item">
                            <span>Performance:</span>
                            <span className="status-ok">✅ Optimale</span>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    );
}

export default function DevPage() {
    const { allowed, loading, clientIP } = useDevAccess();

    if (loading) {
        return (
            <PageTransition>
                <div className="dev-page">
                    <Navbar />
                    <div className="dev-loading">
                        <div className="loading-spinner"></div>
                        <p>Vérification des accès...</p>
                    </div>
                </div>
            </PageTransition>
        );
    }

    if (!allowed) {
        return (
            <PageTransition>
                <div className="dev-page">
                    <Navbar />
                    <div className="dev-denied">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1>🚫 Accès Refusé</h1>
                            <p>Cette page est réservée aux adresses IP autorisées.</p>
                            <div className="ip-info">
                                <strong>Votre IP:</strong> {clientIP || 'Non détectée'}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="dev-page">
                <Navbar />
                <DevPanel />
            </div>
        </PageTransition>
    );
}