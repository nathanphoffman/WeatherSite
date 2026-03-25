import { getBlobConnectionInfo } from "../config";
import { buildDayForecast } from "../scraperEntry";
import { StorageSolution } from "../types/storage";
import { DayForecast } from "../types/forecast";
import { blobStorage } from "./blob";
import { databaseStorage } from "./database";

const CACHE_VERSION = 2;

export async function getForecast(lat?: string, long?: string, source: 'scraper' | 'api' = 'scraper'): Promise<DayForecast> {

    if(!lat || !long) throw "Latitude and/or longitude not provided";

    const nowInSeconds = new Date().getTime() / 1000;

    let storageSolution: StorageSolution | undefined = undefined;
    const blobConnectionInfo = getBlobConnectionInfo();

    if (blobConnectionInfo) storageSolution = blobStorage;
    else storageSolution = databaseStorage;

    if (!storageSolution) throw "No storage method found to serve as a database for forecasts.";

    const oneHourAgo = nowInSeconds - 3600;
    const savedRecord = await storageSolution.getSavedLatLongForecast(lat, long, oneHourAgo);

    if (savedRecord) {
        const parsed = JSON.parse(savedRecord);
        if (parsed.version === CACHE_VERSION) {
            return parsed.data as DayForecast;
        }

        console.log("Cache version mismatch, re-fetching from NOAA");
    }

    console.log("Running fetch against NOAA");
    const forecast = await buildDayForecast(lat, long, source);

    await storageSolution.saveLatLongForecast({
        lat: lat,
        long: long,
        unixSeconds: nowInSeconds,
        forecast: JSON.stringify({ version: CACHE_VERSION, data: forecast }),
    });

    console.log("Completed fetch against NOAA");
    return forecast;
}
