import { getBlobConnectionInfo, FORECAST_TTL_SECONDS, CACHE_VERSION } from "../config";
import { logger } from "../../logger";
import { buildDayForecast } from "../forecastBuilder";
import { StorageSolution } from "../types/storage";
import { DayForecast } from "../types/forecast";
import { WeatherModel } from "../types/databaseModels";
import { safeJsonParse } from "../utility";
import { blobStorage } from "./blob";
import { databaseStorage } from "./database";

// serves from storage while the record is younger than the TTL; the version check discards records saved in an older format
export async function getForecast(lat: string, long: string): Promise<DayForecast> {

    const nowInSeconds = Math.floor(Date.now() / 1000);

    const blobConnectionInfo = getBlobConnectionInfo();
    const storageSolution: StorageSolution = blobConnectionInfo ? blobStorage : databaseStorage;

    const oneHourAgo = nowInSeconds - FORECAST_TTL_SECONDS;
    const savedRecord = await storageSolution.getSavedLatLongForecast(lat, long, oneHourAgo);

    if (savedRecord) {
        const parsed = safeJsonParse<{ version: number; data: DayForecast }>(savedRecord);

        if (!parsed) {
            logger.warn("Cache record corrupted, re-fetching from NOAA");
        } else if (parsed.version === CACHE_VERSION) {
            return parsed.data;
        } else {
            logger.warn("Cache version mismatch, re-fetching from NOAA");
        }
    }

    logger.info("Running fetch against NOAA");
    const forecast = await buildDayForecast(lat, long);

    const weatherRecord = WeatherModel.formModelFromCandidate({
        lat: lat,
        long: long,
        unixSeconds: nowInSeconds,
        forecast: JSON.stringify({ version: CACHE_VERSION, data: forecast }),
    });

    await storageSolution.saveLatLongForecast(weatherRecord);

    logger.info("Completed fetch against NOAA");

    return forecast;
}
