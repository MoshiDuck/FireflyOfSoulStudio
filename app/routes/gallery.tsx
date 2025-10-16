import type { Route } from "./+types/home";
import "../styles/gallery.css";
import { Navbar } from "~/components/navbar";
import { PageTransition } from "~/components/PageTransition";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Gallery | Firefly of Soul Studio" },
        {
            name: "description",
            content: "Discover our visual poetry and photography collections",
        },
    ];
}

const albums = [
    {
        id: "nocturnal",
        title: "Nocturnal Dreams",
        count: "12 photographs",
        cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        photos: [
            {
                src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Night Vision",
            },
            {
                src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Moonlight Dance",
            },
            {
                src: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Starry Night",
            },
            {
                src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Urban Glow",
            },
            {
                src: "https://images.unsplash.com/photo-1506260408121-e353d10b87c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Silent Echoes",
            },
            {
                src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Dream Walker",
            },
        ],
    },
    {
        id: "portraits",
        title: "Soul Portraits",
        count: "8 photographs",
        cover: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        photos: [
            {
                src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Eternal Gaze",
            },
            {
                src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Soul Reflection",
            },
            {
                src: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Inner Light",
            },
        ],
    },
    {
        id: "nature",
        title: "Wilderness Soul",
        count: "15 photographs",
        cover: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        photos: [
            {
                src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Forest Whisper",
            },
            {
                src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Mountain Soul",
            },
            {
                src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "River Dance",
            },
        ],
    },
    {
        id: "urban",
        title: "Urban Echoes",
        count: "10 photographs",
        cover: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        photos: [
            {
                src: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "City Pulse",
            },
            {
                src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Neon Dreams",
            },
            {
                src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                title: "Urban Rhythm",
            },
        ],
    },
];

export default function Gallery() {
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
    const currentAlbum = albums.find((album) => album.id === selectedAlbum);

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />

                {/* Hero Section */}
                <header className="gallery-hero">
                    <div className="gallery-hero-content">
                        <h1 className="hero-title fade-in-up">Visual Poetry</h1>
                        <p className="text-gray-300 text-xl fade-in-up delay-1">
                            Discover the soul behind each moment
                        </p>
                    </div>
                </header>

                {/* Albums Grid / Album Photos */}
                {!selectedAlbum ? (
                    <section className="section albums-section bg-dark-blue">
                        <div className="container">
                            <h2 className="section-title fade-in-up">Albums</h2>
                            <div className="albums-grid">
                                {albums.map((album, index) => (
                                    <div
                                        key={album.id}
                                        className="album-card group hover-lift-card fade-in-up"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                        onClick={() => setSelectedAlbum(album.id)}
                                    >
                                        <div className="album-cover">
                                            <img
                                                src={album.cover}
                                                alt={album.title}
                                                className="group-hover:scale-110"
                                            />
                                            <div className="album-overlay">
                                                <h3>View Album</h3>
                                            </div>
                                        </div>
                                        <div className="album-info">
                                            <h3>{album.title}</h3>
                                            <p>{album.count}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="section album-content-section bg-deep-night">
                        <div className="container">
                            <div className="album-photos active">
                                <div className="album-header">
                                    <h2>{currentAlbum?.title}</h2>
                                    <button
                                        className="back-to-albums hover-scale"
                                        onClick={() => setSelectedAlbum(null)}
                                    >
                                        Back to Albums
                                    </button>
                                </div>
                                <div className="masonry-grid">
                                    {currentAlbum?.photos.map((photo, index) => (
                                        <div
                                            key={index}
                                            className="masonry-item group hover-lift-photo fade-in-up"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <img
                                                src={photo.src}
                                                alt={photo.title}
                                                className="group-hover:scale-105"
                                            />
                                            <div className="photo-info group-hover:translate-y-0">
                                                <h4>{photo.title}</h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="footer footer-gallery">
                    <div className="container">
                        <div className="logo">Firefly of Soul</div>
                        <p>&copy; 2025 Firefly of Soul Studio. All moments preserved.</p>
                    </div>
                </footer>
            </div>
        </PageTransition>
    );
}