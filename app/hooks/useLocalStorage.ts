'use client';

import { useCallback, useState } from 'react';
import { logger } from '@/app/lib/logger';

// reads storage lazily and swallows storage errors because private mode or quota limits should never break the page
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValue;

        try {
            const item = window.localStorage.getItem(key);

            return item !== null ? JSON.parse(item) : initialValue;
        } catch (error) {
            logger.warn(`Unable to read localStorage key "${key}":`, error);

            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((previous: T) => T)) => {
        setStoredValue((previous) => {
            const next = value instanceof Function ? value(previous) : value;

            try {
                if (next === null || next === undefined) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, JSON.stringify(next));
                }
            } catch (error) {
                // storage unavailable (quota or private mode); keep in-memory state only
                logger.warn(`Unable to write localStorage key "${key}":`, error);
            }

            return next;
        });
    }, [key]);

    return [storedValue, setValue] as const;
}
