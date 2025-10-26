// Todo : app/components/ui/SectionHeader.tsx
import { motion } from "motion/react";

interface SectionHeaderProps {
    badge?: string;
    title: string;
    subtitle?: string;
    accentWord?: string;
    className?: string;
    centered?: boolean;
    animated?: boolean;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    variant?: 'default' | 'minimal' | 'accent';
    maxWidth?: string;
}

export function SectionHeader({
                                  badge,
                                  title,
                                  subtitle,
                                  accentWord,
                                  className = "",
                                  centered = true,
                                  animated = true,
                                  tag: TitleTag = "h2",
                                  variant = 'default',
                                  maxWidth
                              }: SectionHeaderProps) {
    const renderTitle = () => {
        if (accentWord && title.includes(accentWord)) {
            const parts = title.split(accentWord);
            return (
                <>
                    {parts[0]}
                    <span className="text-accent">{accentWord}</span>
                    {parts[1]}
                </>
            );
        }
        return title;
    };

    const containerClass = `${centered ? 'section-header' : 'section-header-left'} ${variant !== 'default' ? `section-header-${variant}` : ''} ${className}`;
    const containerStyle = maxWidth ? { maxWidth } : {};

    const Content = () => (
        <div className={containerClass} style={containerStyle}>
            {badge && <div className="section-badge">{badge}</div>}
            <TitleTag className="section-title-modern">
                {renderTitle()}
            </TitleTag>
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
    );

    if (!animated) {
        return <Content />;
    }

    return (
        <motion.div
            className={containerClass}
            style={containerStyle}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {badge && (
                <motion.div
                    className="section-badge"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                >
                    {badge}
                </motion.div>
            )}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
                <TitleTag className="section-title-modern">
                    {renderTitle()}
                </TitleTag>
            </motion.div>
            {subtitle && (
                <motion.p
                    className="section-subtitle"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                >
                    {subtitle}
                </motion.p>
            )}
        </motion.div>
    );
}