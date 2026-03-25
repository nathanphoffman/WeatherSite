import { Candidate, DomainModel } from "./general";
import { candidateToType, isNumber, isPositive, isStringType } from "../utility";

export type Weather = {
    lat: string;  // these are strings to avoid floating point imprecision
    long: string; // these are strings to avoid floating point imprecision
    unixSeconds: number;
    forecast: string;
};

export const WeatherModel: DomainModel<Weather, Candidate<Weather>> = {
    formModelFromCandidate(candidate: Candidate<Weather>): Weather {
        return {
            lat: candidateToType<string>(candidate.lat, [isStringType], "lat"),
            long: candidateToType<string>(candidate.long, [isStringType], "long"),
            unixSeconds: candidateToType<number>(candidate.unixSeconds, [isNumber, isPositive], "unixSeconds"),
            forecast: candidateToType<string>(candidate.forecast, [isStringType], "forecast"),
        };
    }
};