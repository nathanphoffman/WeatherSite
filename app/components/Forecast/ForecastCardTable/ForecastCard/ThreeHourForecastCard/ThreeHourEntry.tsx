'use client';

import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { useMeasurementSystemProviderContext } from '@/app/components/Forecast/MeasurementSystemProvider';
import { GREEN, YELLOW, RED, BRIGHT, WHITE } from '@/app/lib/noaa/output/color';
import { Magnitude } from '@/app/lib/noaa/types/general';
import Tooltip from './Tooltip';
import { buildEntryTooltips } from './tooltipText';
import { getThreeHourEntrySummary } from './threeHourEntrySummary';

const MAGNITUDE_COLOR: Record<Magnitude, string> = {
    0: GREEN,
    1: WHITE,
    2: YELLOW,
    3: RED,
    4: BRIGHT,
};

interface ThreeHourEntryProps {
    group: ThreeHourGroup;
}

export default function ThreeHourEntry({ group }: ThreeHourEntryProps) {
    const { isMetric, convertTemperature, convertWindSpeed } = useMeasurementSystemProviderContext();
    const { regularTime, hours } = group;

    const summary = getThreeHourEntrySummary(hours);
    const {
        humidityMagnitude, windMagnitude, thunderMagnitude, stormMagnitude, realFeelMagnitude,
        realFeelTemperature, stormRating, statusIcon,
    } = summary;

    const tooltips = buildEntryTooltips({ ...summary, convertTemperature, convertWindSpeed, windUnit: isMetric ? 'km/h' : 'mph' });

    return (
        <tr className="border-b border-gray-800 last:border-0">
            <td className="py-1 pr-4 text-gray-500 border-r border-dotted border-gray-700">{regularTime}</td>
            <td className="py-1 px-4 text-center border-r border-dotted border-gray-700">
                <span className={MAGNITUDE_COLOR[realFeelMagnitude]}>
                    <Tooltip text={tooltips.realFeel}>
                        <span>{convertTemperature(realFeelTemperature)}°</span>
                    </Tooltip>
                    {humidityMagnitude > 0 && (
                        <Tooltip text={tooltips.humidity}>
                            <span className={`ml-1 ${MAGNITUDE_COLOR[humidityMagnitude]}`}>H</span>
                        </Tooltip>
                    )}
                </span>
            </td>
            <td className={`py-1 px-2 text-center border-r border-dotted border-gray-700 whitespace-nowrap ${MAGNITUDE_COLOR[stormMagnitude]}`}>
                <Tooltip text={tooltips.storm}>
                    <span>{stormRating}</span>
                </Tooltip>
                {(windMagnitude > 0 || thunderMagnitude > 0) && <span className="ml-1">
                    {windMagnitude > 0 && (
                        <Tooltip text={tooltips.wind}>
                            <span className={MAGNITUDE_COLOR[windMagnitude]}>W</span>
                        </Tooltip>
                    )}
                    {thunderMagnitude > 0 && (
                        <Tooltip text={tooltips.thunder}>
                            <span className={MAGNITUDE_COLOR[thunderMagnitude]}>T</span>
                        </Tooltip>
                    )}
                </span>}
            </td>
            <td className="py-1 pl-4">
                {statusIcon.trim() ? (
                    <Tooltip text={tooltips.status} align="right">{statusIcon}</Tooltip>
                ) : statusIcon}
            </td>
        </tr>
    );
}
