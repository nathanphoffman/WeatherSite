import { labelConfig } from './labelConfig';

interface LabelProps {
    x: number;
    y: number;
    value: string;
}

export function YAxisLabel({ x, y, value }: LabelProps) {
    return (
        <text x={x} y={y} fontSize={labelConfig.fontSize} fill={labelConfig.fill} textAnchor="end">
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
    const xWithPadding = paddingLeft - labelConfig.offset;

    return (
        <>
            <YAxisLabel x={xWithPadding} y={paddingTop + labelConfig.offset} value={formatYLabel(computedMax)} />

            {/* adding plotHeight actually increases distance downwards making it the bottom label just to the side and below the chart */}
            <YAxisLabel x={xWithPadding} y={paddingTop + plotHeight + labelConfig.offset} value={formatYLabel(computedMin)} />
        </>
    );
}
