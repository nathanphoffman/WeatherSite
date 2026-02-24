// lib/db.js
const sqlite3 = require('better-sqlite3');

let _db : any = undefined; 

export function openDatabaseConnection() {
    if(!_db) _db = new sqlite3("./database.sqlite", { verbose: console.log });
    return _db;
}

export function openWeatherTableConnection() {

    const db = openDatabaseConnection();

    db.exec(`CREATE TABLE IF NOT EXISTS weather (
        lat TEXT NOT NULL,
        long TEXT NOT NULL,
        unixSeconds INTEGER NOT NULL,
        forecast JSON NOT NULL
    )`);

    return db;
}

export function saveLatLongForecast(lat: string, long: string, forecast: string) {
    const db = openWeatherTableConnection();

    db.prepare(`INSERT INTO weather (lat, long, forecast) VALUES (?,?,?)`).run(lat, long, forecast);
}

export function getSavedLatLongForecast(lat: string, long: string) {
    const db = openWeatherTableConnection();

    const result = db.prepare(`SELECT forecast FROM weather WHERE lat = ? AND long = ?`).get(lat, long);
    return result;
}