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

    const forecastResult = await fetch(forecastHourlyUrl, { headers });
    if (!forecastResult.ok) throw `NOAA forecast API failed: ${forecastResult.status}`;
    const forecastData = await forecastResult.json();

    const periods = forecastData.properties.periods as any[];
    const seenDays = new Set<string>();
    const uniqueDays: string[] = [];
    const hourlyWeatherRows: ThreeHourWeatherModel[] = [];

    for (const period of periods) {
        const startDate = new Date(period.startTime);
        const month = startDate.getMonth() + 1;
        const day = startDate.getDate();
        const forecastDate = `${month}/${day}`;
        const hour = startDate.getHours();

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

        hourlyWeatherRows.push({
            temperature,
            skyCover,
            wind: windSpeed,
            humidity,
            precipChance,
            rain: inferRain(shortForecast, temperature, precipChance),
            snow: inferSnow(shortForecast, temperature, precipChance),
            thunder: inferThunder(shortForecast, precipChance),
            hour,
        });
    }

    return { hourlyWeatherRows, uniqueDays };
}
