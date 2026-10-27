import { roundStormRating } from '@/app/lib/noaa/output/calculations';
import { Magnitude } from '@/app/lib/noaa/types/general';

// plain-language labels exist so the tooltips are readable without knowing the underlying numbers
function getSkyCoverLabel(skyCover: number): string {
    if (skyCover <= 20) return 'Clear';

    if (skyCover <= 40) return 'Mostly clear';

    if (skyCover <= 60) return 'Partly cloudy';

    if (skyCover <= 80) return 'Mostly cloudy';

    return 'Overcast';
}

// turns a precipitation percentage into wording a reader can act on
function getPrecipLabel(precipChance: number): string {
    if (precipChance <= 5) return 'No precipitation';

    if (precipChance <= 20) return `Small chance of rain (${precipChance}%)`;

    if (precipChance <= 50) return `Chance of rain (${precipChance}%)`;

    if (precipChance <= 80) return `Rain likely (${precipChance}%)`;

    return `Rain expected (${precipChance}%)`;
}

// category cutoffs are in mph; the displayed speed is already converted to the chosen unit
function getWindLabel(windMph: number, displayedWind: number, windUnit: string): string {
    const speed = `${displayedWind} ${windUnit}`;

    if (windMph <= 9) return `Calm (${speed})`;

    if (windMph <= 15) return `Light winds (${speed})`;

    if (windMph <= 22) return `Moderate winds (${speed})`;

    if (windMph <= 29) return `Strong winds (${speed})`;

    return `High winds (${speed})`;
}

// cutoffs match HumidityRanges so the label agrees with the H marker shown in the row
function getHumidityLabel(humidity: number): string {
    if (humidity <= 60) return 'Comfortable';

    if (humidity <= 72) return 'Slightly humid';

    if (humidity <= 84) return 'Humid';

    if (humidity <= 96) return 'Very humid';

    return 'Extremely humid';
}

// turns the numeric storm rating into wording a reader can act on
function getStormLabel(stormRating: number): string {
    if (stormRating < 8) return 'Good conditions';

    if (stormRating < 20) return 'Average conditions';

    if (stormRating < 30) return 'Poor conditions';

    if (stormRating < 50) return 'Bad conditions';

    return 'Severe conditions';
}

// thunder and snow are stored as magnitudes (0-4), not percentages, so they get their own wording
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
    averageTemperature: number;
    averageHumidity: number;
    averageWind: number;
    averageSkyCover: number;
    averagePrecipChance: number;
    averageSnowMagnitude: Magnitude;
    stormRating: number;
    thunderMagnitude: Magnitude;
    unstableWeather: boolean;
    lowestStorm: number;
    highestStorm: number;
    freezeIcon: string;
    happyFace: string;
    convertWindSpeed: (mph: number) => number;
    windUnit: string;
    convertTemperature: (temperature: number) => number;
}

// all tooltip text is built in one place so the row component stays free of wording logic
export function buildEntryTooltips(inputs: EntryTooltipInputs): EntryTooltips {
    const {
        averageTemperature, averageHumidity, averageWind, averageSkyCover, averagePrecipChance, averageSnowMagnitude,
        stormRating, thunderMagnitude, unstableWeather, lowestStorm, highestStorm,
        freezeIcon, happyFace, convertTemperature, convertWindSpeed, windUnit,
    } = inputs;

    const realFeel = `Avg actual: ${convertTemperature(averageTemperature)}°\nReal feel adjusts for humidity, wind, and sun`;

    const humidity = `Humidity: ${averageHumidity}%\n${getHumidityLabel(averageHumidity)}`;

    const storm = [
        getStormLabel(stormRating),
        `Sky: ${averageSkyCover}% — ${getSkyCoverLabel(averageSkyCover)}`,
        getPrecipLabel(averagePrecipChance),
        averageSnowMagnitude > 0 ? `Snow: ${getMagnitudeChanceLabel(averageSnowMagnitude)}` : null,
    ].filter(Boolean).join('\n');

    const wind = `Wind: ${getWindLabel(averageWind, convertWindSpeed(averageWind), windUnit)}`;

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
