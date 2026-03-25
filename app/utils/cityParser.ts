
import { readFile } from 'fs/promises';
import path from 'path';
import Papa from 'papaparse';

// although unnecessary, top cities are broken out from all cities to keep data usage down,
// all cities are only called if there are no matches to saved or top cities
const ALL_CITIES_PATH = 'app/lib/noaa/storage/all_uscities.csv';
const POPULATED_CITIES_PATH = 'app/lib/noaa/storage/populated_uscities.csv';

export interface City {
    city: string;
    state_id: string;
    state_name: string;
    lat: string;
    long: string;
}

function getAbsolutePath(relativePath: string) : string {
    return path.join(process.cwd(), relativePath);
}

async function readCsv(relativePath: string): Promise<City[]> {

    const absolutePath = getAbsolutePath(relativePath);

    const contents = await readFile(absolutePath, 'utf-8');
    const { data } = Papa.parse<City>(contents, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header === 'lng' ? 'long' : header,
    });

    return data;
}

export async function getPopulatedCities(): Promise<City[]> {
    return readCsv(POPULATED_CITIES_PATH);
}

export async function getAllCities(): Promise<City[]> {
    return readCsv(ALL_CITIES_PATH);
}
