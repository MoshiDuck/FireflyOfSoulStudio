// Todo : app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("gallery", "routes/gallery.tsx"),
    route("shootings", "routes/shootings.tsx"),
    route("store", "routes/store.tsx"),
    route("about", "routes/about.tsx"),
    route("testimonials", "routes/testimonials.tsx"),
    route("faq", "routes/faq.tsx"),
    route("dev", "routes/dev.tsx"),
    route("api/check-ip", "routes/api.check-ip.tsx"),
] satisfies RouteConfig;