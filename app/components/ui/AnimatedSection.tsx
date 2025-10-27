// Info : app/components/ui/AnimatedSection.tsx
import { motion } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "fade";
    id?: string;
    threshold?: number;
    triggerOnce?: boolean;
}

export function AnimatedSection({
                                    children,
                                    className = "",
                                    delay = 0,
                                    direction = "up",
                                    id,
                                    threshold = 0.1,
                                    triggerOnce = true,
                                }: AnimatedSectionProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.disconnect();
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin: "50px"
            }
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
    }, [threshold, triggerOnce]);

    const getDirectionValues = () => {
        switch (direction) {
            case "up":
                return { y: 40 };
            case "down":
                return { y: -40 };
            case "left":
                return { x: 40 };
            case "right":
                return { x: -40 };
            case "fade":
                return {};
            default:
                return { y: 40 };
        }
    };

    const directionValues = getDirectionValues();

    return (
        <motion.div
            ref={ref}
            id={id}
            className={className}
            initial={{
                opacity: 0,
                ...directionValues
            }}
            animate={
                isVisible
                    ? {
                        opacity: 1,
                        y: 0,
                        x: 0
                    }
                    : {
                        opacity: 0,
                        ...directionValues
                    }
            }
            transition={{
                duration: 0.8,
                delay,
                ease: "easeOut",
            }}
        >
            {children}
        </motion.div>
    );
}