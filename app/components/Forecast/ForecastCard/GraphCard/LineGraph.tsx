import { SVG_WIDTH, PADDING_LEFT, PADDING_RIGHT, PADDING_TOP, PADDING_BOTTOM, smoothLinePath, smoothAreaPath, formatHourLabel, buildAxisHelpers } from './graphCardsConfig';

export interface ThresholdLine {
    value: number;
    color: string;
    showYLabel?: boolean;
}

export interface LineGraphProps {
    title: string;
    points: { hour: number; value: number }[];
    color: string;
    labelIndices: number[];
    height?: number;
    minValue?: number;
    maxValue?: number;
    formatYLabel?: (value: number) => string;
    thresholdLines?: ThresholdLine[];
    logStrength?: number;
}

// !! this was outputted directly from claude and is a bit of a blackbox, come back to this
export default function LineGraph({ title, points, color, labelIndices, height = 80, minValue, maxValue, formatYLabel, thresholdLines, logStrength }: LineGraphProps) {
    const plotWidth = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = height - PADDING_TOP - PADDING_BOTTOM;

    const values = points.map((p) => p.value);
    const computedMin = minValue ?? Math.min(...values);
    const computedMax = maxValue ?? Math.max(...values);

    const { xAt, yAt: linearYAt } = buildAxisHelpers(points.map((p) => p.hour), computedMin, computedMax, plotWidth, plotHeight);

    const yAt = !!logStrength
        ? (value: number) => {
            const linearNormalized = (value - computedMin) / (computedMax - computedMin || 1);
            const logMin = Math.log(computedMin + 1);
            const logMax = Math.log(computedMax + 1);
            const logNormalized = (Math.log(value + 1) - logMin) / (logMax - logMin || 1);
            const blended = linearNormalized + logStrength * (logNormalized - linearNormalized);
            return PADDING_TOP + (1 - blended) * plotHeight;
        }
        : linearYAt;

    const firstX = xAt(points[0].hour);
    const lastX = xAt(points[points.length - 1].hour);
    const baseline = PADDING_TOP + plotHeight;

    const coords: [number, number][] = points.map((p) => [xAt(p.hour), yAt(p.value)]);
    const linePath = smoothLinePath(coords);
    const areaPath = smoothAreaPath(coords, baseline, firstX, lastX);

    const defaultFormatYLabel = (value: number) => String(Math.round(value));

    return (
        <>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 mt-2">{title}</p>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${height}`} width="100%" height={height}>
                <text x={PADDING_LEFT - 4} y={PADDING_TOP + 4} fontSize={11} fill="#6b7280" textAnchor="end">
                    {(formatYLabel ?? defaultFormatYLabel)(computedMax)}
                </text>
                <text x={PADDING_LEFT - 4} y={PADDING_TOP + plotHeight + 4} fontSize={11} fill="#6b7280" textAnchor="end">
                    {(formatYLabel ?? defaultFormatYLabel)(computedMin)}
                </text>
                <line x1={PADDING_LEFT} y1={PADDING_TOP} x2={PADDING_LEFT + plotWidth} y2={PADDING_TOP} stroke="#1f2937" strokeWidth={1} />
                <line x1={PADDING_LEFT} y1={PADDING_TOP + plotHeight} x2={PADDING_LEFT + plotWidth} y2={PADDING_TOP + plotHeight} stroke="#1f2937" strokeWidth={1} />
                {thresholdLines?.filter((t) => t.value >= computedMin && t.value <= computedMax).map((threshold, index) => (
                    <g key={index}>
                        <line
                            x1={PADDING_LEFT}
                            y1={yAt(threshold.value)}
                            x2={PADDING_LEFT + plotWidth}
                            y2={yAt(threshold.value)}
                            stroke={threshold.color}
                            strokeWidth={1}
                            strokeDasharray="4,3"
                            opacity={0.85}
                        />
                        {threshold.showYLabel && (
                            <text x={PADDING_LEFT - 4} y={yAt(threshold.value) + 4} fontSize={11} fill="#6b7280" textAnchor="end">
                                {(formatYLabel ?? defaultFormatYLabel)(threshold.value)}
                            </text>
                        )}
                    </g>
                ))}
                <path d={areaPath} fill={color} fillOpacity={0.1} />
                <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
                {labelIndices.slice(1).map((dataIndex) => {
                    const point = points[dataIndex];
                    return point ? (
                        <text key={dataIndex} x={xAt(point.hour)} y={height - 4} fontSize={11} fill="#6b7280" textAnchor="middle">
                            {formatHourLabel(point.hour)}
                        </text>
                    ) : null;
                })}
            </svg>
        </>
    );
}
