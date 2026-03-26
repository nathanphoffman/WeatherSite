import { ThresholdLine } from '../graphConfig';
import { thresholdConfig } from './thresholdConfig';

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
    const visibleThresholds = thresholds.filter((threshold) => threshold.value >= computedMin && threshold.value <= computedMax);

    return (
        <>
            {/* These are dotted lines that indicate the severity and coloration that applies in the scale */}
            {visibleThresholds.map((threshold) => (
                <g key={threshold.value}>
                    <line
                        x1={paddingLeft}
                        y1={yAt(threshold.value)}
                        x2={paddingLeft + plotWidth}
                        y2={yAt(threshold.value)}
                        stroke={threshold.color}
                        strokeWidth={thresholdConfig.strokeWidth}
                        strokeDasharray={thresholdConfig.strokeDasharray} /* Makes the line dashed */
                        opacity={thresholdConfig.opacity}
                    />

                    {/* This was a later addition needed used to emphasize a threshold in some cases like cloud cover being 10, I find this useful in log-based scales */}
                    {threshold.showYLabel && (
                        <text x={paddingLeft - thresholdConfig.label.offset} y={yAt(threshold.value) + thresholdConfig.label.offset} fontSize={thresholdConfig.label.fontSize} fill={thresholdConfig.label.fill} textAnchor="end">
                            {formatYLabel(threshold.value)}
                        </text>
                    )}
                </g>
            ))}
        </>
    );
}
