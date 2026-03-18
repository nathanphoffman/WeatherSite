'use client';

import { useEffect, useState } from 'react';
import { DayForecast } from '@/app/lib/noaa/types/forecast';
import WeatherDay from './WeatherDay';

interface ForecastProps {
    lat: string;
    lon: string;
}

export default function Forecast({ lat, lon }: ForecastProps) {
    const [weather, setWeather] = useState<DayForecast | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setWeather(null);
        fetch(`/api/forecast?lat=${lat}&lon=${lon}`, { cache: 'no-store' })
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
    }, [lat, lon]);

    if (loading) return <p className="p-6 text-gray-400">Loading forecast...</p>;
    if (error) return <p className="p-6 text-red-400">{error}</p>;
    if (!weather) return null;

    return (
        <div className="flex flex-wrap gap-4 p-6">
            {Object.entries(weather).map(([forecastDate, groups]) => (
                <WeatherDay key={forecastDate} forecastDate={forecastDate} groups={groups} />
            ))}
        </div>
    );
}
