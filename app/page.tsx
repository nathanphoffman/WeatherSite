import { getPopulatedCities } from './utils/cityParser';
import HomeClient from './components/HomeClient';

export default async function Page() {
    const cities = await getPopulatedCities();
    return <HomeClient cities={cities} />;
}
