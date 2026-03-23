import { formatHourLabel } from '../graphCardsConfig';

interface XAxisLabelsProps {
    referencePoints: { hour: number }[];
    labelIndices: number[];
    skipFirstLabel?: boolean;
    height: number;
    xAt: (hour: number) => number;
}

export default function XAxisLabels({ referencePoints, labelIndices, skipFirstLabel, height, xAt }: XAxisLabelsProps) {
    const displayIndices = skipFirstLabel ? labelIndices.slice(1) : labelIndices;

    return (
        <>
            {displayIndices.map((dataIndex) => {
                const point = referencePoints[dataIndex];
                return point ? (
                    <text key={dataIndex} x={xAt(point.hour)} y={height - 4} fontSize={11} fill="#6b7280" textAnchor="middle">
                        {formatHourLabel(point.hour)}
                    </text>
                ) : null;
            })}
        </>
    );
}
