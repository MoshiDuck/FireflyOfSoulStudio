// Todo : app/routes/home.tsx
import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";
import "../styles/home.css";
import { PageTransition } from "~/components/PageTransition";
import { Link } from "react-router";
import {Footer} from "~/components/Footer";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Firefly of Soul Studio | Capturing Souls Through Light" },
        {
            name: "description",
            content: "Professional photography studio specializing in artistic portraits, fine art photography, and capturing the essence of human soul through light",
        },
    ];
}

const galleryImages = [
    {
        src: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        title: "Golden Hour",
        category: "Portrait"
    },
    {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        title: "Wilderness Soul",
        category: "Nature"
    },
    {
        src: "https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        title: "Mountain Light",
        category: "Landscape"
    },
    {
        src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        title: "Forest Dream",
        category: "Fine Art"
    },
];

const stats = [
    { number: "500+", label: "Portraits Captured" },
    { number: "8", label: "Years of Experience" },
    { number: "50+", label: "Exhibitions" },
    { number: "100%", label: "Client Satisfaction" }
];

export default function Home() {
    return (
        <PageTransition>
            <div className="home-page">
                <Navbar />

                {/* Hero Section avec image de fond */}
                <header className="hero-modern">
                    <div className="hero-background">
                        {/* Image de fond ajoutée ici */}
                        <div
                            className="hero-background-image"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
                            }}
                        ></div>
                        <div className="hero-overlay"></div>
                        {/* Effets de lumière supplémentaires */}
                        <div className="hero-light-effects">
                            <div className="light-effect light-1"></div>
                            <div className="light-effect light-2"></div>
                            <div className="light-effect light-3"></div>
                        </div>
                    </div>
                    <div className="container">
                        <div className="hero-content">
                            <div className="hero-text">
                                <h1 className="hero-title-main">
                                    <span className="title-line">Capturing Souls</span>
                                    <span className="title-line accent">Through Light</span>
                                </h1>
                                <p className="hero-subtitle">
                                    Professional fine art photography that reveals the essence within.
                                    Where every shadow tells a story and every light reveals a soul.
                                </p>
                                <div className="hero-actions">
                                    <Link to="/gallery" className="btn btn-primary">
                                        Explore Gallery
                                    </Link>
                                    <Link to="/pricing" className="btn btn-secondary">
                                        Book Session
                                    </Link>
                                </div>
                            </div>
                            <div className="hero-visual">
                                <div className="floating-card card-1">
                                    <img
                                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                        alt="Portrait Art"
                                    />
                                </div>
                                <div className="floating-card card-2">
                                    <img
                                        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                                        alt="Landscape Art"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="scroll-indicator">
                        <div className="scroll-arrow"></div>
                    </div>
                </header>

                <section id="gallery" className="section gallery-modern">
                    <div className="container">
                        <div className="section-header">
                            <div className="section-badge">Portfolio</div>
                            <h2 className="section-title-modern">
                                Moments of <span className="text-accent">Eternity</span>
                            </h2>
                            <p className="section-subtitle">
                                A curated selection of visual poetry that captures the essence of human experience
                            </p>
                        </div>
                        <div className="gallery-grid-modern">
                            {galleryImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="gallery-item-modern fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="gallery-image-container">
                                        <img
                                            src={image.src}
                                            alt={image.title}
                                            className="gallery-image"
                                        />
                                        <div className="gallery-overlay">
                                            <div className="gallery-content">
                                                <h3 className="gallery-title">{image.title}</h3>
                                                <span className="gallery-category">{image.category}</span>
                                                <Link to="/gallery" className="gallery-link">
                                                    View Project →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="philosophy" className="section philosophy-modern">
                    <div className="container">
                        <div className="philosophy-content">
                            <div className="philosophy-text-modern">
                                <div className="section-badge">Philosophy</div>
                                <h2 className="section-title-modern">
                                    The Art of <span className="text-accent">Perception</span>
                                </h2>
                                <div className="philosophy-quotes">
                                    <blockquote className="quote fade-in-up">
                                        "Every shadow holds a story waiting for its light,
                                        every silence contains music yearning to be heard."
                                    </blockquote>
                                    <blockquote className="quote fade-in-up delay-1">
                                        "In the brief flash of a firefly, eternity is captured—
                                        moments suspended in the amber of perception."
                                    </blockquote>
                                    <blockquote className="quote fade-in-up delay-2">
                                        "Where darkness meets illumination, souls are revealed,
                                        and the ordinary transforms into extraordinary."
                                    </blockquote>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="cta-section">
                    <div className="container">
                        <div className="cta-content fade-in-up">
                            <h2 className="cta-title">Ready to Create Timeless Art?</h2>
                            <p className="cta-description">
                                Let's collaborate to capture your unique story through the lens of artistic vision
                            </p>
                            <div className="cta-actions">
                                <Link to="/pricing" className="btn btn-primary btn-large">
                                    Start Your Journey
                                </Link>
                                <Link to="/gallery" className="btn btn-outline btn-large">
                                    Explore Our Work
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        </PageTransition>
    );
}