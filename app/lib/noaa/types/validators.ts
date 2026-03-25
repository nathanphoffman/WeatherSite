import { CHANCE_FORECAST } from "./general";

export function isChanceForecastValue(candidate: unknown) {
    return (CHANCE_FORECAST as readonly string[]).includes(String(candidate));
}

export function isAboveAbsoluteZero(input: unknown) {
    return Number(input) > -459.67;
}

// World record hourly precipitation is ~12 inches; 20 inches catches obviously erroneous values.
export function isBelowReasonablePrecipitation(input: unknown) {
    return Number(input) < 20;
}

// 24 is permitted because some NOAA period representations use 24 to represent midnight
// (the end of a day), which militaryHourToRegularHour also handles as '12a'.
export function is24HourClockValue(input: unknown) {
    return Number(input) <= 24;
}

// 160°F is well above any recorded weather temperature but safely below boiling (212°F).
export function isBelowRealisticMaxTemperature(input: unknown) {
    return Number(input) < 160;
}

export function isNoMoreThan100(input: unknown) {
    return Number(input) <= 100;
}

export function isBelowSpeedOfSound(input: unknown) {
    return Number(input) < 767;
}