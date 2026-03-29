import { roundStormRating } from '@/app/lib/noaa/output/calculations';
import { Magnitude } from '@/app/lib/noaa/types/general';

function getSkyCoverLabel(skyCover: number): string {
    if (skyCover <= 20) return 'Clear';
    if (skyCover <= 40) return 'Mostly clear';
    if (skyCover <= 60) return 'Partly cloudy';
    if (skyCover <= 80) return 'Mostly cloudy';
    return 'Overcast';
}

function getPrecipLabel(precipChance: number): string {
    if (precipChance <= 5) return 'No precipitation';
    if (precipChance <= 20) return `Small chance of rain (${precipChance}%)`;
    if (precipChance <= 50) return `Chance of rain (${precipChance}%)`;
    if (precipChance <= 80) return `Rain likely (${precipChance}%)`;
    return `Rain expected (${precipChance}%)`;
}

function getWindLabel(wind: number): string {
    if (wind <= 9) return `Calm (${wind} mph)`;
    if (wind <= 15) return `Light winds (${wind} mph)`;
    if (wind <= 22) return `Moderate winds (${wind} mph)`;
    if (wind <= 29) return `Strong winds (${wind} mph)`;
    return `High winds (${wind} mph)`;
}

function getHumidityLabel(humidity: number): string {
    if (humidity <= 60) return 'Comfortable';
    if (humidity <= 72) return 'Slightly humid';
    if (humidity <= 84) return 'Humid';
    if (humidity <= 96) return 'Very humid';
    return 'Extremely humid';
}

function getStormLabel(stormRating: number): string {
    if (stormRating < 8) return 'Good conditions';
    if (stormRating < 20) return 'Average conditions';
    if (stormRating < 30) return 'Poor conditions';
    if (stormRating < 50) return 'Bad conditions';
    return 'Severe conditions';
}

function getMagnitudeChanceLabel(magnitude: Magnitude): string {
    switch (magnitude) {
        case 0: return 'No chance';
        case 1: return 'Small chance';
        case 2: return 'Chance';
        case 3: return 'Likely';
        case 4: return 'Occasional';
    }
}

export interface EntryTooltips {
    realFeel: string;
    humidity: string;
    storm: string;
    wind: string;
    thunder: string;
    status: string;
}

export interface EntryTooltipInputs {
    avgTemp: number;
    avgHumidity: number;
    avgWind: number;
    avgSkyCover: number;
    avgPrecipChance: number;
    avgSnowMagnitude: Magnitude;
    stormRating: number;
    thunderMagnitude: Magnitude;
    unstableWeather: boolean;
    lowestStorm: number;
    highestStorm: number;
    freezeIcon: string;
    happyFace: string;
    convertTemperature: (temp: number) => number;
}

export function buildEntryTooltips(inputs: EntryTooltipInputs): EntryTooltips {
    const {
        avgTemp, avgHumidity, avgWind, avgSkyCover, avgPrecipChance, avgSnowMagnitude,
        stormRating, thunderMagnitude, unstableWeather, lowestStorm, highestStorm,
        freezeIcon, happyFace, convertTemperature,
    } = inputs;

    const realFeel = `Avg actual: ${convertTemperature(avgTemp)}°\nReal feel adjusts for humidity, wind, and sun`;

    const humidity = `Humidity: ${avgHumidity}%\n${getHumidityLabel(avgHumidity)}`;

    const storm = [
        getStormLabel(stormRating),
        `Sky: ${avgSkyCover}% — ${getSkyCoverLabel(avgSkyCover)}`,
        getPrecipLabel(avgPrecipChance),
        avgSnowMagnitude > 0 ? `Snow: ${getMagnitudeChanceLabel(avgSnowMagnitude)}` : null,
    ].filter(Boolean).join('\n');

    const wind = `Wind: ${getWindLabel(avgWind)}`;

    const thunder = `Thunder: ${getMagnitudeChanceLabel(thunderMagnitude)}`;

    const status = unstableWeather
        ? `Unstable conditions\nStorm factor ranges from ${roundStormRating(lowestStorm)} to ${roundStormRating(highestStorm)} this period`
        : freezeIcon.trim()
        ? 'Freezing temperatures expected'
        : happyFace === '😎'
        ? 'Comfortable conditions all around'
        : 'Generally decent conditions';

    return { realFeel, humidity, storm, wind, thunder, status };
}
