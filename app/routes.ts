// Todo : app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("gallery", "routes/gallery.tsx"),
    route("pricing", "routes/pricing.tsx"),
    // Supprimez cette ligne : route("api/reservations", "functions/api/reservations.js")
] satisfies RouteConfig;