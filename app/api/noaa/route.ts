import { getLat, getLon } from "./config";
import { getSavedLatLongForecast, saveLatLongForecast } from "./database";
import { run } from "./scraperEntry";

let LAST_RUN = 0;
let cached: any = undefined;

// app/api/hello/route.ts
export async function GET() {

    let ran: Boolean = false;

    const lat = getLat();
    const long = getLon();
    const now = new Date().getTime() / 1000;

    const memoizedCacheIsInvalid = (!cached || moreThan1HourHasPassed());

    if (memoizedCacheIsInvalid) {

        const oneHourAgo = now - 3600;
        const savedRecord = getSavedLatLongForecast(lat, long, oneHourAgo)
        if (!savedRecord) {
            LAST_RUN = new Date().getTime() / 1000;
            ran = true;
            console.log("Running fetch against NOAA");
            cached = await run();

            saveLatLongForecast({
                lat, long, unixSeconds: now, forecast: cached
            });

            console.log("Completed fetch against NOAA");
        }
        else cached = savedRecord;
    }

    return new Response(JSON.stringify({ cached, ran }), {
        headers: { 'Content-Type': 'application/json' },
    });
}

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

function getLong() {
    throw new Error("Function not implemented.");
}
