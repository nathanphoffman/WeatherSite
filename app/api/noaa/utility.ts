import { Magnitude } from "./types/general";

export function splitIntoGroupsOf3<T>(arr: T[], prev?: T[][]): T[][] {
    const deepClone = [...arr];
    const take3 = deepClone.splice(0, 3);
    if (arr.length < 3) return prev;
    else if (!prev || prev.length === 0) return splitIntoGroupsOf3(deepClone, [take3]);
    else if (prev && prev.length > 0 && arr.length > 2) return splitIntoGroupsOf3(deepClone, [...prev, take3]);
}

export function getDayOfTheWeek(day: string) {
    // !! need to fix this as it will not work on january dates
    return new Date(day + "/" + new Date().getFullYear()).toLocaleString('en-us', { weekday: 'long' });
}

export function getAverage(...numbers: number[] | Magnitude[]) {
    // !! fix this!
    const average = Math.round(numbers.reduce((a, b) => {
        const aa = Number(a);
        const bb = Number(b);
        return aa + bb as any;
    }) / numbers.length);
    return average;
}

export function militaryHourToRegularHour(mil: number): string {
    if (mil === 12) return "12pm";
    else if (mil > 12) return `${mil - 12}pm`;
    else if (mil === 0) return "12am";
    else return `${mil}am`;
}

export function pipe(fns) {
    return (x) => fns.reduce((acc, fn) => fn(acc), x);
}

export function arrayNotEmpty(arr: any[]): boolean {
    return arr && arr.length > 0;
}

export function stripUndefined(arr: any[]): any[] {
    return arr.filter(x => x !== undefined);
}

export function isNumber(input: unknown) {
    return !isNotNumber(input)
}

export function isNotNumber(input: unknown) {
    return isNaN(Number(input));
}

export function isWithin(min, max) {
    return (input: unknown) => {
        return isNumber(input) && min <= Number(input) <= max;
    }
}

export function isPositive(input: unknown) {
    return isNumber(input) && Number(input) > 0;
}

export function isNotNegative(input: unknown) {
    return isNumber(input) && Number(input) >= 0;
}

export function hasValue(input: unknown) {
    return input !== undefined && input !== null && input !== "";
}

export function isString(input: unknown) {
    return hasValue(input) && isNotNumber(input);
}

export function candidateToType<T>(candidate: unknown, validators: ((candidate: unknown) => boolean)[]) {
    const failedFunctionsOrUndefined = validators.map((validator) => validator(candidate) ? undefined : validator.name);
    const failedFunctions = stripUndefined(failedFunctionsOrUndefined);

    if (arrayNotEmpty(failedFunctions)) {
        console.log("VALIDATION FAILED!");
        throw `value ${candidate} was unable to be converted to designated type, failed on conversions: ${failedFunctions.join(',')}`;4
    }
    else return candidate as T;
}
