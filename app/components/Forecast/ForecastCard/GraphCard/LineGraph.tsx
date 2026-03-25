import { GRAPH_DIMENSIONS, ThresholdLine } from './graphConfig';
import { useContainerWidth } from './useContainerWidth';
import { smoothLinePath, smoothAreaPath, buildAxisHelpers } from './graphMath';
import GraphSvg from './GraphSvg/GraphSvg';

export type { ThresholdLine };

export interface LineGraphProps {
    title: string;
    points: { hour: number; value: number }[];
    color: string;
    indicesToLabel: number[];
    height?: number;
    minValue?: number;
    maxValue?: number;
    formatYLabel?: (value: number) => string;
    thresholdLines?: ThresholdLine[];
    logStrength?: number;
}

export default function LineGraph({ title, points, color, indicesToLabel, height, minValue, maxValue, formatYLabel, thresholdLines, logStrength }: LineGraphProps) {
    const { SVG_HEIGHT, PADDING_LEFT, PADDING_RIGHT, PADDING_TOP, PADDING_BOTTOM } = GRAPH_DIMENSIONS;
    const { ref: containerRef, width: svgWidth } = useContainerWidth();
    const resolvedHeight = height ?? SVG_HEIGHT;
    const plotWidth = svgWidth - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = resolvedHeight - PADDING_TOP - PADDING_BOTTOM;

    const values = points.map((p) => p.value);
    const computedMin = minValue ?? Math.min(...values);
    const computedMax = maxValue ?? Math.max(...values);

    const { xAt, yAt: linearYAt } = buildAxisHelpers(points.map((p) => p.hour), computedMin, computedMax, plotWidth, plotHeight);

    const yAt = logStrength
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

    return (
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
            referencePoints={points}
            indicesToLabel={indicesToLabel}
            skipFirstLabel
        >
            <path d={smoothAreaPath(coords, baseline, firstX, lastX)} fill={color} fillOpacity={0.1} />
            <path d={smoothLinePath(coords)} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        </GraphSvg>
    );
}
