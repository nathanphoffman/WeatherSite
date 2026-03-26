'use client';

import { useEffect, useState } from 'react';
import { DayForecast } from '@/app/lib/noaa/types/forecast';
import ForecastCard from './ForecastCard/ForecastCard';

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
        fetch(`/api/forecast?lat=${lat}&lon=${long}&source=api`, { cache: 'no-store' })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch forecast');
                return res.json();
            })
            .then(data => {
                setWeather(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
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

    const now = new Date();
    const todayDate = `${now.getMonth() + 1}/${now.getDate()}`;
    const currentHour = now.getHours();

    return (
        <section className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4 p-6">
            {(() => {
                const allGroups = Object.values(weather).flat();
                return Object.entries(weather).map(([forecastDate, groups]) => (
                    <ForecastCard key={forecastDate} forecastDate={forecastDate} groups={groups} allGroups={allGroups} allFlipped={allFlipped} flipNonce={flipNonce} allExpanded={allExpanded} currentHour={forecastDate === todayDate ? currentHour : undefined} onFlipChange={(flipped) => handleCardFlipChange(forecastDate, flipped)} onExpandChange={setAllExpanded} />
                ));
            })()}
        </section>
    );
}
