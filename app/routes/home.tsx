// Todo : app/routes/home.tsx
import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Firefly of Soul Studio | Capturing Souls Through Light" },
        { name: "description", content: "Professional photography studio capturing souls through light" },
    ];
}

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            {/* Hero Section */}
            <header className="home-hero min-h-screen flex items-center justify-center relative">
                <div className="home-hero-content text-center">
                    <h1 className="hero-title font-cinzel text-4xl md:text-7xl text-amber-500 mb-4">
                        Capturing souls through light
                    </h1>
                </div>
            </header>

            {/* About Section */}
            <section id="about" className="about-section section">
                <div className="container">
                    <div className="about-content">
                        <div className="about-text">
                            <h2 className="font-cinzel text-3xl md:text-4xl text-amber-500 mb-6">Through the Lens</h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                In the silence of the night, where light dances with shadows, I find the truth of a moment.
                                My camera is not a tool, but an extension of the soul.
                            </p>
                        </div>
                        <div className="portrait-wrapper">
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
            <section id="gallery" className="gallery-section section">
                <div className="container">
                    <h2 className="section-title font-cinzel text-3xl md:text-4xl text-amber-500 mb-12 text-center">
                        Moments Captured
                    </h2>
                    <div className="gallery-grid">
                        {[
                            { src: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Golden Hour" },
                            { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Wilderness Soul" },
                            { src: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Mountain Light" },
                            { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80", title: "Forest Dream" }
                        ].map((image, index) => (
                            <div key={index} className="gallery-item group">
                                <img src={image.src} alt={image.title} className="group-hover:scale-105 transition-transform duration-300" />
                                <div className="image-overlay group-hover:translate-y-0">
                                    <h3 className="font-cinzel text-amber-500">{image.title}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section id="philosophy" className="philosophy-section section">
                <div className="container">
                    <div className="philosophy-text">
                        <p className="philosophy-line font-cinzel text-2xl md:text-4xl text-amber-500 text-center">
                            Every shadow holds a story waiting for its light.
                        </p>
                        <p className="philosophy-line font-cinzel text-2xl md:text-4xl text-amber-500 text-center">
                            In the brief flash of a firefly, eternity is captured.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer-home">
                <div className="container">
                    <div className="logo font-cinzel text-2xl text-amber-500 mb-4">Firefly of Soul</div>
                    <p className="text-gray-400">&copy; 2025 Firefly of Soul Studio. All moments preserved.</p>
                </div>
            </footer>
        </div>
    );
}