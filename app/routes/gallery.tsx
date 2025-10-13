// Todo : app/routes/gallery.tsx
import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Gallery | Firefly of Soul Studio" },
        { name: "description", content: "Discover our visual poetry and photography collections" },
    ];
}

export default function Gallery() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <header className="gallery-hero min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="gallery-hero-content text-center">
                    <h1 className="font-cinzel text-4xl md:text-6xl text-amber-500 mb-4">
                        Visual Poetry
                    </h1>
                    <p className="text-gray-300 text-xl">Discover the soul behind each moment</p>
                </div>
            </header>
        </div>
    );
}