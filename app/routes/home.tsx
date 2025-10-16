// Todo : app/routes/home.tsx
import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";
import "../styles/home.css";
import { PageTransition } from "~/components/PageTransition";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Firefly of Soul Studio | Capturing Souls Through Light" },
        {
            name: "description",
            content: "Professional photography studio capturing souls through light",
        },
    ];
}

const galleryImages = [
    {
        src: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        title: "Golden Hour",
    },
    {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        title: "Wilderness Soul",
    },
    {
        src: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        title: "Mountain Light",
    },
    {
        src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        title: "Forest Dream",
    },
];

export default function Home() {
    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-900 text-white">
                <Navbar />

                {/* Hero Section */}
                <header className="hero">
                    <div className="home-hero-content">
                        <h1 className="hero-title fade-in-up">
                            Capturing souls through light
                        </h1>

                        {/* Flèche retirée intentionnellement */}
                    </div>
                </header>

                {/* About Section */}
                <section id="about" className="section about">
                    <div className="container">
                        <div className="about-content">
                            <div className="about-text fade-in-left">
                                <h2 className="section-title text-left mb-8">Through the Lens</h2>
                                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                                    In the silence of the night, where light dances with shadows,
                                    I find the truth of a moment. My camera is not a tool, but an
                                    extension of the soul.
                                </p>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    Every photograph tells a story that words cannot express.
                                    Through the interplay of shadow and illumination, we capture
                                    the essence of what it means to be truly alive.
                                </p>
                            </div>
                            <div className="portrait-wrapper fade-in-right hover-lift">
                                <img
                                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                                    alt="Portrait du photographe"
                                    className="portrait"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gallery Preview Section */}
                <section id="gallery" className="section gallery bg-dark-blue">
                    <div className="container">
                        <h2 className="section-title fade-in-up">Moments Captured</h2>
                        <div className="gallery-grid">
                            {galleryImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="gallery-item group hover-lift-smooth fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <img
                                        src={image.src}
                                        alt={image.title}
                                        className="group-hover:scale-105"
                                    />
                                    <div className="image-overlay group-hover:translate-y-0">
                                        <h3 className="font-cinzel text-amber-500 text-xl">{image.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Philosophy Section - NOUVELLE SECTION */}
                <section id="philosophy" className="section philosophy">
                    <div className="container">
                        <div className="philosophy-text">
                            <p className="philosophy-line fade-in-up">
                                Every shadow holds a story waiting for its light.
                            </p>
                            <p className="philosophy-line fade-in-up delay-1">
                                In the brief flash of a firefly, eternity is captured.
                            </p>
                            <p className="philosophy-line fade-in-up delay-2">
                                Where darkness meets illumination, souls are revealed.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="footer footer-home">
                    <div className="container">
                        <div className="logo font-cinzel text-2xl text-amber-500 mb-4">
                            Firefly of Soul
                        </div>
                        <p className="text-gray-400">
                            &copy; 2025 Firefly of Soul Studio. All moments preserved.
                        </p>
                    </div>
                </footer>
            </div>
        </PageTransition>
    );
}
