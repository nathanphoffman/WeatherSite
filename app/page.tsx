import { getPopulatedCities } from './utils/cityParser';
import CityForecastLookup from './components/CityForecastLookup/CityForecastLookup';

export default async function Page() {
    const cities = await getPopulatedCities();
    return <CityForecastLookup cities={cities} />;
}
