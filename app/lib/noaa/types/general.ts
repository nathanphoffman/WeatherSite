
// Given that there are only 4 string outputs it is easier and quicker to compose this with a hardcoded array than array magic
export const WIND_SPEED = ["", "W", "WW", "WWW", "WWW+"] as const;
export const HUMIDITY = ["", "H", "HH", "HHH", "HHH+"] as const;
export const THUNDER = ["", "T", "TT", "TTT", "TTT+"] as const;

// this is the raw string from NOAA
export const CHANCE_FORECAST = ["--", "SChc", "Chc", "Lkly", "Ocnl"] as const;

export type WindSpeed = typeof WIND_SPEED[number];
export type Humidity = typeof HUMIDITY[number];
export type Thunder = typeof THUNDER[number];
export type ChanceForeast = typeof CHANCE_FORECAST[number];

// 4 is represented as more severe than 3: 3+, as indicated in wind like WWW+, or humidity HHH+, etc.
export type Magnitude = 0 | 1 | 2 | 3 | 4;
export type Postfix = WindSpeed | Humidity | Thunder;
export type PostfixLetter = "W" | "H" | "T"

export type ThreeHourAverage = number;

export type MagnitudeRange = {
    [key in Magnitude]: number[] | ChanceForeast
}

export type HourlyNumbers = number[];

export type RealFeelMin = {
    ExtremelyHotMin: number,
    VeryHotMin: number,
    HotMin: number,
    WarmMin: number,
    NiceMin: number,
    CoolMin: number,
    ColdMin: number,
    VeryColdMin: number
}
export type StormMin = {
    VeryBadMin: number,
    BadMin: number,
    PoorMin: number,
    AverageMin: number
}

export type Candidate<T> = {
    [K in keyof T]?: unknown;
};

export type Hour = number;

export type UnknownNumber = number;

export interface DomainModel<T,Y> {
    formModelFromCandidate(candidate: Y): T;
}
