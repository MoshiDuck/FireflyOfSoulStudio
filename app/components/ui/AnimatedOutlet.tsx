// Todo : app/components/ui/AnimatedOutlet.tsx
import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedSection } from "./AnimatedSection";

export default function AnimatedOutlet() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <AnimatedSection direction="fade" delay={0.2}>
                    <Outlet />
                </AnimatedSection>
            </motion.div>
        </AnimatePresence>
    );
}