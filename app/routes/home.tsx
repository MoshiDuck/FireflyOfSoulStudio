// Todo : app/routes/home.tsx
import type { Route } from "./+types/home";
import { Navbar } from "~/components/navbar";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Firefly of Soul Studio | Capturing Souls Through Light" },
        { name: "description", content: "Professional photography studio capturing souls through light" },
    ];
}

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <header className="hero min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="hero-content text-center">
                    <h1 className="hero-title font-cinzel text-5xl md:text-7xl text-amber-500 mb-4">
                        Capturing souls through light
                    </h1>
                </div>
            </header>
        </div>
    );
}