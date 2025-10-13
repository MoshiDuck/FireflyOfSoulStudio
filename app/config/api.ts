// app/config/api.ts
export const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:8787'  // URL locale en développement
    : 'https://fireflyofsoulstudio.weck20pro.workers.dev';  // URL de production

export const API_ENDPOINTS = {
    RESERVATIONS: `${API_BASE_URL}/api/reservations`
};