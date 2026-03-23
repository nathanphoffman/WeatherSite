import { RefObject, ReactNode } from 'react';
import { GRAPH_DIMENSIONS, ThresholdLine, defaultFormatYLabel } from '../graphCardsConfig';
import GraphBorders from './GraphBorders';
import YAxisLabels from './YAxisLabels';
import ThresholdLines from './ThresholdLines';
import XAxisLabels from './XAxisLabels';

export type { ThresholdLine };

interface GraphSvgProps {
    title: string;
    containerRef: RefObject<HTMLDivElement | null>;
    svgWidth: number;
    height: number;
    plotWidth: number;
    plotHeight: number;
    computedMin: number;
    computedMax: number;
    formatYLabel?: (value: number) => string;
    thresholdLines?: ThresholdLine[];
    yAt: (value: number) => number;
    xAt: (hour: number) => number;
    referencePoints: { hour: number }[];
    indicesToLabel: number[];
    skipFirstLabel?: boolean;
    children: ReactNode;
}

export default function GraphSvg({
    title, containerRef, svgWidth, height, plotWidth, plotHeight,
    computedMin, computedMax, formatYLabel, thresholdLines, yAt, xAt,
    referencePoints, indicesToLabel, skipFirstLabel, children,
}: GraphSvgProps) {
    const { PADDING_LEFT, PADDING_TOP } = GRAPH_DIMENSIONS;
    const format = formatYLabel ?? defaultFormatYLabel;

    return (
        <>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 mt-2">{title}</p>
            <div ref={containerRef}>
                <svg viewBox={`0 0 ${svgWidth} ${height}`} width="100%" height={height}>
                    <GraphBorders paddingLeft={PADDING_LEFT} paddingTop={PADDING_TOP} plotWidth={plotWidth} plotHeight={plotHeight} />
                    <YAxisLabels paddingLeft={PADDING_LEFT} paddingTop={PADDING_TOP} plotHeight={plotHeight} computedMin={computedMin} computedMax={computedMax} formatYLabel={format} />
                    {thresholdLines && (
                        <ThresholdLines thresholds={thresholdLines} computedMin={computedMin} computedMax={computedMax} paddingLeft={PADDING_LEFT} plotWidth={plotWidth} yAt={yAt} formatYLabel={format} />
                    )}
                    {children}
                    <XAxisLabels referencePoints={referencePoints} indicesToLabel={indicesToLabel} skipFirstLabel={skipFirstLabel} height={height} xAt={xAt} />
                </svg>
            </div>
        </>
    );
}
