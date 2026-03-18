import { CHANCE_FORECAST } from "./general";

export function isChanceForecastValue(candidate: unknown) {
    return CHANCE_FORECAST.includes(String(candidate) as any);
}

export function isAboveAbsoluteZero(input: unknown) {
    return Number(input) > -274;
}

export function is24OrLess(input: unknown) {
    return Number(input) <= 24;
}

export function isBelowBoiling(input: unknown) {
    return Number(input) < 212;
}

export function isNoMoreThan100(input: unknown) {
    return Number(input) <= 100;
}

export function isBelowSpeedOfSound(input: unknown) {
    return Number(input) < 767;
}