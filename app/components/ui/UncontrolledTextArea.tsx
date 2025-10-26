// Todo : app/components/ui/UncontrolledTextArea.tsx
import React, { useRef, useEffect, useCallback } from "react";

interface UncontrolledTextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
    onValueChange?: (value: string, name: string) => void;
}

export function UncontrolledTextArea({
                                         name,
                                         defaultValue = "",
                                         onValueChange,
                                         ...props
                                     }: UncontrolledTextAreaProps) {
    const ref = useRef<HTMLTextAreaElement>(null);
    const lastSyncedValue = useRef(defaultValue);

    useEffect(() => {
        if (ref.current) {
            ref.current.value = defaultValue as string;
            lastSyncedValue.current = defaultValue;
        }
    }, [defaultValue]);

    const handleInput = useCallback(
        (e: React.FormEvent<HTMLTextAreaElement>) => {
            const value = (e.target as HTMLTextAreaElement).value;
            if (value !== lastSyncedValue.current) {
                lastSyncedValue.current = value;
                onValueChange?.(value, name || "");
            }
        },
        [name, onValueChange]
    );

    return <textarea ref={ref} name={name} onInput={handleInput} {...props} />;
}