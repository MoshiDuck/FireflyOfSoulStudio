// ==================== 4. Todo : app/components/navbar.tsx (MODIFIÉ AVEC ANIMATIONS) ====================
import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { path: "/", label: "Home" },
        { path: "/gallery", label: "Gallery" },
        { path: "/pricing", label: "Pricing" },
    ];

    return (
        <>
            <motion.nav
                className={`navbar ${isScrolled ? "scrolled" : ""}`}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: [0.6, 0.05, 0.01, 0.9] }}
            >
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        <div className="navbar-brand">
                            <div className="navbar-brand-main">FIREFLY OF SOUL</div>
                            <div className="navbar-brand-sub">STUDIO</div>
                        </div>
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

                    {/* Mobile Menu Button */}
                    <button
                        className="navbar-toggle md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className="navbar-toggle-line"></span>
                        <span className="navbar-toggle-line"></span>
                        <span className="navbar-toggle-line"></span>
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            className="navbar-mobile-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.div
                            className="navbar-mobile-sidebar"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            <div className="navbar-mobile-header">
                                <div className="navbar-mobile-brand">FireflyOfSoulStudio</div>
                                <button
                                    className="navbar-mobile-close"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    aria-label="Close menu"
                                >
                                    ×
                                </button>
                            </div>

                            <nav className="navbar-mobile-nav">
                                {navItems.map((item, index) => (
                                    <motion.div
                                        key={item.path}
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 50, opacity: 0 }}
                                        transition={{ delay: 0.1 * index, duration: 0.3 }}
                                    >
                                        <Link
                                            to={item.path}
                                            className={`navbar-mobile-link ${
                                                isActive(item.path) ? "active" : ""
                                            }`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>

                            <motion.div
                                className="navbar-mobile-footer"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="navbar-mobile-tagline">
                                    Capturing souls through light
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}