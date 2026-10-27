'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from '@/app/hooks/useLocalStorage';

interface MeasurementSystemContextValue {
    isMetric: boolean;
    toggleSystem: () => void;
    convertTemperature: (fahrenheit: number) => number;
    convertWindSpeed: (mph: number) => number;
    convertPrecip: (inches: number) => number;
}

const MeasurementSystemContext = createContext<MeasurementSystemContextValue | null>(null);

const STORAGE_KEY = 'measurementSystem';

// !! come back to this and have AI explain why exactly all this usecallback and usememo is needed and if this is just over-engineered
export function MeasurementSystemProvider({ children }: { children: React.ReactNode }) {
    const [isMetric, setIsMetric] = useLocalStorage<boolean>(STORAGE_KEY, false);

    const toggleSystem = useCallback(() => setIsMetric((previous) => !previous), [setIsMetric]);

    const convertTemperature = useCallback((fahrenheit: number) => {
        if (isMetric) return Math.round((fahrenheit - 32) * 5 / 9 / 2) * 2;

        return Math.round(fahrenheit / 5) * 5;
    }, [isMetric]);

    const convertWindSpeed = useCallback((mph: number) =>
        isMetric ? Math.round(mph * 1.60934) : mph, [isMetric]);

    const convertPrecip = useCallback((inches: number) =>
        isMetric ? parseFloat((inches * 25.4).toFixed(2)) : inches, [isMetric]);

    const contextValue = useMemo(
        () => ({ isMetric, toggleSystem, convertTemperature, convertWindSpeed, convertPrecip }),
        [isMetric, toggleSystem, convertTemperature, convertWindSpeed, convertPrecip],
    );

    return (
        <MeasurementSystemContext.Provider value={contextValue}>
            {children}
        </MeasurementSystemContext.Provider>
    );
}

export function useMeasurementSystemProviderContext() {
    const context = useContext(MeasurementSystemContext);

    if (!context) throw new Error('useMeasurementSystemProviderContext must be used within a MeasurementSystemProvider');

    return context;
}
