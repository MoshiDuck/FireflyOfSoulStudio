// =========================
// File: app/components/AnimatedOutlet.tsx
// =========================

import React, {type JSX} from "react";
import { AnimatePresence } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";

/**
 * AnimatedOutlet
 * - useOutlet() récupère l'élément de route enfant
 * - React.cloneElement lui donne une key dépendant de la route
 * afin que AnimatePresence puisse animer l'exit/enter correctement.
 */
export default function AnimatedOutlet(): JSX.Element | null {
    const location = useLocation();
    const outlet = useOutlet();

    return (
        <AnimatePresence mode="wait" initial={false}>
            {outlet && React.cloneElement(outlet, { key: location.pathname })}
        </AnimatePresence>
    );
}
