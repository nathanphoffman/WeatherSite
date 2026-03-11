import { Weather } from "./databaseModels";

export interface StorageSolution {
    saveLatLongForecast: (weather: Weather)=>Promise<void>;
    getSavedLatLongForecast: (lat: string, long: string, unixSecondsAgeLimit: number)=>Promise<string>;
}