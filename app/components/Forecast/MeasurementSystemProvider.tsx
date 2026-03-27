'use client';

import { createContext, useContext, useState } from 'react';

interface MeasurementSystemContextValue {
    useMetric: boolean;
    toggleSystem: () => void;
    convertTemperature: (fahrenheit: number) => number;
    convertWindSpeed: (mph: number) => number;
    convertPrecip: (inches: number) => number;
}

const MeasurementSystemContext = createContext<MeasurementSystemContextValue | null>(null);

const STORAGE_KEY = 'measurementSystem';

export function MeasurementSystemProvider({ children }: { children: React.ReactNode }) {
    const [useMetric, setUseMetric] = useState(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(STORAGE_KEY) === 'metric';
    });

    const toggleSystem = () => setUseMetric((previous) => {
        const next = !previous;
        localStorage.setItem(STORAGE_KEY, next ? 'metric' : 'imperial');
        return next;
    });

    const convertTemperature = (fahrenheit: number) => {
        if (useMetric) return Math.round((fahrenheit - 32) * 5 / 9 / 2) * 2;
        return Math.round(fahrenheit / 5) * 5;
    };

    const convertWindSpeed = (mph: number) =>
        useMetric ? Math.round(mph * 1.60934) : mph;

    const convertPrecip = (inches: number) =>
        useMetric ? parseFloat((inches * 25.4).toFixed(2)) : inches;

    return (
        <MeasurementSystemContext.Provider value={{ useMetric, toggleSystem, convertTemperature, convertWindSpeed, convertPrecip }}>
            {children}
        </MeasurementSystemContext.Provider>
    );
}

export function useMeasurementSystemProviderContext() {
    const context = useContext(MeasurementSystemContext);
    if (!context) throw new Error('useMeasurementSystemProviderContext must be used within a MeasurementSystemProvider');
    return context;
}
