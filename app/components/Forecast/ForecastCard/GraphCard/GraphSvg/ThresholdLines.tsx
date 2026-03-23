import { ThresholdLine } from '../graphCardsConfig';

interface ThresholdLinesProps {
    thresholds: ThresholdLine[];
    computedMin: number;
    computedMax: number;
    paddingLeft: number;
    plotWidth: number;
    yAt: (value: number) => number;
    formatYLabel: (value: number) => string;
}

export default function ThresholdLines({ thresholds, computedMin, computedMax, paddingLeft, plotWidth, yAt, formatYLabel }: ThresholdLinesProps) {
    const visibleThresholds = thresholds.filter((t) => t.value >= computedMin && t.value <= computedMax);

    return (
        <>
            {/* These are dotted lines that indicate the severity and coloration that applies in the scale */}
            {visibleThresholds.map((threshold, index) => (
                <g key={index}>
                    <line
                        x1={paddingLeft}
                        y1={yAt(threshold.value)}
                        x2={paddingLeft + plotWidth}
                        y2={yAt(threshold.value)}
                        stroke={threshold.color}
                        strokeWidth={1}
                        strokeDasharray="4,3" /* Makes the line dashed */
                        opacity={0.85}
                    />

                    {/* This was a later addition needed used to emphasize a threshold in some cases like cloud cover being 10, I find this useful in log-based scales */}
                    {threshold.showYLabel && (
                        <text x={paddingLeft - 4} y={yAt(threshold.value) + 4} fontSize={11} fill="#6b7280" textAnchor="end">
                            {formatYLabel(threshold.value)}
                        </text>
                    )}
                </g>
            ))}
        </>
    );
}
