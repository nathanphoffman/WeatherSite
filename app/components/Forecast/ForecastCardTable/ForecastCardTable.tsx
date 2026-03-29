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
    onCardFlipChange: (date: string, flipped: boolean) => void;
    onExpandChange: (expanded: boolean) => void;
}

export default function ForecastCardTable({ weather, allGroups, allFlipped, flipNonce, allExpanded, onCardFlipChange, onExpandChange }: ForecastCardTableProps) {
    const { useMetric, toggleSystem } = useMeasurementSystemProviderContext();

    return (
        <>
            <div className="flex justify-center mt-3">
                <div className="flex text-sm border border-gray-700 rounded-lg overflow-hidden">
                    <button
                        type="button"
                        onClick={() => useMetric && toggleSystem()}
                        className={`px-4 py-1.5 transition-colors ${!useMetric ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Imperial
                    </button>
                    <button
                        type="button"
                        onClick={() => !useMetric && toggleSystem()}
                        className={`px-4 py-1.5 transition-colors ${useMetric ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Metric
                    </button>
                </div>
            </div>
            <section className="grid grid-cols-[repeat(auto-fit,minmax(324px,1fr))] gap-6 p-6">
                {Object.entries(weather).map(([forecastDate, groups]) => (
                    <ForecastCard key={forecastDate} forecastDate={forecastDate} groups={groups} allGroups={allGroups} allFlipped={allFlipped} flipNonce={flipNonce} allExpanded={allExpanded} onFlipChange={(flipped) => onCardFlipChange(forecastDate, flipped)} onExpandChange={onExpandChange} />
                ))}
            </section>
        </>
    );
}
