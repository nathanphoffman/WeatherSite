import { GRAPH_DIMENSIONS, ThresholdLine, useContainerWidth, smoothLinePath, buildAxisHelpers } from './graphCardsConfig';
import GraphFrame from './GraphFrame';

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
    const { SVG_HEIGHT, PADDING_LEFT, PADDING_RIGHT, PADDING_TOP, PADDING_BOTTOM } = GRAPH_DIMENSIONS;
    const { ref: containerRef, width: svgWidth } = useContainerWidth();
    const resolvedHeight = height ?? SVG_HEIGHT;
    const plotWidth = svgWidth - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = resolvedHeight - PADDING_TOP - PADDING_BOTTOM;

    const allValues = series.flatMap((s) => s.points.map((p) => p.value));
    const allHours = series.flatMap((s) => s.points.map((p) => p.hour));
    const computedMin = minValue ?? Math.min(...allValues);
    const computedMax = maxValue ?? Math.max(...allValues);

    const { xAt, yAt } = buildAxisHelpers(allHours, computedMin, computedMax, plotWidth, plotHeight);

    const referencePoints = series[0]?.points ?? [];

    return (
        <>
            <GraphFrame
                title={title}
                containerRef={containerRef}
                svgWidth={svgWidth}
                height={resolvedHeight}
                plotWidth={plotWidth}
                plotHeight={plotHeight}
                computedMin={computedMin}
                computedMax={computedMax}
                formatYLabel={formatYLabel}
                thresholdLines={thresholdLines}
                yAt={yAt}
                xAt={xAt}
                referencePoints={referencePoints}
                labelIndices={labelIndices}
            >
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
            </GraphFrame>
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
