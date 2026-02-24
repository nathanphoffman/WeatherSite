// https://forecast.weather.gov/MapClick.php?lat=40.1852&lon=-75.538&lg=english&&FcstType=digital

import { getDayOfTheWeek, splitIntoGroupsOf3 } from "./utility";
//import { Table } from 'console-table-printer';
import { getWeatherLines } from "./output";
import { getParseScrapedData } from "./scraper";

export async function run(): Promise<{[key: string]: string[]}> {

    const { hourlyWeatherRows, uniqueDays } = await getParseScrapedData();
    const hourlyWeatherRowsGroupsOf3 = splitIntoGroupsOf3(hourlyWeatherRows);
    const weatherLines = getWeatherLines(hourlyWeatherRowsGroupsOf3);

    let currentDay = uniqueDays[0];
    const obj: {[key: string]: string[]} = {};

    const today = getDayOfTheWeek(String(currentDay));
    obj[`${currentDay} ${today}`] = [];
    let dayTracker = 0;

    weatherLines.forEach(({ middleHour, weatherLine, regularTime }, i, arr) => {

        const prevMiddleHour = i === 0 ? 0 : arr[i - 1].middleHour;
        let dayOfTheWeek = getDayOfTheWeek(String(currentDay));

        // days of the week are scraped separate from data so we detemine which days belong to which hours here
        if (Number(prevMiddleHour) > Number(middleHour)) {
            currentDay = uniqueDays[++dayTracker];
            dayOfTheWeek = getDayOfTheWeek(String(currentDay));
        }

        pushDay();

        function pushDay() {
            const dayTitle = `${currentDay} ${dayOfTheWeek}`;
            if(!obj[dayTitle]) obj[dayTitle] = [];
            obj[dayTitle].push(`${regularTime}: ${weatherLine}`);
        }

    });

    return obj;

}
