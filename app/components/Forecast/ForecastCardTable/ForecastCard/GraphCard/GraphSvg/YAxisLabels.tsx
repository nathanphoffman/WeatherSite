import { LABEL_CONFIG } from './labelConfig';

interface LabelProps {
    x: number;
    y: number;
    value: string;
}

export function YAxisLabel({ x, y, value }: LabelProps) {
    return (
        <text x={x} y={y} fontSize={LABEL_CONFIG.fontSize} fill={LABEL_CONFIG.fill} textAnchor="end">
            {value}
        </text>
    );
}

interface YAxisLabelsProps {
    paddingLeft: number;
    paddingTop: number;
    plotHeight: number;
    computedMin: number;
    computedMax: number;
    formatYLabel: (value: number) => string;
}

export default function YAxisLabels({ paddingLeft, paddingTop, plotHeight, computedMin, computedMax, formatYLabel }: YAxisLabelsProps) {
    const xWithPadding = paddingLeft - LABEL_CONFIG.offset;

    return (
        <>
            <YAxisLabel x={xWithPadding} y={paddingTop + LABEL_CONFIG.offset} value={formatYLabel(computedMax)} />

            {/* adding plotHeight actually increases distance downwards making it the bottom label just to the side and below the chart */}
            <YAxisLabel x={xWithPadding} y={paddingTop + plotHeight + LABEL_CONFIG.offset} value={formatYLabel(computedMin)} />
        </>
    );
}
