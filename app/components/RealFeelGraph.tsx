import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import { getRealFeelTemperature, getMagnitude } from '@/app/lib/noaa/output/calculations';
import { HumidityRanges, WindRanges } from '@/app/lib/noaa/config';

interface RealFeelGraphProps {
    groups: ThreeHourGroup[];
}

function formatHourLabel(hour: number): string {
    if (hour === 0 || hour === 24) return '12a';
    if (hour === 12) return '12p';
    return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}

export default function RealFeelGraph({ groups }: RealFeelGraphProps) {
    const dataPoints = groups
        .flatMap((group) =>
            group.hours.map((hourData) => ({
                hour: hourData.hour,
                realFeel: getRealFeelTemperature(
                    hourData.temperature,
                    getMagnitude(hourData.humidity, HumidityRanges),
                    getMagnitude(hourData.wind, WindRanges),
                    hourData.skyCover,
                    hourData.hour
                ),
            }))
        )
        .sort((a, b) => a.hour - b.hour);

    if (dataPoints.length === 0) return null;

    const svgWidth = 238;
    const svgHeight = 110;
    const paddingTop = 16;
    const paddingBottom = 20;
    const paddingLeft = 28;
    const paddingRight = 8;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    const temps = dataPoints.map((d) => d.realFeel);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempRange = maxTemp - minTemp || 1;

    const hours = dataPoints.map((d) => d.hour);
    const minHour = Math.min(...hours);
    const maxHour = Math.max(...hours);
    const hourRange = maxHour - minHour || 1;

    function xAt(hour: number): number {
        return paddingLeft + ((hour - minHour) / hourRange) * plotWidth;
    }

    function yAt(temp: number): number {
        return paddingTop + ((maxTemp - temp) / tempRange) * plotHeight;
    }

    const polylinePoints = dataPoints
        .map((d) => `${xAt(d.hour).toFixed(1)},${yAt(d.realFeel).toFixed(1)}`)
        .join(' ');

    // area fill path: go down to baseline, across, back up
    const firstX = xAt(dataPoints[0].hour);
    const lastX = xAt(dataPoints[dataPoints.length - 1].hour);
    const baseline = paddingTop + plotHeight;
    const areaPath = `M ${firstX} ${baseline} L ${polylinePoints.split(' ').map((_, index) => {
        const point = dataPoints[index];
        return point ? `${xAt(point.hour).toFixed(1)},${yAt(point.realFeel).toFixed(1)}` : '';
    }).filter(Boolean).join(' L ')} L ${lastX} ${baseline} Z`;

    // label 3 evenly spaced x-axis points
    const labelCount = 3;
    const labelIndices = Array.from({ length: labelCount }, (_, index) =>
        Math.round((index / (labelCount - 1)) * (dataPoints.length - 1))
    );

    return (
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Real Feel</p>
            <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                width="100%"
                height={svgHeight}
            >
                {/* y-axis labels */}
                <text x={paddingLeft - 4} y={paddingTop + 4} fontSize={9} fill="#6b7280" textAnchor="end">
                    {Math.round(maxTemp)}°
                </text>
                <text x={paddingLeft - 4} y={paddingTop + plotHeight + 4} fontSize={9} fill="#6b7280" textAnchor="end">
                    {Math.round(minTemp)}°
                </text>

                {/* horizontal grid lines */}
                <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft + plotWidth} y2={paddingTop} stroke="#1f2937" strokeWidth={1} />
                <line x1={paddingLeft} y1={paddingTop + plotHeight} x2={paddingLeft + plotWidth} y2={paddingTop + plotHeight} stroke="#1f2937" strokeWidth={1} />

                {/* area fill */}
                <path d={areaPath} fill="#3b82f6" fillOpacity={0.1} />

                {/* line */}
                <polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* x-axis hour labels */}
                {labelIndices.map((dataIndex) => {
                    const point = dataPoints[dataIndex];
                    return (
                        <text
                            key={dataIndex}
                            x={xAt(point.hour)}
                            y={svgHeight - 4}
                            fontSize={9}
                            fill="#6b7280"
                            textAnchor="middle"
                        >
                            {formatHourLabel(point.hour)}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
