// Todo : app/routes/content/faq/faq.tsx
import { PageLayout } from "~/components/layout/PageLayout";
import { HeroSection } from "~/components/ui/HeroSection";
import { CTASection } from "~/components/ui/CTASection";
import { motion } from "motion/react";
import { useState } from "react";
import "../../../components/components.css";
import "./faq.css";

const faqCategories = [
    {
        id: "booking",
        title: "Booking & Sessions",
        icon: "📅",
        questions: [
            {
                question: "How far in advance should I book my session?",
                answer: "We recommend booking 4-6 weeks in advance for the best availability, especially for weekend sessions. For special occasions or specific seasonal themes, we suggest booking 2-3 months ahead."
            },
            {
                question: "What's your cancellation policy?",
                answer: "We require 48 hours notice for cancellations. Rescheduling is free with proper notice. Deposits are fully refundable with 7+ days notice, or can be applied to future sessions with 48+ hours notice."
            },
            {
                question: "Do you offer payment plans?",
                answer: "Yes! We offer flexible payment plans for sessions over $500. You can split your payment into 2-3 installments. Contact us to discuss custom payment arrangements that work for you."
            },
            {
                question: "What happens if the weather is bad for outdoor sessions?",
                answer: "We monitor weather conditions closely and will contact you 24 hours before your session if rescheduling is necessary. We have backup dates available and can also move to our indoor studio if preferred."
            }
        ]
    },
    {
        id: "services",
        title: "Services & Process",
        icon: "🎨",
        questions: [
            {
                question: "What's included in the session fee?",
                answer: "The session fee includes the photographer's time, talent, pre-session consultation, basic editing, and online gallery delivery. Prints, albums, and additional products are available separately."
            },
            {
                question: "How long until I receive my photos?",
                answer: "Portrait sessions: 2-3 weeks. Artistic series: 3-4 weeks. Editorial projects: 4-5 weeks. We'll provide a detailed timeline during your consultation and keep you updated throughout the process."
            },
            {
                question: "Do you provide hair and makeup services?",
                answer: "We work with professional hair and makeup artists who can be added to any session. This service starts at $150 and includes a trial consultation. We highly recommend it for artistic and editorial sessions."
            },
            {
                question: "Can I request specific poses or concepts?",
                answer: "Absolutely! We encourage collaboration and want to bring your vision to life. During our pre-session consultation, we'll discuss your ideas, inspirations, and create a mood board together."
            }
        ]
    },
    {
        id: "products",
        title: "Products & Delivery",
        icon: "🖼️",
        questions: [
            {
                question: "What print products do you offer?",
                answer: "We offer fine art prints on premium archival paper, custom framed pieces, luxury albums, and gallery walls. All our products use museum-quality materials designed to last generations."
            },
            {
                question: "Do I get the digital files?",
                answer: "Yes! All sessions include high-resolution digital files with print release. We deliver them through a private online gallery where you can download, share, and order professional prints."
            },
            {
                question: "What's the difference between basic and premium retouching?",
                answer: "Basic retouching includes color correction, exposure adjustments, and minor blemish removal. Premium retouching includes advanced skin smoothing, detailed object removal, and artistic enhancements."
            },
            {
                question: "Can I order additional prints later?",
                answer: "Yes! Your online gallery remains active for 6 months, and we archive all sessions for 2 years. You can always order additional prints, albums, or products through your gallery."
            }
        ]
    },
    {
        id: "general",
        title: "General Questions",
        icon: "💫",
        questions: [
            {
                question: "What makes your photography style unique?",
                answer: "Our approach combines fine art aesthetics with emotional storytelling. We focus on capturing authentic moments and creating timeless images that reveal the soul behind the subject, using light as our primary medium."
            },
            {
                question: "Do you travel for sessions?",
                answer: "Yes! We're available for travel worldwide. Travel fees apply for locations beyond 50 miles from our studio. Contact us for a custom quote for destination sessions."
            },
            {
                question: "What should I wear for my session?",
                answer: "We provide detailed style guides for each type of session. Generally, we recommend solid colors, timeless pieces, and avoiding busy patterns. We'll discuss wardrobe options during your consultation."
            },
            {
                question: "Do you offer gift certificates?",
                answer: "Yes! Our gift certificates are perfect for birthdays, anniversaries, or any special occasion. They're available in any amount and can be customized with personal messages."
            }
        ]
    }
];

export default function FAQ() {
    const [activeCategory, setActiveCategory] = useState("booking");
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

    const toggleItem = (itemId: string) => {
        setOpenItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const currentCategory = faqCategories.find(cat => cat.id === activeCategory);

    return (
        <PageLayout className="faq-page">
            {/* Hero Section avec composant */}
            <HeroSection
                backgroundImage="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                title="Frequently Asked Questions"
                accentWord="Questions"
                subtitle="Everything you need to know about our photography services, booking process, and artistic approach. Can't find your answer? Contact us directly."
                buttons={[
                    { text: "Book a Session", url: "/pricing", type: "primary" },
                    { text: "Contact Us", url: "#contact", type: "secondary" }
                ]}
                className="faq-hero-modern"
            />

            {/* FAQ Navigation */}
            <section className="faq-nav-section">
                <div className="container">
                    <div className="faq-categories">
                        {faqCategories.map((category, index) => (
                            <motion.button
                                key={category.id}
                                className={`faq-category-btn ${activeCategory === category.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(category.id)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <span className="category-title">{category.title}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="faq-content-section">
                <div className="container">
                    <div className="faq-category-content">
                        <motion.h2
                            className="faq-category-title"
                            key={activeCategory}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {currentCategory?.title}
                        </motion.h2>

                        <div className="faq-questions">
                            {currentCategory?.questions.map((item, index) => (
                                <motion.div
                                    key={index}
                                    className={`faq-item ${openItems[`${activeCategory}-${index}`] ? 'active' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <button
                                        className="faq-question"
                                        onClick={() => toggleItem(`${activeCategory}-${index}`)}
                                    >
                                        <span className="question-text">{item.question}</span>
                                        <span className="toggle-icon">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                            >
                                                <path
                                                    d="M10 4V16M4 10H16"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    </button>
                                    <motion.div
                                        className="faq-answer"
                                        initial={false}
                                        animate={{
                                            height: openItems[`${activeCategory}-${index}`] ? 'auto' : 0,
                                            opacity: openItems[`${activeCategory}-${index}`] ? 1 : 0
                                        }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="answer-content">
                                            {item.answer}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA avec composant */}
            <CTASection
                title="Still Have Questions?"
                description="We're here to help! Contact us directly and we'll get back to you within 24 hours."
                buttons={[
                    { text: "Start Your Project", url: "/pricing", type: "primary" },
                    { text: "Email Us", url: "mailto:hello@fireflyofsoul.com", type: "outline", external: true }
                ]}
                className="cta-section-faq"
            />
        </PageLayout>
    );
}