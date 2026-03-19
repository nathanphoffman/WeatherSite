import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { getMagnitude, convertNOAAChancesToAverageMagnitude, getRealFeelTemperature, getStormRating } from '@/app/lib/noaa/output/calculations';
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

interface WeatherEntryProps {
    group: ThreeHourGroup;
}

export default function WeatherEntry({ group }: WeatherEntryProps) {
    const { regularTime, middleHour, hours } = group;

    const allThreeStormRatings = hours.map((weatherRow) => {
        const { wind, thunder, rain, snow, skyCover, precipChance } = weatherRow;
        const windMagnitude = getMagnitude(Number(wind), WindRanges);
        const thunderMagnitude = convertNOAAChancesToAverageMagnitude(thunder);
        const rainMagnitude = convertNOAAChancesToAverageMagnitude(rain);
        const snowMagnitude = convertNOAAChancesToAverageMagnitude(snow);
        return Number(getStormRating(skyCover, precipChance, rainMagnitude, snowMagnitude, windMagnitude, thunderMagnitude));
    });

    const lowestStorm = Math.min(...allThreeStormRatings);
    const highestStorm = Math.max(...allThreeStormRatings);
    const stormDelta = highestStorm - lowestStorm;
    const unstableWeather = stormDelta >= lowestStorm + 5;

    const humidity = hours.map(h => h.humidity);
    const wind = hours.map(h => h.wind);
    const thunder = hours.map(h => h.thunder);
    const rain = hours.map(h => h.rain);
    const snow = hours.map(h => h.snow);
    const skyCover = hours.map(h => h.skyCover);
    const temperature = hours.map(h => h.temperature);
    const precipChance = hours.map(h => h.precipChance);

    const humidityMagnitude = getMagnitude(getAverage(...humidity), HumidityRanges);
    const windMagnitude = getMagnitude(getAverage(...wind), WindRanges);
    const thunderMagnitude = convertNOAAChancesToAverageMagnitude(...thunder);
    const rainMagnitude = convertNOAAChancesToAverageMagnitude(...rain);
    const snowMagnitude = convertNOAAChancesToAverageMagnitude(...snow);

    const averageSkyCover = getAverage(...skyCover);
    const realFeelTemperature = getRealFeelTemperature(getAverage(...temperature), humidityMagnitude, windMagnitude, averageSkyCover, middleHour);
    const stormRating = getStormRating(averageSkyCover, getAverage(...precipChance), rainMagnitude, snowMagnitude, windMagnitude, thunderMagnitude);

    const realFeelMagnitude = getRealFeelMagnitude(realFeelTemperature);
    const stormMagnitude = getStormMagnitude(stormRating);
    const happyFace = getHappyFaceFromMagnitude(humidityMagnitude, realFeelMagnitude, stormMagnitude);
    const freezeIcon = getFreezeIconFromTemperatures(...temperature);

    return (
        <div className="flex gap-3 items-baseline py-1 border-b border-gray-800 text-xl last:border-0">
            <span className="text-gray-500 w-12">{regularTime}</span>
            <span className={magnitudeColor[realFeelMagnitude]}>{realFeelTemperature}°</span>
            {humidityMagnitude > 0 && <span className={magnitudeColor[humidityMagnitude]}>H</span>}
            <span className={magnitudeColor[stormMagnitude]}>{stormRating}</span>
            {unstableWeather && <span>⚠️</span>}
            {windMagnitude > 0 && <span className={magnitudeColor[windMagnitude]}>W</span>}
            {thunderMagnitude > 0 && <span className={magnitudeColor[thunderMagnitude]}>T</span>}
            <span>{happyFace}{freezeIcon}</span>
        </div>
    );
}
