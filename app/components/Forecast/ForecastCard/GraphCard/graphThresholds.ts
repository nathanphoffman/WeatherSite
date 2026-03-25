import { RealFeelPreferences, StormPreferences } from '@/app/lib/noaa/config';
import { ThresholdLine } from './LineGraph';

export const realFeelThresholds: ThresholdLine[] = [
    { value: RealFeelPreferences.ExtremelyHotMin, color: '#f43f5e' },
    { value: RealFeelPreferences.VeryHotMin, color: '#ef4444' },
    { value: RealFeelPreferences.HotMin, color: '#eab308' },
    { value: RealFeelPreferences.WarmMin, color: 'rgba(255,255,255,0.0)' },
    { value: RealFeelPreferences.NiceMin, color: '#22c55e' },
    { value: RealFeelPreferences.CoolMin, color: 'rgba(255,255,255,0.0)' },
    { value: RealFeelPreferences.ColdMin, color: '#eab308' },
    { value: RealFeelPreferences.VeryColdMin, color: '#ef4444' },
];

export const stormThresholds: ThresholdLine[] = [
    { value: StormPreferences.AverageMin, color: 'rgba(255,255,255,0.45)' },
    { value: StormPreferences.PoorMin, color: '#eab308' },
    { value: StormPreferences.BadMin, color: '#ef4444' },
    { value: StormPreferences.VeryBadMin, color: '#f43f5e' },
];

export const windThresholds: ThresholdLine[] = [
    { value: 10, color: 'rgba(255,255,255,0.45)' },
    { value: 16, color: '#eab308' },
    { value: 23, color: '#ef4444' },
    { value: 30, color: '#f43f5e' },
];
