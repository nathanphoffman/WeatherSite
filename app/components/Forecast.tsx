import { getForecast } from '@/app/lib/noaa/storage/main';
import WeatherDay from './WeatherDay';

export const dynamic = 'force-dynamic';

export default async function Forecast() {

    const weather = await getForecast();

    return (
        <div className="flex flex-wrap gap-4 p-6">
            {Object.entries(weather).map(([forecastDate, groups]) => (
                <WeatherDay key={forecastDate} forecastDate={forecastDate} groups={groups} />
            ))}
        </div>
    );
}
