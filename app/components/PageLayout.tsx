// Todo : app/components/PageLayout.tsx
import { PageTransition } from "~/components/PageTransition";
import { Navbar } from "~/components/navbar";
import { Footer } from "~/components/Footer";

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