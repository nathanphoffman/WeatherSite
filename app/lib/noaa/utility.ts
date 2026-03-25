import { Magnitude } from "./types/general";


export function splitIntoGroupsOf3<T>(arr: T[], prev?: T[][]): T[][] | undefined {
    const deepClone = [...arr];
    const take3 = deepClone.splice(0, 3);

    if (arr.length < 3) return prev;
    else if (!prev || prev.length === 0) return splitIntoGroupsOf3(deepClone, [take3]);
    else if (prev && prev.length > 0 && arr.length > 2) return splitIntoGroupsOf3(deepClone, [...prev, take3]);
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

export function pipe(fns: ((t: any)=>any)[]) {
    return (x: any) => fns.reduce((acc, fn) => fn(acc), x);
}

export function arrayNotEmpty(arr: any[]): boolean {
    return arr && arr.length > 0;
}

export function stripUndefined(arr: any[]): any[] {
    return arr.filter(x => x !== undefined);
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

// !! review this
export function candidateToType<T>(candidate: unknown, validators: ((candidate: unknown) => boolean)[], fieldName?: string) {
    const failedFunctionsOrUndefined = validators.map((validator) => validator(candidate) ? undefined : validator.name);
    const failedFunctions = stripUndefined(failedFunctionsOrUndefined);

    if (arrayNotEmpty(failedFunctions)) {
        const fieldInfo = fieldName ? ` field="${fieldName}"` : "";
        console.log(`VALIDATION FAILED!${fieldInfo} value=${candidate}`);
        const fieldLabel = fieldName ? ` for field "${fieldName}"` : "";
        throw new Error(`value ${candidate}${fieldLabel} was unable to be converted to designated type, failed on conversions: ${failedFunctions.join(",")}`);
    }
    else return candidate as T;
}
