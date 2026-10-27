import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { getMagnitude, convertNOAAChancesToAverageMagnitude, getHourRealFeel, getHourStormRating, roundStormRating } from '@/app/lib/noaa/output/calculations';
import { getRealFeelMagnitude, getStormMagnitude, getHappyFaceFromMagnitude, getFreezeIconFromTemperatures } from '@/app/lib/noaa/output/color';
import { HumidityRanges, WindRanges } from '@/app/lib/noaa/config';
import { getAverage } from '@/app/lib/noaa/utility';

export function getThreeHourEntrySummary(hours: ThreeHourGroup['hours']) {
    const temperatures = hours.map((hourData) => hourData.temperature);
    const humidities = hours.map((hourData) => hourData.humidity);
    const winds = hours.map((hourData) => hourData.wind);

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

    const hasFreezeIcon = freezeIcon.trim() !== '';
    const statusIcon = unstableWeather ? '⚠️' : hasFreezeIcon ? freezeIcon : happyFace;

    return {
        humidityMagnitude, windMagnitude, thunderMagnitude, stormMagnitude, realFeelMagnitude,
        realFeelTemperature, stormRating, unstableWeather, lowestStorm, highestStorm,
        freezeIcon, happyFace, statusIcon,
        averageTemperature: Math.round(getAverage(...temperatures)),
        averageHumidity: Math.round(getAverage(...humidities)),
        averageWind: Math.round(getAverage(...winds)),
        averageSkyCover: Math.round(getAverage(...hours.map((hourData) => hourData.skyCover))),
        averagePrecipChance: Math.round(getAverage(...hours.map((hourData) => hourData.precipChance))),
        averageSnowMagnitude: convertNOAAChancesToAverageMagnitude(...hours.map((hourData) => hourData.snow)),
    };
}
