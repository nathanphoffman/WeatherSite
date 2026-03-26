import { Candidate, ChanceForecast, DomainModel, Hour } from "./general";
import { candidateToType, isNumber, isNotNegative, isStringNotNumber } from "../utility";
import { is24HourClockValue, isAboveAbsoluteZero, isBelowRealisticMaxTemperature, isBelowReasonablePrecipitation, isBelowSpeedOfSound, isChanceForecastValue, isNoMoreThan100 } from "./validators";

type Fahrenheit = number;
type Percent = number;
type AirMilesPerHour = number;
type Inches = number;

// !! unknown number should be updated here
export interface ThreeHourWeatherModel {
    temperature: Fahrenheit,
    skyCover: Percent,
    wind: AirMilesPerHour,
    humidity: Percent,
    precipChance: Percent,
    precipAmount: Inches,
    rain: ChanceForecast,
    snow: ChanceForecast,
    thunder: ChanceForecast,
    hour: Hour  // use a range comparison something fancy like IntRange<>
};

export const ThreeHourWeatherModel: DomainModel<ThreeHourWeatherModel, Candidate<ThreeHourWeatherModel>> = {
    formModelFromCandidate(candidate: Candidate<ThreeHourWeatherModel>): ThreeHourWeatherModel {
        return {
            temperature: formFahrenheit("temperature", candidate.temperature),
            skyCover: formPercent("skyCover", candidate.skyCover),
            wind: formAirMilesPerHour("wind", candidate.wind),
            humidity: formPercent("humidity", candidate.humidity),
            precipChance: formPercent("precipChance", candidate.precipChance),
            precipAmount: formInches("precipAmount", candidate.precipAmount),
            rain: formChanceForecast("rain", candidate.rain),
            snow: formChanceForecast("snow", candidate.snow),
            thunder: formChanceForecast("thunder", candidate.thunder),
            hour: formHour("hour", candidate.hour),
        };

        function formChanceForecast(fieldName: string, candidate: unknown): ChanceForecast {
            return candidateToType<ChanceForecast>(candidate, [isStringNotNumber, isChanceForecastValue], fieldName);
        }

        function formFahrenheit(fieldName: string, candidate: unknown): Fahrenheit {
            return candidateToType<Fahrenheit>(candidate, [isNumber, isAboveAbsoluteZero, isBelowRealisticMaxTemperature], fieldName);
        }

        function formPercent(fieldName: string, candidate: unknown): Percent {
            return candidateToType<Percent>(candidate, [isNumber, isNotNegative, isNoMoreThan100], fieldName);
        }

        function formAirMilesPerHour(fieldName: string, candidate: unknown): AirMilesPerHour {
            return candidateToType<AirMilesPerHour>(candidate, [isNumber, isNotNegative, isBelowSpeedOfSound], fieldName);
        }

        function formInches(fieldName: string, candidate: unknown): Inches {
            return candidateToType<Inches>(candidate, [isNumber, isNotNegative, isBelowReasonablePrecipitation], fieldName);
        }

        function formHour(fieldName: string, candidate: unknown): Hour {
            return candidateToType<Hour>(candidate, [isNumber, isNotNegative, is24HourClockValue], fieldName);
        }
    }
};
