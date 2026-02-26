export type Weather = {
    lat: string  // these are strings to avoid floating point imprecision
    long: string // these are strings to avoid floating point imprecision
    unixSeconds: number
    forecast: string
};