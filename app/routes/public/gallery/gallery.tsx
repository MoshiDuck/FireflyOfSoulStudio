// Info : app/routes/public/gallery/gallery.tsx
import { PageLayout } from "~/components/layout/PageLayout";
import { HeroSection } from "~/components/ui/HeroSection";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { CTASection } from "~/components/ui/CTASection";
import { GalleryPaymentProcess } from "~/components/booking/GalleryPaymentProcess";
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "~/config/api";
import "../../../components/components.css";
import "../service/pricing-common.css";
import "./gallery.css";

interface PhotoAlbum {
    id: string;
    name: string;
    description?: string;
    clientEmail?: string;
    shootDate?: string;
    createdAt: string;
    photoCount?: number;
    coverUrl?: string;
    photos?: Photo[];
    totalAmount?: number;
    amountPaid?: number;
    customerInfo?: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
    };
}

interface Photo {
    key: string;
    size: number;
    uploaded: string;
    url: string;
    metadata?: {
        contentType?: string;
        [key: string]: any;
    };
}

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

interface PaymentStatus {
    hasPaidDeposit: boolean;
    hasPaidFull: boolean;
    albumId: string;
    totalAmount?: number;
    amountPaid?: number;
}

// Service factice pour l'album (utilisé dans le processus de paiement)
const ALBUM_SERVICE = {
    id: "photo_album",
    name: "Album Photo Complet",
    description: "Accès complet à toutes les photos de votre album en haute résolution",
    price: 0, // Sera calculé dynamiquement
    type: "album" as const,
    duration: "Accès permanent",
    features: [
        "Téléchargement de toutes les photos",
        "Qualité haute résolution",
        "Accès illimité dans le temps",
        "Sans filigrane ni flou"
    ]
};

// Fonction pour obtenir l'URL d'une image (avec proxy)
const getImageUrl = (r2Url: string): string => {
    if (!r2Url) {
        return getPlaceholderImage();
    }

    try {
        const url = new URL(r2Url);
        const path = url.pathname.substring(1);
        return `/api/images/${path}`;
    } catch (error) {
        return getPlaceholderImage();
    }
};

// Image placeholder base64 (SVG)
const getPlaceholderImage = (): string => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTMwQzE2NS44IDEzMCAxMzggMTU3LjggMTM4IDE5MkMxMzggMjI2LjIgMTY1LjggMjU0IDIwMCAyNTRDMjM0LjIgMjU0IDI2MiAyMjYuMiAyNjIgMTkyQzI2MiAxNTcuOCAyMzQuMiAxMzAgMjAwIDEzMFoiIGZpbGw9IiM5Q0EERkYiLz4KPHBhdGggZD0iTTEwMCAzMjBDMTAwIDMwMi4yIDExNC4yIDI4OCAxMzIgMjg4SDI2OEMyODUuOCAyODggMzAwIDMwMi4yIDMwMCAzMjBWMzUyQzMwMCAzNjkuOCAyODUuOCAzODQgMjY4IDM4OEgxMzJDMTE0LjIgMzg4IDEwMCAzNjkuOCAxMDAgMzUyVjMyMFoiIGZpbGw9IiM5Q0EERkYiLz4KPC9zdmc+';
};

export default function Gallery() {
    const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const [currentAlbum, setCurrentAlbum] = useState<PhotoAlbum | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    // Charger les albums au montage du composant
    useEffect(() => {
        loadAlbums();
    }, []);

    // Charger les détails de l'album et le statut de paiement quand il est sélectionné
    useEffect(() => {
        if (selectedAlbum) {
            loadAlbumDetails(selectedAlbum);
            loadPaymentStatus(selectedAlbum);
        }
    }, [selectedAlbum]);

    // Fonction pour charger le statut de paiement avec les montants
    const loadPaymentStatus = async (albumId: string) => {
        try {
            const response = await fetch(`/api/albums/${albumId}/payment-status`);
            if (response.ok) {
                const result: ApiResponse<PaymentStatus> = await response.json();
                if (result.success && result.data) {
                    setPaymentStatus(result.data);
                } else {
                    if (currentAlbum) {
                        setPaymentStatus({
                            hasPaidDeposit: true,
                            hasPaidFull: false,
                            albumId: albumId,
                            totalAmount: currentAlbum.totalAmount,
                            amountPaid: currentAlbum.amountPaid
                        });
                    } else {
                        setPaymentStatus({
                            hasPaidDeposit: true,
                            hasPaidFull: false,
                            albumId: albumId
                        });
                    }
                }
            } else {
                if (currentAlbum) {
                    setPaymentStatus({
                        hasPaidDeposit: true,
                        hasPaidFull: false,
                        albumId: albumId,
                        totalAmount: currentAlbum.totalAmount,
                        amountPaid: currentAlbum.amountPaid
                    });
                } else {
                    setPaymentStatus({
                        hasPaidDeposit: true,
                        hasPaidFull: false,
                        albumId: albumId
                    });
                }
            }
        } catch (error) {
            console.error('❌ Erreur chargement statut paiement:', error);
            if (currentAlbum) {
                setPaymentStatus({
                    hasPaidDeposit: true,
                    hasPaidFull: false,
                    albumId: albumId,
                    totalAmount: currentAlbum.totalAmount,
                    amountPaid: currentAlbum.amountPaid
                });
            } else {
                setPaymentStatus({
                    hasPaidDeposit: true,
                    hasPaidFull: false,
                    albumId: albumId
                });
            }
        }
    };

    // Fonction pour déterminer le style d'une image
    const getImageStyle = (index: number) => {
        if (!paymentStatus || paymentStatus.hasPaidFull) {
            return '';
        }
        return index === 0 ? 'preview-image' : 'locked-image';
    };

    // Fonction pour démarrer le processus de paiement
    const handleStartPayment = () => {
        setIsPaying(true);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    // Fonction appelée quand le paiement est annulé
    const handlePaymentCancel = () => {
        setIsPaying(false);
    };

    // Fonction appelée quand le paiement est complété
    const handlePaymentComplete = () => {
        setIsPaying(false);
        if (selectedAlbum) {
            loadPaymentStatus(selectedAlbum);
        }
    };

    const loadAlbums = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/albums');
            if (response.ok) {
                const result: ApiResponse<{ albums: PhotoAlbum[] }> = await response.json();
                if (result.success && result.data) {
                    const albumsWithDetails = await Promise.all(
                        result.data.albums.map(async (album) => {
                            let photoCount = 0;
                            let coverUrl = '';

                            try {
                                const photosResponse = await fetch(`/api/albums/${album.id}/photos`);
                                if (photosResponse.ok) {
                                    const photosResult: ApiResponse<{ photos: Photo[] }> = await photosResponse.json();
                                    if (photosResult.success && photosResult.data) {
                                        photoCount = photosResult.data.photos.length;
                                        coverUrl = photosResult.data.photos[0]?.url || '';
                                    }
                                }
                            } catch (error) {
                                console.warn(`Erreur détails album ${album.name}:`, error);
                            }

                            return {
                                ...album,
                                coverUrl,
                                photoCount
                            };
                        })
                    );

                    setAlbums(albumsWithDetails);
                } else {
                    throw new Error(result.error || 'Erreur lors du chargement des albums');
                }
            } else {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
        } catch (error) {
            setError('Impossible de charger les albums. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAlbumDetails = async (albumId: string) => {
        setIsLoading(true);
        try {
            const albumResponse = await fetch(`/api/albums/${albumId}/photos`);
            if (albumResponse.ok) {
                const result: ApiResponse<{
                    albumName: string;
                    photos: Photo[];
                    totalAmount?: number;
                    amountPaid?: number;
                    customerInfo?: {
                        firstName: string;
                        lastName: string;
                        email: string;
                        phone?: string;
                    };
                }> = await albumResponse.json();
                if (result.success && result.data) {
                    const album = albums.find(a => a.id === albumId);
                    if (album) {
                        const updatedAlbum = {
                            ...album,
                            photos: result.data.photos,
                            photoCount: result.data.photos.length,
                            totalAmount: result.data.totalAmount,
                            amountPaid: result.data.amountPaid,
                            customerInfo: result.data.customerInfo
                        };
                        setCurrentAlbum(updatedAlbum);

                        if (paymentStatus) {
                            setPaymentStatus({
                                ...paymentStatus,
                                totalAmount: result.data.totalAmount,
                                amountPaid: result.data.amountPaid
                            });
                        }
                    }
                } else {
                    throw new Error(result.error || 'Erreur lors du chargement des photos');
                }
            } else {
                throw new Error(`Erreur HTTP: ${albumResponse.status}`);
            }
        } catch (error) {
            setError('Impossible de charger les photos de l\'album.');
        } finally {
            setIsLoading(false);
        }
    };

    const getPhotoCountText = (count: number = 0): string => {
        if (count === 0) return 'Aucune photo';
        if (count === 1) return '1 photographie';
        return `${count} photographies`;
    };

    // CORRECTION : Calculer le montant restant à payer (total - déjà payé)
    const getRemainingAmount = (): number => {
        if (paymentStatus?.totalAmount && paymentStatus.amountPaid !== undefined) {
            const remaining = paymentStatus.totalAmount - paymentStatus.amountPaid;
            return Math.max(0, remaining);
        }

        if (currentAlbum?.totalAmount && currentAlbum.amountPaid !== undefined) {
            const remaining = currentAlbum.totalAmount - currentAlbum.amountPaid;
            return Math.max(0, remaining);
        }

        console.warn('⚠️ Données de paiement manquantes, utilisation de la valeur par défaut 100€');
        return 100;
    };

    return (
        <PageLayout className="gallery-page">
            <HeroSection
                backgroundImage="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                title="Galerie Photos"
                accentWord="Photos"
                subtitle="Découvrez nos albums photos réalisés avec passion. Chaque image raconte une histoire unique et capture des moments précieux."
                buttons={[
                    { text: "Réserver une Séance", url: "/shootings", type: "primary" },
                    { text: "Explorer les Albums", url: "#albums", type: "secondary" }
                ]}
                className="gallery-hero-modern"
            />

            {!selectedAlbum ? (
                <section id="albums" className="section albums-section-modern">
                    <div className="container">
                        <SectionHeader
                            badge="Collections"
                            title="Nos Albums Photos"
                            accentWord="Albums"
                            subtitle="Parcourez nos collections de photographies artistiques et professionnelles"
                        />

                        {isLoading ? (
                            <div className="loading-albums">
                                <div className="loading-spinner"></div>
                                <p>Chargement des albums...</p>
                            </div>
                        ) : error ? (
                            <div className="error-message">
                                <p>{error}</p>
                                <button onClick={loadAlbums} className="btn-primary">
                                    Réessayer
                                </button>
                            </div>
                        ) : albums.length === 0 ? (
                            <div className="no-albums">
                                <div className="placeholder-icon">📷</div>
                                <h3>Aucun album disponible</h3>
                                <p>Les albums photos apparaîtront ici une fois créés.</p>
                                <a href="/shootings" className="btn-primary">
                                    Réserver une séance
                                </a>
                            </div>
                        ) : (
                            <div className="albums-grid-modern">
                                {albums.map((album, index) => (
                                    <div
                                        key={album.id}
                                        className="album-card-modern fade-in-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                        onClick={() => setSelectedAlbum(album.id)}
                                    >
                                        <div className="album-visual">
                                            <div className="album-cover-modern">
                                                <img
                                                    src={getImageUrl(album.coverUrl || '')}
                                                    alt={album.name}
                                                    className="album-image"
                                                    onError={(e) => {
                                                        e.currentTarget.src = getPlaceholderImage();
                                                    }}
                                                />
                                                <div className="album-overlay-modern">
                                                    <div className="album-overlay-content">
                                                        <span className="view-album-text">Voir l'Album</span>
                                                        <div className="album-stats">
                                                            <span className="photo-count">
                                                                {getPhotoCountText(album.photoCount)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="album-info-modern">
                                            <h3 className="album-title">{album.name}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            ) : isPaying && currentAlbum ? (
                // PROCESSUS DE PAIEMENT SPÉCIFIQUE GALERIE
                <div id="payment-section" className="booking-process-section">
                    <div className="container">
                        <GalleryPaymentProcess
                            service={{
                                ...ALBUM_SERVICE,
                                price: getRemainingAmount(),
                                description: `Accès complet à votre album "${currentAlbum.name}" - ${currentAlbum.photoCount} photos en haute résolution`,
                                name: `Album "${currentAlbum.name}" - Solde`
                            }}
                            onBack={handlePaymentCancel}
                            onComplete={handlePaymentComplete}
                            apiEndpoint={API_ENDPOINTS.RESERVATIONS}
                            customerInfo={currentAlbum.customerInfo || {
                                firstName: "Client",
                                lastName: currentAlbum.name.split(' ')[0] || "Album",
                                email: currentAlbum.clientEmail || "client@example.com"
                            }}
                            totalAmount={paymentStatus?.totalAmount || currentAlbum.totalAmount || 850}
                            amountPaid={paymentStatus?.amountPaid || currentAlbum.amountPaid || 255}
                            existingReservationId={selectedAlbum} // ← IMPORTANT: ID de la réservation existante
                        />
                    </div>
                </div>
            ) : (
                // VUE ALBUM NORMAL
                <section className="section album-detail-section">
                    <div className="container">
                        <div className="album-detail-header">
                            <button
                                className="back-button"
                                onClick={() => {
                                    setSelectedAlbum(null);
                                    setCurrentAlbum(null);
                                    setError(null);
                                    setPaymentStatus(null);
                                    setIsPaying(false);
                                }}
                            >
                                <span className="back-arrow">←</span>
                                Retour aux Albums
                            </button>

                            {isLoading ? (
                                <div className="loading-album-details">
                                    <div className="loading-spinner"></div>
                                    <p>Chargement des photos...</p>
                                </div>
                            ) : error ? (
                                <div className="error-message">
                                    <p>{error}</p>
                                    <button onClick={() => loadAlbumDetails(selectedAlbum)} className="btn-primary">
                                        Réessayer
                                    </button>
                                </div>
                            ) : currentAlbum ? (
                                <div className="album-detail-info">
                                    <div className="section-badge">Album</div>
                                    <h1 className="album-detail-title">{currentAlbum.name}</h1>

                                    {/* Statut de paiement minimaliste */}
                                    {paymentStatus && !paymentStatus.hasPaidFull && (
                                        <div className="access-status">
                                            <div className="access-badge preview">
                                                <span className="access-icon">●</span>
                                                Mode Prévisualisation
                                            </div>
                                            <div className="payment-info">
                                                <button
                                                    className="unlock-btn"
                                                    onClick={handleStartPayment}
                                                >
                                                    Payer le solde - {getRemainingAmount()}€
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {paymentStatus?.hasPaidFull && (
                                        <div className="access-status">
                                            <div className="access-badge success">
                                                <span className="access-icon">●</span>
                                                Album Déverrouillé
                                            </div>
                                        </div>
                                    )}

                                    <div className="album-detail-meta">
                                        <span className="photo-count-badge">
                                            {getPhotoCountText(currentAlbum.photoCount)}
                                        </span>
                                        {currentAlbum.shootDate && (
                                            <span className="album-date">
                                                Séance du {new Date(currentAlbum.shootDate).toLocaleDateString('fr-FR')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {currentAlbum && currentAlbum.photos && currentAlbum.photos.length > 0 ? (
                            <div className="photos-grid-modern">
                                {currentAlbum.photos.map((photo, index) => (
                                    <div
                                        key={photo.key}
                                        className="photo-card-modern fade-in-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="photo-container">
                                            <img
                                                src={getImageUrl(photo.url)}
                                                alt={`Photo ${index + 1} - ${currentAlbum.name}`}
                                                className={`photo-image ${getImageStyle(index)}`}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.src = getPlaceholderImage();
                                                }}
                                            />

                                            {/* Overlay minimaliste */}
                                            <div className="photo-overlay-modern">
                                                {paymentStatus?.hasPaidFull ? (
                                                    <a
                                                        href={getImageUrl(photo.url)}
                                                        download
                                                        className="download-btn"
                                                    >
                                                        Télécharger
                                                    </a>
                                                ) : (
                                                    <div className="access-overlay">
                                                        {index === 0 ? 'Aperçu' : 'Verrouillé'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </section>
            )}

            {!selectedAlbum && !isPaying && (
                <CTASection
                    title="Prêt à Créer Votre Histoire ?"
                    description="Laissez-nous capturer vos moments précieux à travers notre vision artistique"
                    buttons={[
                        { text: "Commencer Votre Projet", url: "/shootings", type: "primary" },
                        { text: "En Savoir Plus", url: "/about", type: "outline" }
                    ]}
                    className="cta-section-gallery"
                />
            )}
        </PageLayout>
    );
}