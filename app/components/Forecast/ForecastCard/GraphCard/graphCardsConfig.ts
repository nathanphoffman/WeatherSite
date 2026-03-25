export const GRAPH_DIMENSIONS = {
    SVG_WIDTH: 238,
    SVG_HEIGHT: 80,
    PADDING_TOP: 16,
    PADDING_BOTTOM: 20,
    PADDING_LEFT: 40,
    PADDING_RIGHT: 30, // slightly smaller as it doesn't have y-axis labels
};

export interface ThresholdLine {
    value: number;
    color: string;
    showYLabel?: boolean;
}

export const defaultFormatYLabel = (value: number) => String(Math.round(value));
