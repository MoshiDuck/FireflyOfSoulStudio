// Todo : app/components/ui/CTASection.tsx
import { Link } from "react-router";
import { motion } from "motion/react";

interface CTASectionProps {
    title: string;
    description: string;
    buttons: Array<{
        text: string;
        url: string;
        type: 'primary' | 'secondary' | 'outline';
        external?: boolean;
    }>;
    className?: string;
    animated?: boolean;
    centered?: boolean;
    variant?: 'default' | 'minimal' | 'accent';
}

export function CTASection({
                               title,
                               description,
                               buttons,
                               className = "",
                               animated = true,
                               centered = true,
                               variant = 'default'
                           }: CTASectionProps) {
    const containerClass = `cta-section ${variant !== 'default' ? `cta-${variant}` : ''} ${centered ? 'cta-centered' : ''} ${className}`;

    const Content = () => (
        <div className={`cta-content ${centered ? 'cta-content-centered' : ''}`}>
            <h2 className="cta-title">{title}</h2>
            <p className="cta-description">{description}</p>
            <div className="cta-actions">
                {buttons.map((button, index) => (
                    button.external ? (
                        <a
                            key={index}
                            href={button.url}
                            className={`btn btn-${button.type} btn-large`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {button.text}
                        </a>
                    ) : button.url.startsWith('#') ? (
                        <a
                            key={index}
                            href={button.url}
                            className={`btn btn-${button.type} btn-large`}
                        >
                            {button.text}
                        </a>
                    ) : (
                        <Link
                            key={index}
                            to={button.url}
                            className={`btn btn-${button.type} btn-large`}
                        >
                            {button.text}
                        </Link>
                    )
                ))}
            </div>
        </div>
    );

    return (
        <section className={containerClass}>
            <div className="container">
                {animated ? (
                    <motion.div
                        className={`cta-content ${centered ? 'cta-content-centered' : ''}`}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="cta-title">{title}</h2>
                        <p className="cta-description">{description}</p>
                        <div className="cta-actions">
                            {buttons.map((button, index) => (
                                button.external ? (
                                    <a
                                        key={index}
                                        href={button.url}
                                        className={`btn btn-${button.type} btn-large`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {button.text}
                                    </a>
                                ) : button.url.startsWith('#') ? (
                                    <a
                                        key={index}
                                        href={button.url}
                                        className={`btn btn-${button.type} btn-large`}
                                    >
                                        {button.text}
                                    </a>
                                ) : (
                                    <Link
                                        key={index}
                                        to={button.url}
                                        className={`btn btn-${button.type} btn-large`}
                                    >
                                        {button.text}
                                    </Link>
                                )
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <Content />
                )}
            </div>
        </section>
    );
}