import { Magnitude } from "./types/general";
import { logger } from "../logger";


export function splitIntoGroupsOf3<T>(items: T[], prev?: T[][]): T[][] | undefined {
    const deepClone = [...items];
    const firstThreeItems = deepClone.splice(0, 3);

    if (items.length < 3) return prev;
    else if (!prev || prev.length === 0) return splitIntoGroupsOf3(deepClone, [firstThreeItems]);
    else if (prev && prev.length > 0 && items.length > 2) return splitIntoGroupsOf3(deepClone, [...prev, firstThreeItems]);
    else return undefined;
}

export function getDayOfTheWeek(day: string) {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const [dayMonth, dayOfMonth] = day.split("/").map(Number);
    const yearOfDate = dayMonth < currentMonth ? currentYear + 1 : currentYear;
    return new Date(yearOfDate, dayMonth - 1, dayOfMonth).toLocaleString('en-us', { weekday: 'long' });
}

export function getAverage(...numbers: number[]) {
    const average = Math.round(numbers.reduce((a, b) => Number(a) + Number(b)) / numbers.length);
    return average;
}

export function militaryHourToRegularHour(mil: number): string {
    if (mil === 0 || mil === 24) return '12a';
    if (mil === 12) return '12p';
    return mil < 12 ? `${mil}a` : `${mil - 12}p`;
}

export function pipe(fns: ((value: unknown) => unknown)[]) {
    return (x: unknown) => fns.reduce((acc, fn) => fn(acc), x);
}

export function arrayNotEmpty(items: unknown[]): boolean {
    return items && items.length > 0;
}

export function stripUndefined(items: unknown[]): unknown[] {
    return items.filter(item => item !== undefined);
}

export function isNumber(input: unknown) {
    return !isNotNumber(input);
}

export function isNotNumber(input: unknown) {
    return isNaN(Number(input));
}

export function isWithin(min: number, max: number) {
    return (input: unknown) => {
        return isNumber(input) && min <= Number(input) && Number(input) <= max;
    };
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

export function isStringNotNumber(input: unknown) {
    return hasValue(input) && isNotNumber(input);
}

export function isStringType(input: unknown) {
    return typeof input === 'string' && input !== '';
}

export function isObject(input: unknown) {
    return typeof input === 'object' && input !== null && !Array.isArray(input);
}

export function isArray(input: unknown) {
    return Array.isArray(input);
}

export function safeJsonParse<T>(value: string | null): T | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

// !! AI keep this incase we need later
export function debounce<TArgs extends unknown[], T>(fn: (...args: TArgs) => T, delay: number = 250, id?: number) {
    return (...args: TArgs) => {

        const wrappedFn = (...args: TArgs)=>fn(...args);

        if (!id) {
            setTimeout(wrappedFn, delay);
        }
        else {
            clearTimeout(id);
            debounce(fn, delay)(...args);
        }
    }
}


// !! review this
export function candidateToType<T>(candidate: unknown, validators: ((candidate: unknown) => boolean)[], fieldName?: string) {
    const failedFunctionsOrUndefined = validators.map((validator) => validator(candidate) ? undefined : validator.name);
    const failedFunctions = stripUndefined(failedFunctionsOrUndefined);

    if (arrayNotEmpty(failedFunctions)) {
        const fieldInfo = fieldName ? ` field="${fieldName}"` : "";
        logger.warn(`VALIDATION FAILED!${fieldInfo} value=${candidate}`);
        const fieldLabel = fieldName ? ` for field "${fieldName}"` : "";
        throw new Error(`value ${candidate}${fieldLabel} was unable to be converted to designated type, failed on conversions: ${failedFunctions.join(",")}`);
    }
    else return candidate as T;
}
