'use client';

import { useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { City } from '@/app/utils/cityParser';
import { ICON_BUTTON_CLASSES } from '@/app/components/iconButtonClasses';
import { getCityKey } from '@/app/utils/cityKey';

interface CitySearchProps {
    cities: City[];
    initialCity?: City | null;
    onSelect?: (city: City) => void;
    onClear?: () => void;
}

export default function CitySearch({ cities, initialCity, onSelect, onClear }: CitySearchProps) {
    const listboxId = useId();
    const [query, setQuery] = useState('');
    const [allCities, setAllCities] = useState<City[]>(cities);
    const [allCitiesLoaded, setAllCitiesLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [citySelected, setCitySelected] = useState(false);

    useEffect(() => {
        if (initialCity) {
            setQuery(`${initialCity.city}, ${initialCity.state_id}`);
            setCitySelected(true);
        }
    }, [initialCity]);

    // because cities is loaded into a state object on this component, the parent component does not force cities back into allCities state
    useEffect(() => {
        setAllCities(cities);
    }, [cities]);

    const clear = () => {
        setQuery('');
        setCitySelected(false);
        onClear?.();
    };

    const filterCities = (cityList: City[], value: string): City[] => {
        const lower = value.toLowerCase();
        if (lower.includes(',') || lower.includes(' ')) {
            const [cityPart, statePart] = lower.split(/[, ]+/, 2).map(searchPart => searchPart.trim());
            return cityList.filter(cityItem =>
                cityItem.city.toLowerCase().startsWith(cityPart) &&
                cityItem.state_id.toLowerCase().startsWith(statePart)
            );
        }
        return cityList.filter(cityItem => cityItem.city.toLowerCase().startsWith(lower));
    };

    const getCurrentlyFilteredCities = (inputValue: string) => inputValue.length > 0 ? filterCities(allCities, inputValue).slice(0, 3) : [];

    const onCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setQuery(value);
        setCitySelected(false);

        // the idea here is we start serverside with all of the populated cities loaded in
        // then if the populated cities drop below 3 in the filter we load in all cities not just the populated ones
        // this is in an effort to preserve data and partly because I wanted to make the system more robust and fun
        if (!allCitiesLoaded && value.length > 0) {

            const currentlyShownCities = getCurrentlyFilteredCities(value);

            if (!loading && currentlyShownCities.length === 0) {
                setLoading(true);

                // !! artificial delay to show a loading screen
                setTimeout(async () => {
                    try {
                        const response = await fetch('/api/cities');
                        if (!response.ok) throw new Error('City list unavailable');

                        const { allCities: fetchedCities } = await response.json();

                        setAllCities((previous) => {
                            const existing = new Set(previous.map(getCityKey));
                            const unique = fetchedCities.filter((cityItem: City) => !existing.has(getCityKey(cityItem)));
                            return [...previous, ...unique];
                        });

                        setAllCitiesLoaded(true);
                    } catch {
                        // leave allCitiesLoaded false so the next keystroke can retry
                    } finally {
                        setLoading(false);
                    }
                }, 250);

            }
        }
    };

    const populateInput = function (city: City) {
        setQuery(`${city.city}, ${city.state_id}`);
        setCitySelected(true);
        onSelect?.(city);
    };

    const filteredCities = getCurrentlyFilteredCities(query);

    return (
        <header className="p-4 flex justify-center">
            <div className="flex items-center gap-2 w-full max-w-sm">
                <Link
                    href="/about"
                    className={ICON_BUTTON_CLASSES}
                    aria-label="About"
                >
                    ?
                </Link>
                <div className="relative flex-1 min-w-0">
                    <input
                        type="text"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={!citySelected && filteredCities.length > 0}
                        aria-controls={listboxId}
                        value={query}
                        onChange={onCityChange}
                        placeholder="Search for a city..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
                    />
                    {!citySelected && (filteredCities.length > 0 || loading) && (
                        /* Covers the screen viewport so that the Simple Map credits link is not clickable */
                        <div className="fixed inset-0 z-10" onClick={() => setCitySelected(true)} />
                    )}
                    {!citySelected && (filteredCities.length > 0 || loading) && (
                        <ul id={listboxId} role="listbox" className="absolute z-20 mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg">
                            {loading && (<li className="block px-4 py-2 text-lg text-gray-300">(Loading more cities...)</li>)}
                            {!loading && filteredCities.map(cityItem => (
                                <li key={getCityKey(cityItem)}>
                                    <button
                                        type="button"
                                        onClick={() => populateInput(cityItem)}
                                        className="block w-full text-left px-4 py-2 text-lg text-gray-300 hover:bg-gray-800 hover:text-white"
                                    >
                                        {cityItem.city}, {cityItem.state_id}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {query.length > 0 && (
                    <button
                        type="button"
                        onClick={clear}
                        className={ICON_BUTTON_CLASSES}
                        aria-label="Clear"
                    >
                        ✕
                    </button>
                )}
            </div>
        </header>
    );
}
