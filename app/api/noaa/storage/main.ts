import { getBlobConnectionInfo, getLat, getLon } from "../config";
import { run } from "../scraperEntry";
import { StorageSolution } from "../types/storage";
import { DayForecast } from "../types/forecast";
import { blobStorage } from "./blob";
import { databaseStorage } from "./database";

const CACHE_VERSION = 2;

export async function getForecast(lat?: string, lon?: string, source: 'scraper' | 'api' = 'scraper'): Promise<DayForecast> {

    const resolvedLat = lat ?? getLat();
    const resolvedLon = lon ?? getLon();

    const nowInSeconds = new Date().getTime() / 1000;

    let storageSolution: StorageSolution | undefined = undefined;
    const blobConnectionInfo = getBlobConnectionInfo();

    if (blobConnectionInfo) storageSolution = blobStorage;
    else storageSolution = databaseStorage;

    if (!storageSolution) throw "No storage method found to serve as a database for forecasts.";

    const oneHourAgo = nowInSeconds - 3600;
    const savedRecord = await storageSolution.getSavedLatLongForecast(resolvedLat, resolvedLon, oneHourAgo);

    if (savedRecord) {
        const parsed = JSON.parse(savedRecord);
        if (parsed.version === CACHE_VERSION) {
            return parsed.data as DayForecast;
        }
        console.log("Cache version mismatch, re-fetching from NOAA");
    }

    console.log("Running fetch against NOAA");
    const forecast = await run(resolvedLat, resolvedLon, source);

    await storageSolution.saveLatLongForecast({
        lat: resolvedLat,
        long: resolvedLon,
        unixSeconds: nowInSeconds,
        forecast: JSON.stringify({ version: CACHE_VERSION, data: forecast }),
    });

    console.log("Completed fetch against NOAA");
    return forecast;
}
