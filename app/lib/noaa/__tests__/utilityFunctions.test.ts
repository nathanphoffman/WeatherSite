import { describe, it, expect } from "vitest";
import {
    splitIntoGroupsOf3,
    getAverage,
    militaryHourToRegularHour,
    arrayNotEmpty,
    stripUndefined,
    candidateToType,
    isObject,
    isArray,
    safeJsonParse,
} from "../utility";
import { isNumber, isNotNegative } from "../utility";

// ---------------------------------------------------------------------------
// splitIntoGroupsOf3
// ---------------------------------------------------------------------------
describe("splitIntoGroupsOf3", () => {
    it("returns undefined for an empty array", () => {
        expect(splitIntoGroupsOf3([])).toBeUndefined();
    });

    it("returns undefined when fewer than 3 items are provided", () => {
        expect(splitIntoGroupsOf3([1, 2])).toBeUndefined();
    });

    it("groups exactly 3 items into a single group", () => {
        expect(splitIntoGroupsOf3([1, 2, 3])).toEqual([[1, 2, 3]]);
    });

    it("groups 6 items into two groups of 3", () => {
        expect(splitIntoGroupsOf3([1, 2, 3, 4, 5, 6])).toEqual([
            [1, 2, 3],
            [4, 5, 6],
        ]);
    });

    it("groups 9 items into three groups of 3", () => {
        expect(splitIntoGroupsOf3([1, 2, 3, 4, 5, 6, 7, 8, 9])).toEqual([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
        ]);
    });

    it("drops the trailing incomplete group for 7 items", () => {
        const result = splitIntoGroupsOf3([1, 2, 3, 4, 5, 6, 7]);
        expect(result).toEqual([[1, 2, 3], [4, 5, 6]]);
    });
});

// ---------------------------------------------------------------------------
// getAverage
// ---------------------------------------------------------------------------
describe("getAverage", () => {
    it("returns the single value when given one number", () => {
        expect(getAverage(10)).toBe(10);
    });

    it("returns the mean of two equal numbers", () => {
        expect(getAverage(5, 5)).toBe(5);
    });

    it("returns the rounded mean of multiple numbers", () => {
        expect(getAverage(1, 2, 3)).toBe(2);
        expect(getAverage(10, 20, 30)).toBe(20);
    });

    it("rounds to the nearest integer", () => {
        // (1 + 2) / 2 = 1.5, Math.round → 2
        expect(getAverage(1, 2)).toBe(2);
    });
});

// ---------------------------------------------------------------------------
// militaryHourToRegularHour
// ---------------------------------------------------------------------------
describe("militaryHourToRegularHour", () => {
    it("converts 0 (midnight) to '12a'", () => {
        expect(militaryHourToRegularHour(0)).toBe("12a");
    });

    it("converts 24 (end-of-day midnight) to '12a'", () => {
        expect(militaryHourToRegularHour(24)).toBe("12a");
    });

    it("converts 12 (noon) to '12p'", () => {
        expect(militaryHourToRegularHour(12)).toBe("12p");
    });

    it("converts morning hours correctly", () => {
        expect(militaryHourToRegularHour(6)).toBe("6a");
        expect(militaryHourToRegularHour(1)).toBe("1a");
    });

    it("converts afternoon and evening hours correctly", () => {
        expect(militaryHourToRegularHour(13)).toBe("1p");
        expect(militaryHourToRegularHour(23)).toBe("11p");
    });
});

// ---------------------------------------------------------------------------
// arrayNotEmpty
// ---------------------------------------------------------------------------
describe("arrayNotEmpty", () => {
    it("returns false for an empty array", () => {
        expect(arrayNotEmpty([])).toBe(false);
    });

    it("returns true when the array has at least one element", () => {
        expect(arrayNotEmpty([1])).toBe(true);
        expect(arrayNotEmpty([1, 2, 3])).toBe(true);
    });
});

// ---------------------------------------------------------------------------
// stripUndefined
// ---------------------------------------------------------------------------
describe("stripUndefined", () => {
    it("returns an empty array when all elements are undefined", () => {
        expect(stripUndefined([undefined, undefined])).toEqual([]);
    });

    it("removes undefined values while keeping all other values", () => {
        expect(stripUndefined([1, undefined, 2, undefined, 3])).toEqual([1, 2, 3]);
    });

    it("returns the original array unchanged when there are no undefined values", () => {
        expect(stripUndefined([1, 2, 3])).toEqual([1, 2, 3]);
    });

    it("keeps null and empty string values — only strips undefined", () => {
        expect(stripUndefined([null, "", undefined, 0])).toEqual([null, "", 0]);
    });
});

// ---------------------------------------------------------------------------
// isObject
// ---------------------------------------------------------------------------
describe("isObject", () => {
    it("returns true for plain objects", () => {
        expect(isObject({})).toBe(true);
        expect(isObject({ key: "value" })).toBe(true);
    });

    it("returns false for arrays", () => {
        expect(isObject([])).toBe(false);
        expect(isObject([1, 2, 3])).toBe(false);
    });

    it("returns false for null, primitives, and undefined", () => {
        expect(isObject(null)).toBe(false);
        expect(isObject(undefined)).toBe(false);
        expect(isObject(42)).toBe(false);
        expect(isObject("string")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// isArray
// ---------------------------------------------------------------------------
describe("isArray", () => {
    it("returns true for arrays", () => {
        expect(isArray([])).toBe(true);
        expect(isArray([1, 2, 3])).toBe(true);
    });

    it("returns false for non-arrays", () => {
        expect(isArray({})).toBe(false);
        expect(isArray(null)).toBe(false);
        expect(isArray(undefined)).toBe(false);
        expect(isArray("string")).toBe(false);
    });
});

// ---------------------------------------------------------------------------
// safeJsonParse
// ---------------------------------------------------------------------------
describe("safeJsonParse", () => {
    it("parses valid JSON strings", () => {
        expect(safeJsonParse<{ key: string }>('{"key":"value"}')).toEqual({ key: "value" });
        expect(safeJsonParse<number[]>("[1,2,3]")).toEqual([1, 2, 3]);
    });

    it("returns null for malformed JSON", () => {
        expect(safeJsonParse("{not valid json}")).toBeNull();
    });

    it("returns null for null input", () => {
        expect(safeJsonParse(null)).toBeNull();
    });

    it("returns null for empty string", () => {
        expect(safeJsonParse("")).toBeNull();
    });
});

// ---------------------------------------------------------------------------
// candidateToType
// ---------------------------------------------------------------------------
describe("candidateToType", () => {
    it("returns the value when all validators pass", () => {
        expect(candidateToType<number>(42, [isNumber, isNotNegative])).toBe(42);
    });

    it("returns zero when all validators pass for zero", () => {
        expect(candidateToType<number>(0, [isNumber, isNotNegative])).toBe(0);
    });

    it("throws an error when any validator fails", () => {
        expect(() => candidateToType<number>(-5, [isNumber, isNotNegative])).toThrow();
    });

    it("includes the field name in the error message when provided", () => {
        expect(() =>
            candidateToType<number>(-5, [isNotNegative], "myField")
        ).toThrow(/myField/);
    });

    it("includes the failing validator name in the error message", () => {
        expect(() =>
            candidateToType<number>(-5, [isNotNegative])
        ).toThrow(/isNotNegative/);
    });
});
