import { ChanceForeast } from '../types/general';
import { ThreeHourWeatherModel } from '../types/threeHourWeather';



// this logic is a bit of a temporary solution for now
// this series of infer functions just converts api output from noaa to what the scraper logic predicts as what is shown on the site differs from the api
function inferSkyCover(shortForecast: string): number {
    const f = shortForecast.toLowerCase();
    if (f.includes('mostly clear') || f.includes('mostly sunny')) return 20;
    if (f.includes('clear') || f.includes('sunny')) return 5;
    if (f.includes('partly')) return 50;
    if (f.includes('mostly cloudy')) return 75;
    return 90;
}

function precipProbToChance(prob: number): ChanceForeast {
    if (prob <= 0) return '--';
    if (prob <= 25) return 'SChc';
    if (prob <= 50) return 'Chc';
    if (prob <= 75) return 'Lkly';
    return 'Ocnl';
}

function inferRain(shortForecast: string, temperature: number, precipChance: number): ChanceForeast {
    if (precipChance <= 0) return '--';
    const f = shortForecast.toLowerCase();
    if (temperature >= 35 || f.includes('rain') || f.includes('shower') || f.includes('drizzle')) {
        return precipProbToChance(precipChance);
    }
    return '--';
}

function inferSnow(shortForecast: string, temperature: number, precipChance: number): ChanceForeast {
    if (precipChance <= 0) return '--';
    const f = shortForecast.toLowerCase();
    if (temperature < 33 || f.includes('snow') || f.includes('flurr') || f.includes('blizzard')) {
        return precipProbToChance(precipChance);
    }
    return '--';
}

function inferThunder(shortForecast: string, precipChance: number): ChanceForeast {
    const f = shortForecast.toLowerCase();
    if (f.includes('thunder')) return precipProbToChance(precipChance);
    return '--';
}

function parseDurationHours(duration: string): number {
    const match = duration.match(/PT(\d+)H/);
    return match ? parseInt(match[1], 10) : 1;
}

function buildPrecipMapMm(values: { validTime: string; value: number | null }[]): Map<string, number> {
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

export async function getParseApiData(lat: string, lon: string): Promise<{ hourlyWeatherRows: ThreeHourWeatherModel[], uniqueDays: string[] }> {
    const headers = {
        'User-Agent': 'WeatherSite/1.0 (weather app)',
        'Accept': 'application/geo+json',
    };

    // NOAA maintains a location of grid points that lat lon point to, here we get that coarse grid position to use against their main api
    const pointsResult = await fetch(`https://api.weather.gov/points/${lat},${lon}`, { headers });
    if (!pointsResult.ok) throw `NOAA points API failed: ${pointsResult.status}`;
    const pointsData = await pointsResult.json();
    const forecastHourlyUrl = pointsData.properties.forecastHourly;
    const forecastGridDataUrl = pointsData.properties.forecastGridData;

    const [forecastResult, gridDataResult] = await Promise.all([
        fetch(forecastHourlyUrl, { headers }),
        fetch(forecastGridDataUrl, { headers }),
    ]);
    if (!forecastResult.ok) throw `NOAA forecast API failed: ${forecastResult.status}`;
    const forecastData = await forecastResult.json();
    const gridData = gridDataResult.ok ? await gridDataResult.json() : null;
    const precipMap = gridData
        ? buildPrecipMapMm(gridData.properties.quantitativePrecipitation?.values ?? [])
        : new Map<string, number>();

    const periods = forecastData.properties.periods;
    const seenDays = new Set<string>();
    const uniqueDays: string[] = [];
    const hourlyWeatherRows: ThreeHourWeatherModel[] = [];

    for (const period of periods) {
        const [datePart, timePart] = (period.startTime as string).split('T');
        const [, monthStr, dayStr] = datePart.split('-');
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        const forecastDate = `${month}/${day}`;
        const hour = parseInt(timePart.split(':')[0], 10);

        if (!seenDays.has(forecastDate)) {
            seenDays.add(forecastDate);
            uniqueDays.push(forecastDate);
        }

        const temperature = period.temperatureUnit === 'C'
            ? Math.round(period.temperature * 9 / 5 + 32)
            : period.temperature;

        const windSpeed = parseInt(period.windSpeed) || 0;
        const humidity = period.relativeHumidity?.value ?? 50;
        const precipChance = period.probabilityOfPrecipitation?.value ?? 0;
        const shortForecast: string = period.shortForecast ?? '';
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
