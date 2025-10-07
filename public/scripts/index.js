import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
export const helloWorld = onRequest((request, response) => {
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
});
export const website = onRequest((request, response) => {
    response.send("Firefly of Soul Studio Website");
});
//# sourceMappingURL=index.js.map