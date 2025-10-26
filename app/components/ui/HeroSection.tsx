// Todo : app/components/ui/HeroSection.tsx
import { motion } from "motion/react";
import { Link } from "react-router";

interface HeroSectionProps {
    backgroundImage: string;
    title?: string;
    titleLines?: [string, string];
    subtitle: string;
    accentWord?: string;
    buttons?: Array<{
        text: string;
        url: string;
        type: 'primary' | 'secondary';
    }>;
    showScrollIndicator?: boolean;
    floatingCards?: Array<{
        src: string;
        alt: string;
        className: string;
    }>;
    showLightEffects?: boolean;
    centered?: boolean;
    className?: string;
    variant?: 'default' | 'minimal' | 'compact';
    height?: 'full' | 'large' | 'medium';
}

export function HeroSection({
                                backgroundImage,
                                title,
                                titleLines,
                                subtitle,
                                accentWord,
                                buttons = [],
                                showScrollIndicator = true,
                                floatingCards = [],
                                showLightEffects = false,
                                centered = true,
                                className = "",
                                variant = 'default',
                                height = 'full'
                            }: HeroSectionProps) {

    const heroClass = `hero-modern ${variant !== 'default' ? `hero-${variant}` : ''} ${height !== 'full' ? `hero-height-${height}` : 'hero-height-full'} ${className}`;
    const contentClass = `hero-content ${centered ? 'hero-content-centered' : 'hero-content-left'}`;

    const renderTitle = () => {
        if (titleLines) {
            return (
                <motion.h1
                    className="hero-title-main"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="title-line">{titleLines[0]}</span>
                    <span className="title-line accent">{titleLines[1]}</span>
                </motion.h1>
            );
        }

        if (title && accentWord && title.includes(accentWord)) {
            const parts = title.split(accentWord);
            return (
                <motion.h1
                    className="hero-title-main"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {parts[0]}
                    <span className="text-accent">{accentWord}</span>
                    {parts[1]}
                </motion.h1>
            );
        }

        return (
            <motion.h1
                className="hero-title-main"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {title}
            </motion.h1>
        );
    };

    return (
        <header className={heroClass}>
            <div className="hero-background">
                <div
                    className="hero-background-image"
                    style={{ backgroundImage: `url('${backgroundImage}')` }}
                ></div>
                <div className="hero-overlay"></div>

                {showLightEffects && (
                    <div className="hero-light-effects">
                        <div className="light-effect light-1"></div>
                        <div className="light-effect light-2"></div>
                        <div className="light-effect light-3"></div>
                    </div>
                )}
            </div>

            <div className="container">
                <div className={contentClass}>
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {renderTitle()}

                        <motion.p
                            className="hero-subtitle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                        >
                            {subtitle}
                        </motion.p>

                        {buttons.length > 0 && (
                            <motion.div
                                className="hero-actions"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                            >
                                {buttons.map((button, index) => (
                                    button.url.startsWith('#') ? (
                                        <a
                                            key={index}
                                            href={button.url}
                                            className={`btn btn-${button.type}`}
                                        >
                                            {button.text}
                                        </a>
                                    ) : (
                                        <Link
                                            key={index}
                                            to={button.url}
                                            className={`btn btn-${button.type}`}
                                        >
                                            {button.text}
                                        </Link>
                                    )
                                ))}
                            </motion.div>
                        )}
                    </motion.div>

                    {floatingCards.length > 0 && (
                        <div className="hero-visual">
                            {floatingCards.map((card, index) => (
                                <motion.div
                                    key={index}
                                    className={`floating-card ${card.className}`}
                                    initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + index * 0.2, duration: 0.8, ease: "easeOut" }}
                                >
                                    <img src={card.src} alt={card.alt} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showScrollIndicator && (
                <div className="scroll-indicator">
                    <div className="scroll-arrow"></div>
                </div>
            )}
        </header>
    );
}