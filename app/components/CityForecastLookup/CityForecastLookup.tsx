'use client';

import { useEffect, useState } from 'react';
import CitySearch from '@/app/components/CityForecastLookup/CitySearch';
import Forecast from '../Forecast/Forecast';
import { City } from '@/app/utils/cityParser';
import { safeJsonParse } from '@/app/lib/noaa/utility';

const STORAGE_KEY = 'lastCity';
const STORAGE_KEY_CACHED_CITIES = 'cachedCities';
const STORAGE_VERSION = 2;
const STORAGE_VERSION_KEY = 'storageVersion';

interface CityForecastLookupProps {
    cities: City[];
}

export default function CityForecastLookup({ cities }: CityForecastLookupProps) {
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [allFlipped, setAllFlipped] = useState(false);
    const [flipNonce, setFlipNonce] = useState(0);
    const [flippedCount, setFlippedCount] = useState(0);
    const [totalCards, setTotalCards] = useState(0);
    const [cachedAndPopularCities, setCachedAndPopularCities] = useState(cities);

    const handleFlipCountChange = (flippedCount: number, totalCount: number) => {
        setFlippedCount(flippedCount);
        setTotalCards(totalCount);
    };

    const flipAll = (value: boolean) => {
        setAllFlipped(value);
        setFlipNonce((previous) => previous + 1);
    };

    const getCachedCitiesFromStorage = (): City[] => {
        return safeJsonParse<City[]>(localStorage.getItem(STORAGE_KEY_CACHED_CITIES)) ?? [];
    }

    const addSelectedCityToLookupCache = (city: City) => {
        const cachedCitiesFromStorage = getCachedCitiesFromStorage();
        const matchedCity = cachedCitiesFromStorage.find(cachedCity => cachedCity.city === city.city);
        if(!matchedCity) {
            const newCityList = [city, ...cachedCitiesFromStorage];
            localStorage.setItem(STORAGE_KEY_CACHED_CITIES, JSON.stringify(newCityList));
        }
    }

    useEffect(() => {
        const storedVersion = Number(localStorage.getItem(STORAGE_VERSION_KEY));
        if (storedVersion !== STORAGE_VERSION) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_KEY_CACHED_CITIES);
            localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
        }

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setSelectedCity(safeJsonParse<City>(saved));

        const cachedCities = getCachedCitiesFromStorage();
        const cachedCityNames = new Set(cachedCities.map((city) => city.city));
        setCachedAndPopularCities([...cachedCities, ...cachedAndPopularCities.filter((city) => !cachedCityNames.has(city.city))]);
    }, []);

    const selectCity = (city: City) => {
        addSelectedCityToLookupCache(city);
        setSelectedCity(city);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    };

    const clearCity = () => {
        setSelectedCity(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <section>
            <CitySearch cities={cachedAndPopularCities} initialCity={selectedCity} onSelect={selectCity} onClear={clearCity} />
            {selectedCity && (
                <>
                    <div className="flex justify-center gap-2 mt-3">
                        <button
                            type="button"
                            onClick={() => flipAll(false)}
                            className={`text-sm border rounded-lg px-4 py-1.5 transition-colors ${totalCards > 0 && flippedCount === 0 ? 'text-white border-gray-500' : 'text-gray-400 hover:text-white border-gray-700 hover:border-gray-500'}`}
                        >
                            View Forecasts
                        </button>
                        <button
                            type="button"
                            onClick={() => flipAll(true)}
                            className={`text-sm border rounded-lg px-4 py-1.5 transition-colors ${totalCards > 0 && flippedCount === totalCards ? 'text-white border-gray-500' : 'text-gray-400 hover:text-white border-gray-700 hover:border-gray-500'}`}
                        >
                            View Graphs
                        </button>
                    </div>
                    <Forecast lat={selectedCity.lat} long={selectedCity.long} allFlipped={allFlipped} flipNonce={flipNonce} onFlipCountChange={handleFlipCountChange} />
                </>
            )}
        </section>
    );
}
