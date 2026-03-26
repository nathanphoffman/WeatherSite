import { DayForecast } from '@/app/lib/noaa/types/forecast';
import ForecastCard from '@/app/components/Forecast/ForecastCardTable/ForecastCard/ForecastCard';
import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { useMeasurementSystemProviderContext } from '@/app/components/Forecast/MeasurementSystemProvider';

interface ForecastCardTableProps {
    weather: DayForecast;
    allGroups: ThreeHourGroup[];
    allFlipped: boolean;
    flipNonce: number;
    allExpanded: boolean;
    todayDate: string;
    currentHour: number;
    onCardFlipChange: (date: string, flipped: boolean) => void;
    onExpandChange: (expanded: boolean) => void;
}

export default function ForecastCardTable({ weather, allGroups, allFlipped, flipNonce, allExpanded, todayDate, currentHour, onCardFlipChange, onExpandChange }: ForecastCardTableProps) {
    const { useMetric, toggleSystem } = useMeasurementSystemProviderContext();

    return (
        <>
            <div className="flex justify-center mt-3">
                <button
                    type="button"
                    onClick={toggleSystem}
                    className="text-sm border rounded-lg px-4 py-1.5 transition-colors text-gray-400 hover:text-white border-gray-700 hover:border-gray-500"
                >
                    {useMetric ? 'Imperial' : 'Metric'}
                </button>
            </div>
            <section className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4 p-6">
                {Object.entries(weather).map(([forecastDate, groups]) => (
                    <ForecastCard key={forecastDate} forecastDate={forecastDate} groups={groups} allGroups={allGroups} allFlipped={allFlipped} flipNonce={flipNonce} allExpanded={allExpanded} currentHour={forecastDate === todayDate ? currentHour : undefined} onFlipChange={(flipped) => onCardFlipChange(forecastDate, flipped)} onExpandChange={onExpandChange} />
                ))}
            </section>
        </>
    );
}
