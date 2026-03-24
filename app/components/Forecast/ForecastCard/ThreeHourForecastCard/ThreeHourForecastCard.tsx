import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import ThreeHourEntry from './ThreeHourEntry';

interface ThreeHourForecastCardProps {
    groups: ThreeHourGroup[];
}

export default function ThreeHourForecast({ groups }: ThreeHourForecastCardProps) {
    return (
        <>
            {groups.map((group) => (
                <ThreeHourEntry key={group.regularTime} group={group} />
            ))}
        </>
    );
}
