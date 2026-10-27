import { militaryHourToRegularHour } from '@/app/lib/noaa/utility';
import { LABEL_CONFIG } from './labelConfig';

interface XAxisLabelsProps {
    referencePoints: { hour: number }[];
    indicesToLabel: number[];
    skipFirstLabel?: boolean;
    height: number;
    xAt: (hour: number) => number;
}

export default function XAxisLabels({ referencePoints, indicesToLabel, skipFirstLabel, height, xAt }: XAxisLabelsProps) {
    const displayIndices = skipFirstLabel ? indicesToLabel.slice(1) : indicesToLabel;

    return (
        <>
            {displayIndices.map((dataIndex) => {
                const point = referencePoints[dataIndex];

                return point ? (
                    <text key={point.hour} x={xAt(point.hour)} y={height - LABEL_CONFIG.offset} fontSize={LABEL_CONFIG.fontSize} fill={LABEL_CONFIG.fill} textAnchor="middle">
                        {militaryHourToRegularHour(point.hour)}
                    </text>
                ) : null;
            })}
        </>
    );
}
