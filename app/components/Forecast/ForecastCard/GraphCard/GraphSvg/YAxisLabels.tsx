interface YAxisLabelsProps {
    paddingLeft: number;
    paddingTop: number;
    plotHeight: number;
    computedMin: number;
    computedMax: number;
    formatYLabel: (value: number) => string;
}

export default function YAxisLabels({ paddingLeft, paddingTop, plotHeight, computedMin, computedMax, formatYLabel }: YAxisLabelsProps) {
    return (
        <>
            <text x={paddingLeft - 4} y={paddingTop + 4} fontSize={11} fill="#6b7280" textAnchor="end">
                {formatYLabel(computedMax)}
            </text>
            <text x={paddingLeft - 4} y={paddingTop + plotHeight + 4} fontSize={11} fill="#6b7280" textAnchor="end">
                {formatYLabel(computedMin)}
            </text>
        </>
    );
}
