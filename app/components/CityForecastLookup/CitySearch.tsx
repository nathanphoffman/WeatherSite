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
    const [loading, setLoading] = useState(false);
    const [citySelected, setCitySelected] = useState(false);

    useEffect(() => {
        if (initialCity) setQuery(`${initialCity.city}, ${initialCity.state_id}`);
    }, [initialCity]);

    // because cities is loaded into a state object on this component, the parent component does not force cities back into allCities state
    useEffect(() => {
        setAllCities(cities);
    }, [cities]);

    const filterCities = (cityList: City[], value: string): City[] => {
        const lower = value.toLowerCase();
        if (lower.includes(',') || lower.includes(' ')) {
            const [cityPart, statePart] = lower.split(/[, ]+/, 2).map(s => s.trim());
            return cityList.filter(c =>
                c.city.toLowerCase().startsWith(cityPart) &&
                c.state_id.toLowerCase().startsWith(statePart)
            );
        }
        return cityList.filter(c => c.city.toLowerCase().startsWith(lower));
    };

    const filtered = query.length > 0 ? filterCities(allCities, query).slice(0, 3) : [];

    const onCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setCitySelected(false);

        // the idea here is we start serverside with all of the populated cities loaded in
        // then if the populated cities drop below 3 in the filter we load in all cities not just the populated ones
        // this is in an effort to preserve data and partly because I wanted to make the system more robust and fun
        if (!allCitiesLoaded && value.length > 0) {
            const filtered = filterCities(allCities, value);

            if (filtered.length === 0) {
                setLoading(true);

                setTimeout(async () => {
                    const res = await fetch('/api/cities');
                    

                    const { allCities: fetchedCities } = await res.json();

                    setAllCities((prev) => {
                        const existing = new Set(prev.map(c => `${c.city}-${c.state_id}`));
                        const unique = fetchedCities.filter((c: City) => !existing.has(`${c.city}-${c.state_id}`));
                        return [...prev, ...unique];
                    });

                    setLoading(false);
                    setAllCitiesLoaded(true);
                    
                }, 1000);
            }
        }
    };

    const populateInput = async function (city: City) {
        setQuery(`${city.city}, ${city.state_id}`);
        setCitySelected(true);
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
                    {!citySelected && (filtered.length > 0 || loading) && (
                        /* Covers the screen vieport so that the Simple Map credits link is not clickable */
                        <div className="fixed inset-0 z-10" onClick={() => setCitySelected(true)} />
                    )}
                    {!citySelected && (filtered.length > 0 || loading) && (
                        <ul className="absolute z-20 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                            {loading && (<li>(Loading more cities...)</li>)}
                            {!loading && filtered.map(c => (
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
