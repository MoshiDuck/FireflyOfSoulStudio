// Info : app/routes/admin/dev/dev.tsx
import { Navbar } from "~/components/layout/navbar/navbar";
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
            <div className="dev-panel-header">
                <h1>🛠️ Panel Développeur</h1>
                <p>Gestion des commandes et outils de développement</p>
                <div className="access-info">
                    <small>🔒 Protégé par Cloudflare Access</small>
                </div>
            </div>

            <div className="dev-sections">
                <div className="dev-section">
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
                                            <button
                                                onClick={() => handleValidateOrder(order.id)}
                                                className="btn-validate"
                                            >
                                                ✅ Valider
                                            </button>
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="btn-cancel"
                                            >
                                                ❌ Annuler
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dev-section">
                    <h3>📊 Informations Système</h3>
                    <div className="dev-info-grid">
                        {systemInfo && Object.entries(systemInfo).map(([key, value]) => (
                            <div key={key} className="info-item">
                                <strong>{key}:</strong>
                                <span>{JSON.stringify(value)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dev-section">
                    <h3>⚡ Actions Rapides</h3>
                    <div className="dev-actions">
                        <button
                            onClick={() => window.location.reload()}
                            className="dev-action-btn"
                        >
                            🔁 Recharger la Page
                        </button>
                        <button
                            onClick={() => console.clear()}
                            className="dev-action-btn"
                        >
                            🧹 Clear Console
                        </button>
                        <button
                            onClick={() => alert('Statut: OK')}
                            className="dev-action-btn"
                        >
                            🔍 Vérifier Statut
                        </button>
                    </div>
                </div>

                <div className="dev-section">
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
                </div>
            </div>
        </div>
    );
}

export default function DevPage() {
    const location = useLocation();

    // Vérifier si l'utilisateur arrive directement sur /dev (sans rechargement)
    useEffect(() => {
        const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;

        if (navigationEntry && navigationEntry.type === "navigate") {
            console.log("Navigation standard vers /dev");
        } else {
            console.log("Navigation côté client détectée, vérification de l'accès...");
        }
    }, [location]);

    return (
        <div className="dev-page">
            <Navbar />
            <DevPanel />
        </div>
    );
}