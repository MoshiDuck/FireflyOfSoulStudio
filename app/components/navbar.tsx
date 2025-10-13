// Todo : app/components/navbar.tsx
import { Link, useLocation } from "react-router";

export function Navbar() {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path ? "bg-amber-500 text-gray-900" : "text-amber-500 hover:bg-amber-500 hover:text-gray-900";
    };

    return (
        <nav className="navbar absolute top-0 w-full p-8 z-10">
            <div className="container mx-auto flex justify-between items-center">
                <div className="logo font-cinzel text-amber-500 text-2xl font-bold">
                    Firefly of Soul
                </div>
                <div className="nav-buttons flex gap-4">
                    <Link
                        to="/"
                        className={`nav-btn px-4 py-2 border border-amber-500 rounded transition-all duration-300 ${isActive("/")}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/gallery"
                        className={`nav-btn px-4 py-2 border border-amber-500 rounded transition-all duration-300 ${isActive("/gallery")}`}
                    >
                        Gallery
                    </Link>
                    <Link
                        to="/pricing"
                        className={`nav-btn px-4 py-2 border border-amber-500 rounded transition-all duration-300 ${isActive("/pricing")}`}
                    >
                        Pricing
                    </Link>
                </div>
            </div>
        </nav>
    );
}