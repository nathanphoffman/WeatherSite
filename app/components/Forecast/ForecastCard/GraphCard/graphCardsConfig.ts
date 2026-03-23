import { useRef, useState, useEffect } from 'react';

export const GRAPH_DIMENSIONS = {
    SVG_WIDTH: 238,
    SVG_HEIGHT: 80,
    PADDING_TOP: 16,
    PADDING_BOTTOM: 20,
    PADDING_LEFT: 28,
    PADDING_RIGHT: 20, // slightly smaller as it doesn't have y-axis labels
};

export interface ThresholdLine {
    value: number;
    color: string;
    showYLabel?: boolean;
}

export const defaultFormatYLabel = (value: number) => String(Math.round(value));

export function useContainerWidth() {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(GRAPH_DIMENSIONS.SVG_WIDTH);
    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(entries => {
            setWidth(entries[0].contentRect.width);
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return { ref, width };
}

export function smoothLinePath(points: [number, number][]): string {
    if (points.length < 2) return '';

    // Start the SVG path command at the very first point
    let svgPath = `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;

    for (let i = 0; i < points.length - 1; i++) {

        // this is a geometrical constant of bezier, better not to think too hard about it, it just works
        const BEZIER_MAGIC_NUMBER = 6;

        // We're drawing one smooth curve segment from segmentStart to segmentEnd.
        // To avoid a sharp corner where segments meet, we look at the point that
        // came before segmentStart and the point that comes after segmentEnd.
        // Those neighbors tell us what direction the line is "traveling" at each end,
        // so the curve can flow smoothly out of the previous segment and into the next one.
        const segmentStart     = points[i];
        const segmentEnd       = points[i + 1];
        const pointBeforeStart = points[i - 1] ?? segmentStart;  // only undefined on the very first segment; fall back to segmentStart so the exit handle points straight toward segmentEnd
        const pointAfterEnd    = points[i + 2] ?? segmentEnd;    // only undefined on the very last segment; fall back to segmentEnd so the entry handle points straight back toward segmentStart

        // A Bezier curve uses two invisible "handles" to shape the curve —
        // think of them like the drag handles on a curved anchor point in Figma or Illustrator.
        // Each handle is placed a short distance from its anchor, aimed in the direction
        // the line is traveling at that moment. That's what creates the smooth, rounded look.

        // exitHandle: sits just ahead of segmentStart, nudged toward segmentEnd.
        // The direction it points is based on the slope from pointBeforeStart to segmentEnd,
        // which tells us how the line is flowing as it leaves segmentStart.
        const exitHandleX = segmentStart[0] + (segmentEnd[0] - pointBeforeStart[0]) / BEZIER_MAGIC_NUMBER;
        const exitHandleY = segmentStart[1] + (segmentEnd[1] - pointBeforeStart[1]) / BEZIER_MAGIC_NUMBER;

        // entryHandle: sits just before segmentEnd, nudged back toward segmentStart.
        // The direction it points is based on the slope from segmentStart to pointAfterEnd,
        // which tells us how the line is flowing as it arrives at segmentEnd.
        const entryHandleX = segmentEnd[0] - (pointAfterEnd[0] - segmentStart[0]) / BEZIER_MAGIC_NUMBER;
        const entryHandleY = segmentEnd[1] - (pointAfterEnd[1] - segmentStart[1]) / BEZIER_MAGIC_NUMBER;
 
        const exitHandleCoords  = `${exitHandleX.toFixed(1)},${exitHandleY.toFixed(1)}`;
        const entryHandleCoords = `${entryHandleX.toFixed(1)},${entryHandleY.toFixed(1)}`;
        const destinationCoords = `${segmentEnd[0].toFixed(1)},${segmentEnd[1].toFixed(1)}`;
        // "C" tells the browser: draw a cubic Bezier curve using these two handles, ending at the destination
        svgPath += ` C ${exitHandleCoords} ${entryHandleCoords} ${destinationCoords}`;
    }

    return svgPath;
}

export function smoothAreaPath(
    points: [number, number][],
    baselineY: number,
    firstPointX: number,
    lastPointX: number,
): string {
    // Draw the smooth line across the top, then close the filled shape:
    // drop straight down to the baseline on the right side, travel left along
    // the baseline back to the start, then Z closes the path back to the first point.
    return `${smoothLinePath(points)} L ${lastPointX.toFixed(1)},${baselineY} L ${firstPointX.toFixed(1)},${baselineY} Z`;
}

export function buildAxisHelpers(allHours: number[], computedMin: number, computedMax: number, plotWidth: number, plotHeight: number) {
    const { PADDING_LEFT, PADDING_TOP } = GRAPH_DIMENSIONS;
    const minHour = Math.min(...allHours);
    const maxHour = Math.max(...allHours);
    const hourRange = maxHour - minHour || 1;
    const valueRange = computedMax - computedMin || 1;
    const xAt = (hour: number) => PADDING_LEFT + ((hour - minHour) / hourRange) * plotWidth;
    const yAt = (value: number) => PADDING_TOP + ((computedMax - value) / valueRange) * plotHeight;
    return { xAt, yAt };
}
