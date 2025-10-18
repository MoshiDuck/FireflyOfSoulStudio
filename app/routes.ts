// Todo : app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("gallery", "routes/gallery.tsx"),
    route("pricing", "routes/pricing.tsx"),
    route("about", "routes/about.tsx"),
    route("testimonials", "routes/testimonials.tsx"),
    route("faq", "routes/faq.tsx"),
] satisfies RouteConfig;