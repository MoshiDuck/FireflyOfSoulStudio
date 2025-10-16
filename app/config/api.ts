// ==================== 1. Todo : app/config/api.ts (CORRIGÉ) ====================
export const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:8787'
    : 'https://fireflyofsoulstudio.weck20pro.workers.dev';

export const API_ENDPOINTS = {
    RESERVATIONS: `${API_BASE_URL}/api/reservations`,
    CONTACT: `${API_BASE_URL}/api/contact`,
    GALLERY: `${API_BASE_URL}/api/gallery`,
    SERVICES: `${API_BASE_URL}/api/services`,
};

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(endpoint, defaultOptions);

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            error: 'An error occurred',
        })) as { error?: string };  // ✅ Type assertion ajouté
        throw new Error(error.error || 'Network error');
    }

    return response.json();
}