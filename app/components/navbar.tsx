// app/components/navbar.tsx
import { Link, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import "../styles/navbar.css";

export function Navbar() {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsMoreOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isActive = (path: string) => location.pathname === path;

    const primaryItems = [
        { path: "/", label: "Home" },
        { path: "/gallery", label: "Gallery" },
        { path: "/shootings", label: "Shootings" },
        { path: "/store", label: "Store" }
    ];

    const secondaryItems = [
        { path: "/about", label: "About" },
        { path: "/testimonials", label: "Reviews" },
        { path: "/faq", label: "FAQ" }
    ];

    return (
        <motion.nav
            className={`navbar ${isScrolled ? "scrolled" : ""}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
        >
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={() => setIsMoreOpen(false)}>
                    <div className="navbar-brand-main">FIREFLY OF SOUL</div>
                    <div className="navbar-brand-sub">STUDIO</div>
                </Link>

                <ul className="navbar-nav">
                    {primaryItems.map((item, index) => (
                        <motion.li
                            key={item.path}
                            className="navbar-item"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                        >
                            <Link
                                to={item.path}
                                className={`navbar-link ${isActive(item.path) ? "active" : ""}`}
                                onClick={() => setIsMoreOpen(false)}
                            >
                                {item.label}
                            </Link>
                        </motion.li>
                    ))}

                    {/* Dropdown pour les pages secondaires */}
                    <motion.li
                        className="navbar-item dropdown"
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * primaryItems.length, duration: 0.5 }}
                    >
                        <button
                            className={`navbar-link dropdown-toggle ${isMoreOpen ? 'active' : ''} ${secondaryItems.some(item => isActive(item.path)) ? 'active' : ''}`}
                            onClick={() => setIsMoreOpen(!isMoreOpen)}
                        >
                            More
                            <motion.span
                                animate={{ rotate: isMoreOpen ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="dropdown-arrow"
                            >
                                ▼
                            </motion.span>
                        </button>

                        <AnimatePresence>
                            {isMoreOpen && (
                                <motion.ul
                                    className="dropdown-menu"
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                >
                                    {secondaryItems.map((item) => (
                                        <li key={item.path} className="dropdown-item">
                                            <Link
                                                to={item.path}
                                                className={`dropdown-link ${isActive(item.path) ? "active" : ""}`}
                                                onClick={() => setIsMoreOpen(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </AnimatePresence>
                    </motion.li>
                </ul>
            </div>
        </motion.nav>
    );
}