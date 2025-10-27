// Info : app/hooks/useFormDataManager.ts
import { useRef, useState, useCallback } from "react";

export function useFormDataManager<T extends Record<string, string>>(initialData: T) {
    const formDataRef = useRef(initialData);
    const [, forceUpdate] = useState({});

    const updateField = useCallback((field: keyof T, value: string) => {
        formDataRef.current = { ...formDataRef.current, [field]: value };
    }, []);

    const getFormData = useCallback(() => formDataRef.current, []);

    const reset = useCallback(
        (newData = initialData) => {
            formDataRef.current = newData;
            forceUpdate({});
        },
        [initialData]
    );

    return { updateField, getFormData, reset };
}