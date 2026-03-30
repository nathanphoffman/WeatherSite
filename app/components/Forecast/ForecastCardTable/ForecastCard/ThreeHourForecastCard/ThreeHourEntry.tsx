'use client';

import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { getMagnitude, convertNOAAChancesToAverageMagnitude, getHourRealFeel, getHourStormRating, roundStormRating } from '@/app/lib/noaa/output/calculations';
import { useMeasurementSystemProviderContext } from '@/app/components/Forecast/MeasurementSystemProvider';
import { getRealFeelMagnitude, getStormMagnitude, getHappyFaceFromMagnitude, getFreezeIconFromTemperatures, GREEN, YELLOW, RED, BRIGHT, WHITE } from '@/app/lib/noaa/output/color';
import { HumidityRanges, WindRanges } from '@/app/lib/noaa/config';
import { getAverage } from '@/app/lib/noaa/utility';
import { Magnitude } from '@/app/lib/noaa/types/general';
import Tooltip from './Tooltip';
import { buildEntryTooltips } from './tooltipText';

const magnitudeColor: Record<Magnitude, string> = {
    0: GREEN,
    1: WHITE,
    2: YELLOW,
    3: RED,
    4: BRIGHT,
};

interface ThreeHourEntryProps {
    group: ThreeHourGroup;
}

export default function ThreeHourEntry({ group }: ThreeHourEntryProps) {
    const { convertTemperature } = useMeasurementSystemProviderContext();
    const { regularTime, hours } = group;

    const temperatures = hours.map((h) => h.temperature);
    const humidities = hours.map((h) => h.humidity);
    const winds = hours.map((h) => h.wind);

    const allThreeStormRatings = hours.map(getHourStormRating);
    const lowestStorm = Math.min(...allThreeStormRatings);
    const highestStorm = Math.max(...allThreeStormRatings);
    const stormDelta = highestStorm - lowestStorm;

    // there is no point showing unstable weather if it is unstable because of a 2, 1, 8 say
    const unstableWeather = highestStorm > 10 && (stormDelta >= lowestStorm + 5);

    const humidityMagnitude = getMagnitude(getAverage(...humidities), HumidityRanges);
    const windMagnitude = getMagnitude(getAverage(...winds), WindRanges);
    const thunderMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((hourData) => hourData.thunder));

    const realFeelTemperature = Math.round(getAverage(...hours.map(getHourRealFeel)) / 5) * 5;
    const stormRating = roundStormRating(getAverage(...allThreeStormRatings));

    const realFeelMagnitude = getRealFeelMagnitude(realFeelTemperature);
    const stormMagnitude = getStormMagnitude(stormRating);
    const happyFace = getHappyFaceFromMagnitude(humidityMagnitude, realFeelMagnitude, stormMagnitude);
    const freezeIcon = getFreezeIconFromTemperatures(...temperatures);
    const statusIcon = unstableWeather ? '⚠️' : freezeIcon.trim() ? freezeIcon : happyFace;

    const tooltips = buildEntryTooltips({
        avgTemp: Math.round(getAverage(...temperatures)),
        avgHumidity: Math.round(getAverage(...humidities)),
        avgWind: Math.round(getAverage(...winds)),
        avgSkyCover: Math.round(getAverage(...hours.map((h) => h.skyCover))),
        avgPrecipChance: Math.round(getAverage(...hours.map((h) => h.precipChance))),
        avgSnowMagnitude: convertNOAAChancesToAverageMagnitude(...hours.map((h) => h.snow)),
        stormRating,
        thunderMagnitude,
        unstableWeather,
        lowestStorm,
        highestStorm,
        freezeIcon,
        happyFace,
        convertTemperature,
    });

    return (
        <tr className="border-b border-gray-800 last:border-0">
            <td className="py-1 pr-4 text-gray-500 border-r border-dotted border-gray-700">{regularTime}</td>
            <td className="py-1 px-4 border-r border-dotted border-gray-700">
                <span className={magnitudeColor[realFeelMagnitude]}>
                    <Tooltip text={tooltips.realFeel}>
                        <span>{convertTemperature(realFeelTemperature)}°</span>
                    </Tooltip>
                    {humidityMagnitude > 0 && (
                        <Tooltip text={tooltips.humidity}>
                            <span className={`ml-1 ${magnitudeColor[humidityMagnitude]}`}>H</span>
                        </Tooltip>
                    )}
                </span>
            </td>
            <td className={`py-1 px-2 border-r border-dotted border-gray-700 whitespace-nowrap ${magnitudeColor[stormMagnitude]}`}>
                <Tooltip text={tooltips.storm}>
                    <span>{stormRating}</span>
                </Tooltip>
                {(windMagnitude > 0 || thunderMagnitude > 0) && <span className="ml-1">
                    {windMagnitude > 0 && (
                        <Tooltip text={tooltips.wind}>
                            <span className={magnitudeColor[windMagnitude]}>W</span>
                        </Tooltip>
                    )}
                    {thunderMagnitude > 0 && (
                        <Tooltip text={tooltips.thunder}>
                            <span className={magnitudeColor[thunderMagnitude]}>T</span>
                        </Tooltip>
                    )}
                </span>}
            </td>
            <td className="py-1 pl-4">
                {statusIcon.trim() ? (
                    <Tooltip text={tooltips.status} align="right">{statusIcon}</Tooltip>
                ) : statusIcon}
            </td>
        </tr>
    );
}
