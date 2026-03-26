import { Candidate, DomainModel } from "./general";
import { candidateToType, isNumber, isPositive, isStringType } from "../utility";
import { isReasonableUnixTimestamp, isValidLatitude, isValidLongitude } from "./validators";

export type Weather = {
    lat: string;  // these are strings to avoid floating point imprecision
    long: string; // these are strings to avoid floating point imprecision
    unixSeconds: number;
    forecast: string;
};

export const WeatherModel: DomainModel<Weather, Candidate<Weather>> = {
    formModelFromCandidate(candidate: Candidate<Weather>): Weather {
        return {
            lat: candidateToType<string>(candidate.lat, [isStringType, isValidLatitude], "lat"),
            long: candidateToType<string>(candidate.long, [isStringType, isValidLongitude], "long"),
            unixSeconds: candidateToType<number>(candidate.unixSeconds, [isNumber, isPositive, isReasonableUnixTimestamp], "unixSeconds"),
            forecast: candidateToType<string>(candidate.forecast, [isStringType], "forecast"),
        };
    }
};