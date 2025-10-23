// Todo : app/components/AnimatedSection.tsx
import { motion } from "motion/react";
import {type ReactNode, useEffect, useRef, useState } from "react";

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "fade";
    id?: string;
}

export function AnimatedSection({
                                    children,
                                    className = "",
                                    delay = 0,
                                    direction = "up",
                                    id,
                                }: AnimatedSectionProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1, rootMargin: "50px" }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    const getDirectionValues = () => {
        switch (direction) {
            case "up":
                return { y: 40, x: 0 };
            case "down":
                return { y: -40, x: 0 };
            case "left":
                return { x: 40, y: 0 };
            case "right":
                return { x: -40, y: 0 };
            case "fade":
                return { y: 0, x: 0 };
            default:
                return { y: 40, x: 0 };
        }
    };

    const directionValues = getDirectionValues();

    return (
        <motion.div
            ref={ref}
            id={id}
            className={className}
            initial={{ opacity: 0, ...directionValues }}
            animate={
                isVisible
                    ? { opacity: 1, y: 0, x: 0 }
                    : { opacity: 0, ...directionValues }
            }
            transition={{
                duration: 0.8,
                delay,
                ease: [0.6, 0.05, 0.01, 0.9],
            }}
        >
            {children}
        </motion.div>
    );
}