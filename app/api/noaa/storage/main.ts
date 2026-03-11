

/*
    const lat = getLat();
    const long = getLon();
*/

import { getBlobConnectionInfo, getLat, getLon } from "../config";
import { run } from "../scraperEntry";
import { StorageSolution } from "../types/storage";
import { blobStorage } from "./blob";
import { databaseStorage } from "./database";

export async function getForecast(/*lat: string, long: string*/) {

    const lat = getLat();
    const long = getLon();

    const nowInSeconds = new Date().getTime() / 1000;

    //const memoizedCacheIsInvalid = (!cached || moreThan1HourHasPassed());

    //if (memoizedCacheIsInvalid) {

    let storageSolution: StorageSolution | undefined = undefined;
    const blobConnectionInfo = getBlobConnectionInfo();

    if (blobConnectionInfo) storageSolution = blobStorage;
    else storageSolution = databaseStorage;

    if (!storageSolution) throw "No storage method found to serve as a database for forecasts.";

    const oneHourAgo = nowInSeconds - 3600;
    const savedRecord = await storageSolution.getSavedLatLongForecast(lat, long, oneHourAgo);

    if (savedRecord) {
        return JSON.parse(savedRecord);
    }
    else {
        console.log("Running fetch against NOAA");
        const forecast = await run();

        await storageSolution.saveLatLongForecast({
            lat, long, unixSeconds: nowInSeconds, forecast: JSON.stringify(forecast)
        });

        console.log("Completed fetch against NOAA");
        return forecast;
    }

}
/*
function getNowInSeconds() {
    return (new Date()).getTime() / 1000;
}

function moreThan1HourHasPassed() {
    const mins = minutesSinceLastRun();
    return mins > 60;
}

function minutesSinceLastRun() {
    const deltaSeconds = LAST_RUN - getNowInSeconds();
    return deltaSeconds / 60;
}
    */