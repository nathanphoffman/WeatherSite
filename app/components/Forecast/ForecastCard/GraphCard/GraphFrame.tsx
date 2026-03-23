import { RefObject, ReactNode } from 'react';
import { GRAPH_DIMENSIONS, ThresholdLine, defaultFormatYLabel, formatHourLabel } from './graphCardsConfig';

interface GraphFrameProps {
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
    labelIndices: number[];
    skipFirstLabel?: boolean;
    children: ReactNode;
}

export default function GraphFrame({
    title, containerRef, svgWidth, height, plotWidth, plotHeight,
    computedMin, computedMax, formatYLabel, thresholdLines, yAt, xAt,
    referencePoints, labelIndices, skipFirstLabel, children,
}: GraphFrameProps) {
    const { PADDING_LEFT, PADDING_TOP } = GRAPH_DIMENSIONS;
    const format = formatYLabel ?? defaultFormatYLabel;
    const displayIndices = skipFirstLabel ? labelIndices.slice(1) : labelIndices;

    return (
        <>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 mt-2">{title}</p>
            <div ref={containerRef}>
                <svg viewBox={`0 0 ${svgWidth} ${height}`} width="100%" height={height}>
                    <text x={PADDING_LEFT - 4} y={PADDING_TOP + 4} fontSize={11} fill="#6b7280" textAnchor="end">
                        {format(computedMax)}
                    </text>
                    <text x={PADDING_LEFT - 4} y={PADDING_TOP + plotHeight + 4} fontSize={11} fill="#6b7280" textAnchor="end">
                        {format(computedMin)}
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
                                    {format(threshold.value)}
                                </text>
                            )}
                        </g>
                    ))}
                    {children}
                    {displayIndices.map((dataIndex) => {
                        const point = referencePoints[dataIndex];
                        return point ? (
                            <text key={dataIndex} x={xAt(point.hour)} y={height - 4} fontSize={11} fill="#6b7280" textAnchor="middle">
                                {formatHourLabel(point.hour)}
                            </text>
                        ) : null;
                    })}
                </svg>
            </div>
        </>
    );
}
