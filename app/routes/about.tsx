// Todo : app/routes/about.tsx
import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";
import { PageTransition } from "~/components/PageTransition";
import { AnimatedSection } from "~/components/AnimatedSection";
import { Link } from "react-router";
import { motion } from "motion/react";
import "../styles/about.css";
import {Footer} from "~/components/Footer";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "About | Firefly of Soul Studio" },
        {
            name: "description",
            content: "Meet the artist behind Firefly of Soul Studio - Professional photographer with 8+ years of experience in fine art photography",
        },
    ];
}

const values = [
    {
        icon: "🎨",
        title: "Artistic Integrity",
        description: "Every photograph is created with artistic vision and technical excellence, ensuring each image tells a meaningful story."
    },
    {
        icon: "✨",
        title: "Emotional Connection",
        description: "I believe in creating images that resonate emotionally, capturing the authentic essence of each moment and subject."
    },
    {
        icon: "🌙",
        title: "Light as Poetry",
        description: "Light is my primary medium - I use it to paint emotions, create atmosphere, and reveal hidden beauty."
    },
    {
        icon: "💫",
        title: "Timeless Quality",
        description: "My work focuses on creating images that transcend trends and remain meaningful for generations to come."
    }
];

const milestones = [
    { year: "2016", event: "Founded Firefly of Soul Studio" },
    { year: "2018", event: "First International Exhibition" },
    { year: "2020", event: "Featured in Art Photography Magazine" },
    { year: "2022", event: "Opened Studio Gallery Space" },
    { year: "2024", event: "500+ Client Sessions Completed" }
];

export default function About() {
    return (
        <PageTransition>
            <div className="about-page">
                <Navbar />

                <header className="about-hero-modern">
                    <div className="about-hero-background">
                        <div
                            className="hero-background-image"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
                            }}
                        ></div>
                        <div className="hero-overlay"></div>
                    </div>
                    <div className="container">
                        <div className="about-hero-content">
                            <motion.div
                                className="about-hero-text"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                            >
                                <h1 className="about-hero-title">
                                    The Artist <span className="text-accent">Behind</span> the Lens
                                </h1>
                                <p className="about-hero-subtitle">
                                    Where vision meets emotion, and every photograph tells a story of light, shadow,
                                    and the beautiful complexity of the human soul.
                                </p>
                                <div className="about-hero-actions">
                                    <Link to="/gallery" className="btn btn-primary">
                                        View My Work
                                    </Link>
                                    <Link to="/shootings" className="btn btn-secondary">
                                        Book a Session
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    <div className="scroll-indicator">
                        <div className="scroll-arrow"></div>
                    </div>
                </header>

                <section className="story-section-modern">
                    <div className="container">
                        <div className="story-content-modern">
                            <AnimatedSection className="story-text-modern" delay={0.1}>
                                <div className="section-badge">My Journey</div>
                                <h2 className="section-title-modern">
                                    Capturing Souls Through <span className="text-accent">Light</span>
                                </h2>

                                <div className="story-description-modern">
                                    <p>
                                        In the silence between moments, where light dances with shadows,
                                        I discovered my purpose. My journey began not with a camera, but with
                                        a profound appreciation for the poetry of existence.
                                    </p>

                                    <p>
                                        Over the past eight years, my camera has become an extension of my
                                        perception, a tool to capture the unspoken truths and hidden beauty
                                        that surrounds us. Each session is a collaboration, where we co-create
                                        images that reveal the authentic essence within.
                                    </p>
                                </div>

                                <div className="story-features">
                                    <div className="feature-modern">
                                        <div className="feature-icon">🎯</div>
                                        <div className="feature-content">
                                            <h4>Artistic Vision</h4>
                                            <p>Unique creative perspective for each project</p>
                                        </div>
                                    </div>
                                    <div className="feature-modern">
                                        <div className="feature-icon">🌟</div>
                                        <div className="feature-content">
                                            <h4>Premium Quality</h4>
                                            <p>Highest standard materials and techniques</p>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>

                            <AnimatedSection className="story-visual-modern" direction="left" delay={0.2}>
                                <div className="portrait-container-modern">
                                    <img
                                        src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                        alt="Professional Photographer"
                                        className="artist-portrait-modern"
                                    />
                                    <div className="portrait-frame-modern"></div>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>
                </section>

                <AnimatedSection className="values-section-modern">
                    <div className="container">
                        <div className="section-header-modern">
                            <div className="section-badge">Philosophy</div>
                            <h2 className="section-title-modern">
                                My Creative <span className="text-accent">Values</span>
                            </h2>
                            <p className="section-subtitle">
                                The principles that guide my artistic vision and approach to photography
                            </p>
                        </div>

                        <div className="values-grid-modern">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    className="value-card-modern"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="value-icon-modern">{value.icon}</div>
                                    <h3 className="value-title-modern">{value.title}</h3>
                                    <p className="value-description-modern">{value.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                <AnimatedSection className="timeline-section-modern">
                    <div className="container">
                        <div className="section-header-modern">
                            <div className="section-badge">Journey</div>
                            <h2 className="section-title-modern">
                                My Creative <span className="text-accent">Timeline</span>
                            </h2>
                            <p className="section-subtitle">
                                Key moments that have shaped my artistic journey and professional growth
                            </p>
                        </div>

                        <div className="timeline-modern">
                            {milestones.map((milestone, index) => (
                                <motion.div
                                    key={index}
                                    className="timeline-item-modern"
                                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                >
                                    <div className="timeline-content">
                                        <div className="timeline-year">{milestone.year}</div>
                                        <div className="timeline-event">{milestone.event}</div>
                                    </div>
                                    <div className="timeline-dot"></div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                <section className="about-cta-section-modern">
                    <div className="container">
                        <AnimatedSection>
                            <div className="about-cta-content-modern">
                                <h2 className="cta-title">Ready to Create Your Story?</h2>
                                <p className="cta-description">
                                    Let's collaborate to capture your unique essence through the lens of artistic vision.
                                    Your timeless portrait awaits.
                                </p>
                                <div className="cta-actions">
                                    <Link to="/shootings" className="btn btn-primary btn-large">
                                        Book Your Session
                                    </Link>
                                    <Link to="/gallery" className="btn btn-outline btn-large">
                                        View Portfolio
                                    </Link>
                                </div>
                            </div>
                        </AnimatedSection>
                    </div>
                </section>
                <Footer />
            </div>
        </PageTransition>
    );
}