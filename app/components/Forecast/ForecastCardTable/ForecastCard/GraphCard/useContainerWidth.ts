import { useRef, useState, useEffect } from 'react';
import { GRAPH_DIMENSIONS } from './graphConfig';

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
