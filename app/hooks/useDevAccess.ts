// Todo : app/hooks/useDevAccess.ts
import { useState, useEffect } from 'react';

interface DevAccessState {
    allowed: boolean;
    loading: boolean;
    clientIP?: string;
}

interface CheckIPResponse {
    allowed: boolean;
    clientIP?: string;
    error?: string;
}

export function useDevAccess() {
    const [access, setAccess] = useState<DevAccessState>({
        allowed: false,
        loading: true
    });

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const response = await fetch('/api/check-ip');
                const data: CheckIPResponse = await response.json();

                setAccess({
                    allowed: data.allowed || false,
                    loading: false,
                    clientIP: data.clientIP
                });
            } catch (error) {
                console.error('❌ Error checking dev access:', error);
                setAccess({ allowed: false, loading: false });
            }
        };

        checkAccess();
    }, []);

    return access;
}