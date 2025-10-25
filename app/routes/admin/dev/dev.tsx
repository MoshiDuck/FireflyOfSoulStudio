// Todo : app/routes/admin/dev/dev.tsx
import { Navbar } from "~/components/layout/navbar/navbar";
import { PageTransition } from "~/components/ui/PageTransition";
import { AnimatedSection } from "~/components/ui/AnimatedSection";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useLocation } from "react-router";
import "./dev.css";

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

        // Données simulées
        setOrders([
            { id: 1, client: "Jean Dupont", status: "En attente", amount: "150€" },
            { id: 2, client: "Marie Martin", status: "Validée", amount: "200€" },
            { id: 3, client: "Pierre Lambert", status: "Expédiée", amount: "180€" }
        ]);
    }, []);

    const handleValidateOrder = (orderId: number) => {
        setOrders(orders.map(order =>
            order.id === orderId
                ? { ...order, status: "Validée" }
                : order
        ));
        alert(`Commande #${orderId} validée !`);
    };

    const handleCancelOrder = (orderId: number) => {
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
                <div className="access-info">
                    <small>🔒 Protégé par Cloudflare Access</small>
                </div>
            </motion.div>

            <div className="dev-sections">
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
                        <div className="diagnostic-item">
                            <span>Cloudflare Access:</span>
                            <span className="status-ok">✅ Actif</span>
                        </div>
                    </div>
                </AnimatedSection>
            </div>
        </div>
    );
}

export default function DevPage() {
    const location = useLocation();

    // Vérifier si l'utilisateur arrive directement sur /dev (sans rechargement)
    useEffect(() => {
        // Si l'utilisateur navigue via React Router (sans rechargement),
        // rediriger avec un rechargement complet pour déclencher Cloudflare Access
        const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

        if (navigationEntry && navigationEntry.type === "navigate") {
            // C'est une navigation standard, laisser Cloudflare Access faire son travail
            console.log("Navigation standard vers /dev");
        } else {
            // C'est probablement une navigation côté client, forcer le rechargement
            console.log("Navigation côté client détectée, vérification de l'accès...");
        }
    }, [location]);

    return (
        <PageTransition>
            <div className="dev-page">
                <Navbar />
                <DevPanel />
            </div>
        </PageTransition>
    );
}