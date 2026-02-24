import { BRIGHT, color, GREEN, RED, WHITE, YELLOW } from "./color";
import { Magnitude, Postfix, PostfixLetter } from "../types/general";

export function getWithColor(magnitude: Magnitude, str: string) {

    //!! remove the need for this conversion
    const magAsNumber = Number(magnitude);
    const postFix = str;
    if(magAsNumber === 4) return color(color(postFix, RED), BRIGHT);
    else if (magAsNumber === 3) return color(postFix, RED) ;
    else if (magAsNumber === 2) return color(postFix, YELLOW);
    else if (magAsNumber === 1) return color(postFix, WHITE);
    else if (magAsNumber === 0) return color(postFix, GREEN);
    else throw "magnitude is not in the 0-4 range of expected numbers";
}

// delete !!
export function getPostfix(magnitude: Magnitude, postFixLetter: PostfixLetter): Postfix | string {
    const magAsNumber = Number(magnitude);
    if (magAsNumber > 4 || magAsNumber < 0) throw "magnitude cannot be greater than 4 or less than 0";
    else if (magAsNumber === 0) return "";
    else return getWithColor(magnitude, postFixLetter);
    //else throw `Postfix ${postFixLetter ?? "empty"} is not setup.`;
}