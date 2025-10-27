// Info : app/components/layout/Footer.tsx
import { Link } from "react-router";

export function Footer() {
    return (
        <footer className="footer-modern">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <div className="logo">Firefly of Soul</div>
                        <p className="footer-tagline">
                            Capturing the poetry of light and shadow since 2024
                        </p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Navigation</h4>
                            <Link to="/">Home</Link>
                            <Link to="/about">About</Link>
                            <Link to="/gallery">Gallery</Link>
                            <Link to="/shootings">Shootings</Link>
                            <Link to="/store">Store</Link>
                            <Link to="/reviews">Reviews</Link>
                            <Link to="/faq">FAQ</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Connect</h4>
                            <a href="mailto:hello@fireflyofsoul.com">Email</a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 Firefly of Soul Studio. All moments preserved with artistic integrity.</p>
                </div>
            </div>
        </footer>
    );
}