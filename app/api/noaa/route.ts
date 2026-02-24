import { getLat, getLon } from "./config";
import { createBaseTable, getSavedLatLongForecast, saveLatLongForecast } from "./database";
import { run } from "./scraperEntry";

let LAST_RUN = 0;
let cached: any = undefined;

// app/api/hello/route.ts
export async function GET() {

    LAST_RUN = new Date().getTime() / 1000;
    let ran: Boolean = false;

    if (!cached || moreThan1HourHasPassed()) {
        ran = true;
        console.log("Running fetch against NOAA");
        cached = await run();
        console.log("Completed fetch against NOAA");
    }

    const lat = getLat();
    const long = getLon();
    //createBaseTable();

    //saveLatLongForecast(lat, long, JSON.stringify(cached));

    const json = getSavedLatLongForecast("22", long);
    console.log("json is", json);

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
