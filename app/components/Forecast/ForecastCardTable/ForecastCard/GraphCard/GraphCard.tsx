'use client';

import { useEffect, useState } from 'react';
import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { getRealFeelTemperature, getMagnitude, convertNOAAChancesToAverageMagnitude, getStormRating } from '@/app/lib/noaa/output/calculations';
import { getRealFeelMagnitude, getStormMagnitude, getHappyFaceFromMagnitude } from '@/app/lib/noaa/output/color';
import { HumidityRanges, WindRanges, ChanceRanges } from '@/app/lib/noaa/config';
import { realFeelThresholds, stormThresholds, windThresholds } from './graphThresholds';
import { getAverage } from '@/app/lib/noaa/utility';
import LineGraph from './LineGraph';
import MultiLineGraph from './MultiLineGraph';
import { useMeasurementSystemProviderContext } from '@/app/components/Forecast/MeasurementSystemProvider';

interface GraphCardProps {
    groups: ThreeHourGroup[];
    allGroups?: ThreeHourGroup[];
    allExpanded: boolean;
    currentHour?: number;
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

const toRealFeel = (hourData: HourData) =>
    getRealFeelTemperature(
        hourData.temperature,
        getMagnitude(hourData.humidity, HumidityRanges),
        getMagnitude(hourData.wind, WindRanges),
        hourData.skyCover,
        hourData.hour
    );

const toStormRating = (hourData: HourData) =>
    getStormRating(
        hourData.skyCover,
        hourData.precipChance,
        getMagnitude(hourData.rain, ChanceRanges),
        getMagnitude(hourData.snow, ChanceRanges),
        getMagnitude(hourData.wind, WindRanges),
        getMagnitude(hourData.thunder, ChanceRanges)
    );
    
const toWindSpeed = (hourData: HourData) => hourData.wind;

export default function GraphCard({ groups, allGroups, allExpanded, currentHour, onExpandChange }: GraphCardProps) {
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

    const sortedHours = (selector: (hourData: HourData) => number) =>
        groups
            .flatMap((group) => group.hours.map((hourData) => ({ hour: hourData.hour, value: selector(hourData) })))
            .sort((pointA, pointB) => pointA.hour - pointB.hour);

    const clipToCurrentHour = (points: { hour: number; value: number }[]) =>
        currentHour !== undefined ? points.filter((point) => point.hour >= currentHour) : points;

    const realFeelPoints = clipToCurrentHour(sortedHours(toRealFeel));
    const stormRatingPoints = clipToCurrentHour(sortedHours(toStormRating));
    const windPoints = clipToCurrentHour(sortedHours((hourData) => hourData.wind));
    const skyCoverPoints = clipToCurrentHour(sortedHours((hourData) => hourData.skyCover));
    const humidityPoints = clipToCurrentHour(sortedHours((hourData) => hourData.humidity));
    const precipChancePoints = clipToCurrentHour(sortedHours((hourData) => hourData.precipChance));
    const precipAmountPoints = clipToCurrentHour(sortedHours((hourData) => hourData.precipAmount ?? 0));
    const rainPoints = clipToCurrentHour(sortedHours((hourData) => chanceToPercent(hourData.rain)));
    const snowPoints = clipToCurrentHour(sortedHours((hourData) => chanceToPercent(hourData.snow)));
    const thunderPoints = clipToCurrentHour(sortedHours((hourData) => chanceToPercent(hourData.thunder)));

    if (realFeelPoints.length === 0) return null;

    const SMILEY_RANK: Record<string, number> = { '😎': 0, '🙂': 1 };
    const smileys = groups.map((group) => {
        const { middleHour, hours } = group;
        const humidityMagnitude = getMagnitude(getAverage(...hours.map((hourData) => hourData.humidity)), HumidityRanges);
        const windMagnitude = getMagnitude(getAverage(...hours.map((hourData) => hourData.wind)), WindRanges);
        const thunderMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((hourData) => hourData.thunder));
        const rainMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((hourData) => hourData.rain));
        const snowMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((hourData) => hourData.snow));
        const averageSkyCover = getAverage(...hours.map((hourData) => hourData.skyCover));
        const realFeel = getRealFeelTemperature(getAverage(...hours.map((hourData) => hourData.temperature)), humidityMagnitude, windMagnitude, averageSkyCover, middleHour);
        const stormRating = getStormRating(averageSkyCover, getAverage(...hours.map((hourData) => hourData.precipChance)), rainMagnitude, snowMagnitude, windMagnitude, thunderMagnitude);
        return getHappyFaceFromMagnitude(humidityMagnitude, getRealFeelMagnitude(realFeel), getStormMagnitude(stormRating));
    });
    const bestSmiley = smileys.reduce<string | null>((best, smiley) => {
        if (!(smiley in SMILEY_RANK)) return best;
        if (best === null || SMILEY_RANK[smiley] < SMILEY_RANK[best]) return smiley;
        return best;
    }, null);

    const dailyHighRealFeel = Math.max(...realFeelPoints.map((point) => point.value));
    const dailyLowRealFeel = Math.min(...realFeelPoints.map((point) => point.value));

    function getWeeklyHighAndLow(dataExtractionFn: (hourData: HourData) => number) {
        const weeklyValues = (allGroups ?? groups).flatMap((group) => group.hours.map(dataExtractionFn));
        const weeklyHigh = Math.max(...weeklyValues);
        const weeklyLow = Math.min(...weeklyValues);
        return { weeklyHigh, weeklyLow };
    }

    const weeklyHighAndLowRealFeel = getWeeklyHighAndLow(toRealFeel);
    const weeklyHighAndLowWindSpeed = getWeeklyHighAndLow(toWindSpeed);

    const indicesToLabel = Array.from({ length: 3 }, (_, index) =>
        Math.round((index / 2) * (realFeelPoints.length - 1))
    );

    return (
        <section>
            <div className="flex justify-between items-baseline">
                <span className="text-4xl font-bold text-white">{convertTemperature(dailyHighRealFeel)}°</span>
                <span className="text-4xl font-bold text-gray-400">{convertTemperature(dailyLowRealFeel)}°</span>
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
                maxValue={75}
                logStrength={0.4}
                thresholdLines={[{ value: 10, color: 'rgba(255,255,255,0.45)', showYLabel: true }]}
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
                        maxValue={Math.max(...precipAmountPoints.map((point) => convertPrecip(point.value)).filter(isFinite), convertPrecip(0.5))}
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
