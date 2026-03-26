import { describe, it, expect } from "vitest";
import pointsResponse from "../sources/samples/noaa-points-response.sample.json";
import hourlyForecast from "../sources/samples/noaa-hourly-forecast.sample.json";
import gridData from "../sources/samples/noaa-grid-data.sample.json";
import {
    NoaaPointsProperties,
    NoaaHourlyPeriod,
    NoaaPrecipEntry,
} from "../types/noaaApiModels";

// ---------------------------------------------------------------------------
// NoaaPointsProperties — parsed from noaa-points-response.sample.json
// ---------------------------------------------------------------------------
describe("NoaaPointsProperties", () => {
    const rawProperties = pointsResponse.properties;

    it("parses forecastHourlyUrl from the sample points response", () => {
        const result = NoaaPointsProperties.formModelFromCandidate(rawProperties);
        expect(result.forecastHourlyUrl).toBe(
            "https://api.weather.gov/gridpoints/PHI/35,84/forecast/hourly"
        );
    });

    it("parses forecastGridDataUrl from the sample points response", () => {
        const result = NoaaPointsProperties.formModelFromCandidate(rawProperties);
        expect(result.forecastGridDataUrl).toBe(
            "https://api.weather.gov/gridpoints/PHI/35,84"
        );
    });

    it("produces an object with the correct shape", () => {
        const result = NoaaPointsProperties.formModelFromCandidate(rawProperties);
        expect(result).toHaveProperty("forecastHourlyUrl");
        expect(result).toHaveProperty("forecastGridDataUrl");
        expect(typeof result.forecastHourlyUrl).toBe("string");
        expect(typeof result.forecastGridDataUrl).toBe("string");
    });

    it("throws when a required URL is missing", () => {
        expect(() =>
            NoaaPointsProperties.formModelFromCandidate({ forecastHourly: undefined, forecastGridData: undefined })
        ).toThrow();
    });
});

// ---------------------------------------------------------------------------
// NoaaHourlyPeriod — parsed from noaa-hourly-forecast.sample.json
// ---------------------------------------------------------------------------
describe("NoaaHourlyPeriod", () => {
    const periods = hourlyForecast.properties.periods;

    it("parses all three periods from the sample without throwing", () => {
        for (const period of periods) {
            expect(() => NoaaHourlyPeriod.formModelFromCandidate(period)).not.toThrow();
        }
    });

    it("parses the first period with correct field values", () => {
        const result = NoaaHourlyPeriod.formModelFromCandidate(periods[0]);
        expect(result.startTime).toBe("2026-03-25T14:00:00-04:00");
        expect(result.temperature).toBe(54);
        expect(result.temperatureUnit).toBe("F");
        expect(result.windSpeed).toBe("5 mph");
        expect(result.humidity).toBe(45);
        expect(result.precipChance).toBe(8);
        expect(result.shortForecast).toBe("Partly Sunny");
    });

    it("produces objects with the expected shape for all periods", () => {
        for (const period of periods) {
            const result = NoaaHourlyPeriod.formModelFromCandidate(period);
            expect(result).toHaveProperty("startTime");
            expect(result).toHaveProperty("temperature");
            expect(result).toHaveProperty("temperatureUnit");
            expect(result).toHaveProperty("windSpeed");
            expect(result).toHaveProperty("humidity");
            expect(result).toHaveProperty("precipChance");
            expect(result).toHaveProperty("shortForecast");
        }
    });

    it("applies a default humidity of 50 when relativeHumidity is null", () => {
        const periodWithNullHumidity = { ...periods[0], relativeHumidity: null };
        const result = NoaaHourlyPeriod.formModelFromCandidate(periodWithNullHumidity);
        expect(result.humidity).toBe(50);
    });

    it("applies a default precipChance of 0 when probabilityOfPrecipitation is null", () => {
        const periodWithNullPrecip = { ...periods[0], probabilityOfPrecipitation: null };
        const result = NoaaHourlyPeriod.formModelFromCandidate(periodWithNullPrecip);
        expect(result.precipChance).toBe(0);
    });

    it("throws when temperature is missing", () => {
        const invalidPeriod = { ...periods[0], temperature: undefined };
        expect(() => NoaaHourlyPeriod.formModelFromCandidate(invalidPeriod)).toThrow();
    });
});

// ---------------------------------------------------------------------------
// NoaaPrecipEntry — parsed from noaa-grid-data.sample.json
// ---------------------------------------------------------------------------
describe("NoaaPrecipEntry", () => {
    const precipValues = gridData.properties.quantitativePrecipitation.values;

    it("parses all precipitation entries from the sample without throwing", () => {
        for (const entry of precipValues) {
            expect(() => NoaaPrecipEntry.formModelFromCandidate(entry)).not.toThrow();
        }
    });

    it("parses the first entry with a zero precipitation value", () => {
        const result = NoaaPrecipEntry.formModelFromCandidate(precipValues[0]);
        expect(result.validTime).toBe("2026-03-25T02:00:00+00:00/PT4H");
        expect(result.value).toBe(0);
    });

    it("parses a non-zero precipitation value correctly", () => {
        const result = NoaaPrecipEntry.formModelFromCandidate(precipValues[6]);
        expect(result.validTime).toBe("2026-03-27T06:00:00+00:00/PT6H");
        expect(result.value).toBeCloseTo(9.906, 2);
    });

    it("preserves a null value as null", () => {
        const entryWithNullValue = { validTime: "2026-03-25T02:00:00+00:00/PT4H", value: null };
        const result = NoaaPrecipEntry.formModelFromCandidate(entryWithNullValue);
        expect(result.value).toBeNull();
    });

    it("produces objects with the expected shape for all entries", () => {
        for (const entry of precipValues) {
            const result = NoaaPrecipEntry.formModelFromCandidate(entry);
            expect(result).toHaveProperty("validTime");
            expect(result).toHaveProperty("value");
            expect(typeof result.validTime).toBe("string");
        }
    });

    it("throws when validTime is missing", () => {
        expect(() =>
            NoaaPrecipEntry.formModelFromCandidate({ validTime: undefined, value: 0 })
        ).toThrow();
    });
});
