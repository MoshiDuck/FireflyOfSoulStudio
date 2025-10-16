// Todo : app/components/PageTransition.tsx
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
    return <div className="page-fade-in">{children}</div>;
}