import { getBlobConnectionInfo, FORECAST_TTL_SECONDS } from "../config";
import { buildDayForecast } from "../forecastBuilder";
import { StorageSolution } from "../types/storage";
import { DayForecast } from "../types/forecast";
import { WeatherModel } from "../types/databaseModels";
import { safeJsonParse } from "../utility";
import { blobStorage } from "./blob";
import { databaseStorage } from "./database";

const CACHE_VERSION = 2;

export async function getForecast(lat?: string, long?: string): Promise<DayForecast> {

    if(!lat || !long) throw new Error("Latitude and/or longitude not provided");

    const nowInSeconds = new Date().getTime() / 1000;

    let storageSolution: StorageSolution | undefined = undefined;
    const blobConnectionInfo = getBlobConnectionInfo();

    if (blobConnectionInfo) storageSolution = blobStorage;
    else storageSolution = databaseStorage;

    if (!storageSolution) throw new Error("No storage method found to serve as a database for forecasts.");

    const oneHourAgo = nowInSeconds - FORECAST_TTL_SECONDS;
    const savedRecord = await storageSolution.getSavedLatLongForecast(lat, long, oneHourAgo);

    if (savedRecord) {
        const parsed = safeJsonParse<{ version: number; data: DayForecast }>(savedRecord);
        if (!parsed) {
            console.log("Cache record corrupted, re-fetching from NOAA");
        } else if (parsed.version === CACHE_VERSION) {
            return parsed.data;
        } else {
            console.log("Cache version mismatch, re-fetching from NOAA");
        }
    }

    console.log("Running fetch against NOAA");
    const forecast = await buildDayForecast(lat, long);

    const weatherRecord = WeatherModel.formModelFromCandidate({
        lat: lat,
        long: long,
        unixSeconds: nowInSeconds,
        forecast: JSON.stringify({ version: CACHE_VERSION, data: forecast }),
    });

    await storageSolution.saveLatLongForecast(weatherRecord);

    console.log("Completed fetch against NOAA");
    return forecast;
}
