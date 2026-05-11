import { describe, it, expect } from "vitest";
import { getStormRating } from "./calculations";
import { Magnitude } from "../types/general";

// Magnitudes for readability
const NONE = 0 as Magnitude;    // "--" / ≤9mph wind / ≤60% humidity
const SLIGHT = 1 as Magnitude;  // "SChc" / 10-15mph / 61-72%
const CHANCE = 2 as Magnitude;  // "Chc" / 16-22mph / 73-84%
const LIKELY = 3 as Magnitude;  // "Lkly" / 23-29mph / 85-96%
const OCNL = 4 as Magnitude;    // "Ocnl" / ≥30mph / ≥97%

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
        const rating = getStormRating(5, 0, 0, NONE, NONE, NONE, NONE);
        expectInRange(rating, 0, 2);
    });

    it("50/50 cloudy breezy afternoon, low precip chance — should be alright", () => {
        const rating = getStormRating(50, 15, 0, NONE, SLIGHT, NONE, SLIGHT);
        expectInRange(rating, 8, 10);
    });

    it("overcast humid summer day, no wind low precip chance — should be alright", () => {
        // skyCover=85, precipChance=20, precipAmount=0, humidity=chance(73-84%)
        // skyCoverOutOf10=8.5, humidityPenalty=2, precipPenalty=0 → raw=10.5
        const rating = getStormRating(85, 20, 0, NONE, NONE, NONE, CHANCE);
        expectInRange(rating, 10, 20);
    });

    it("light rain shower — should be poor", () => {
        const rating = getStormRating(90, 60, LIGHT_PRECIP, NONE, SLIGHT, NONE, CHANCE);
        expectInRange(rating, 15, 25);
    });

    it("light snow flurries, breezy — should be Average (8-20)", () => {
        const rating = getStormRating(80, 40, 0.05, SLIGHT, SLIGHT, NONE, SLIGHT);
        expectInRange(rating, 30, 40);
    });

    it("fully overcast, heavy rain,  moderate wind, bad conditions", () => {
        // skyCover=95, precipChance=80, precipAmount=0.5in, wind=chance(16-22mph), humidity=likely
        // skyCoverOutOf10=9.5, windPenalty=6, precipPenalty=0.8*min(0.5*1*20,10)=0.8*10=8, humidityPenalty=3 → raw=26.5
        const rating = getStormRating(100, 95, HEAVY_PRECIP, NONE, CHANCE, NONE, LIKELY);
        expectInRange(rating, 30, 40);
    });

    it("strong wind gusts, mostly clear — should be Bad (30-50)", () => {
        // skyCover=60, precipChance=5, precipAmount=0, wind=ocnl(≥30mph), humidity=none
        // skyCoverOutOf10=6, windPenalty=24, precipPenalty=0 → raw=30
        const rating = getStormRating(60, 5, 0, NONE, OCNL, NONE, NONE);
        expect(rating).toBeCloseTo(30, 2);
    });

    it("thunderstorm with heavy rain — should be Bad (30-50)", () => {
        // skyCover=100, precipChance=90, precipAmount=0.5in, wind=likely(23-29mph), thunder=chance, humidity=likely
        // skyCoverOutOf10=10, thunderPenalty=10, windPenalty=13.5, precipPenalty=0.9*10=9, humidityPenalty=3 → raw=45.5
        const rating = getStormRating(100, 90, 0.5, NONE, LIKELY, CHANCE, LIKELY);
        expect(rating).toBeCloseTo(45.5, 2);
    });

    it("winter blizzard — should be Bad (30-50)", () => {
        // skyCover=100, precipChance=90, precipAmount=0.3in, snow=likely, wind=likely, humidity=slight
        // skyCoverOutOf10=10, windPenalty=13.5, precipPenalty=0.9*min(0.3*(3+1)*20,10)=0.9*10=9, humidityPenalty=1 → raw=33.5
        const rating = getStormRating(100, 90, 0.3, LIKELY, LIKELY, NONE, SLIGHT);
        expect(rating).toBeCloseTo(33.5, 2);
    });

    it("severe thunderstorm — should be capped at VeryBad (50)", () => {
        // skyCover=100, precipChance=100, precipAmount=0.5in/hr (maxes precip penalty; cap kicks in at 0.5), wind=ocnl, thunder=ocnl, humidity=ocnl
        // raw = 10 + 24 + 10 + 20 + 4 = 68 → capped at 50
        const rating = getStormRating(100, 100, 0.5, NONE, OCNL, OCNL, OCNL);
        expect(rating).toBe(50);
    });

    it("snow multiplies precip penalty proportionally to snow magnitude", () => {
        const noSnow = getStormRating(100, 80, 0.3, NONE, NONE, NONE, NONE);
        const likelySnow = getStormRating(100, 80, 0.3, LIKELY, NONE, NONE, NONE);
        expect(likelySnow).toBeGreaterThan(noSnow);
    });
});
