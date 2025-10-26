// Todo : app/components/ui/UncontrolledInput.tsx
import React, { useRef, useEffect, useCallback } from "react";

interface UncontrolledInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
    onValueChange?: (value: string, name: string) => void;
}

export function UncontrolledInput({
                                      name,
                                      defaultValue = "",
                                      onValueChange,
                                      ...props
                                  }: UncontrolledInputProps) {
    const ref = useRef<HTMLInputElement>(null);
    const lastSyncedValue = useRef(defaultValue);

    useEffect(() => {
        if (ref.current) {
            ref.current.value = defaultValue as string;
            lastSyncedValue.current = defaultValue;
        }
    }, [defaultValue]);

    const handleInput = useCallback(
        (e: React.FormEvent<HTMLInputElement>) => {
            const value = (e.target as HTMLInputElement).value;
            if (value !== lastSyncedValue.current) {
                lastSyncedValue.current = value;
                onValueChange?.(value, name || "");
            }
        },
        [name, onValueChange]
    );

    return <input ref={ref} name={name} onInput={handleInput} {...props} />;
}