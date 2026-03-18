'use client';

import { useState } from 'react';
import CitySearch from '@/components/CitySearch';
import Forecast from './Forecast';
import { City } from '@/app/utils/cityParser';

interface HomeClientProps {
    cities: City[];
}

export default function HomeClient({ cities }: HomeClientProps) {
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    return (
        <section>
            <CitySearch cities={cities} onSelect={setSelectedCity} onClear={() => setSelectedCity(null)} />
            {selectedCity && (
                <Forecast lat={selectedCity.lat} lon={selectedCity.lng} />
            )}
        </section>
    );
}
