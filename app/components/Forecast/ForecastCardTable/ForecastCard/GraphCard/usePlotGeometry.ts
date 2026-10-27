import { GRAPH_DIMENSIONS } from './graphConfig';
import { useContainerWidth } from './useContainerWidth';

export function usePlotGeometry(height?: number) {
    const { SVG_HEIGHT, PADDING_LEFT, PADDING_RIGHT, PADDING_TOP, PADDING_BOTTOM } = GRAPH_DIMENSIONS;
    const { ref: containerRef, width: svgWidth } = useContainerWidth();
    const resolvedHeight = height ?? SVG_HEIGHT;
    const plotWidth = svgWidth - PADDING_LEFT - PADDING_RIGHT;
    const plotHeight = resolvedHeight - PADDING_TOP - PADDING_BOTTOM;

    return { containerRef, svgWidth, resolvedHeight, plotWidth, plotHeight };
}
