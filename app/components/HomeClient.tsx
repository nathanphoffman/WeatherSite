'use client';

import { useEffect, useState } from 'react';
import CitySearch from '@/components/CitySearch';
import Forecast from './Forecast';
import { City } from '@/app/utils/cityParser';

const STORAGE_KEY = 'lastCity';

interface HomeClientProps {
    cities: City[];
}

export default function HomeClient({ cities }: HomeClientProps) {
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setSelectedCity(JSON.parse(saved));
    }, []);

    const selectCity = (city: City) => {
        setSelectedCity(city);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    };

    const clearCity = () => {
        setSelectedCity(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <section>
            <CitySearch cities={cities} initialCity={selectedCity} onSelect={selectCity} onClear={clearCity} />
            {selectedCity && (
                <Forecast lat={selectedCity.lat} lon={selectedCity.lng} />
            )}
        </section>
    );
}
