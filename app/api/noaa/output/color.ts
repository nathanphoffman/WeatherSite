import { RealFeelPreferences, StormPreferences } from "../config";
import { Magnitude } from "../types/general";

export const BRIGHT = "text-rose-500" as const;
//export const BLINK = 5 as const;
export const RED = "text-red-500" as const;
export const GREEN = "text-green-500" as const;
export const YELLOW = "text-yellow-500" as const;
export const WHITE = "text-white" as const;

export function getRealFeelMagnitude(realFeel: number): Magnitude {

    if (realFeel >= RealFeelPreferences.ExtremelyHotMin) return 4;
    else if (realFeel >= RealFeelPreferences.VeryHotMin) return 3;
    else if (realFeel >= RealFeelPreferences.HotMin) return 2;
    else if (realFeel >= RealFeelPreferences.WarmMin) return 1;
    else if (realFeel >= RealFeelPreferences.NiceMin) return 0;
    else if (realFeel >= RealFeelPreferences.CoolMin) return 1;
    else if (realFeel >= RealFeelPreferences.ColdMin) return 2;
    else if (realFeel >= RealFeelPreferences.VeryColdMin) return 3;
    else return 4;
}

export function getStormMagnitude(stormRating: number): Magnitude {
    if (stormRating < StormPreferences.AverageMin) return 0;
    else if (stormRating < StormPreferences.PoorMin) return 1;
    else if (stormRating < StormPreferences.BadMin) return 2;
    else if (stormRating < StormPreferences.VeryBadMin) return 3;
    else return 4;
}

export function color(txt: string, color: number) {
    if (!color) return txt;
    return `<span class="${color}">${txt}</span>`;
}

export function underline(txt: string) {
    return `${"\x1b"}[4m${txt}${"\x1b"}[0m`;
}

export function getFreezeIconFromTemperatures(...temperatures: number[]) {
    const freezingTemperatures = temperatures.find(temp => temp < 33);
    return (freezingTemperatures ?? 0) > 0 ? "🧊" : " ";
}

export function getHappyFaceFromMagnitude(humidityMagnitude: Magnitude, realFeelMagnitude: Magnitude, stormMagnitude: Magnitude) {
    let sadIndex = 0;

    sadIndex = sadIndex + realFeelMagnitude + stormMagnitude + humidityMagnitude * 0.5;

    if (sadIndex === 0) return "😎";
    else if (sadIndex <= 1) return "🙂";
    else return " ";
}
/*
// the purpose of this is to account for burst events like sudden showers followed by clear skies
// since three hours are normally averaged, this lets us know if there is a lot of deviation between them
export function getUnstableStormRatingIcon(...stormRatings: string[]) {
    const freezingTemperatures = temperatures.find(temp=>Number(temp) < 33);
    return freezingTemperatures?.length ?? 0 > 0;
    //⚠️
}
    */
