// app/routes/home.tsx
import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";
import "../styles/home.css";
import { PageTransition } from "~/components/PageTransition";
import { Link } from "react-router";

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

                {/* Hero Section Modernisée */}
                <header className="hero-modern">
                    <div className="hero-background">
                        <div className="hero-overlay"></div>
                    </div>
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
                    <div className="scroll-indicator">
                        <div className="scroll-arrow"></div>
                    </div>
                </header>

                {/* Stats Section */}
                <section className="stats-section">
                    <div className="container">
                        <div className="stats-grid">
                            {stats.map((stat, index) => (
                                <div key={index} className="stat-item fade-in-up">
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section Modernisée */}
                <section id="about" className="section about-modern">
                    <div className="container">
                        <div className="about-content-modern">
                            <div className="about-text-modern fade-in-left">
                                <div className="section-badge">About the Artist</div>
                                <h2 className="section-title-modern">
                                    Where Vision Meets <span className="text-accent">Emotion</span>
                                </h2>
                                <p className="about-description">
                                    In the silence between moments, where light dances with shadows,
                                    I discover the unspoken truth. My camera is not merely a tool—it's
                                    an extension of perception, capturing the poetry of existence.
                                </p>
                                <p className="about-description">
                                    Each photograph is a conversation between light and soul, a visual
                                    symphony that transcends words. Through meticulous craftsmanship
                                    and intuitive connection, we reveal the authentic essence that
                                    defines your unique story.
                                </p>
                                <div className="about-features">
                                    <div className="feature">
                                        <div className="feature-icon">🎨</div>
                                        <div className="feature-text">
                                            <h4>Artistic Vision</h4>
                                            <p>Unique creative perspective for each project</p>
                                        </div>
                                    </div>
                                    <div className="feature">
                                        <div className="feature-icon">✨</div>
                                        <div className="feature-text">
                                            <h4>Premium Quality</h4>
                                            <p>Highest standard materials and techniques</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="about-visual-modern fade-in-right">
                                <div className="portrait-container">
                                    <img
                                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                        alt="Professional Photographer"
                                        className="portrait-modern"
                                    />
                                    <div className="portrait-frame"></div>
                                    <div className="experience-badge">
                                        <div className="experience-years">8+</div>
                                        <div className="experience-text">Years Experience</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gallery Preview Section Modernisée */}
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
                        <div className="gallery-cta fade-in-up">
                            <Link to="/gallery" className="btn btn-outline">
                                View Complete Portfolio
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Philosophy Section Modernisée */}
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

                {/* CTA Section */}
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

                {/* Footer */}
                <footer className="footer-modern">
                    <div className="container">
                        <div className="footer-content">
                            <div className="footer-brand">
                                <div className="logo">Firefly of Soul</div>
                                <p className="footer-tagline">
                                    Capturing the poetry of light and shadow since 2016
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
                                    <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">Pinterest</a>
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