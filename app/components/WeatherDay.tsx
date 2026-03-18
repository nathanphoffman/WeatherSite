import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import WeatherEntry from './WeatherEntry';

interface WeatherDayProps {
    forecastDate: string;
    groups: ThreeHourGroup[];
}

export default function WeatherDay({ forecastDate, groups }: WeatherDayProps) {
    return (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 min-w-[180px] flex-1">
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-700">
                {forecastDate}
            </div>
            {groups.map((group) => (
                <WeatherEntry key={group.regularTime} group={group} />
            ))}
        </div>
    );
}
