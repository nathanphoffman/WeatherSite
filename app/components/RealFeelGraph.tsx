import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { getRealFeelTemperature, getMagnitude, convertNOAAChancesToAverageMagnitude, getStormRating } from '@/app/lib/noaa/output/calculations';
import { getRealFeelMagnitude, getStormMagnitude, getHappyFaceFromMagnitude } from '@/app/lib/noaa/output/color';
import { HumidityRanges, WindRanges, RealFeelPreferences } from '@/app/lib/noaa/config';
import { getAverage } from '@/app/lib/noaa/utility';

interface RealFeelGraphProps {
    groups: ThreeHourGroup[];
}

interface ThresholdLine {
    value: number;
    color: string;
}

interface LineGraphProps {
    title: string;
    points: { hour: number; value: number }[];
    color: string;
    labelIndices: number[];
    height?: number;
    minValue?: number;
    maxValue?: number;
    formatYLabel?: (value: number) => string;
    thresholdLines?: ThresholdLine[];
}

const SVG_WIDTH = 238;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 20;
const PADDING_LEFT = 28;
const PADDING_RIGHT = 8;

function smoothLinePath(coords: [number, number][]): string {
    if (coords.length < 2) return '';
    let path = `M ${coords[0][0].toFixed(1)},${coords[0][1].toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
        const previous = coords[i - 1] ?? coords[i];
        const current = coords[i];
        const next = coords[i + 1];
        const afterNext = coords[i + 2] ?? next;
        const cp1x = current[0] + (next[0] - previous[0]) / 6;
        const cp1y = current[1] + (next[1] - previous[1]) / 6;
        const cp2x = next[0] - (afterNext[0] - current[0]) / 6;
        const cp2y = next[1] - (afterNext[1] - current[1]) / 6;
        path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${next[0].toFixed(1)},${next[1].toFixed(1)}`;
    }
    return path;
}

function smoothAreaPath(coords: [number, number][], baseline: number, firstX: number, lastX: number): string {
    return `${smoothLinePath(coords)} L ${lastX.toFixed(1)},${baseline} L ${firstX.toFixed(1)},${baseline} Z`;
}

function formatHourLabel(hour: number): string {
    if (hour === 0 || hour === 24) return '12a';
    if (hour === 12) return '12p';
    return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}

function LineGraph({ title, points, color, labelIndices, height = 80, minValue, maxValue, formatYLabel, thresholdLines }: LineGraphProps) {
    const plotWidth = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = height - PADDING_TOP - PADDING_BOTTOM;

    const values = points.map((p) => p.value);
    const computedMin = minValue ?? Math.min(...values);
    const computedMax = maxValue ?? Math.max(...values);
    const valueRange = computedMax - computedMin || 1;

    const hours = points.map((p) => p.hour);
    const minHour = Math.min(...hours);
    const maxHour = Math.max(...hours);
    const hourRange = maxHour - minHour || 1;

    const xAt = (hour: number) => PADDING_LEFT + ((hour - minHour) / hourRange) * plotWidth;
    const yAt = (value: number) => PADDING_TOP + ((computedMax - value) / valueRange) * plotHeight;

    const firstX = xAt(points[0].hour);
    const lastX = xAt(points[points.length - 1].hour);
    const baseline = PADDING_TOP + plotHeight;

    const coords: [number, number][] = points.map((p) => [xAt(p.hour), yAt(p.value)]);
    const linePath = smoothLinePath(coords);
    const areaPath = smoothAreaPath(coords, baseline, firstX, lastX);

    const defaultFormatYLabel = (value: number) => String(Math.round(value));

    // !! this was outputted directly from claude and is a bit of a blackbox, come back to this
    return (
        <>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 mt-2">{title}</p>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${height}`} width="100%" height={height}>
                <text x={PADDING_LEFT - 4} y={PADDING_TOP + 4} fontSize={9} fill="#6b7280" textAnchor="end">
                    {(formatYLabel ?? defaultFormatYLabel)(computedMax)}
                </text>
                <text x={PADDING_LEFT - 4} y={PADDING_TOP + plotHeight + 4} fontSize={9} fill="#6b7280" textAnchor="end">
                    {(formatYLabel ?? defaultFormatYLabel)(computedMin)}
                </text>
                <line x1={PADDING_LEFT} y1={PADDING_TOP} x2={PADDING_LEFT + plotWidth} y2={PADDING_TOP} stroke="#1f2937" strokeWidth={1} />
                <line x1={PADDING_LEFT} y1={PADDING_TOP + plotHeight} x2={PADDING_LEFT + plotWidth} y2={PADDING_TOP + plotHeight} stroke="#1f2937" strokeWidth={1} />
                {thresholdLines?.filter((t) => t.value >= computedMin && t.value <= computedMax).map((threshold, index) => (
                    <line
                        key={index}
                        x1={PADDING_LEFT}
                        y1={yAt(threshold.value)}
                        x2={PADDING_LEFT + plotWidth}
                        y2={yAt(threshold.value)}
                        stroke={threshold.color}
                        strokeWidth={1}
                        strokeDasharray="4,3"
                        opacity={0.5}
                    />
                ))}
                <path d={areaPath} fill={color} fillOpacity={0.1} />
                <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
                {labelIndices.map((dataIndex) => {
                    const point = points[dataIndex];
                    return point ? (
                        <text key={dataIndex} x={xAt(point.hour)} y={height - 4} fontSize={9} fill="#6b7280" textAnchor="middle">
                            {formatHourLabel(point.hour)}
                        </text>
                    ) : null;
                })}
            </svg>
        </>
    );
}

export default function RealFeelGraph({ groups }: RealFeelGraphProps) {
    const sortedHours = (selector: (hourData: ThreeHourGroup['hours'][number]) => number) =>
        groups
            .flatMap((group) => group.hours.map((hourData) => ({ hour: hourData.hour, value: selector(hourData) })))
            .sort((a, b) => a.hour - b.hour);

    const realFeelPoints = groups
        .flatMap((group) =>
            group.hours.map((hourData) => ({
                hour: hourData.hour,
                value: getRealFeelTemperature(
                    hourData.temperature,
                    getMagnitude(hourData.humidity, HumidityRanges),
                    getMagnitude(hourData.wind, WindRanges),
                    hourData.skyCover,
                    hourData.hour
                ),
            }))
        )
        .sort((a, b) => a.hour - b.hour);

    const windPoints = sortedHours((h) => h.wind);
    const skyCoverPoints = sortedHours((h) => h.skyCover);

    if (realFeelPoints.length === 0) return null;

    const SMILEY_RANK: Record<string, number> = { '😎': 0, '🙂': 1 };
    const smileys = groups.map((group) => {
        const { middleHour, hours } = group;
        const humidityMagnitude = getMagnitude(getAverage(...hours.map((h) => h.humidity)), HumidityRanges);
        const windMagnitude = getMagnitude(getAverage(...hours.map((h) => h.wind)), WindRanges);
        const thunderMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((h) => h.thunder));
        const rainMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((h) => h.rain));
        const snowMagnitude = convertNOAAChancesToAverageMagnitude(...hours.map((h) => h.snow));
        const averageSkyCover = getAverage(...hours.map((h) => h.skyCover));
        const realFeel = getRealFeelTemperature(getAverage(...hours.map((h) => h.temperature)), humidityMagnitude, windMagnitude, averageSkyCover, middleHour);
        const stormRating = getStormRating(averageSkyCover, getAverage(...hours.map((h) => h.precipChance)), rainMagnitude, snowMagnitude, windMagnitude, thunderMagnitude);
        return getHappyFaceFromMagnitude(humidityMagnitude, getRealFeelMagnitude(realFeel), getStormMagnitude(stormRating));
    });
    const bestSmiley = smileys.reduce<string | null>((best, smiley) => {
        if (!(smiley in SMILEY_RANK)) return best;
        if (best === null || SMILEY_RANK[smiley] < SMILEY_RANK[best]) return smiley;
        return best;
    }, null);

    const realFeelThresholds: ThresholdLine[] = [
        { value: RealFeelPreferences.ExtremelyHotMin, color: '#f43f5e' },
        { value: RealFeelPreferences.VeryHotMin,      color: '#ef4444' },
        { value: RealFeelPreferences.HotMin,          color: '#eab308' },
        { value: RealFeelPreferences.WarmMin,         color: 'rgba(255,255,255,0.45)' },
        { value: RealFeelPreferences.NiceMin,         color: '#22c55e' },
        { value: RealFeelPreferences.CoolMin,         color: 'rgba(255,255,255,0.45)' },
        { value: RealFeelPreferences.ColdMin,         color: '#eab308' },
        { value: RealFeelPreferences.VeryColdMin,     color: '#ef4444' },
    ];

    const windThresholds: ThresholdLine[] = [
        { value: 10, color: 'rgba(255,255,255,0.45)' },
        { value: 16, color: '#eab308' },
        { value: 23, color: '#ef4444' },
        { value: 30, color: '#f43f5e' },
    ];

    const highTemp = Math.max(...realFeelPoints.map((p) => p.value));
    const lowTemp = Math.min(...realFeelPoints.map((p) => p.value));

    const labelCount = 3;
    const labelIndices = Array.from({ length: labelCount }, (_, index) =>
        Math.round((index / (labelCount - 1)) * (realFeelPoints.length - 1))
    );

/*
            <LineGraph
                title="Wind Speed"
                points={windPoints}
                color="#a78bfa"
                labelIndices={labelIndices}
                minValue={0}
                thresholdLines={windThresholds}
            />
*/

    return (
        <div>
            <div className="flex justify-between items-baseline mb-3">
                <span className="text-4xl font-bold text-white">{highTemp}°</span>
                <span className="text-4xl font-bold text-gray-400">{lowTemp}°</span>
            </div>
            <LineGraph
                title="Real Feel"
                points={realFeelPoints}
                color="#3b82f6"
                labelIndices={labelIndices}
                height={110}
                formatYLabel={(value) => `${Math.round(value)}°`}
                thresholdLines={realFeelThresholds}
            />
            <LineGraph
                title="Cloud Cover"
                points={skyCoverPoints}
                color="#94a3b8"
                labelIndices={labelIndices}
                minValue={0}
                maxValue={100}
                formatYLabel={(value) => `${value}%`}
            />

  
        </div>
    );
}
