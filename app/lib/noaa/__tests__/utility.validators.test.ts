import { describe, it, expect } from "vitest";
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
// isNumber, isNotNumber
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
// isWithin
// ---------------------------------------------------------------------------
describe("isWithin", () => {
    const between0and10 = isWithin(0, 10);

    it("returns true when the value is inside the inclusive range", () => {
        expect(between0and10(0)).toBe(true);
        expect(between0and10(5)).toBe(true);
        expect(between0and10(10)).toBe(true);
    });

    it("returns false when the value is outside the range", () => {
        expect(between0and10(-1)).toBe(false);
        expect(between0and10(11)).toBe(false);
    });

    it("returns false for non-numeric inputs", () => {
        expect(between0and10("hello")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isPositive
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
// isNotNegative
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
// hasValue
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
// isStringNotNumber
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
// isStringType
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
