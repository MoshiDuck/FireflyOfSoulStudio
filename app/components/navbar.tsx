// app/components/navbar.tsx
import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import "../styles/navbar.css";

export function Navbar() {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: "/", label: "Home" },
        { path: "/gallery", label: "Gallery" },
        { path: "/shootings", label: "Shootings" },
        { path: "/store", label: "Store" },
        { path: "/faq", label: "FAQ" },
        { path: "/testimonials", label: "Reviews" },
        { path: "/about", label: "About" },
    ];

    return (
        <motion.nav
            className={`navbar ${isScrolled ? "scrolled" : ""}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
        >
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <div className="navbar-brand-main">FIREFLY OF SOUL</div>
                    <div className="navbar-brand-sub">STUDIO</div>
                </Link>

                <ul className="navbar-nav">
                    {navItems.map((item, index) => (
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
                            >
                                {item.label}
                            </Link>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </motion.nav>
    );
}