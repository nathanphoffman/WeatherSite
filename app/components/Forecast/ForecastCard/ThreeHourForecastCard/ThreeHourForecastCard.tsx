import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import ThreeHourEntry from './ThreeHourEntry';

interface ThreeHourForecastCardProps {
    groups: ThreeHourGroup[];
}

export default function ThreeHourForecastCard({ groups }: ThreeHourForecastCardProps) {
    return (
        <ul>
            {groups.map((group) => (
                <ThreeHourEntry key={group.regularTime} group={group} />
            ))}
        </ul>
    );
}
