import { ChanceForecast } from '../types/general';
import { ThreeHourWeatherModel } from '../types/threeHourWeather';
import { NoaaHourlyPeriod, NoaaPointsProperties, NoaaPrecipEntry } from '../types/noaaApiModels';



// this logic is a bit of a temporary solution for now
// these infer functions convert NOAA API output to the internal forecast model
function inferSkyCover(shortForecast: string): number {
    const forecastLower = shortForecast.toLowerCase();
    if (forecastLower.includes('mostly clear') || forecastLower.includes('mostly sunny')) return 20;
    if (forecastLower.includes('clear') || forecastLower.includes('sunny')) return 5;
    if (forecastLower.includes('partly')) return 50;
    if (forecastLower.includes('mostly cloudy')) return 75;
    return 90;
}

function precipProbToChance(prob: number): ChanceForecast {
    if (prob <= 0) return '--';
    if (prob <= 25) return 'SChc';
    if (prob <= 50) return 'Chc';
    if (prob <= 75) return 'Lkly';
    // 'Ocnl' is used here as the app's maximum probability tier, not in NOAA's literal
    // "Occasionally" sense. The ChanceForecast type does not include 'Def' (Definite),
    // so 'Ocnl' serves as the top tier for >75% probability by intentional design.
    return 'Ocnl';
}

function inferRain(shortForecast: string, temperature: number, precipChance: number): ChanceForecast {
    if (precipChance <= 0) return '--';
    const forecastLower = shortForecast.toLowerCase();
    if (temperature >= 35 || forecastLower.includes('rain') || forecastLower.includes('shower') || forecastLower.includes('drizzle')) {
        return precipProbToChance(precipChance);
    }
    return '--';
}

function inferSnow(shortForecast: string, temperature: number, precipChance: number): ChanceForecast {
    if (precipChance <= 0) return '--';
    const forecastLower = shortForecast.toLowerCase();
    if (temperature < 33 || forecastLower.includes('snow') || forecastLower.includes('flurr') || forecastLower.includes('blizzard')) {
        return precipProbToChance(precipChance);
    }
    return '--';
}

function inferThunder(shortForecast: string, precipChance: number): ChanceForecast {
    const forecastLower = shortForecast.toLowerCase();
    if (forecastLower.includes('thunder')) return precipProbToChance(precipChance);
    return '--';
}

function parseDurationHours(duration: string): number {
    const match = duration.match(/PT(\d+)H/);
    return match ? parseInt(match[1], 10) : 1;
}

function buildPrecipMapMm(values: NoaaPrecipEntry[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const { validTime, value } of values) {
        if (value === null) continue;
        const [startTimeStr, durationStr] = validTime.split('/');
        const durationHours = parseDurationHours(durationStr);
        const perHourMm = value / durationHours;
        const startTime = new Date(startTimeStr);
        for (let i = 0; i < durationHours; i++) {
            const hourTime = new Date(startTime.getTime() + i * 3600 * 1000);
            const key = hourTime.toISOString().slice(0, 13);
            map.set(key, perHourMm);
        }
    }
    return map;
}

export async function fetchAndParseNoaaForecast(lat: string, long: string): Promise<{ hourlyWeatherRows: ThreeHourWeatherModel[], uniqueDays: string[] }> {
    const headers = {
        'User-Agent': 'WeatherSite/1.0 (weather app)',
        'Accept': 'application/geo+json',
    };

    // NOAA maintains a location of grid points that lat lon point to, here we get that coarse grid position to use against their main api
    const pointsResult = await fetch(`https://api.weather.gov/points/${lat},${long}`, { headers });
    if (!pointsResult.ok) throw new Error(`NOAA points API failed: ${pointsResult.status}`);
    const pointsData = await pointsResult.json();
    const { forecastHourlyUrl, forecastGridDataUrl } = NoaaPointsProperties.formModelFromCandidate(pointsData.properties ?? {});

    const [forecastResult, gridDataResult] = await Promise.all([
        fetch(forecastHourlyUrl, { headers }),
        fetch(forecastGridDataUrl, { headers }),
    ]);
    if (!forecastResult.ok) throw new Error(`NOAA forecast API failed: ${forecastResult.status}`);
    const forecastData = await forecastResult.json();
    const gridData = gridDataResult.ok ? await gridDataResult.json() : null;
    const precipEntries: NoaaPrecipEntry[] = gridData
        ? (gridData.properties.quantitativePrecipitation?.values ?? []).map(
            (entry: unknown) => NoaaPrecipEntry.formModelFromCandidate(entry as { validTime?: unknown; value?: unknown })
          )
        : [];
    const precipMap = buildPrecipMapMm(precipEntries);

    const periods = forecastData.properties.periods;
    const seenDays = new Set<string>();
    const uniqueDays: string[] = [];
    const hourlyWeatherRows: ThreeHourWeatherModel[] = [];

    for (const rawPeriod of periods) {
        const period = NoaaHourlyPeriod.formModelFromCandidate(rawPeriod);
        const [datePortion, timePortion] = period.startTime.split('T');
        const [, monthString, dayString] = datePortion.split('-');
        const month = parseInt(monthString, 10);
        const day = parseInt(dayString, 10);
        const forecastDate = `${month}/${day}`;
        const hour = parseInt(timePortion.split(':')[0], 10);

        if (!seenDays.has(forecastDate)) {
            seenDays.add(forecastDate);
            uniqueDays.push(forecastDate);
        }

        const temperature = period.temperatureUnit === 'C'
            ? Math.round(period.temperature * 9 / 5 + 32)
            : period.temperature;

        // NOAA returns windSpeed as a string like "5 mph" or "10 mph"; parseInt handles the " mph" suffix correctly.
        // Upper-bound range validation is not applied here — it occurs downstream in ThreeHourWeatherModel.formModelFromCandidate via isBelowSpeedOfSound.
        const windSpeed = parseInt(period.windSpeed) || 0;
        const { humidity, precipChance, shortForecast } = period;
        const skyCover = inferSkyCover(shortForecast);

        const periodUtcKey = new Date(period.startTime).toISOString().slice(0, 13);
        const precipAmountMm = precipMap.get(periodUtcKey) ?? 0;
        const precipAmount = Math.round((precipAmountMm / 25.4) * 100) / 100;

        hourlyWeatherRows.push(ThreeHourWeatherModel.formModelFromCandidate({
            temperature,
            skyCover,
            wind: windSpeed,
            humidity,
            precipChance,
            precipAmount,
            rain: inferRain(shortForecast, temperature, precipChance),
            snow: inferSnow(shortForecast, temperature, precipChance),
            thunder: inferThunder(shortForecast, precipChance),
            hour,
        }));
    }

    return { hourlyWeatherRows, uniqueDays };
}
