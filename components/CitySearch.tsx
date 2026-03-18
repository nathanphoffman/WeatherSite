'use client';

import { useEffect, useState } from 'react';
import { City } from '@/app/utils/cityParser';

interface CitySearchProps {
    cities: City[];
    initialCity?: City | null;
    onSelect?: (city: City) => void;
    onClear?: () => void;
}

export default function CitySearch({ cities, initialCity, onSelect, onClear }: CitySearchProps) {
    const [query, setQuery] = useState('');
    const [allCities, setAllCities] = useState<City[]>(cities);
    const [allCitiesLoaded, setAllCitiesLoaded] = useState(false);

    useEffect(() => {
        if (initialCity) setQuery(`${initialCity.city}, ${initialCity.state_id}`);
    }, [initialCity]);

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

    const populateInput = async function (city: City) {
        setQuery(`${city.city}, ${city.state_id}`);
        onSelect?.(city);
    };

    return (
        <div className="p-4 flex justify-center">
            <div className="flex items-center gap-2 w-full max-w-sm">
                <a
                    href="/about"
                    className="flex items-center justify-center w-10 h-10 text-xl text-gray-400 border border-gray-600 rounded-lg hover:text-white hover:border-gray-400 active:bg-gray-800"
                    aria-label="About"
                >
                    ?
                </a>
                <div className="relative flex-1 min-w-0">
                <input
                    type="text"
                    value={query}
                    onChange={onCityChange}
                    placeholder="Search for a city..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
                {filtered.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                    {filtered.map(c => (
                        <li key={`${c.city}-${c.state_id}`}>
                            <a
                                href="#"
                                onClick={e => { e.preventDefault(); populateInput(c); }}
                                className="block px-4 py-2 text-lg text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                                {c.city}, {c.state_id}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
                </div>
                {query.length > 0 && (
                    <button
                        onClick={() => { setQuery(''); onClear?.(); }}
                        className="flex items-center justify-center w-10 h-10 text-xl text-gray-400 border border-gray-600 rounded-lg hover:text-white hover:border-gray-400 active:bg-gray-800"
                        aria-label="Clear"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}
