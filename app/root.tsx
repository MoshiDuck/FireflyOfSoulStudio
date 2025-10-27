// Info : app/root.tsx
import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "react-router";
import type {Route} from "./+types/root";

import stylesUrl from "./routes/app.css?url";

export const links: Route.LinksFunction = () => [
    {rel: "preconnect", href: "https://fonts.googleapis.com"},
    { rel: "stylesheet", href: stylesUrl },
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

export function Layout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <Meta/>
            <Links/>
            {/* ✅ CSS CRITIQUE - Seulement les animations et transitions */}
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

        /* ✅ ANIMATIONS NAVBAR UNIQUEMENT */
        .navbar {
            transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.36s cubic-bezier(.2,.9,.2,1);
        }
        
        .navbar.scrolled {
            box-shadow: 0 6px 18px rgba(0,0,0,0.45);
        }
        
        .navbar-link {
            transition: all 0.22s ease;
        }
        
        .navbar-link.active {
            animation: gentlePulse 2s infinite;
        }
        
        @keyframes gentlePulse {
            0%,100% { box-shadow: 0 0 15px rgba(255,213,128,0.3); }
            50% { box-shadow: 0 0 25px rgba(255,213,128,0.5); }
        }

        /* ✅ ANIMATIONS GLOBALES */
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

        /* ✅ TRANSITIONS CRITIQUES POUR GALLERY */
        .gallery-item img, .masonry-item img {
          transition: transform 0.3s ease !important;
        }

        .image-overlay, .photo-info {
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
    `
            }}/>
        </head>
        <body>
        <div id="app">
            {children}
        </div>
        <ScrollRestoration/>
        <Scripts/>
        </body>
        </html>
    );
}

export function ErrorBoundary({ error }: { error: unknown }) {
    if (isRouteErrorResponse(error)) {
        return (
            <div>
                <h1>
                    {error.status} {error.statusText}
                </h1>
                <p>{error.data}</p>
            </div>
        );
    } else if (error instanceof Error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error.message}</p>
                <p>The stack trace is:</p>
                <pre>{error.stack}</pre>
            </div>
        );
    } else {
        return <h1>Unknown Error</h1>;
    }
}

export default function App() {
    return <Outlet/>;
}