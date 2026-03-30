import { ChanceRanges, HumidityRanges, WindRanges } from "../config";
import { Magnitude, MagnitudeRange } from "../types/general";
import { getAverage } from "../utility";

export function convertNOAAChancesToAverageMagnitude(...chances: string[]): Magnitude {
    const magnitudes = chances.map((chance) => getMagnitude(chance, ChanceRanges));
    const averageMagnitude = getAverage(...magnitudes);
    if (averageMagnitude > 4) return 4 as Magnitude;
    else if (averageMagnitude >= 0) return averageMagnitude as Magnitude;
    else throw new Error("the average chance calculation was beyond the expected range of values");
}

export function isInRange(value: number | string, range: number[] | string) {
    if (typeof value === 'string' && typeof range === 'string') return value === range;
    else if (typeof value === 'number' && typeof range === 'string') return ChanceRanges[Number(value) as Magnitude] === range;
    else if (typeof value === 'number' && typeof range === 'object' && range.length === 2) {
        if (range[0] === -1 && value <= range[1]) return true;
        if (range[1] === -1 && value >= range[0]) return true;
        else return range[0] <= value && value <= range[1];
    }
    else throw new Error("an unexpected type was encountered when performing a range comparison");
}

export function getMagnitude(value: number | string, range: MagnitudeRange): Magnitude {
    const magnitude = Object.keys(range).find(key => isInRange(value, range[Number(key) as Magnitude]));

    if (magnitude === undefined) throw new Error(`no magnitude found for value: ${value}`);
    return Number(magnitude) as Magnitude;
}

export function getRealFeelTemperature(temperature: number, humidity: number, wind: number, averageSkyCover: number, hour: number) {
    // this is a rough approximation, simply adjusting by steps of 5 based on the calculated magnitude of these factors (the number of W and H letters in the output)

    const SUNRISE = 7 as const;
    const SUNSET = 18 as const;
    const MIDDAY = (SUNRISE + SUNSET) / 2;
    const HALF_DAY_SPAN = MIDDAY - SUNRISE;

    const isDayTime = hour > SUNRISE && hour < SUNSET;

    // humidity matters more in heat — scale up above 50°F, minimum of 0.5 at low temps, capped at 2 to avoid runaway at extreme heat
    const humidityScale = Math.min((temperature - 50) / 30 + 0.5, 2);

    // wind matters more in cold — scale up below 60°F, minimum of 0.5 at high temps, capped at 2 to avoid runaway at extreme cold
    const windScale = Math.min(Math.max((60 - temperature) / 30 + 0.5, 0.5), 2);

    // the reason for the reduction in temperature of -4.5 is that being outside in the shade even in calm breeze has more windflow than indoors, and outdoor temperatures do already include sunlight to some extent
    let realFeel = temperature + 1.5 * humidity * humidityScale - 6 * wind * windScale - 4.5;

    if (isDayTime && averageSkyCover < 95) {
        const dayTimeAmount = HALF_DAY_SPAN - Math.abs(MIDDAY - hour);
        realFeel += dayTimeAmount * 2 * ((100 - averageSkyCover) / 100);
    }

    return realFeel;
}

export function isAnyTemperatureFreezing(...temperatures: string[]) {
    const freezingTemperatures = temperatures.find(temperature => Number(temperature) < 33);
    return (freezingTemperatures?.length ?? 0) > 0;
}

export function getHourRealFeel(hourData: {
    temperature: number;
    humidity: number;
    wind: number;
    skyCover: number;
    hour: number;
}): number {
    return getRealFeelTemperature(
        hourData.temperature,
        getMagnitude(hourData.humidity, HumidityRanges),
        getMagnitude(hourData.wind, WindRanges),
        hourData.skyCover,
        hourData.hour
    );
}

export function getHourStormRating(hourData: {
    skyCover: number;
    precipChance: number;
    precipAmount: number;
    snow: string;
    wind: number;
    thunder: string;
    humidity: number;
}): number {
    return getStormRating(
        hourData.skyCover,
        hourData.precipChance,
        hourData.precipAmount,
        getMagnitude(hourData.snow, ChanceRanges),
        getMagnitude(hourData.wind, WindRanges),
        getMagnitude(hourData.thunder, ChanceRanges),
        getMagnitude(hourData.humidity, HumidityRanges)
    );
}

export function getStormRating(skyCover: number, precipChance: number, precipAmount: number, snowMagnitude: Magnitude, windMagnitude: Magnitude, thunderMagnitude: Magnitude, humidityMagnitude: Magnitude) {

    // max 10
    const skyCoverOutOf10 = 10 * (skyCover / 100);

    // max 20 (mag 4 requires "Ocnl" thunder category, which is rare)
    const thunderPenalty = thunderMagnitude * 5;

    // max 24 — rescaled from windMagnitude³/2 to leave room for precip contribution
    const windPenalty = windMagnitude * windMagnitude * 1.5;

    // ~max 40
    const precipPenalty = (precipChance / 100) * Math.min(precipAmount * (snowMagnitude + 1) * 20, 10);

    // max: 2.5: the reason for this small penalty is to account for haze
    const humidityPenalty = humidityMagnitude / 2;

    const rawRating = skyCoverOutOf10 + windPenalty + precipPenalty + thunderPenalty + humidityPenalty;
    return Math.min(rawRating, 50);
}

export function roundStormRating(rating: number): number {
    if (rating < 10) return Math.round(rating);
    return roundToNearestFive(rating);
}

export function roundToNearestFive(num: number) {
    return Math.round(num / 5) * 5;
}
