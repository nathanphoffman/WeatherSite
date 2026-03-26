import { describe, it, expect } from "vitest";
import {
    isChanceForecastValue,
    isAboveAbsoluteZero,
    isBelowReasonablePrecipitation,
    is24HourClockValue,
    isBelowRealisticMaxTemperature,
    isNoMoreThan100,
    isBelowSpeedOfSound,
    isValidLatitude,
    isValidLongitude,
    isValidTemperatureUnit,
    isReasonableUnixTimestamp,
} from "../types/validators";

// ---------------------------------------------------------------------------
// isChanceForecastValue
// ---------------------------------------------------------------------------
describe("isChanceForecastValue", () => {
    it("accepts every valid CHANCE_FORECAST value", () => {
        expect(isChanceForecastValue("--")).toBe(true);
        expect(isChanceForecastValue("SChc")).toBe(true);
        expect(isChanceForecastValue("Chc")).toBe(true);
        expect(isChanceForecastValue("Lkly")).toBe(true);
        expect(isChanceForecastValue("Ocnl")).toBe(true);
    });

    it("rejects values not in the CHANCE_FORECAST list", () => {
        expect(isChanceForecastValue("chc")).toBe(false);
        expect(isChanceForecastValue("")).toBe(false);
        expect(isChanceForecastValue("Def")).toBe(false);
        expect(isChanceForecastValue(null)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isAboveAbsoluteZero
// ---------------------------------------------------------------------------
describe("isAboveAbsoluteZero", () => {
    it("accepts numbers strictly above absolute zero (-459.67)", () => {
        expect(isAboveAbsoluteZero(-459.66)).toBe(true);
        expect(isAboveAbsoluteZero(0)).toBe(true);
        expect(isAboveAbsoluteZero(98.6)).toBe(true);
    });

    it("rejects values at or below absolute zero", () => {
        expect(isAboveAbsoluteZero(-459.67)).toBe(false);
        expect(isAboveAbsoluteZero(-500)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isBelowReasonablePrecipitation
// ---------------------------------------------------------------------------
describe("isBelowReasonablePrecipitation", () => {
    it("accepts values below 20 inches", () => {
        expect(isBelowReasonablePrecipitation(0)).toBe(true);
        expect(isBelowReasonablePrecipitation(19.99)).toBe(true);
    });

    it("rejects values at or above 20 inches", () => {
        expect(isBelowReasonablePrecipitation(20)).toBe(false);
        expect(isBelowReasonablePrecipitation(25)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// is24HourClockValue
// ---------------------------------------------------------------------------
describe("is24HourClockValue", () => {
    it("accepts values 0 through 24", () => {
        expect(is24HourClockValue(0)).toBe(true);
        expect(is24HourClockValue(12)).toBe(true);
        expect(is24HourClockValue(24)).toBe(true);
    });

    it("rejects values above 24", () => {
        expect(is24HourClockValue(25)).toBe(false);
        expect(is24HourClockValue(100)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isBelowRealisticMaxTemperature
// ---------------------------------------------------------------------------
describe("isBelowRealisticMaxTemperature", () => {
    it("accepts values below 160", () => {
        expect(isBelowRealisticMaxTemperature(100)).toBe(true);
        expect(isBelowRealisticMaxTemperature(159.9)).toBe(true);
    });

    it("rejects values at or above 160", () => {
        expect(isBelowRealisticMaxTemperature(160)).toBe(false);
        expect(isBelowRealisticMaxTemperature(200)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isNoMoreThan100
// ---------------------------------------------------------------------------
describe("isNoMoreThan100", () => {
    it("accepts values up to 100", () => {
        expect(isNoMoreThan100(0)).toBe(true);
        expect(isNoMoreThan100(50)).toBe(true);
        expect(isNoMoreThan100(100)).toBe(true);
    });

    it("rejects values above 100", () => {
        expect(isNoMoreThan100(101)).toBe(false);
        expect(isNoMoreThan100(200)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isBelowSpeedOfSound
// ---------------------------------------------------------------------------
describe("isBelowSpeedOfSound", () => {
    it("accepts values below 767 mph", () => {
        expect(isBelowSpeedOfSound(0)).toBe(true);
        expect(isBelowSpeedOfSound(766.9)).toBe(true);
    });

    it("rejects values at or above 767 mph", () => {
        expect(isBelowSpeedOfSound(767)).toBe(false);
        expect(isBelowSpeedOfSound(1000)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isValidLatitude
// ---------------------------------------------------------------------------
describe("isValidLatitude", () => {
    it("accepts valid latitude values from -90 to 90", () => {
        expect(isValidLatitude(-90)).toBe(true);
        expect(isValidLatitude(0)).toBe(true);
        expect(isValidLatitude(40.1852)).toBe(true);
        expect(isValidLatitude(90)).toBe(true);
    });

    it("rejects values outside the -90 to 90 range", () => {
        expect(isValidLatitude(-91)).toBe(false);
        expect(isValidLatitude(91)).toBe(false);
    });

    it("rejects non-numeric inputs", () => {
        expect(isValidLatitude("not a number")).toBe(false);
        expect(isValidLatitude(undefined)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isValidLongitude
// ---------------------------------------------------------------------------
describe("isValidLongitude", () => {
    it("accepts valid longitude values from -180 to 180", () => {
        expect(isValidLongitude(-180)).toBe(true);
        expect(isValidLongitude(0)).toBe(true);
        expect(isValidLongitude(-75.538)).toBe(true);
        expect(isValidLongitude(180)).toBe(true);
    });

    it("rejects values outside the -180 to 180 range", () => {
        expect(isValidLongitude(-181)).toBe(false);
        expect(isValidLongitude(181)).toBe(false);
    });

    it("rejects non-numeric inputs", () => {
        expect(isValidLongitude("not a number")).toBe(false);
        expect(isValidLongitude(undefined)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isValidTemperatureUnit
// ---------------------------------------------------------------------------
describe("isValidTemperatureUnit", () => {
    it("accepts 'C' and 'F'", () => {
        expect(isValidTemperatureUnit("C")).toBe(true);
        expect(isValidTemperatureUnit("F")).toBe(true);
    });

    it("rejects anything other than 'C' or 'F'", () => {
        expect(isValidTemperatureUnit("K")).toBe(false);
        expect(isValidTemperatureUnit("c")).toBe(false);
        expect(isValidTemperatureUnit("f")).toBe(false);
        expect(isValidTemperatureUnit("")).toBe(false);
        expect(isValidTemperatureUnit(null)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isReasonableUnixTimestamp
// ---------------------------------------------------------------------------
describe("isReasonableUnixTimestamp", () => {
    it("accepts timestamps at or below the year-2100 boundary (4102444800)", () => {
        expect(isReasonableUnixTimestamp(0)).toBe(true);
        expect(isReasonableUnixTimestamp(1711497600)).toBe(true);
        expect(isReasonableUnixTimestamp(4102444800)).toBe(true);
    });

    it("rejects timestamps beyond the year-2100 boundary", () => {
        expect(isReasonableUnixTimestamp(4102444801)).toBe(false);
        expect(isReasonableUnixTimestamp(9999999999)).toBe(false);
    });
});
