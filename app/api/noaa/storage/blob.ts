import { getStore } from "@netlify/blobs";
import { Weather } from "../types/databaseModels";
import { ThreeHourWeatherModel } from "../types/threeHourWeather";

const SITE_ID = process.env.SITE_ID; // netlify also calls this project id
const BLOB_TOKEN = process.env.BLOB_TOKEN;

const FORECASTS = 'FORECASTS';

export const blobStorage = {
    saveLatLongForecast: async function (weather: Weather) {
        const { lat, long } = weather;
        const key = lat + long;

        const store = getStore(FORECASTS, { siteID: SITE_ID, token: BLOB_TOKEN });
        await store.set(key, JSON.stringify(weather));
    },

    getSavedLatLongForecast: async function (lat: string, long: string, unixSecondsAgeLimit: number): Promise<string> {
        const key = lat + long;

        const store = getStore(FORECASTS, { siteID: SITE_ID, token: BLOB_TOKEN });

        const weather = await store.get(key, {type: 'text'});
        if(!weather) return "";

        const weatherObj = JSON.parse(weather);

        // we check to see if the forecast is current before trusting it
        if(Number(weatherObj?.unixSeconds) > unixSecondsAgeLimit) return weatherObj.forecast;
        else return "";
    }
}
