// =========================
// File: app/components/AnimatedLayout.tsx
// =========================

import React from "react";
import { motion } from "framer-motion";

const variants = {
    hidden: { opacity: 0, y: 12, scale: 0.995 },
    enter: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -12, scale: 0.995 }
};

export function AnimatedLayout({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            className="page-wrapper"
            initial="hidden"
            animate="enter"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "relative" }}
        >
            {children}
        </motion.div>
    );
}