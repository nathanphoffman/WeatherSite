import { RealFeelPreferences, StormPreferences } from '@/app/lib/noaa/config';
import { ThresholdLine } from './LineGraph';

const COLOR_EXTREME = '#f43f5e';
const COLOR_BAD = '#ef4444';
const COLOR_POOR = '#eab308';
const COLOR_INVISIBLE = 'rgba(255,255,255,0.0)';
const COLOR_GOOD = '#22c55e';
const COLOR_REFERENCE = 'rgba(255,255,255,0.45)';

export const realFeelThresholds: ThresholdLine[] = [
    { value: RealFeelPreferences.ExtremelyHotMin, color: COLOR_EXTREME },
    { value: RealFeelPreferences.VeryHotMin, color: COLOR_BAD },
    { value: RealFeelPreferences.HotMin, color: COLOR_POOR },
    { value: RealFeelPreferences.WarmMin, color: COLOR_INVISIBLE },
    { value: RealFeelPreferences.NiceMin, color: COLOR_GOOD },
    { value: RealFeelPreferences.CoolMin, color: COLOR_INVISIBLE },
    { value: RealFeelPreferences.ColdMin, color: COLOR_POOR },
    { value: RealFeelPreferences.VeryColdMin, color: COLOR_BAD },
];

export const stormThresholds: ThresholdLine[] = [
    { value: StormPreferences.AverageMin, color: COLOR_REFERENCE },
    { value: StormPreferences.PoorMin, color: COLOR_POOR },
    { value: StormPreferences.BadMin, color: COLOR_BAD },
    { value: StormPreferences.VeryBadMin, color: COLOR_EXTREME },
];

export const windThresholds: ThresholdLine[] = [
    { value: 10, color: COLOR_REFERENCE },
    { value: 16, color: COLOR_POOR },
    { value: 23, color: COLOR_BAD },
    { value: 30, color: COLOR_EXTREME },
];

export const stormRatingThresholds: ThresholdLine[] = [
    { value: 10, color: COLOR_REFERENCE, showYLabel: true },
];

export const precipThresholds: ThresholdLine[] = [
    { value: 0.2, color: COLOR_REFERENCE, showYLabel: true },
];
