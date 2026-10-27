'use client';

import { useEffect, useState } from 'react';
import { ChanceRanges } from '@/app/lib/noaa/config';
import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { getHourRealFeel, getHourStormRating } from '@/app/lib/noaa/output/calculations';
import { REAL_FEEL_THRESHOLDS, WIND_THRESHOLDS, STORM_RATING_THRESHOLDS } from './graphThresholds';
import { GRAPH_COLORS } from './graphConfig';
import LineGraph from './LineGraph';
import MultiLineGraph from './MultiLineGraph';
import { useMeasurementSystemProviderContext } from '@/app/components/Forecast/MeasurementSystemProvider';

interface GraphCardProps {
    groups: ThreeHourGroup[];
    allGroups?: ThreeHourGroup[];
    allExpanded: boolean;
    onExpandChange?: (expanded: boolean) => void;
}

const PERCENT_PER_CHANCE_STEP = 25;

// each chance code's position in ChanceRanges is its 25% step (0 = "--", 4 = "Ocnl")
function chanceToPercent(chance: string): number {
    const chanceStep = Object.entries(ChanceRanges).find(([, code]) => code === chance)?.[0];

    return Number(chanceStep ?? 0) * PERCENT_PER_CHANCE_STEP;
}

type HourData = ThreeHourGroup['hours'][number];

const toWindSpeed = (hourData: HourData) => hourData.wind;

export default function GraphCard({ groups, allGroups, allExpanded, onExpandChange }: GraphCardProps) {
    const [expanded, setExpanded] = useState(false);
    const { isMetric, convertTemperature, convertWindSpeed, convertPrecip } = useMeasurementSystemProviderContext();

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
    const windPoints = sortedHours(toWindSpeed);
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
                <span className="text-4xl font-bold text-white"><span className="sr-only">Daily high </span>{convertTemperature(dailyHighRealFeel)}°</span>
                <span className="text-4xl font-bold text-gray-400"><span className="sr-only">Daily low </span>{convertTemperature(dailyLowRealFeel)}°</span>
            </div>

            <LineGraph
                title={`Real Feel (${isMetric ? '°C' : '°F'})`}
                points={realFeelPoints.map((point) => ({ ...point, value: convertTemperature(point.value) }))}
                color={GRAPH_COLORS.REAL_FEEL}
                indicesToLabel={indicesToLabel}
                height={110}
                minValue={convertTemperature(weeklyHighAndLowRealFeel.weeklyLow)}
                maxValue={convertTemperature(weeklyHighAndLowRealFeel.weeklyHigh)}
                formatYLabel={(value) => `${Math.round(value)}°`}
                thresholdLines={REAL_FEEL_THRESHOLDS.map((threshold) => ({ ...threshold, value: convertTemperature(threshold.value) }))}
            />
            <LineGraph
                title="Storm Rating"
                points={stormRatingPoints}
                color={GRAPH_COLORS.STORM_RATING}
                indicesToLabel={indicesToLabel}
                height={90}
                minValue={0}
                maxValue={50}
                logStrength={0.4}
                thresholdLines={STORM_RATING_THRESHOLDS}
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
                        color={GRAPH_COLORS.CLOUD_COVER}
                        indicesToLabel={indicesToLabel}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />
                    <LineGraph
                        title="Precip Chance"
                        points={precipChancePoints}
                        color={GRAPH_COLORS.PRECIP_CHANCE}
                        indicesToLabel={indicesToLabel}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />
                    <LineGraph
                        title={`Wind Speed (${isMetric ? 'km/h' : 'mph'})`}
                        points={windPoints.map((point) => ({ ...point, value: convertWindSpeed(point.value) }))}
                        minValue={convertWindSpeed(weeklyHighAndLowWindSpeed.weeklyLow)}
                        maxValue={convertWindSpeed(weeklyHighAndLowWindSpeed.weeklyHigh)}
                        color={GRAPH_COLORS.WIND_SPEED}
                        indicesToLabel={indicesToLabel}
                        thresholdLines={WIND_THRESHOLDS.map((threshold) => ({ ...threshold, value: convertWindSpeed(threshold.value) }))}
                    />
                    <LineGraph
                        title="Humidity"
                        points={humidityPoints}
                        color={GRAPH_COLORS.HUMIDITY}
                        indicesToLabel={indicesToLabel}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />

                    <LineGraph
                        title={`Precipitation (${isMetric ? 'mm' : 'in'})`}
                        points={precipAmountPoints.map((point) => ({ ...point, value: convertPrecip(point.value) }))}
                        color={GRAPH_COLORS.PRECIP_AMOUNT}
                        indicesToLabel={indicesToLabel}
                        minValue={0}
                        logStrength={1}
                        maxValue={Math.max(...precipAmountPoints.map((point) => convertPrecip(point.value)).filter(isFinite), convertPrecip(0.1))}
                        formatYLabel={(value) => isMetric ? value.toFixed(1) : value.toFixed(2)}
                    />

                    <MultiLineGraph
                        title="Rain / Snow / Thunder"
                        series={[
                            { points: rainPoints, color: GRAPH_COLORS.RAIN, label: 'Rain' },
                            { points: snowPoints, color: GRAPH_COLORS.SNOW, label: 'Snow' },
                            { points: thunderPoints, color: GRAPH_COLORS.THUNDER, label: 'Thunder' },
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
