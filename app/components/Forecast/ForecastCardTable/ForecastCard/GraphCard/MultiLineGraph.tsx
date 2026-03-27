import { GRAPH_DIMENSIONS, ThresholdLine } from './graphConfig';
import { useContainerWidth } from './useContainerWidth';
import { smoothLinePath, buildAxisHelpers } from './graphMath';
import GraphSvg from './GraphSvg/GraphSvg';

export interface MultiLineSeries {
    points: { hour: number; value: number }[];
    color: string;
    label: string;
}

export interface MultiLineGraphProps {
    title: string;
    series: MultiLineSeries[];
    indicesToLabel: number[];
    height?: number;
    minValue?: number;
    maxValue?: number;
    formatYLabel?: (value: number) => string;
    thresholdLines?: ThresholdLine[];
}

export default function MultiLineGraph({ title, series, indicesToLabel, height, minValue, maxValue, formatYLabel, thresholdLines }: MultiLineGraphProps) {
    const { SVG_HEIGHT, PADDING_LEFT, PADDING_RIGHT, PADDING_TOP, PADDING_BOTTOM } = GRAPH_DIMENSIONS;
    const { ref: containerRef, width: svgWidth } = useContainerWidth();
    const resolvedHeight = height ?? SVG_HEIGHT;
    const plotWidth = svgWidth - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = resolvedHeight - PADDING_TOP - PADDING_BOTTOM;

    const effectiveSeries = series.map((seriesItem) =>
        seriesItem.points.length === 1
            ? { ...seriesItem, points: [seriesItem.points[0], { ...seriesItem.points[0], hour: seriesItem.points[0].hour + 1 }] }
            : seriesItem
    );

    const allValues = effectiveSeries.flatMap((seriesItem) => seriesItem.points.map((point) => point.value));
    const allHours = effectiveSeries.flatMap((seriesItem) => seriesItem.points.map((point) => point.hour));
    const computedMin = minValue ?? Math.min(...allValues);
    const computedMax = maxValue ?? Math.max(...allValues);

    const { xAt, yAt } = buildAxisHelpers(allHours, computedMin, computedMax, plotWidth, plotHeight);

    const referencePoints = effectiveSeries[0]?.points ?? [];

    return (
        <>
            <GraphSvg
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
                indicesToLabel={indicesToLabel}
            >
                {effectiveSeries.map((seriesItem) => {
                    const coords: [number, number][] = seriesItem.points.map((point) => [xAt(point.hour), yAt(point.value)]);
                    return (
                        <path
                            key={seriesItem.label}
                            d={smoothLinePath(coords)}
                            fill="none"
                            stroke={seriesItem.color}
                            strokeWidth={1.5}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    );
                })}
            </GraphSvg>
            <div className="flex gap-3 mt-1">
                {series.map((seriesItem) => (
                    <div key={seriesItem.label} className="flex items-center gap-1">
                        <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: seriesItem.color }} />
                        <span className="text-xs text-gray-500">{seriesItem.label}</span>
                    </div>
                ))}
            </div>
        </>
    );
}
