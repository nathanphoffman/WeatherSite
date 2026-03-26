import { DomainModel } from "./general";
import { candidateToType, isNumber, isNotNegative, isStringNotNumber, isObject, isArray } from "../utility";
import { isNoMoreThan100, isValidTemperatureUnit } from "./validators";

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

// --- NoaaPointsResponse ---
// Validates the outer envelope of the /points/{lat},{lon} response before
// extracting properties. Guards against error bodies (e.g. { title, status })
// that would otherwise silently produce an empty-object fallback.

export const NoaaPointsResponse: DomainModel<NoaaPointsProperties, { properties?: unknown }> = {
    formModelFromCandidate(candidate: { properties?: unknown }): NoaaPointsProperties {
        const properties = candidateToType<NoaaRawPointsProperties>(candidate.properties, [isObject], "properties");
        return NoaaPointsProperties.formModelFromCandidate(properties);
    }
};

// --- NoaaForecastResponse ---
// Validates the outer envelope of the hourly forecast response.
// Ensures properties.periods is an array before iterating.

export interface NoaaForecastResponse {
    periods: unknown[];
}

export const NoaaForecastResponse: DomainModel<NoaaForecastResponse, { properties?: unknown }> = {
    formModelFromCandidate(candidate: { properties?: unknown }): NoaaForecastResponse {
        const properties = candidateToType<{ periods?: unknown }>(candidate.properties, [isObject], "properties");
        const periods = candidateToType<unknown[]>(properties.periods, [isArray], "periods");
        return { periods };
    }
};

// --- NoaaGridDataResponse ---
// Validates the outer envelope of the grid data response.
// quantitativePrecipitation is optional in NOAA responses; defaults to empty array.

export interface NoaaGridDataResponse {
    precipValues: unknown[];
}

export const NoaaGridDataResponse: DomainModel<NoaaGridDataResponse, { properties?: unknown }> = {
    formModelFromCandidate(candidate: { properties?: unknown }): NoaaGridDataResponse {
        const properties = candidateToType<{ quantitativePrecipitation?: { values?: unknown } }>(candidate.properties, [isObject], "properties");
        const precipValues = (properties.quantitativePrecipitation?.values as unknown[] | undefined) ?? [];
        return { precipValues };
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
            temperatureUnit: candidateToType(candidate.temperatureUnit, [isStringNotNumber, isValidTemperatureUnit], "temperatureUnit"),
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
