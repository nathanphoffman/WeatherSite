'use client';

import { useState } from 'react';
import { City } from '@/app/utils/cityParser';

interface CitySearchProps {
    cities: City[];
}

export default function CitySearch({ cities }: CitySearchProps) {
    const [query, setQuery] = useState('');
    const [allCities, setAllCities] = useState<City[]>(cities);
    const [allCitiesLoaded, setAllCitiesLoaded] = useState(false);

    const filtered = query.length > 0
        ? allCities.filter(c => c.city.toLowerCase().startsWith(query.toLowerCase())).slice(0, 3)
        : [];

    const onCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // the idea here is we start serverside with all of the populated cities loaded in
        // then if the populated cities drop below 3 in the filter we load in all cities not just the populated ones
        // this is in an effort to preserve data and partly because I wanted to make the system more robust and fun
        if (!allCitiesLoaded && value.length > 0) {
            const filtered = allCities.filter(c => c.city.toLowerCase().startsWith(value.toLowerCase()));

            if (filtered.length < 3) {

                const res = await fetch('/api/cities');
                const { allCities: fetchedCities } = await res.json();

                setAllCities((prev) => {
                    const existing = new Set(prev.map(c => `${c.city}-${c.state_id}`));
                    const unique = fetchedCities.filter((c: City) => !existing.has(`${c.city}-${c.state_id}`));
                    return [...prev, ...unique];
                });

                setAllCitiesLoaded(true);
            }
        }
    };

    const populateInput = async function (city: string) {
        setQuery(city);
    }

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={onCityChange}
                placeholder="Search for a city..."
            />
            {filtered.length > 0 && (
                <ul>
                    {filtered.map(c => (
                        <a href="#" onClick={e=>populateInput(`${c.city}, ${c.state_id}`)}><li key={`${c.city}-${c.state_id}`}>
                            {c.city}, {c.state_id}
                        </li></a>
                    ))}
                </ul>
            )}
        </div>
    );
}
