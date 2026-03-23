import { getGraphDimensions, useContainerWidth, smoothLinePath, formatHourLabel, buildAxisHelpers } from './graphCardsConfig';
import { ThresholdLine } from './LineGraph';

export interface MultiLineSeries {
    points: { hour: number; value: number }[];
    color: string;
    label: string;
}

export interface MultiLineGraphProps {
    title: string;
    series: MultiLineSeries[];
    labelIndices: number[];
    height?: number;
    minValue?: number;
    maxValue?: number;
    formatYLabel?: (value: number) => string;
    thresholdLines?: ThresholdLine[];
}

export default function MultiLineGraph({ title, series, labelIndices, height, minValue, maxValue, formatYLabel, thresholdLines }: MultiLineGraphProps) {
    const { SVG_HEIGHT, PADDING_LEFT, PADDING_RIGHT, PADDING_TOP, PADDING_BOTTOM } = getGraphDimensions();
    const { ref: containerRef, width: svgWidth } = useContainerWidth();
    const resolvedHeight = height ?? SVG_HEIGHT;
    const plotWidth = svgWidth - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = resolvedHeight - PADDING_TOP - PADDING_BOTTOM;

    const allValues = series.flatMap((s) => s.points.map((p) => p.value));
    const allHours = series.flatMap((s) => s.points.map((p) => p.hour));
    const computedMin = minValue ?? Math.min(...allValues);
    const computedMax = maxValue ?? Math.max(...allValues);

    const { xAt, yAt } = buildAxisHelpers(allHours, computedMin, computedMax, plotWidth, plotHeight);

    const defaultFormatYLabel = (value: number) => String(Math.round(value));
    const referencePoints = series[0]?.points ?? [];

    return (
        <>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 mt-2">{title}</p>
            <div ref={containerRef}>
            <svg viewBox={`0 0 ${svgWidth} ${resolvedHeight}`} width="100%" height={resolvedHeight}>
                <text x={PADDING_LEFT - 4} y={PADDING_TOP + 4} fontSize={11} fill="#6b7280" textAnchor="end">
                    {(formatYLabel ?? defaultFormatYLabel)(computedMax)}
                </text>
                <text x={PADDING_LEFT - 4} y={PADDING_TOP + plotHeight + 4} fontSize={11} fill="#6b7280" textAnchor="end">
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
                        opacity={0.85}
                    />
                ))}
                {series.map((s, seriesIndex) => {
                    const coords: [number, number][] = s.points.map((p) => [xAt(p.hour), yAt(p.value)]);
                    return (
                        <path
                            key={seriesIndex}
                            d={smoothLinePath(coords)}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={1.5}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    );
                })}
                {labelIndices.map((dataIndex) => {
                    const point = referencePoints[dataIndex];
                    return point ? (
                        <text key={dataIndex} x={xAt(point.hour)} y={resolvedHeight - 4} fontSize={11} fill="#6b7280" textAnchor="middle">
                            {formatHourLabel(point.hour)}
                        </text>
                    ) : null;
                })}
            </svg>
            </div>
            <div className="flex gap-3 mt-1">
                {series.map((s, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-xs text-gray-500">{s.label}</span>
                    </div>
                ))}
            </div>
        </>
    );
}
