// Info : app/routes/public/gallery/gallery.tsx
import { PageLayout } from "~/components/layout/PageLayout";
import { HeroSection } from "~/components/ui/HeroSection";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { CTASection } from "~/components/ui/CTASection";
import { useState, useEffect } from "react";
import "../../../components/components.css";
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

// Fonction pour obtenir l'URL d'une image (avec proxy)
const getImageUrl = (r2Url: string): string => {
    if (!r2Url) {
        console.log('🔄 Utilisation placeholder: URL vide');
        return getPlaceholderImage();
    }

    try {
        // Utiliser le proxy pour contourner les problèmes CORS/401
        const url = new URL(r2Url);
        const path = url.pathname.substring(1); // Enlever le slash initial
        const proxyUrl = `/api/images/${path}`;

        console.log('🔄 Conversion URL:', { r2Url, proxyUrl });
        return proxyUrl;
    } catch (error) {
        console.error('❌ Erreur construction URL image:', error, r2Url);
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

    // Charger les albums au montage du composant
    useEffect(() => {
        loadAlbums();
    }, []);

    // Charger les détails de l'album quand il est sélectionné
    useEffect(() => {
        if (selectedAlbum) {
            loadAlbumDetails(selectedAlbum);
        }
    }, [selectedAlbum]);

    const loadAlbums = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/albums');
            if (response.ok) {
                const result: ApiResponse<{ albums: PhotoAlbum[] }> = await response.json();
                if (result.success && result.data) {
                    // Charger les albums d'abord, puis les détails progressivement
                    const albumsWithDetails = await Promise.all(
                        result.data.albums.map(async (album) => {
                            let photoCount = 0;
                            let coverUrl = '';

                            try {
                                // Récupérer les infos de l'album pour avoir le vrai compteur
                                const photosResponse = await fetch(`/api/albums/${album.id}/photos`);
                                if (photosResponse.ok) {
                                    const photosResult: ApiResponse<{ photos: Photo[] }> = await photosResponse.json();
                                    if (photosResult.success && photosResult.data) {
                                        photoCount = photosResult.data.photos.length;
                                        // Prendre la première photo comme couverture
                                        coverUrl = photosResult.data.photos[0]?.url || '';
                                    }
                                }
                            } catch (error) {
                                console.warn(`⚠️ Erreur détails album ${album.name}:`, error);
                            }

                            return {
                                ...album,
                                coverUrl,
                                photoCount
                            };
                        })
                    );

                    setAlbums(albumsWithDetails);
                    console.log('✅ Albums chargés:', albumsWithDetails);
                } else {
                    throw new Error(result.error || 'Erreur lors du chargement des albums');
                }
            } else {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Erreur chargement albums:', error);
            setError('Impossible de charger les albums. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadAlbumDetails = async (albumId: string) => {
        setIsLoading(true);
        try {
            // Charger les infos de l'album
            const albumResponse = await fetch(`/api/albums/${albumId}/photos`);
            if (albumResponse.ok) {
                const result: ApiResponse<{ albumName: string; photos: Photo[] }> = await albumResponse.json();
                if (result.success && result.data) {
                    const album = albums.find(a => a.id === albumId);
                    if (album) {
                        setCurrentAlbum({
                            ...album,
                            photos: result.data.photos,
                            photoCount: result.data.photos.length
                        });
                    }
                } else {
                    throw new Error(result.error || 'Erreur lors du chargement des photos');
                }
            } else {
                throw new Error(`Erreur HTTP: ${albumResponse.status}`);
            }
        } catch (error) {
            console.error('❌ Erreur chargement détails album:', error);
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

    return (
        <PageLayout className="gallery-page">
            {/* Hero Section */}
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
                                                        console.error('❌ Erreur chargement image cover:', album.coverUrl);
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
            ) : (
                <section className="section album-detail-section">
                    <div className="container">
                        <div className="album-detail-header">
                            <button
                                className="back-button"
                                onClick={() => {
                                    setSelectedAlbum(null);
                                    setCurrentAlbum(null);
                                    setError(null);
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
                                                className="photo-image"
                                                loading="lazy"
                                                onError={(e) => {
                                                    console.error('❌ Erreur chargement image:', photo.url);
                                                    e.currentTarget.src = getPlaceholderImage();
                                                }}
                                            />
                                            <div className="photo-overlay-modern">
                                                <div className="photo-info-modern">
                                                    <h4 className="photo-title">
                                                        {photo.key.split('/').pop() || `Photo ${index + 1}`}
                                                    </h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : currentAlbum && !isLoading && !error ? (
                            <div className="no-photos-in-album">
                                <div className="placeholder-icon">📸</div>
                                <h3>Aucune photo dans cet album</h3>
                                <p>Les photos apparaîtront ici une fois uploadées.</p>
                            </div>
                        ) : null}

                        <div className="album-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setSelectedAlbum(null);
                                    setCurrentAlbum(null);
                                    setError(null);
                                }}
                            >
                                Voir Tous les Albums
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {!selectedAlbum && (
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