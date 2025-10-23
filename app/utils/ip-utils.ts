// app/utils/ip-utils.ts
export function getClientIP(request: Request): string {
    // Cloudflare
    const cfIP = request.headers.get('CF-Connecting-IP');
    if (cfIP) return cfIP;

    // Standard headers
    const xForwardedFor = request.headers.get('X-Forwarded-For');
    if (xForwardedFor) {
        // Prendre la première IP de la chaîne
        return xForwardedFor.split(',')[0].trim();
    }

    const xRealIP = request.headers.get('X-Real-IP');
    if (xRealIP) return xRealIP;

    // Fallback pour le développement
    return '127.0.0.1';
}