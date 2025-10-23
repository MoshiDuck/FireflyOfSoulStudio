// Todo : app/routes/gallery.tsx
import type { Route } from "./+types/home";
import "../styles/gallery.css";
import { Navbar } from "~/components/navbar";
import { PageTransition } from "~/components/PageTransition";
import { useState } from "react";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Gallery | Firefly of Soul Studio" },
        {
            name: "description",
            content: "Discover our visual poetry and photography collections - Fine art photography showcasing portraits, nature, and urban landscapes",
        },
    ];
}

const albums = [
    {
        id: "nocturnal",
        title: "Nocturnal Dreams",
        count: "12 photographs",
        cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        description: "Exploring the mystery and beauty of the night",
        photos: [
            {
                src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Night Vision",
                category: "Fine Art"
            },
            {
                src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Moonlight Dance",
                category: "Landscape"
            },
            {
                src: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Starry Night",
                category: "Astro"
            },
            {
                src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Urban Glow",
                category: "Urban"
            },
            {
                src: "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Silent Echoes",
                category: "Fine Art"
            },
            {
                src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Dream Walker",
                category: "Portrait"
            },
        ],
    },
    {
        id: "portraits",
        title: "Soul Portraits",
        count: "8 photographs",
        cover: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        description: "Capturing the essence of human soul",
        photos: [
            {
                src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Eternal Gaze",
                category: "Portrait"
            },
            {
                src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Soul Reflection",
                category: "Portrait"
            },
            {
                src: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Inner Light",
                category: "Portrait"
            },
        ],
    },
    {
        id: "nature",
        title: "Wilderness Soul",
        count: "15 photographs",
        cover: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        description: "The untamed beauty of wilderness",
        photos: [
            {
                src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Forest Whisper",
                category: "Nature"
            },
            {
                src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Mountain Soul",
                category: "Landscape"
            },
            {
                src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "River Dance",
                category: "Nature"
            },
        ],
    },
    {
        id: "urban",
        title: "Urban Echoes",
        count: "10 photographs",
        cover: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        description: "The rhythm and poetry of city life",
        photos: [
            {
                src: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "City Pulse",
                category: "Urban"
            },
            {
                src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Neon Dreams",
                category: "Urban"
            },
            {
                src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                title: "Urban Rhythm",
                category: "Street"
            },
        ],
    },
];

export default function Gallery() {
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const currentAlbum = albums.find((album) => album.id === selectedAlbum);

    return (
        <PageTransition>
            <div className="gallery-page">
                <Navbar />

                {/* Hero Section Modernisée */}
                <header className="gallery-hero-modern">
                    <div className="hero-background-gallery">
                        <div className="hero-overlay-gallery"></div>
                    </div>
                    <div className="container">
                        <div className="gallery-hero-content">
                            <div className="gallery-hero-text">
                                <h1 className="gallery-hero-title fade-in-up">
                                    Visual <span className="text-accent">Poetry</span>
                                </h1>
                                <p className="gallery-hero-subtitle fade-in-up delay-1">
                                    Where every image tells a story and every story reveals a soul.
                                    Explore our curated collections of fine art photography.
                                </p>
                                <div className="gallery-hero-actions fade-in-up delay-2">
                                    <Link to="/pricing" className="btn btn-primary">
                                        Book Your Session
                                    </Link>
                                    <a href="#albums" className="btn btn-secondary">
                                        Explore Collections
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="scroll-indicator">
                        <div className="scroll-arrow"></div>
                    </div>
                </header>

                {/* Albums Grid */}
                {!selectedAlbum ? (
                    <section id="albums" className="section albums-section-modern">
                        <div className="container">
                            <div className="section-header-modern">
                                <div className="section-badge">Collections</div>
                                <h2 className="section-title-modern">
                                    Curated <span className="text-accent">Albums</span>
                                </h2>
                                <p className="section-subtitle">
                                    Discover our carefully crafted photography collections,
                                    each telling a unique visual story
                                </p>
                            </div>
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
                                                    src={album.cover}
                                                    alt={album.title}
                                                    className="album-image"
                                                />
                                                <div className="album-overlay-modern">
                                                    <div className="album-overlay-content">
                                                        <span className="view-album-text">View Album</span>
                                                        <div className="album-stats">
                                                            <span className="photo-count">{album.count}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="album-info-modern">
                                            <h3 className="album-title">{album.title}</h3>
                                            <p className="album-description">{album.description}</p>
                                            <div className="album-meta">
                                                <span className="album-count">{album.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="section album-detail-section">
                        <div className="container">
                            <div className="album-detail-header">
                                <button
                                    className="back-button"
                                    onClick={() => setSelectedAlbum(null)}
                                >
                                    <span className="back-arrow">←</span>
                                    Back to Albums
                                </button>
                                <div className="album-detail-info">
                                    <div className="section-badge">Album</div>
                                    <h1 className="album-detail-title">{currentAlbum?.title}</h1>
                                    <p className="album-detail-description">{currentAlbum?.description}</p>
                                    <div className="album-detail-meta">
                                        <span className="photo-count-badge">{currentAlbum?.count}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="photos-grid-modern">
                                {currentAlbum?.photos.map((photo, index) => (
                                    <div
                                        key={index}
                                        className="photo-card-modern fade-in-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="photo-container">
                                            <img
                                                src={photo.src}
                                                alt={photo.title}
                                                className="photo-image"
                                            />
                                            <div className="photo-overlay-modern">
                                                <div className="photo-info-modern">
                                                    <h4 className="photo-title">{photo.title}</h4>
                                                    <span className="photo-category">{photo.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="album-actions">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setSelectedAlbum(null)}
                                >
                                    View All Albums
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA Section */}
                {!selectedAlbum && (
                    <section className="cta-section-gallery">
                        <div className="container">
                            <div className="cta-content-gallery fade-in-up">
                                <h2 className="cta-title">Ready to Create Your Story?</h2>
                                <p className="cta-description">
                                    Let's capture your unique moments through the lens of artistic vision
                                </p>
                                <div className="cta-actions">
                                    <Link to="/pricing" className="btn btn-primary btn-large">
                                        Start Your Project
                                    </Link>
                                    <Link to="/" className="btn btn-outline btn-large">
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="footer-modern-gallery">
                    <div className="container">
                        <div className="footer-content">
                            <div className="footer-brand">
                                <div className="logo">Firefly of Soul</div>
                                <p className="footer-tagline">
                                    Capturing the poetry of light and shadow since 2024
                                </p>
                            </div>
                            <div className="footer-links">
                                <div className="footer-column">
                                    <h4>Navigation</h4>
                                    <Link to="/">Home</Link>
                                    <Link to="/gallery">Gallery</Link>
                                    <Link to="/pricing">Pricing</Link>
                                </div>
                                <div className="footer-column">
                                    <h4>Connect</h4>
                                    <a href="mailto:hello@fireflyofsoul.com">Email</a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                                </div>
                            </div>
                        </div>
                        <div className="footer-bottom">
                            <p>&copy; 2025 Firefly of Soul Studio. All moments preserved with artistic integrity.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </PageTransition>
    );
}