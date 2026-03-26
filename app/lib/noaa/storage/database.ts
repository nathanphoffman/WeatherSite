import { LAT_MULTIPLIER, LONG_MULTIPLIER } from "../config";
import { Weather } from "../types/databaseModels";
import { StorageSolution } from "../types/storage";
import { logger } from "../../logger";
import Database from 'better-sqlite3';

let _db: Database.Database | undefined = undefined;

export function openDatabaseConnection() {
    if (!_db) _db = new Database("./database.sqlite", { verbose: logger.debug });
    return _db;
}

function openWeatherTableConnection() {

    const db = openDatabaseConnection();

    db.exec(`
        CREATE TABLE IF NOT EXISTS weather (
            lat INTEGER NOT NULL,
            long INTEGER NOT NULL,
            unixSeconds INTEGER NOT NULL,
            forecast JSON NOT NULL,
        UNIQUE(lat, long)
        )
    `);

    return db;
}

export const databaseStorage: StorageSolution = {
    saveLatLongForecast: async function (weather: Weather) {

        const { lat, long, unixSeconds, forecast } = weather;
        const db = openWeatherTableConnection();

        // for convenience of using integers and unique comparison to avoid floating point uncertainty
        // we convert decimals to whole numbers for lat and long for storage
        const storageIntegerLat = Math.round(Number(lat) * LAT_MULTIPLIER);
        const storageIntegerLong = Math.round(Number(long) * LONG_MULTIPLIER);

        db.prepare(`
            INSERT INTO weather (lat, long, unixSeconds, forecast) 
            VALUES (?,?,?,?)
            ON CONFLICT(lat, long) DO UPDATE SET
                lat = excluded.lat,
                long = excluded.long,
                unixSeconds = excluded.unixSeconds,
                forecast = excluded.forecast
        `)
            .run(storageIntegerLat, storageIntegerLong, unixSeconds, forecast);
    },

    getSavedLatLongForecast: async function (lat: string, long: string, unixSecondsAgeLimit: number): Promise<string> {
        const db = openWeatherTableConnection();

        const storageIntegerLat = Math.round(Number(lat) * LAT_MULTIPLIER);
        const storageIntegerLong = Math.round(Number(long) * LONG_MULTIPLIER);

        const result = db.prepare(`SELECT forecast FROM weather WHERE lat = ? AND long = ? AND unixSeconds > ?`).get(storageIntegerLat, storageIntegerLong, unixSecondsAgeLimit) as { forecast: string };
        return result?.forecast;
    }
}