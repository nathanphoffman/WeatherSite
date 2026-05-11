import { describe, it, expect } from "vitest";
import { getStormRating } from "./calculations";
import { Magnitude } from "../types/general";

// Magnitudes for readability
const NONE = 0 as Magnitude;      // "--" / ≤9mph wind / ≤60% humidity
const ALRIGHT = 1 as Magnitude;   // "SChc" / 10-15mph / 61-72%
const POOR = 2 as Magnitude;      // "Chc" / 16-22mph / 73-84%
const BAD = 3 as Magnitude;       // "Lkly" / 23-29mph / 85-96%
const SEVERE = 4 as Magnitude;    // "Ocnl" / ≥30mph / ≥97%

// Precipitation amounts in liquid-equivalent inches/hr
const LIGHT_PRECIP = 0.02;      // drizzle
const MODERATE_PRECIP = 0.15;   // steady rain
const HEAVY_PRECIP = 0.35;      // heavy rain
const INTENSE_PRECIP = 0.6;     // tropical/severe storm

function expectInRange(value: number, min: number, max: number) {
    expect(value, `expected ${value} to be in [${min}, ${max})`).toBeGreaterThanOrEqual(min);
    expect(value, `expected ${value} to be in [${min}, ${max})`).toBeLessThan(max);
}

describe("getStormRating", () => {
    it("clear calm day — should be near 0", () => {
        const rating = getStormRating({
            skyCover: 5,
            precipChance: 0,
            precipAmount: 0,
            snowMagnitude: NONE,
            windMagnitude: NONE,
            thunderMagnitude: NONE,
            humidityMagnitude: NONE,
        });
        expectInRange(rating, 0, 2);
    });

    it("50/50 cloudy breezy afternoon, low precip chance — should be alright", () => {
        const rating = getStormRating({
            skyCover: 50,
            precipChance: 15,
            precipAmount: 0,
            snowMagnitude: NONE,
            windMagnitude: ALRIGHT,
            thunderMagnitude: NONE,
            humidityMagnitude: ALRIGHT,
        });
        expectInRange(rating, 8, 10);
    });

    it("overcast humid summer day, no wind low precip chance — should be alright", () => {
        const rating = getStormRating({
            skyCover: 85,
            precipChance: 20,
            precipAmount: 0,
            snowMagnitude: NONE,
            windMagnitude: NONE,
            thunderMagnitude: NONE,
            humidityMagnitude: POOR,
        });
        expectInRange(rating, 10, 20);
    });

    it("light rain shower — should be poor", () => {
        const rating = getStormRating({
            skyCover: 90,
            precipChance: 60,
            precipAmount: LIGHT_PRECIP,
            snowMagnitude: NONE,
            windMagnitude: ALRIGHT,
            thunderMagnitude: NONE,
            humidityMagnitude: POOR,
        });
        expectInRange(rating, 15, 25);
    });

    it("light snow flurries, breezy", () => {
        const rating = getStormRating({
            skyCover: 80,
            precipChance: 40,
            precipAmount: 0.05,
            snowMagnitude: ALRIGHT,
            windMagnitude: ALRIGHT,
            thunderMagnitude: NONE,
            humidityMagnitude: ALRIGHT,
        });
        expectInRange(rating, 12, 20);
    });

    it("fully overcast, heavy rain, moderate wind, bad conditions", () => {
        const rating = getStormRating({
            skyCover: 100,
            precipChance: 95,
            precipAmount: HEAVY_PRECIP,
            snowMagnitude: NONE,
            windMagnitude: POOR,
            thunderMagnitude: NONE,
            humidityMagnitude: BAD,
        });
        expectInRange(rating, 30, 40);
    });

    it("strong wind gusts, mostly clear", () => {
        const rating = getStormRating({
            skyCover: 60,
            precipChance: 5,
            precipAmount: 0,
            snowMagnitude: NONE,
            windMagnitude: SEVERE,
            thunderMagnitude: NONE,
            humidityMagnitude: NONE,
        });
        expectInRange(rating, 28, 35);
    });

    it("thunderstorm with heavy rain", () => {
        const rating = getStormRating({
            skyCover: 100,
            precipChance: 90,
            precipAmount: 0.5,
            snowMagnitude: NONE,
            windMagnitude: BAD,
            thunderMagnitude: POOR,
            humidityMagnitude: BAD,
        });
        expectInRange(rating, 35, 51);
    });

    it("winter blizzard", () => {
        const rating = getStormRating({
            skyCover: 100,
            precipChance: 95,
            precipAmount: 0.4,
            snowMagnitude: BAD,
            windMagnitude: BAD,
            thunderMagnitude: NONE,
            humidityMagnitude: ALRIGHT,
        });
        expectInRange(rating, 45, 50);
    });

    it("severe thunderstorm — should be capped at VeryBad (50)", () => {
        const rating = getStormRating({
            skyCover: 100,
            precipChance: 100,
            precipAmount: INTENSE_PRECIP,
            snowMagnitude: NONE,
            windMagnitude: SEVERE,
            thunderMagnitude: SEVERE,
            humidityMagnitude: SEVERE,
        });
        expect(rating).toBe(50);
    });

    it("snow multiplies precip penalty proportionally to snow magnitude", () => {
        const noSnow = getStormRating({
            skyCover: 100,
            precipChance: 80,
            precipAmount: 0.3,
            snowMagnitude: NONE,
            windMagnitude: NONE,
            thunderMagnitude: NONE,
            humidityMagnitude: NONE,
        });
        const likelySnow = getStormRating({
            skyCover: 100,
            precipChance: 80,
            precipAmount: 0.3,
            snowMagnitude: BAD,
            windMagnitude: NONE,
            thunderMagnitude: NONE,
            humidityMagnitude: NONE,
        });
        expect(likelySnow).toBeGreaterThan(noSnow);
    });
});
