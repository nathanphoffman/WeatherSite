'use client';

import { useEffect, useState } from 'react';
import { DayForecast } from '@/app/lib/noaa/types/forecast';
import { MeasurementSystemProvider } from '@/app/components/Forecast/MeasurementSystemProvider';
import ForecastCardTable from '@/app/components/Forecast/ForecastCardTable/ForecastCardTable';

interface ForecastProps {
    lat: string;
    long: string;
    allFlipped: boolean;
    flipNonce: number;
    onFlipCountChange?: (flippedCount: number, totalCount: number) => void;
}

export default function Forecast({ lat, long, allFlipped, flipNonce, onFlipCountChange }: ForecastProps) {
    const [weather, setWeather] = useState<DayForecast | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [flippedDates, setFlippedDates] = useState<Set<string>>(new Set());
    const [allExpanded, setAllExpanded] = useState(false);

    useEffect(() => {
        setFlippedDates(new Set());
        setAllExpanded(false);
    }, [weather]);

    useEffect(() => {
        if (!allFlipped) setAllExpanded(false);
    }, [allFlipped]);

    useEffect(() => {
        if (!weather) return;
        const totalCount = Object.keys(weather).length;
        onFlipCountChange?.(flippedDates.size, totalCount);
    }, [flippedDates, weather, onFlipCountChange]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setWeather(null);
        fetch(`/api/forecast?lat=${lat}&long=${long}&source=api`, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) throw new Error('Failed to fetch forecast');
                return response.json();
            })
            .then(data => {
                setWeather(data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.message);
                setLoading(false);
            });
    }, [lat, long]);

    if (loading) return <p className="p-6 text-gray-400">Loading forecast...</p>;
    if (error) return <p className="p-6 text-red-400">{error}</p>;
    if (!weather) return null;

    const handleCardFlipChange = (date: string, flipped: boolean) => {
        setFlippedDates((previous) => {
            const next = new Set(previous);
            if (flipped) next.add(date);
            else next.delete(date);
            return next;
        });
    };

    const allGroups = Object.values(weather).flat();

    return (
        <MeasurementSystemProvider>
            <ForecastCardTable
                weather={weather}
                allGroups={allGroups}
                allFlipped={allFlipped}
                flipNonce={flipNonce}
                allExpanded={allExpanded}
                onCardFlipChange={handleCardFlipChange}
                onExpandChange={setAllExpanded}
            />
        </MeasurementSystemProvider>
    );
}
