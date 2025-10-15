// =========================
// File: corrections / Navbar (import fix)
// Path: app/components/navbar.tsx (MODIFIE)
// =========================

// NOTE: votre import d'origine utilisait "react-router" — cela doit être "react-router-dom"

import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function Navbar() {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = [
        { path: "/", label: "Home" },
        { path: "/gallery", label: "Gallery" },
        { path: "/pricing", label: "Pricing" }
    ];
    return (
        <>
            {/* Navigation principale */}
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <div className="navbar-firefly">
                            <div className="navbar-firefly-core"></div>
                            <div className="navbar-firefly-glow-1"></div>
                            <div className="navbar-firefly-glow-2"></div>
                        </div>
                        <div className="navbar-brand">
                            <div className="navbar-brand-main">FIREFLY OF SOUL</div>
                            <div className="navbar-brand-sub">STUDIO</div>
                        </div>
                    </Link>
                    {/* Navigation desktop */}
                    <ul className="navbar-nav">
                        {navItems.map((item) => (
                            <li key={item.path} className="navbar-item">
                                <Link
                                    to={item.path}
                                    className={`navbar-link ${isActive(item.path) ? 'active' : ''}`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {/* Bouton menu mobile */}
                    <button
                        className={`navbar-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className="navbar-toggle-line"></span>
                        <span className="navbar-toggle-line"></span>
                        <span className="navbar-toggle-line"></span>
                    </button>
                </div>
            </nav>
            {/* Menu mobile */}
            <div className={`navbar-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
                <div
                    className="navbar-mobile-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>

                <div className="navbar-mobile-sidebar">
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
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`navbar-mobile-link ${isActive(item.path) ? 'active' : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="navbar-mobile-footer">
                        <div className="navbar-mobile-brand">FireflyOfSoulStudio</div>
                        <div className="navbar-mobile-tagline">Capturing souls through light</div>
                    </div>
                </div>
            </div>
        </>
    );
}