export const SVG_WIDTH = 238;
export const PADDING_TOP = 16;
export const PADDING_BOTTOM = 20;
export const PADDING_LEFT = 28;
export const PADDING_RIGHT = 8;

export function smoothLinePath(coords: [number, number][]): string {
    if (coords.length < 2) return '';
    let path = `M ${coords[0][0].toFixed(1)},${coords[0][1].toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
        const previous = coords[i - 1] ?? coords[i];
        const current = coords[i];
        const next = coords[i + 1];
        const afterNext = coords[i + 2] ?? next;
        const cp1x = current[0] + (next[0] - previous[0]) / 6;
        const cp1y = current[1] + (next[1] - previous[1]) / 6;
        const cp2x = next[0] - (afterNext[0] - current[0]) / 6;
        const cp2y = next[1] - (afterNext[1] - current[1]) / 6;
        path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${next[0].toFixed(1)},${next[1].toFixed(1)}`;
    }
    return path;
}

export function smoothAreaPath(coords: [number, number][], baseline: number, firstX: number, lastX: number): string {
    return `${smoothLinePath(coords)} L ${lastX.toFixed(1)},${baseline} L ${firstX.toFixed(1)},${baseline} Z`;
}

export function formatHourLabel(hour: number): string {
    if (hour === 0 || hour === 24) return '12a';
    if (hour === 12) return '12p';
    return hour < 12 ? `${hour}a` : `${hour - 12}p`;
}

export function buildAxisHelpers(allHours: number[], computedMin: number, computedMax: number, plotWidth: number, plotHeight: number) {
    const minHour = Math.min(...allHours);
    const maxHour = Math.max(...allHours);
    const hourRange = maxHour - minHour || 1;
    const valueRange = computedMax - computedMin || 1;
    const xAt = (hour: number) => PADDING_LEFT + ((hour - minHour) / hourRange) * plotWidth;
    const yAt = (value: number) => PADDING_TOP + ((computedMax - value) / valueRange) * plotHeight;
    return { xAt, yAt, minHour, maxHour };
}
