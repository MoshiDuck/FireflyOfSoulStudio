import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
    },
    {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Inter:wght@300;400&display=swap",
    },
];

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <Meta />
            <Links />
            {/* ✅ CSS CRITIQUE COMPLET inspiré de l'ancien code */}
            <style dangerouslySetInnerHTML={{
                __html: `
            /* Variables et Reset */
            :root {
              --deep-night: #0D0D0D;
              --dark-blue: #121212;
              --warm-gold: #FFD580;
              --amber-light: #FFCA28;
              --soft-gray: #e0e0e0;
              --page-padding: clamp(1rem, 2vw, 2rem);
            }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { height: 100%; overflow-x: hidden; }
            body { 
              font-family: 'Inter', sans-serif; 
              background-color: var(--deep-night); 
              color: var(--soft-gray); 
              line-height: 1.6; 
            }
            #app { min-height: 100vh; position: relative; }

            /* Navigation Critique */
            .navbar { 
              position: fixed; 
              top: 0; 
              width: 100%; 
              padding: clamp(1rem, 2.5vw, 2rem);
              z-index: 1000; 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              background: rgba(13, 13, 13, 0.95); 
              backdrop-filter: blur(10px);
              transition: all 0.3s ease;
            }
            .navbar.scrolled { background: rgba(13, 13, 13, 0.98); }

            .navbar-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
              max-width: 1200px;
              margin: 0 auto;
            }

            .navbar-logo {
              display: flex;
              align-items: center;
              gap: 1rem;
              text-decoration: none;
            }

            .navbar-brand-main {
              font-family: 'Cinzel', serif;
              font-size: clamp(1.125rem, 1.8vw, 1.5rem);
              color: var(--warm-gold);
              font-weight: 600;
            }

            .navbar-brand-sub {
              font-family: 'Inter', sans-serif;
              font-size: 0.8rem;
              opacity: 0.8;
              color: var(--soft-gray);
            }

            .navbar-nav {
              display: flex;
              gap: clamp(0.5rem, 1.5vw, 1rem);
              list-style: none;
            }

            .navbar-link {
              color: var(--soft-gray);
              text-decoration: none;
              padding: clamp(0.35rem, 0.9vw, 0.8rem) clamp(0.6rem, 1.4vw, 1rem);
              border: 1px solid var(--warm-gold);
              border-radius: 2px;
              transition: all 0.3s ease;
              font-family: 'Inter', sans-serif;
              font-size: clamp(0.85rem, 1.2vw, 0.95rem);
              position: relative;
            }

            .navbar-link:hover, .navbar-link.active {
              background: var(--warm-gold);
              color: var(--deep-night);
            }

            .navbar-link.active {
              box-shadow: 0 0 15px rgba(255, 213, 128, 0.3);
              animation: gentlePulse 2s infinite;
            }

            @keyframes gentlePulse {
              0%, 100% { box-shadow: 0 0 15px rgba(255, 213, 128, 0.3); }
              50% { box-shadow: 0 0 25px rgba(255, 213, 128, 0.5); }
            }

            /* Hero Sections */
            .hero, .gallery-hero, .pricing-hero {
              height: 100vh;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              position: relative;
              background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3)), 
                         url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
              background-position: center;
              background-repeat: no-repeat;
              background-size: cover;
            }

            .home-hero-content, .gallery-hero-content, .pricing-hero-content {
              text-align: center;
              z-index: 2;
              padding: clamp(1rem, 2.5vw, 2rem);
            }

            .hero-title {
              font-family: 'Cinzel', serif;
              font-size: clamp(2rem, 6vw, 5rem);
              color: var(--warm-gold);
              margin-bottom: clamp(1rem, 3vw, 2rem);
              font-weight: 400;
            }

            /* Container et Sections */
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 0 var(--page-padding);
            }

            .section {
              padding: clamp(40px, 6vw, 100px) 0;
            }

            .section-title {
              font-family: 'Cinzel', serif;
              font-size: clamp(1.75rem, 3.5vw, 2.5rem);
              color: var(--warm-gold);
              text-align: center;
              margin-bottom: clamp(1rem, 3vw, 3rem);
            }

            /* Gallery Items Critiques */
            .gallery-item, .masonry-item {
              position: relative;
              overflow: hidden;
              aspect-ratio: 4/5;
              cursor: pointer;
            }

            .gallery-item img, .masonry-item img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform 0.3s ease !important;
            }

            .image-overlay, .photo-info {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              background: linear-gradient(transparent 0%, rgba(0,0,0,0.8) 100%);
              padding: clamp(1rem, 2.2vw, 2rem) clamp(1rem, 2.2vw, 2rem) clamp(1rem, 2.2vw, 1rem);
              transform: translateY(100%);
              transition: transform 0.3s ease !important;
            }

            .gallery-item:hover .image-overlay, 
            .masonry-item:hover .photo-info {
              transform: translateY(0) !important;
            }

            .gallery-item:hover img, 
            .masonry-item:hover img {
              transform: scale(1.05) !important;
            }

            /* Animations de base */
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }

            @keyframes fadeInLeft {
              from { opacity: 0; transform: translateX(-50px); }
              to { opacity: 1; transform: translateX(0); }
            }

            @keyframes fadeInRight {
              from { opacity: 0; transform: translateX(50px); }
              to { opacity: 1; transform: translateX(0); }
            }

            .page-fade-in { animation: fadeIn 0.3s ease-out forwards; }
            .fade-in { animation: fadeIn 0.6s ease-out forwards; }
            .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
            .fade-in-left { animation: fadeInLeft 0.8s ease-out forwards; opacity: 0; }
            .fade-in-right { animation: fadeInRight 0.8s ease-out forwards; opacity: 0; }
            .delay-1 { animation-delay: 0.3s; }
            .delay-2 { animation-delay: 0.6s; }

            /* Responsive de base */
            @media (max-width: 768px) {
              .container { padding: 0 clamp(0.8rem, 2.2vw, 1rem); }
              .section { padding: clamp(30px, 5.5vw, 60px) 0; }
              .navbar { padding: clamp(1rem, 2.5vw, 1rem); }
              .navbar-nav { display: none; }
              .navbar-toggle { display: flex; }
            }

            @media (max-width: 480px) {
              .hero-title { font-size: clamp(1.75rem, 6.5vw, 2.5rem); }
            }
          `
            }} />
        </head>
        <body>
        <div id="app">
            {children}
        </div>
        <ScrollRestoration />
        <Scripts />
        {/* ✅ CSS non-critique chargé après */}
        <link rel="stylesheet" href="/styles/app.css" />
        </body>
        </html>
    );
}

export default function App() {
    return <Outlet />;
}
