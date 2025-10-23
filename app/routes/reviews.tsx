// Todo : app/routes/reviews.tsx
import { Navbar } from "~/components/navbar";
import { PageTransition } from "~/components/PageTransition";
import { AnimatedSection } from "~/components/AnimatedSection";
import { Link } from "react-router";
import { motion } from "motion/react";
import "../styles/reviews.css";
import {Footer} from "~/components/Footer";

const reviews = [
    {
        id: 1,
        name: "Sarah & James",
        session: "Couple Portrait Session",
        rating: 5,
        text: "An absolutely magical experience! The photographer captured our connection in ways we didn't even know were possible. Every photo tells our story.",
        image: "https://images.unsplash.com/photo-1474176857210-7287d38d27c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        featured: true
    },
    {
        id: 2,
        name: "Emma Rodriguez",
        session: "Fine Art Portrait",
        rating: 5,
        text: "Working with Firefly of Soul was transformative. The attention to detail and artistic vision resulted in portraits that feel like they reveal my true essence.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Michael Chen",
        session: "Editorial Project",
        rating: 5,
        text: "Professional, creative, and deeply intuitive. The final images exceeded all expectations and have become the centerpiece of our brand's visual identity.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "The Johnson Family",
        session: "Family Portrait",
        rating: 5,
        text: "Capturing the chaos and beauty of our family with such grace and artistry. These photos will be treasured for generations.",
        image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "Isabelle Martin",
        session: "Artistic Series",
        rating: 5,
        text: "Every step of the process felt like a creative collaboration. The results are more than photos - they're works of art that capture my spirit.",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "David & Marco",
        session: "Engagement Session",
        rating: 5,
        text: "The photographer created such a comfortable atmosphere that our genuine emotions shine through in every single image. Pure magic!",
        image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
];

const stats = [
    { number: "100+", label: "Happy Clients" },
    { number: "4.9/5", label: "Average Rating" },
    { number: "98%", label: "Would Recommend" },
    { number: "50+", label: "5-Star Reviews" }
];

export default function Reviews() {
    return (
        <PageTransition>
            <div className="reviews-page">
                <Navbar />

                {/* Hero Section - Même style que les autres pages */}
                <header className="reviews-hero-modern">
                    <div className="reviews-hero-background">
                        <div
                            className="hero-background-image"
                            style={{
                                backgroundImage: `url('https://images.unsplash.com/photo-1521791055366-0d553872125f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
                            }}
                        ></div>
                        <div className="hero-overlay"></div>
                    </div>
                    <div className="container">
                        <div className="reviews-hero-content">
                            <motion.div
                                className="reviews-hero-text"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                            >
                                <h1 className="reviews-hero-title">
                                    Voices of <span className="text-accent">Experience</span>
                                </h1>
                                <p className="reviews-hero-subtitle">
                                    Discover the stories behind the lens through the eyes of those who've experienced
                                    the magic of Firefly of Soul Studio firsthand.
                                </p>
                                <div className="reviews-hero-actions">
                                    <Link to="/pricing" className="btn btn-primary">
                                        Book Your Session
                                    </Link>
                                    <a href="#reviews" className="btn btn-secondary">
                                        Read Stories
                                    </a>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                    <div className="scroll-indicator">
                        <div className="scroll-arrow"></div>
                    </div>
                </header>

                {/* Stats Section */}
                <AnimatedSection className="reviews-stats-section">
                    <div className="container">
                        <div className="reviews-stats-grid">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    className="stat-item"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                >
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* Featured Testimonial */}
                <AnimatedSection className="featured-testimonial-section">
                    <div className="container">
                        <div className="section-header-modern">
                            <div className="section-badge">Featured Story</div>
                            <h2 className="section-title-modern">
                                Moments That <span className="text-accent">Matter</span>
                            </h2>
                            <p className="section-subtitle">
                                A glimpse into the transformative experiences that become timeless memories
                            </p>
                        </div>

                        <div className="featured-testimonial-modern">
                            {reviews.filter(t => t.featured).map((testimonial) => (
                                <motion.div
                                    key={testimonial.id}
                                    className="featured-testimonial-card"
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                >
                                    <div className="testimonial-visual">
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="testimonial-image"
                                        />
                                        <div className="testimonial-overlay"></div>
                                    </div>
                                    <div className="testimonial-content">
                                        <div className="rating-stars">
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <span key={i} className="star">★</span>
                                            ))}
                                        </div>
                                        <blockquote className="testimonial-text">
                                            "{testimonial.text}"
                                        </blockquote>
                                        <div className="testimonial-author">
                                            <div className="author-name">{testimonial.name}</div>
                                            <div className="author-session">{testimonial.session}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* reviews Grid */}
                <AnimatedSection className="reviews-grid-section" id="reviews">
                    <div className="container">
                        <div className="section-header-modern">
                            <div className="section-badge">Client Stories</div>
                            <h2 className="section-title-modern">
                                Shared <span className="text-accent">Experiences</span>
                            </h2>
                            <p className="section-subtitle">
                                Real stories from real people who trusted us to capture their most precious moments
                            </p>
                        </div>

                        <div className="reviews-grid-modern">
                            {reviews.filter(t => !t.featured).map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.id}
                                    className="testimonial-card-modern"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="testimonial-header">
                                        <div className="client-avatar">
                                            <img
                                                src={testimonial.image}
                                                alt={testimonial.name}
                                            />
                                        </div>
                                        <div className="client-info">
                                            <div className="client-name">{testimonial.name}</div>
                                            <div className="client-session">{testimonial.session}</div>
                                        </div>
                                    </div>
                                    <div className="rating-stars">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} className="star">★</span>
                                        ))}
                                    </div>
                                    <blockquote className="testimonial-quote">
                                        "{testimonial.text}"
                                    </blockquote>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>

                {/* CTA Section */}
                <AnimatedSection className="cta-section-reviews">
                    <div className="container">
                        <div className="cta-content-reviews">
                            <h2 className="cta-title">Ready to Create Your Story?</h2>
                            <p className="cta-description">
                                Join our family of satisfied clients and let us capture your unique journey through the art of photography.
                            </p>
                            <div className="cta-actions">
                                <Link to="/pricing" className="btn btn-primary btn-large">
                                    Start Your Journey
                                </Link>
                                <Link to="/gallery" className="btn btn-outline btn-large">
                                    View Our Work
                                </Link>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
                <Footer />
            </div>
        </PageTransition>
    );
}