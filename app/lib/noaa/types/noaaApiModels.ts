import { DomainModel } from "./general";
import { candidateToType, isNumber, isNotNegative, isStringNotNumber } from "../utility";
import { isNoMoreThan100 } from "./validators";

// Verified against live NOAA API responses.
// See app/lib/noaa/sources/samples/ for reference.

// --- NoaaPointsProperties ---
// Represents the fields we use from the /points/{lat},{lon} response.

export interface NoaaPointsProperties {
    forecastHourlyUrl: string;
    forecastGridDataUrl: string;
}

type NoaaRawPointsProperties = {
    forecastHourly?: unknown;
    forecastGridData?: unknown;
};

export const NoaaPointsProperties: DomainModel<NoaaPointsProperties, NoaaRawPointsProperties> = {
    formModelFromCandidate(candidate: NoaaRawPointsProperties): NoaaPointsProperties {
        return {
            forecastHourlyUrl: candidateToType(candidate.forecastHourly, [isStringNotNumber], "forecastHourlyUrl"),
            forecastGridDataUrl: candidateToType(candidate.forecastGridData, [isStringNotNumber], "forecastGridDataUrl"),
        };
    }
};

// --- NoaaHourlyPeriod ---
// Represents a single period from the /gridpoints/{wfo}/{x},{y}/forecast/hourly response.
// relativeHumidity and probabilityOfPrecipitation are nested objects in the raw response;
// their values are flattened here. Defaults applied: humidity → 50, precipChance → 0.

export interface NoaaHourlyPeriod {
    startTime: string;
    temperature: number;
    temperatureUnit: string;
    windSpeed: string;
    humidity: number;
    precipChance: number;
    shortForecast: string;
}

type NoaaRawHourlyPeriod = {
    startTime?: unknown;
    temperature?: unknown;
    temperatureUnit?: unknown;
    windSpeed?: unknown;
    relativeHumidity?: { value?: unknown } | null;
    probabilityOfPrecipitation?: { value?: unknown } | null;
    shortForecast?: unknown;
};

export const NoaaHourlyPeriod: DomainModel<NoaaHourlyPeriod, NoaaRawHourlyPeriod> = {
    formModelFromCandidate(candidate: NoaaRawHourlyPeriod): NoaaHourlyPeriod {
        return {
            startTime: candidateToType(candidate.startTime, [isStringNotNumber], "startTime"),
            temperature: candidateToType(candidate.temperature, [isNumber], "temperature"),
            temperatureUnit: candidateToType(candidate.temperatureUnit, [isStringNotNumber], "temperatureUnit"),
            windSpeed: candidateToType(candidate.windSpeed, [isStringNotNumber], "windSpeed"),
            humidity: candidateToType(candidate.relativeHumidity?.value ?? 50, [isNumber, isNotNegative, isNoMoreThan100], "humidity"),
            precipChance: candidateToType(candidate.probabilityOfPrecipitation?.value ?? 0, [isNumber, isNotNegative, isNoMoreThan100], "precipChance"),
            shortForecast: String(candidate.shortForecast ?? ''),
        };
    }
};

// --- NoaaPrecipEntry ---
// Represents a single entry in quantitativePrecipitation.values from the grid data response.
// value is null when NOAA omits the measurement for that interval.

export interface NoaaPrecipEntry {
    validTime: string;
    value: number | null;
}

export const NoaaPrecipEntry: DomainModel<NoaaPrecipEntry, { validTime?: unknown; value?: unknown }> = {
    formModelFromCandidate(candidate: { validTime?: unknown; value?: unknown }): NoaaPrecipEntry {
        return {
            validTime: candidateToType(candidate.validTime, [isStringNotNumber], "validTime"),
            value: candidate.value === null ? null : candidateToType(candidate.value, [isNumber, isNotNegative], "value"),
        };
    }
};
