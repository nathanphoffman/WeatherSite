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
import {
    isNumber,
    isNotNumber,
    isWithin,
    isPositive,
    isNotNegative,
    hasValue,
    isStringNotNumber,
    isStringType,
} from "../utility";

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

// ---------------------------------------------------------------------------
// Utility validators: isNumber, isNotNumber
// ---------------------------------------------------------------------------
describe("isNumber", () => {
    it("returns true for numeric values", () => {
        expect(isNumber(0)).toBe(true);
        expect(isNumber(42)).toBe(true);
        expect(isNumber(-3.14)).toBe(true);
        expect(isNumber("100")).toBe(true);
    });

    it("returns false for non-numeric values", () => {
        expect(isNumber("hello")).toBe(false);
        expect(isNumber(undefined)).toBe(false);
    });
});

describe("isNotNumber", () => {
    it("returns true for non-numeric values", () => {
        expect(isNotNumber("hello")).toBe(true);
        expect(isNotNumber(undefined)).toBe(true);
    });

    it("returns false for numeric values", () => {
        expect(isNotNumber(42)).toBe(false);
        expect(isNotNumber("42")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Utility validator: isWithin
// ---------------------------------------------------------------------------
describe("isWithin", () => {
    it("returns true when the value is inside the inclusive range", () => {
        const between0and10 = isWithin(0, 10);
        expect(between0and10(0)).toBe(true);
        expect(between0and10(5)).toBe(true);
        expect(between0and10(10)).toBe(true);
    });

    it("returns false when the value is outside the range", () => {
        const between0and10 = isWithin(0, 10);
        expect(between0and10(-1)).toBe(false);
        expect(between0and10(11)).toBe(false);
    });

    it("returns false for non-numeric inputs", () => {
        const between0and10 = isWithin(0, 10);
        expect(between0and10("hello")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Utility validator: isPositive
// ---------------------------------------------------------------------------
describe("isPositive", () => {
    it("returns true for numbers greater than zero", () => {
        expect(isPositive(1)).toBe(true);
        expect(isPositive(0.001)).toBe(true);
    });

    it("returns false for zero and negative numbers", () => {
        expect(isPositive(0)).toBe(false);
        expect(isPositive(-1)).toBe(false);
    });

    it("returns false for non-numeric inputs", () => {
        expect(isPositive("hello")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Utility validator: isNotNegative
// ---------------------------------------------------------------------------
describe("isNotNegative", () => {
    it("returns true for zero and positive numbers", () => {
        expect(isNotNegative(0)).toBe(true);
        expect(isNotNegative(1)).toBe(true);
        expect(isNotNegative(100)).toBe(true);
    });

    it("returns false for negative numbers", () => {
        expect(isNotNegative(-1)).toBe(false);
        expect(isNotNegative(-0.001)).toBe(false);
    });

    it("returns false for non-numeric inputs", () => {
        expect(isNotNegative("hello")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Utility validator: hasValue
// ---------------------------------------------------------------------------
describe("hasValue", () => {
    it("returns true for values that are present and non-empty", () => {
        expect(hasValue(0)).toBe(true);
        expect(hasValue("text")).toBe(true);
        expect(hasValue(false)).toBe(true);
    });

    it("returns false for undefined, null, and empty string", () => {
        expect(hasValue(undefined)).toBe(false);
        expect(hasValue(null)).toBe(false);
        expect(hasValue("")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Utility validator: isStringNotNumber
// ---------------------------------------------------------------------------
describe("isStringNotNumber", () => {
    it("returns true for values that have content and are not numeric", () => {
        expect(isStringNotNumber("hello")).toBe(true);
        expect(isStringNotNumber("https://api.weather.gov")).toBe(true);
    });

    it("returns false for numeric strings", () => {
        expect(isStringNotNumber("42")).toBe(false);
        expect(isStringNotNumber("3.14")).toBe(false);
    });

    it("returns false for empty, null, or undefined", () => {
        expect(isStringNotNumber("")).toBe(false);
        expect(isStringNotNumber(null)).toBe(false);
        expect(isStringNotNumber(undefined)).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// Utility validator: isStringType
// ---------------------------------------------------------------------------
describe("isStringType", () => {
    it("returns true for non-empty strings", () => {
        expect(isStringType("hello")).toBe(true);
        expect(isStringType("42")).toBe(true);
    });

    it("returns false for empty strings", () => {
        expect(isStringType("")).toBe(false);
    });

    it("returns false for non-string types", () => {
        expect(isStringType(42)).toBe(false);
        expect(isStringType(null)).toBe(false);
        expect(isStringType(undefined)).toBe(false);
    });
});
