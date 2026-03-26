import { getStore } from "@netlify/blobs";
import { Weather } from "../types/databaseModels";
import { ThreeHourWeatherModel } from "../types/threeHourWeather";
import { getBlobConnectionInfo } from "../config";
import { safeJsonParse } from "../utility";
import { logger } from "../../logger";

const blobConnectionInfo = getBlobConnectionInfo();
const SITE_ID = blobConnectionInfo?.SITE_ID; // netlify also calls this project id
const BLOB_TOKEN = blobConnectionInfo?.BLOB_TOKEN;

const FORECASTS = 'FORECASTS';

export const blobStorage = {
    saveLatLongForecast: async function (weather: Weather) {
        if(!blobConnectionInfo) throw new Error("Blobs are not available, unable to save forecast.");

        const { lat, long } = weather;
        const key = `${lat}|${long}`;

        const store = getStore(FORECASTS, { siteID: SITE_ID, token: BLOB_TOKEN });
        await store.set(key, JSON.stringify(weather));
    },

    getSavedLatLongForecast: async function (lat: string, long: string, unixSecondsAgeLimit: number): Promise<string> {

        if(!blobConnectionInfo) throw new Error("Blobs are not available, unable to get forecast.");
        const key = `${lat}|${long}`;

        const store = getStore(FORECASTS, { siteID: SITE_ID, token: BLOB_TOKEN });

        const weather = await store.get(key, {type: 'text'});
        if(!weather) return "";

        const weatherObj = safeJsonParse<Weather>(weather);
        if (!weatherObj) {
            logger.error(`VALIDATION FAILED! field="weatherBlob" value=<corrupted>`);
            return "";
        }

        // we check to see if the forecast is current before trusting it
        if(Number(weatherObj.unixSeconds) > unixSecondsAgeLimit) return weatherObj.forecast;
        else return "";
    }
}
