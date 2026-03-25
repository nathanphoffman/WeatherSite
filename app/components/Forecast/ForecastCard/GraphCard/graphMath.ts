import { GRAPH_DIMENSIONS } from './graphConfig';

// Almost all of this was 100% Claude, this is a bit of a black box, but I have commented some myself and used AI to add comments to better explain itself
// At the end of the day this is more of a mathematician function and less a coding one
// The intent of this function and the reason it was added is to smooth our coarse three-hour data points for the line charts
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
        const pointBeforeStart = points[i - 1] ?? segmentStart;  // only undefined on the very first segment; fall back to segmentStart so curvePullNearStart aims straight toward segmentEnd
        const pointAfterEnd    = points[i + 2] ?? segmentEnd;    // only undefined on the very last segment; fall back to segmentEnd so curvePullNearEnd aims straight back toward segmentStart

        // A Bezier curve uses two invisible "pull points" to shape the curve.
        // The curve bends toward each pull point without actually passing through it —
        // like how a magnet can bend a path without touching it.
        // One pull point sits near segmentStart and one sits near segmentEnd.
        // Their positions are based on the direction the line is already traveling,
        // which is what makes the curve look smooth instead of pointy at each data point.

        // curvePullNearStart: an invisible point just ahead of segmentStart.
        // The curve bends toward it as it leaves segmentStart.
        // Its position is based on the slope from pointBeforeStart to segmentEnd,
        // which tells us what direction the line is flowing at segmentStart.
        const curvePullNearStartX = segmentStart[0] + (segmentEnd[0] - pointBeforeStart[0]) / BEZIER_MAGIC_NUMBER;
        const curvePullNearStartY = segmentStart[1] + (segmentEnd[1] - pointBeforeStart[1]) / BEZIER_MAGIC_NUMBER;

        // curvePullNearEnd: an invisible point just before segmentEnd.
        // The curve bends toward it as it arrives at segmentEnd.
        // Its position is based on the slope from segmentStart to pointAfterEnd,
        // which tells us what direction the line is flowing at segmentEnd.
        const curvePullNearEndX = segmentEnd[0] - (pointAfterEnd[0] - segmentStart[0]) / BEZIER_MAGIC_NUMBER;
        const curvePullNearEndY = segmentEnd[1] - (pointAfterEnd[1] - segmentStart[1]) / BEZIER_MAGIC_NUMBER;

        const curvePullNearStart = `${curvePullNearStartX.toFixed(1)},${curvePullNearStartY.toFixed(1)}`;
        const curvePullNearEnd   = `${curvePullNearEndX.toFixed(1)},${curvePullNearEndY.toFixed(1)}`;
        const destination        = `${segmentEnd[0].toFixed(1)},${segmentEnd[1].toFixed(1)}`;

        // "C" tells the browser: draw a cubic Bezier curve using these two pull points, ending at the destination
        svgPath += ` C ${curvePullNearStart} ${curvePullNearEnd} ${destination}`;
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
