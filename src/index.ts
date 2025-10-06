// Todo : src/index.ts
/**
 * Import des fonctions Firebase
 */
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// Exemple de fonction HTTP de base
export const helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", {structuredData: true});
    response.send("Hello from Firebase!");
});

// Fonction pour servir votre site web statique
export const website = onRequest((request, response) => {
    // Ici vous pouvez ajouter la logique pour servir votre site
    // ou laisser Firebase Hosting gérer les fichiers statiques
    response.send("Firefly of Soul Studio Website");
});