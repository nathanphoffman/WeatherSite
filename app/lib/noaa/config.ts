import { MagnitudeRange, RealFeelMin, StormMin } from "./types/general";

export const latLon = {
    default: [40.1852, -75.538], //royersford
    ny: [40.7198, -73.993], //nyc
    p: [39.99310, -74.78790], //philly
    hillsgrove: [41.39127, -76.75871],
    h: [40.2761, -76.8845], //harrisburg
};

export const LAT_MULTIPLIER = 1_000_000;
export const LONG_MULTIPLIER = 1_000_000;

export function getBlobConnectionInfo() {
    const SITE_ID = process.env.BLOB_SITE_ID; // netlify also calls this project id
    const BLOB_TOKEN = process.env.BLOB_TOKEN;

    if(!SITE_ID || !BLOB_TOKEN) return undefined;
    else return {
        SITE_ID, BLOB_TOKEN
    }
}

export function getChosenLocation() {
    const argument = (process.argv as any[])?.[2];
    const chosenLocation = !argument ? "default" : argument;
    return String(chosenLocation);
}

const LESS = -1 as const;
const MORE = -1 as const;

export const HumidityRanges: MagnitudeRange = {
    0: [LESS, 60],
    1: [61, 72],
    2: [73, 84],
    3: [85, 96],
    4: [97, MORE]
} as const;

export const WindRanges: MagnitudeRange = {
    0: [LESS, 9],
    1: [10, 15],
    2: [16, 22],
    3: [23, 29],
    4: [30, MORE]
} as const;

export const ChanceRanges: MagnitudeRange = {
    0: "--",
    1: "SChc", // Small Chance
    2: "Chc",  // Chance
    3: "Lkly", // Likely
    4: "Ocnl", // Occasionally (max chance)
};

export const RealFeelPreferences: RealFeelMin = {
    ExtremelyHotMin: 105,
    VeryHotMin: 100,
    HotMin: 90,
    WarmMin: 85,
    NiceMin: 65,
    CoolMin: 45,
    ColdMin: 30,
    VeryColdMin: 5
    // Extremely Cold (bright red) is below ColdMin
};

export const StormPreferences: StormMin = {
    VeryBadMin: 50,
    BadMin: 30,
    PoorMin: 20,
    AverageMin: 8
    // Good (green) is better than (or below) AverageMin "storm level"
};

export const HEADER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36';
export const HEADER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
