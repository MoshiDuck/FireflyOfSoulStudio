// Todo : app/components/layout/PageLayout.tsx
import { PageTransition } from "~/components/ui/PageTransition";
import { Navbar } from "~/components/layout/navbar/navbar";
import { Footer } from "~/components/layout/Footer";

interface PageLayoutProps {
    children: React.ReactNode;
    className?: string;
    centered?: boolean;
}

export function PageLayout({ children, className = "", centered = false }: PageLayoutProps) {
    return (
        <PageTransition>
            <div className={`${className} ${centered ? 'page-centered' : ''}`}>
                <Navbar />
                {children}
                <Footer />
            </div>
        </PageTransition>
    );
}