interface GraphBordersProps {
    paddingLeft: number;
    paddingTop: number;
    plotWidth: number;
    plotHeight: number;
}

export default function GraphBorders({ paddingLeft, paddingTop, plotWidth, plotHeight }: GraphBordersProps) {
    return (
        <>
            <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft + plotWidth} y2={paddingTop} stroke="#1f2937" strokeWidth={1} />
            <line x1={paddingLeft} y1={paddingTop + plotHeight} x2={paddingLeft + plotWidth} y2={paddingTop + plotHeight} stroke="#1f2937" strokeWidth={1} />
        </>
    );
}
