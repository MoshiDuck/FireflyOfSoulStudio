// Todo : app/routes/home.tsx
import { PageLayout } from "~/components/PageLayout";
import { HeroSection } from "~/components/HeroSection";
import { SectionHeader } from "~/components/SectionHeader";
import { CTASection } from "~/components/CTASection";
import { Link } from "react-router";
import "../styles/home.css";

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

export default function Home() {
    return (
        <PageLayout className="home-page">
            {/* Hero Section avec composant */}
            <HeroSection
                centered={false}
                backgroundImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                titleLines={["Capturing Souls", "Through Light"]}
                subtitle="Professional fine art photography that reveals the essence within. Where every shadow tells a story and every light reveals a soul."
                buttons={[
                    { text: "Explore Gallery", url: "/gallery", type: "primary" },
                    { text: "Book Session", url: "/shootings", type: "secondary" }
                ]}
                floatingCards={[
                    {
                        src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        alt: "Portrait Art",
                        className: "card-1"
                    },
                    {
                        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                        alt: "Landscape Art",
                        className: "card-2"
                    }
                ]}
                showLightEffects={true}
            />

            {/* Gallery Section avec SectionHeader */}
            <section id="gallery" className="section gallery-modern">
                <div className="container">
                    <SectionHeader
                        badge="Portfolio"
                        title="Moments of Eternity"
                        accentWord="Eternity"
                        subtitle="A curated selection of visual poetry that captures the essence of human experience"
                    />
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

            {/* Philosophy Section avec SectionHeader */}
            <section id="philosophy" className="section philosophy-modern">
                <div className="container">
                    <div className="philosophy-content">
                        <div className="philosophy-text-modern">
                            <SectionHeader
                                badge="Philosophy"
                                title="The Art of Perception"
                                accentWord="Perception"
                                centered={false}
                            />
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

            {/* CTA Section avec composant */}
            <CTASection
                title="Ready to Create Timeless Art?"
                description="Let's collaborate to capture your unique story through the lens of artistic vision"
                buttons={[
                    { text: "Start Your Journey", url: "/shootings", type: "primary" },
                    { text: "Explore Our Work", url: "/gallery", type: "outline" }
                ]}
            />
        </PageLayout>
    );
}