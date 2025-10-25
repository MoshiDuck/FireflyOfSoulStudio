// Todo : app/routes.ts
// app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/index.tsx"), // Redirige vers home
    route("home", "routes/public/home/home.tsx"),
    route("gallery", "routes/public/gallery/gallery.tsx"),
    route("shootings", "routes/public/service/shootings/shootings.tsx"),
    route("store", "routes/public/service/store/store.tsx"),
    route("about", "routes/content/about/about.tsx"),
    route("reviews", "routes/content/reviews/reviews.tsx"),
    route("faq", "routes/content/faq/faq.tsx"),
    route("dev", "routes/admin/dev/dev.tsx"),
    route("api/check-ip", "routes/admin/api.check-ip.tsx"),
] satisfies RouteConfig;