'use client';

import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
            const item = window.localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((previous: T) => T)) => {
        setStoredValue((previous) => {
            const next = value instanceof Function ? value(previous) : value;
            if (next === null || next === undefined) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(next));
            }
            return next;
        });
    }, [key]);

    return [storedValue, setValue] as const;
}
