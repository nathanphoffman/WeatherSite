import { getDayOfTheWeek, militaryHourToRegularHour, splitIntoGroupsOf3 } from "./utility";
import { fetchAndParseNoaaForecast } from "./sources/noaaApi";
import { DayForecast, ThreeHourGroup } from "./types/forecast";
import { ThreeHourWeatherModel } from "./types/threeHourWeather";

export async function buildDayForecast(lat: string, long: string): Promise<DayForecast> {

    const { hourlyWeatherRows, uniqueDays } = await fetchAndParseNoaaForecast(lat, long);

    const hourlyWeatherRowsGroupsOf3 = splitIntoGroupsOf3(hourlyWeatherRows);

    let currentDay = uniqueDays[0];
    const dayForecast: DayForecast = {};

    const today = getDayOfTheWeek(String(currentDay));
    dayForecast[`${currentDay} ${today}`] = [];
    let dayTracker = 0;

    hourlyWeatherRowsGroupsOf3?.forEach((threeHours: ThreeHourWeatherModel[], i, allWeatherGroups) => {
        const middleHour = threeHours[1].hour;
        const prevMiddleHour = i === 0 ? 0 : allWeatherGroups[i - 1][1].hour;
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
        if (!dayForecast[dayTitle]) dayForecast[dayTitle] = [];
        dayForecast[dayTitle].push(group);
    });

    return dayForecast;
}
