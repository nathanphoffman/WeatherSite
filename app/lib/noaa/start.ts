import { getLat, getLon } from "./config";
//import { getSavedLatLongForecast, saveLatLongForecast } from "./storage/database";
import { run } from "./scraperEntry";

let LAST_RUN = 0;
let cached: any = undefined;

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
