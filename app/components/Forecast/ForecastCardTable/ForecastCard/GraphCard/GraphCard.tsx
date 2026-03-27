'use client';

import { useEffect, useState } from 'react';
import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { getHourRealFeel, getHourStormRating, roundToNearestFive } from '@/app/lib/noaa/output/calculations';
import { realFeelThresholds, windThresholds, stormRatingThresholds, precipThresholds } from './graphThresholds';
import LineGraph from './LineGraph';
import MultiLineGraph from './MultiLineGraph';
import { useMeasurementSystemProviderContext } from '@/app/components/Forecast/MeasurementSystemProvider';

interface GraphCardProps {
    groups: ThreeHourGroup[];
    allGroups?: ThreeHourGroup[];
    allExpanded: boolean;
    onExpandChange?: (expanded: boolean) => void;
}

const CHANCE_TO_PERCENT: Record<string, number> = {
    '--': 0,
    'SChc': 25,
    'Chc': 50,
    'Lkly': 75,
    'Ocnl': 100,
};

function chanceToPercent(chance: string): number {
    return CHANCE_TO_PERCENT[chance] ?? 0;
}

type HourData = ThreeHourGroup['hours'][number];

const toWindSpeed = (hourData: HourData) => hourData.wind;

export default function GraphCard({ groups, allGroups, allExpanded, onExpandChange }: GraphCardProps) {
    const [expanded, setExpanded] = useState(false);
    const { useMetric, convertTemperature, convertWindSpeed, convertPrecip } = useMeasurementSystemProviderContext();

    useEffect(() => {
        setExpanded(allExpanded);
    }, [allExpanded]);

    const handleExpand = (event: React.MouseEvent) => {
        event.stopPropagation();
        const next = !expanded;
        setExpanded(next);
        onExpandChange?.(next);
    };

    const firstMiddleHour = groups[0]?.middleHour ?? 0;
    const lastMiddleHour = groups[groups.length - 1]?.middleHour ?? 23;

    const sortedHours = (selector: (hourData: HourData) => number) =>
        groups
            .flatMap((group) => group.hours.map((hourData) => ({ hour: hourData.hour, value: selector(hourData) })))
            .filter((point) => point.hour >= firstMiddleHour && point.hour <= lastMiddleHour)
            .sort((pointA, pointB) => pointA.hour - pointB.hour);

    const realFeelPoints = sortedHours(getHourRealFeel);
    const stormRatingPoints = sortedHours(getHourStormRating);
    const windPoints = sortedHours((hourData) => hourData.wind);
    const skyCoverPoints = sortedHours((hourData) => hourData.skyCover);
    const humidityPoints = sortedHours((hourData) => hourData.humidity);
    const precipChancePoints = sortedHours((hourData) => hourData.precipChance);
    const precipAmountPoints = sortedHours((hourData) => hourData.precipAmount ?? 0);
    const rainPoints = sortedHours((hourData) => chanceToPercent(hourData.rain));
    const snowPoints = sortedHours((hourData) => chanceToPercent(hourData.snow));
    const thunderPoints = sortedHours((hourData) => chanceToPercent(hourData.thunder));

    if (realFeelPoints.length === 0) return null;

    const dailyHighRealFeel = Math.max(...realFeelPoints.map((point) => point.value));
    const dailyLowRealFeel = Math.min(...realFeelPoints.map((point) => point.value));

    function getWeeklyHighAndLow(dataExtractionFn: (hourData: HourData) => number) {
        const weeklyValues = (allGroups ?? groups).flatMap((group) => group.hours.map(dataExtractionFn));
        const weeklyHigh = Math.max(...weeklyValues);
        const weeklyLow = Math.min(...weeklyValues);
        return { weeklyHigh, weeklyLow };
    }

    const weeklyHighAndLowRealFeel = getWeeklyHighAndLow(getHourRealFeel);
    const weeklyHighAndLowWindSpeed = getWeeklyHighAndLow(toWindSpeed);

    const indicesToLabel = [...new Set(Array.from({ length: 3 }, (_, index) =>
        Math.round((index / 2) * (realFeelPoints.length - 1))
    ))];

    return (
        <section>
            <div className="flex justify-between items-baseline">
                <span className="text-4xl font-bold text-white">{convertTemperature(roundToNearestFive(dailyHighRealFeel))}°</span>
                <span className="text-4xl font-bold text-gray-400">{convertTemperature(roundToNearestFive(dailyLowRealFeel))}°</span>
            </div>

            <LineGraph
                title={`Real Feel (${useMetric ? '°C' : '°F'})`}
                points={realFeelPoints.map((point) => ({ ...point, value: convertTemperature(point.value) }))}
                color="#3b82f6"
                indicesToLabel={indicesToLabel}
                height={110}
                minValue={convertTemperature(weeklyHighAndLowRealFeel.weeklyLow)}
                maxValue={convertTemperature(weeklyHighAndLowRealFeel.weeklyHigh)}
                formatYLabel={(value) => `${Math.round(value)}°`}
                thresholdLines={realFeelThresholds.map((threshold) => ({ ...threshold, value: convertTemperature(threshold.value) }))}
            />
            <LineGraph
                title="Storm Rating"
                points={stormRatingPoints}
                color="#a855f7"
                indicesToLabel={indicesToLabel}
                height={90}
                minValue={0}
                maxValue={50}
                logStrength={0.4}
                thresholdLines={stormRatingThresholds}
            />

            <button
                type="button"
                onClick={handleExpand}
                className="w-full mt-3 py-1 text-xs text-gray-500 hover:text-gray-300 border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
            >
                {expanded ? '▲ less' : '▼ more'}
            </button>

            <div className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <LineGraph
                        title="Cloud Cover"
                        points={skyCoverPoints}
                        color="#94a3b8"
                        indicesToLabel={indicesToLabel}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />
                    <LineGraph
                        title="Precip Chance"
                        points={precipChancePoints}
                        color="#60a5fa"
                        indicesToLabel={indicesToLabel}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />
                    <LineGraph
                        title={`Wind Speed (${useMetric ? 'km/h' : 'mph'})`}
                        points={windPoints.map((point) => ({ ...point, value: convertWindSpeed(point.value) }))}
                        minValue={convertWindSpeed(weeklyHighAndLowWindSpeed.weeklyLow)}
                        maxValue={convertWindSpeed(weeklyHighAndLowWindSpeed.weeklyHigh)}
                        color="#a78bfa"
                        indicesToLabel={indicesToLabel}
                        thresholdLines={windThresholds.map((threshold) => ({ ...threshold, value: convertWindSpeed(threshold.value) }))}
                    />
                    <LineGraph
                        title="Humidity"
                        points={humidityPoints}
                        color="#06b6d4"
                        indicesToLabel={indicesToLabel}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />

                    <LineGraph
                        title={`Precipitation (${useMetric ? 'mm' : 'in'})`}
                        points={precipAmountPoints.map((point) => ({ ...point, value: convertPrecip(point.value) }))}
                        color="#38bdf8"
                        indicesToLabel={indicesToLabel}
                        minValue={0}
                        logStrength={2}
                        thresholdLines={precipThresholds.map((threshold) => ({ ...threshold, value: convertPrecip(threshold.value) }))}
                        maxValue={Math.max(...precipAmountPoints.map((point) => convertPrecip(point.value)).filter(isFinite), convertPrecip(1))}
                        formatYLabel={(value) => useMetric ? value.toFixed(1) : value.toFixed(2)}
                    />

                    <MultiLineGraph
                        title="Rain / Snow / Thunder"
                        series={[
                            { points: rainPoints, color: '#60a5fa', label: 'Rain' },
                            { points: snowPoints, color: '#e2e8f0', label: 'Snow' },
                            { points: thunderPoints, color: '#fbbf24', label: 'Thunder' },
                        ]}
                        indicesToLabel={indicesToLabel}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />
                </div>
            </div>
        </section>
    );
}
