// Todo : app/routes/content/about/about.tsx
import { PageLayout } from "~/components/layout/PageLayout";
import { HeroSection } from "~/components/ui/HeroSection";
import { SectionHeader } from "~/components/ui/SectionHeader";
import { CTASection } from "~/components/ui/CTASection";
import { motion } from "motion/react";
import "../../../components/components.css";
import "./about.css";

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
        <PageLayout className="about-page">
            {/* Hero Section avec la même hauteur que les autres pages */}
            <HeroSection
                backgroundImage="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                title="The Artist Behind the Lens"
                accentWord="Behind"
                subtitle="Where vision meets emotion, and every photograph tells a story of light, shadow, and the beautiful complexity of the human soul."
                buttons={[
                    { text: "View My Work", url: "/gallery", type: "primary" },
                    { text: "Book a Session", url: "/shootings", type: "secondary" }
                ]}
                className="about-hero-modern"
            />

            {/* Le reste du code reste identique */}
            <section className="story-section-modern">
                <div className="container">
                    <div className="story-content-modern">
                        <div className="story-text-modern">
                            <SectionHeader
                                badge="My Journey"
                                title="Capturing Souls Through Light"
                                accentWord="Light"
                                centered={false}
                            />
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
                        </div>
                        <motion.div
                            className="story-visual-modern"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="portrait-container-modern">
                                <img
                                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Professional Photographer"
                                    className="artist-portrait-modern"
                                />
                                <div className="portrait-frame-modern"></div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="values-section-modern">
                <div className="container">
                    <SectionHeader
                        badge="Philosophy"
                        title="My Creative Values"
                        accentWord="Values"
                        subtitle="The principles that guide my artistic vision and approach to photography"
                    />
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
            </section>

            <section className="timeline-section-modern">
                <div className="container">
                    <SectionHeader
                        badge="Journey"
                        title="My Creative Timeline"
                        accentWord="Timeline"
                        subtitle="Key moments that have shaped my artistic journey and professional growth"
                    />
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
            </section>

            <CTASection
                title="Ready to Create Your Story?"
                description="Let's collaborate to capture your unique essence through the lens of artistic vision. Your timeless portrait awaits."
                buttons={[
                    { text: "Book Your Session", url: "/shootings", type: "primary" },
                    { text: "View Portfolio", url: "/gallery", type: "outline" }
                ]}
                className="about-cta-section-modern"
            />
        </PageLayout>
    );
}