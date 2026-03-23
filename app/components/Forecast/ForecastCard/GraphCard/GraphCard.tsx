'use client';

import { useEffect, useState } from 'react';
import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { getRealFeelTemperature, getMagnitude, convertNOAAChancesToAverageMagnitude, getStormRating } from '@/app/lib/noaa/output/calculations';
import { getRealFeelMagnitude, getStormMagnitude, getHappyFaceFromMagnitude } from '@/app/lib/noaa/output/color';
import { HumidityRanges, WindRanges, RealFeelPreferences, StormPreferences, ChanceRanges } from '@/app/lib/noaa/config';
import { getAverage } from '@/app/lib/noaa/utility';
import LineGraph, { ThresholdLine } from './LineGraph';
import MultiLineGraph from './MultiLineGraph';

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

export default function GraphCard({ groups, allGroups, allExpanded, currentHour, onExpandChange }: GraphCardProps) {
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        setExpanded(allExpanded);
    }, [allExpanded]);

    const handleExpand = (event: React.MouseEvent) => {
        event.stopPropagation();
        const next = !expanded;
        setExpanded(next);
        onExpandChange?.(next);
    };

    const sortedHours = (selector: (hourData: ThreeHourGroup['hours'][number]) => number) =>
        groups
            .flatMap((group) => group.hours.map((hourData) => ({ hour: hourData.hour, value: selector(hourData) })))
            .sort((a, b) => a.hour - b.hour);

    const clipToCurrentHour = (points: { hour: number; value: number }[]) =>
        currentHour !== undefined ? points.filter((point) => point.hour >= currentHour) : points;

    const realFeelPoints = clipToCurrentHour(groups
        .flatMap((group) =>
            group.hours.map((hourData) => ({
                hour: hourData.hour,
                value: getRealFeelTemperature(
                    hourData.temperature,
                    getMagnitude(hourData.humidity, HumidityRanges),
                    getMagnitude(hourData.wind, WindRanges),
                    hourData.skyCover,
                    hourData.hour
                ),
            }))
        )
        .sort((a, b) => a.hour - b.hour));

    const windPoints = clipToCurrentHour(sortedHours((h) => h.wind));
    const skyCoverPoints = clipToCurrentHour(sortedHours((h) => h.skyCover));
    const humidityPoints = clipToCurrentHour(sortedHours((h) => h.humidity));
    const precipChancePoints = clipToCurrentHour(sortedHours((h) => h.precipChance));

    const stormRatingPoints = clipToCurrentHour(groups
        .flatMap((group) =>
            group.hours.map((hourData) => ({
                hour: hourData.hour,
                value: getStormRating(
                    hourData.skyCover,
                    hourData.precipChance,
                    getMagnitude(hourData.rain, ChanceRanges),
                    getMagnitude(hourData.snow, ChanceRanges),
                    getMagnitude(hourData.wind, WindRanges),
                    getMagnitude(hourData.thunder, ChanceRanges)
                ),
            }))
        )
        .sort((a, b) => a.hour - b.hour));

    const rainPoints = clipToCurrentHour(sortedHours((h) => chanceToPercent(h.rain)));
    const snowPoints = clipToCurrentHour(sortedHours((h) => chanceToPercent(h.snow)));
    const thunderPoints = clipToCurrentHour(sortedHours((h) => chanceToPercent(h.thunder)));

    if (realFeelPoints.length === 0) return null;

    const SMILEY_RANK: Record<string, number> = { '😎': 0, '🙂': 1 };
    const smileys = groups.map((group) => {
        const { middleHour, hours } = group;
        const humidityMagnitude = getMagnitude(getAverage(...hours.map((h) => h.humidity)), HumidityRanges);
        const windMagnitude = getMagnitude(getAverage(...hours.map((h) => h.wind)), WindRanges);
        const thunderMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((h) => h.thunder));
        const rainMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((h) => h.rain));
        const snowMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((h) => h.snow));
        const averageSkyCover = getAverage(...hours.map((h) => h.skyCover));
        const realFeel = getRealFeelTemperature(getAverage(...hours.map((h) => h.temperature)), humidityMagnitude, windMagnitude, averageSkyCover, middleHour);
        const stormRating = getStormRating(averageSkyCover, getAverage(...hours.map((h) => h.precipChance)), rainMagnitude, snowMagnitude, windMagnitude, thunderMagnitude);
        return getHappyFaceFromMagnitude(humidityMagnitude, getRealFeelMagnitude(realFeel), getStormMagnitude(stormRating));
    });
    const bestSmiley = smileys.reduce<string | null>((best, smiley) => {
        if (!(smiley in SMILEY_RANK)) return best;
        if (best === null || SMILEY_RANK[smiley] < SMILEY_RANK[best]) return smiley;
        return best;
    }, null);

    const realFeelThresholds: ThresholdLine[] = [
        { value: RealFeelPreferences.ExtremelyHotMin, color: '#f43f5e' },
        { value: RealFeelPreferences.VeryHotMin, color: '#ef4444' },
        { value: RealFeelPreferences.HotMin, color: '#eab308' },
        { value: RealFeelPreferences.WarmMin, color: 'rgba(255,255,255,0.0)' },
        { value: RealFeelPreferences.NiceMin, color: '#22c55e' },
        { value: RealFeelPreferences.CoolMin, color: 'rgba(255,255,255,0.0)' },
        { value: RealFeelPreferences.ColdMin, color: '#eab308' },
        { value: RealFeelPreferences.VeryColdMin, color: '#ef4444' },
    ];

    const humidityThresholds: ThresholdLine[] = [
        { value: 61, color: 'rgba(255,255,255,0.45)' },
        { value: 73, color: '#eab308' },
        { value: 85, color: '#ef4444' },
        { value: 97, color: '#f43f5e' },
    ];

    const stormThresholds: ThresholdLine[] = [
        { value: StormPreferences.AverageMin, color: 'rgba(255,255,255,0.45)' },
        { value: StormPreferences.PoorMin, color: '#eab308' },
        { value: StormPreferences.BadMin, color: '#ef4444' },
        { value: StormPreferences.VeryBadMin, color: '#f43f5e' },
    ];

    const windThresholds: ThresholdLine[] = [
        { value: 10, color: 'rgba(255,255,255,0.45)' },
        { value: 16, color: '#eab308' },
        { value: 23, color: '#ef4444' },
        { value: 30, color: '#f43f5e' },
    ];

    const highTemp = Math.max(...realFeelPoints.map((p) => p.value));
    const lowTemp = Math.min(...realFeelPoints.map((p) => p.value));

    const computeRealFeel = (group: ThreeHourGroup) =>
        group.hours.map((hourData) =>
            getRealFeelTemperature(
                hourData.temperature,
                getMagnitude(hourData.humidity, HumidityRanges),
                getMagnitude(hourData.wind, WindRanges),
                hourData.skyCover,
                hourData.hour
            )
        );

    const scaleGroups = allGroups ?? groups;
    const allRealFeelValues = scaleGroups.flatMap(computeRealFeel);
    const globalHighTemp = Math.max(...allRealFeelValues);
    const globalLowTemp = Math.min(...allRealFeelValues);

    const labelCount = 3;
    const labelIndices = Array.from({ length: labelCount }, (_, index) =>
        Math.round((index / (labelCount - 1)) * (realFeelPoints.length - 1))
    );

    return (
        <div>
            <div className="flex justify-between items-baseline mb-3">
                <span className="text-4xl font-bold text-white">{highTemp}°</span>
                <span className="text-4xl font-bold text-gray-400">{lowTemp}°</span>
            </div>

            <LineGraph
                title="Real Feel"
                points={realFeelPoints}
                color="#3b82f6"
                labelIndices={labelIndices}
                height={110}
                minValue={globalLowTemp}
                maxValue={globalHighTemp}
                formatYLabel={(value) => `${Math.round(value)}°`}
                thresholdLines={realFeelThresholds}
            />
            <LineGraph
                title="Storm Rating"
                points={stormRatingPoints}
                color="#a855f7"
                labelIndices={labelIndices}
                minValue={0}
                maxValue={75}
                logStrength={0.4}
                thresholdLines={[{ value: 10, color: 'rgba(255,255,255,0.45)', showYLabel: true }]}
            />

            <button
                onClick={handleExpand}
                className="w-full mt-3 py-1 text-xs text-gray-500 hover:text-gray-300 border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
            >
                {expanded ? '▲ less' : '▼ more'}
            </button>

            <div style={{ display: 'grid', gridTemplateRows: expanded ? '1fr' : '0fr', transition: 'grid-template-rows 0.2s ease' }}>
                <div style={{ overflow: 'hidden' }}>
                    <LineGraph
                        title="Cloud Cover"
                        points={skyCoverPoints}
                        color="#94a3b8"
                        labelIndices={labelIndices}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />
                    <LineGraph
                        title="Precip Chance"
                        points={precipChancePoints}
                        color="#60a5fa"
                        labelIndices={labelIndices}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />
                    <LineGraph
                        title="Wind Speed"
                        points={windPoints}
                        color="#a78bfa"
                        labelIndices={labelIndices}
                        minValue={0}
                        thresholdLines={windThresholds}
                    />
                    <LineGraph
                        title="Humidity"
                        points={humidityPoints}
                        color="#06b6d4"
                        labelIndices={labelIndices}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />

                    <MultiLineGraph
                        title="Rain / Snow / Thunder"
                        series={[
                            { points: rainPoints, color: '#60a5fa', label: 'Rain' },
                            { points: snowPoints, color: '#e2e8f0', label: 'Snow' },
                            { points: thunderPoints, color: '#fbbf24', label: 'Thunder' },
                        ]}
                        labelIndices={labelIndices}
                        minValue={0}
                        maxValue={100}
                        formatYLabel={(value) => `${value}%`}
                    />
                </div>
            </div>
        </div>
    );
}
