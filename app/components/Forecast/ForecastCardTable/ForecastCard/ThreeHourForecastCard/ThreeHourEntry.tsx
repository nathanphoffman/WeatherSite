'use client';

import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { getMagnitude, convertNOAAChancesToAverageMagnitude, getHourRealFeel, getHourStormRating, roundStormRating } from '@/app/lib/noaa/output/calculations';
import { useMeasurementSystemProviderContext } from '@/app/components/Forecast/MeasurementSystemProvider';
import { getRealFeelMagnitude, getStormMagnitude, getHappyFaceFromMagnitude, getFreezeIconFromTemperatures, GREEN, YELLOW, RED, BRIGHT, WHITE } from '@/app/lib/noaa/output/color';
import { HumidityRanges, WindRanges } from '@/app/lib/noaa/config';
import { getAverage } from '@/app/lib/noaa/utility';
import { Magnitude } from '@/app/lib/noaa/types/general';

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

    const allThreeStormRatings = hours.map(getHourStormRating);
    const lowestStorm = Math.min(...allThreeStormRatings);
    const highestStorm = Math.max(...allThreeStormRatings);
    const stormDelta = highestStorm - lowestStorm;

    // there is no point showing unstable weather if it is unstable because of a 2, 1, 8 say
    const unstableWeather = highestStorm > 10 && (stormDelta >= lowestStorm + 5);

    const humidityMagnitude = getMagnitude(getAverage(...hours.map((hourData) => hourData.humidity)), HumidityRanges);
    const windMagnitude = getMagnitude(getAverage(...hours.map((hourData) => hourData.wind)), WindRanges);
    const thunderMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((hourData) => hourData.thunder));

    const realFeelTemperature = Math.round(getAverage(...hours.map(getHourRealFeel)) / 5) * 5;
    const stormRating = roundStormRating(getAverage(...allThreeStormRatings));

    const realFeelMagnitude = getRealFeelMagnitude(realFeelTemperature);
    const stormMagnitude = getStormMagnitude(stormRating);
    const happyFace = getHappyFaceFromMagnitude(humidityMagnitude, realFeelMagnitude, stormMagnitude);
    const freezeIcon = getFreezeIconFromTemperatures(...hours.map((hourData) => hourData.temperature));

    return (
        <li className="flex gap-3 items-baseline py-1 border-b border-gray-800 text-xl last:border-0">
            <span className="text-gray-500 w-12 mr-1">{regularTime}</span>
            <span className={magnitudeColor[realFeelMagnitude]}>{convertTemperature(realFeelTemperature)}°</span>
            {humidityMagnitude > 0 && <span className={magnitudeColor[humidityMagnitude]}>H</span>}
            <span className={magnitudeColor[stormMagnitude]}>{stormRating}</span>
            {unstableWeather && <span>⚠️</span>}
            {windMagnitude > 0 && <span className={magnitudeColor[windMagnitude]}>W</span>}
            {thunderMagnitude > 0 && <span className={magnitudeColor[thunderMagnitude]}>T</span>}
            <span>{happyFace}{freezeIcon}</span>
        </li>
    );
}
