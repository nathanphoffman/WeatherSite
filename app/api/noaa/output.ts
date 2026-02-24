import { convertNOAAChancesToAverageMagnitude, getMagnitude, getRealFeelTemperature, getStormRating } from "./output/calculations";
import { getFreezeIconFromTemperatures, getHappyFaceFromMagnitude, getRealFeelMagnitude, getStormMagnitude } from "./output/color";
import { HumidityRanges, WindRanges } from "./config";
import { getPostfix, getWithColor } from "./output/postfix";
import { getAverage, militaryHourToRegularHour } from "./utility";
import { ThreeHourWeatherModel } from "./types/threeHourWeather";

export function getWeatherLines(hourlyWeatherRowsGroupsOf3: ThreeHourWeatherModel[][]) {

    const weatherLines = hourlyWeatherRowsGroupsOf3.map((threeHours: ThreeHourWeatherModel[]) => {
        const middleHour = threeHours[1].hour;
        const regularTime = militaryHourToRegularHour(middleHour);

        const allThreeStormRatings = threeHours.map((weatherRow)=>{
            const { wind, thunder, rain, snow, skyCover, precipChance } = weatherRow;

            const windMagnitude = getMagnitude(Number(wind), WindRanges);
            const thunderMagnitude = convertNOAAChancesToAverageMagnitude(thunder);
            const rainMagnitude = convertNOAAChancesToAverageMagnitude(rain);
            const snowMagnitude = convertNOAAChancesToAverageMagnitude(snow);

            return Number(getStormRating(skyCover, precipChance, rainMagnitude, snowMagnitude, windMagnitude, thunderMagnitude));
        });

        const lowestStorm = Math.min(...allThreeStormRatings);
        const highestStorm = Math.max(...allThreeStormRatings);
        const stormDelta = highestStorm-lowestStorm;

        const unstableWeatherIcon = stormDelta >= lowestStorm + 5 ? "⚠️" : "";

        const humidity = threeHours.map(x => x.humidity);
        const wind = threeHours.map(x => x.wind);
        const thunder = threeHours.map(x => x.thunder);
        const rain = threeHours.map(x => x.rain);
        const snow = threeHours.map(x => x.snow);
        const skyCover = threeHours.map(x => x.skyCover);
        const temperature = threeHours.map(x => x.temperature);
        const precipChance = threeHours.map(x => x.precipChance);

        // Magnitudes
        const humidityMagnitude = getMagnitude(getAverage(...humidity), HumidityRanges);
        const windMagnitude = getMagnitude(getAverage(...wind), WindRanges);
        const thunderMagnitude = convertNOAAChancesToAverageMagnitude(...thunder);
        const rainMagnitude = convertNOAAChancesToAverageMagnitude(...rain);
        const snowMagnitude = convertNOAAChancesToAverageMagnitude(...snow);

        const humidityPostFix = getPostfix(humidityMagnitude, "H");
        const windPostFix = getPostfix(windMagnitude, "W");
        const thunderPostFix = getPostfix(thunderMagnitude, "T");

        const averageSkyCover = getAverage(...skyCover);
        const realFeelTemperature = getRealFeelTemperature(getAverage(...temperature), humidityMagnitude, windMagnitude, averageSkyCover, middleHour);
        const stormRating = getStormRating(averageSkyCover, getAverage(...precipChance), rainMagnitude, snowMagnitude, windMagnitude, thunderMagnitude);

        const realFeelMagnitude = getRealFeelMagnitude(realFeelTemperature);
        const stormMagnitude = getStormMagnitude(stormRating);
        const happyFace = getHappyFaceFromMagnitude(humidityMagnitude, realFeelMagnitude, stormMagnitude);
        const freezeIcon = getFreezeIconFromTemperatures(...temperature);

        const weatherLine = `${getWithColor(realFeelMagnitude, String(realFeelTemperature))}${humidityPostFix} ${getWithColor(stormMagnitude, String(stormRating))}${unstableWeatherIcon}${windPostFix}${thunderPostFix} ${happyFace}${freezeIcon}`;

        return {
            middleHour,
            regularTime,
            weatherLine
        };

    });

    return weatherLines;

}