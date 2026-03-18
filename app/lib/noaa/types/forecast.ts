import { ThreeHourWeatherModel } from './threeHourWeather';

export type ThreeHourGroup = {
    regularTime: string;
    middleHour: number;
    hours: [ThreeHourWeatherModel, ThreeHourWeatherModel, ThreeHourWeatherModel];
};

export type DayForecast = {
    [forecastDate: string]: ThreeHourGroup[];
};
