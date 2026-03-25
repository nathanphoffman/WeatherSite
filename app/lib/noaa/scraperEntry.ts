import { getDayOfTheWeek, militaryHourToRegularHour, splitIntoGroupsOf3 } from "./utility";
import { getParseScrapedData } from "./scraper";
import { fetchAndParseNoaaForecast } from "./sources/noaaApi";
import { DayForecast, ThreeHourGroup } from "./types/forecast";
import { ThreeHourWeatherModel } from "./types/threeHourWeather";

export async function buildDayForecast(lat: string, long: string, source: 'scraper' | 'api' = 'scraper'): Promise<DayForecast> {

    const { hourlyWeatherRows, uniqueDays } = source === 'api'
        ? await fetchAndParseNoaaForecast(lat, long)
        : await getParseScrapedData(lat, long);

        // !! note: we need to rename this weather3 deal -- it now refers to singular hours
    const hourlyWeatherRowsGroupsOf3 = splitIntoGroupsOf3(hourlyWeatherRows);

    let currentDay = uniqueDays[0];
    const obj: DayForecast = {};

    const today = getDayOfTheWeek(String(currentDay));
    obj[`${currentDay} ${today}`] = [];
    let dayTracker = 0;

    hourlyWeatherRowsGroupsOf3?.forEach((threeHours: ThreeHourWeatherModel[], i, arr) => {
        const middleHour = threeHours[1].hour;
        const prevMiddleHour = i === 0 ? 0 : arr[i - 1][1].hour;
        let dayOfTheWeek = getDayOfTheWeek(String(currentDay));

        // days of the week are scraped separately from data so we determine which days belong to which hours here
        if (Number(prevMiddleHour) > Number(middleHour)) {
            currentDay = uniqueDays[++dayTracker];
            dayOfTheWeek = getDayOfTheWeek(String(currentDay));
        }

        const group: ThreeHourGroup = {
            regularTime: militaryHourToRegularHour(middleHour),
            middleHour,
            hours: threeHours as [ThreeHourWeatherModel, ThreeHourWeatherModel, ThreeHourWeatherModel],
        };

        const dayTitle = `${currentDay} ${dayOfTheWeek}`;
        if (!obj[dayTitle]) obj[dayTitle] = [];
        obj[dayTitle].push(group);
    });

    return obj;
}
