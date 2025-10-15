// =========================
// File: app/routes/gallery.tsx (MODIFIE)
// =========================

import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";
import { useState } from "react";
import { AnimatedLayout } from "~/components/AnimatedLayout";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Gallery | Firefly of Soul Studio" },
        { name: "description", content: "Discover our visual poetry and photography collections" },
    ];
}
const albums = [
    {
        id: "nocturnal",
        title: "Nocturnal Dreams",
        count: "12 photographs",
        cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        photos: [
            { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Night Vision" },
            { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Moonlight Dance" },
            { src: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Starry Night" }
        ]
    },
    {
        id: "portraits",
        title: "Soul Portraits",
        count: "8 photographs",
        cover: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        photos: [
            { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Eternal Gaze" }
        ]
    },
    {
        id: "nature",
        title: "Wilderness Soul",
        count: "15 photographs",
        cover: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        photos: []
    },
    {
        id: "urban",
        title: "Urban Echoes",
        count: "10 photographs",
        cover: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        photos: []
    }
];
export default function Gallery() {
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

    const currentAlbum = albums.find(album => album.id === selectedAlbum);

    return (
        <AnimatedLayout>
            <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />

                {/* Hero Section */}
                <header className="gallery-hero min-h-[60vh] flex items-center justify-center">
                    <div className="gallery-hero-content text-center">
                        <h1 className="font-cinzel text-4xl md:text-6xl text-amber-500 mb-4">
                            Visual Poetry
                        </h1>
                        <p className="text-gray-300 text-xl">Discover the soul behind each moment</p>
                    </div>
                </header>
                {/* Albums Grid */}
                {!selectedAlbum && (
                    <section className="albums-section section">
                        <div className="container">
                            <h2 className="section-title font-cinzel text-3xl md:text-4xl text-amber-500 mb-12 text-center">
                                Albums
                            </h2>
                            <div className="albums-grid">
                                {albums.map((album) => (
                                    <div
                                        key={album.id}
                                        className="album-card group cursor-pointer"
                                        onClick={() => setSelectedAlbum(album.id)}
                                    >
                                        <div className="album-cover relative overflow-hidden">
                                            <img
                                                src={album.cover}
                                                alt={album.title}
                                                className="group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="album-overlay group-hover:opacity-100">
                                                <h3 className="font-cinzel text-gray-900 text-xl">View Album</h3>
                                            </div>
                                        </div>
                                        <div className="album-info">
                                            <h3 className="font-cinzel text-amber-500 text-lg">{album.title}</h3>
                                            <p className="text-gray-400">{album.count}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
                {/* Album Photos */}
                {selectedAlbum && currentAlbum && (
                    <section className="album-content-section section">
                        <div className="container">
                            <div className="album-photos active">
                                <div className="album-header">
                                    <h2 className="font-cinzel text-3xl text-amber-500">{currentAlbum.title}</h2>
                                    <button
                                        className="back-to-albums"
                                        onClick={() => setSelectedAlbum(null)}
                                    >
                                        Back to Albums
                                    </button>
                                </div>
                                <div className="masonry-grid">
                                    {currentAlbum.photos.map((photo, index) => (
                                        <div key={index} className="masonry-item group">
                                            <img
                                                src={photo.src}
                                                alt={photo.title}
                                                className="group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="photo-info group-hover:translate-y-0">
                                                <h4 className="font-cinzel text-amber-500">{photo.title}</h4>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
                {/* Footer */}
                <footer className="footer-gallery">
                    <div className="container">
                        <div className="logo font-cinzel text-2xl text-amber-500 mb-4">Firefly of Soul</div>
                        <p className="text-gray-400">&copy; 2025 Firefly of Soul Studio. All moments preserved.</p>
                    </div>
                </footer>
            </div>
        </AnimatedLayout>
    );
}
