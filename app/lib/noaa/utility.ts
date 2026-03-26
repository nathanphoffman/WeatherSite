import { Magnitude } from "./types/general";
import { logger } from "../logger";


export function splitIntoGroupsOf3<T>(items: T[], previous?: T[][]): T[][] | undefined {
    const deepClone = [...items];
    const firstThreeItems = deepClone.splice(0, 3);

    if (items.length < 3) return previous;
    else if (!previous || previous.length === 0) return splitIntoGroupsOf3(deepClone, [firstThreeItems]);
    else if (previous && previous.length > 0 && items.length > 2) return splitIntoGroupsOf3(deepClone, [...previous, firstThreeItems]);
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
    const average = Math.round(numbers.reduce((accumulator, currentValue) => Number(accumulator) + Number(currentValue)) / numbers.length);
    return average;
}

export function militaryHourToRegularHour(militaryHour: number): string {
    if (militaryHour === 0 || militaryHour === 24) return '12a';
    if (militaryHour === 12) return '12p';
    return militaryHour < 12 ? `${militaryHour}a` : `${militaryHour - 12}p`;
}

export function pipe(functions: ((value: unknown) => unknown)[]) {
    return (x: unknown) => functions.reduce((accumulator, func) => func(accumulator), x);
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
export function debounce<TArgs extends unknown[], T>(callbackFunction: (...args: TArgs) => T, delay: number = 250, id?: number) {
    return (...args: TArgs) => {

        const wrappedFunction = (...args: TArgs) => callbackFunction(...args);

        if (!id) {
            setTimeout(wrappedFunction, delay);
        }
        else {
            clearTimeout(id);
            debounce(callbackFunction, delay)(...args);
        }
    };
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
