// Todo : app/components/layout/PageLayout.tsx
import { AnimatedSection } from "~/components/ui/AnimatedSection";
import { Navbar } from "~/components/layout/navbar/navbar";
import { Footer } from "~/components/layout/Footer";

interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
    centered?: boolean;
}

export function PageLayout({ children, className = "", centered = false }: PageLayoutProps) {
    return (
        <AnimatedSection
            className={`${className} ${centered ? 'page-centered' : ''}`}
            direction="fade"
            delay={0.1}
        >
            <Navbar />
            {children}
            <Footer />
        </AnimatedSection>
    );
}