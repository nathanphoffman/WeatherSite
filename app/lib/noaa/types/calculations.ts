import { Magnitude } from "./general";

export type RealFeelMin = {
    ExtremelyHotMin: number;
    VeryHotMin: number;
    HotMin: number;
    WarmMin: number;
    NiceMin: number;
    CoolMin: number;
    ColdMin: number;
    VeryColdMin: number;
};

export type StormMin = {
    VeryBadMin: number;
    BadMin: number;
    PoorMin: number;
    AverageMin: number;
};

export type StormFactors = {
    skyCover: number;
    precipChance: number;
    precipAmount: number;
    snowMagnitude: Magnitude;
    windMagnitude: Magnitude;
    thunderMagnitude: Magnitude;
    humidityMagnitude: Magnitude;
};
