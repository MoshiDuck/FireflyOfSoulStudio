// Info : app/routes/admin/dev/dev.tsx
import { Navbar } from "~/components/layout/navbar/navbar";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useLocation, Link } from "react-router";
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

interface AlbumStats {
    totalAlbums: number;
    totalPhotos: number;
    totalSizeFormatted: string;
    monthlyCost: string;
    recentAlbums: any[];
}

interface AlbumStatsResponse {
    success: boolean;
    data?: {
        totalAlbums: number;
        totalPhotos: number;
        totalSizeFormatted: string;
        monthlyCost: string;
        recentAlbums: any[];
    };
    error?: string;
}


function DevPanel() {
    const [orders, setOrders] = useState<any[]>([]);
    const [albumStats, setAlbumStats] = useState<AlbumStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    useEffect(() => {
        // Données simulées
        setOrders([
            { id: 1, client: "Jean Dupont", status: "En attente", amount: "150€" },
            { id: 2, client: "Marie Martin", status: "Validée", amount: "200€" },
            { id: 3, client: "Pierre Lambert", status: "Expédiée", amount: "180€" }
        ]);

        // Charger les stats des albums
        loadAlbumStats();
    }, []);

    const loadAlbumStats = async () => {
        setIsLoadingStats(true);
        try {
            const response = await fetch('/api/albums/stats');

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result: AlbumStatsResponse = await response.json();

            if (result.success && result.data) {
                setAlbumStats({
                    totalAlbums: result.data.totalAlbums,
                    totalPhotos: result.data.totalPhotos,
                    totalSizeFormatted: result.data.totalSizeFormatted,
                    monthlyCost: result.data.monthlyCost,
                    recentAlbums: result.data.recentAlbums
                });
                console.log('✅ Statistiques chargées:', result.data);
            } else {
                throw new Error(result.error || 'Erreur inconnue');
            }
        } catch (error) {
            console.error('❌ Erreur chargement stats albums:', error);
            // Optionnel: afficher un message d'erreur à l'utilisateur
        } finally {
            setIsLoadingStats(false);
        }
    };

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
                <p>Gestion des commandes, albums photos et outils de développement</p>
                <div className="access-info">
                    <small>🔒 Protégé par Cloudflare Access</small>
                </div>
            </div>

            <div className="dev-sections">
                {/* NOUVELLE SECTION : Gestion des Albums Photos */}
                <div className="dev-section">
                    <div className="section-header-with-action">
                        <h3>📸 Gestion des Albums Photos</h3>
                        <Link to="/admin/photo-upload" className="btn-primary">
                            🚀 Accéder à l'Upload
                        </Link>
                    </div>

                    {isLoadingStats ? (
                        <div className="loading-stats">
                            <p>Chargement des statistiques...</p>
                        </div>
                    ) : albumStats ? (
                        <div className="album-stats">
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-number">{albumStats.totalAlbums}</div>
                                    <div className="stat-label">Albums</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">{albumStats.totalPhotos}</div>
                                    <div className="stat-label">Photos</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">{albumStats.totalSizeFormatted}</div>
                                    <div className="stat-label">Stockage</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-number">{albumStats.monthlyCost}</div>
                                    <div className="stat-label">Coût/mois</div>
                                </div>
                            </div>

                            <div className="recent-albums">
                                <h4>Albums Récents</h4>
                                {albumStats.recentAlbums.length > 0 ? (
                                    <div className="albums-list-mini">
                                        {albumStats.recentAlbums.map((album: any) => (
                                            <div key={album.id} className="album-item-mini">
                                                <div className="album-info-mini">
                                                    <div className="album-name">{album.name}</div>
                                                    <div className="album-details">
                                                        <small>{album.photoCount} photos • {album.sizeFormatted}</small>
                                                    </div>
                                                </div>
                                                <div className="album-date">
                                                    {new Date(album.createdAt).toLocaleDateString('fr-FR')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-albums">Aucun album créé</p>
                                )}
                            </div>

                            <div className="album-actions">
                                <button
                                    onClick={loadAlbumStats}
                                    className="dev-action-btn"
                                >
                                    🔄 Actualiser Stats
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="no-stats">
                            <p>Impossible de charger les statistiques des albums</p>
                            <button
                                onClick={loadAlbumStats}
                                className="dev-action-btn"
                            >
                                🔄 Réessayer
                            </button>
                        </div>
                    )}
                </div>

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