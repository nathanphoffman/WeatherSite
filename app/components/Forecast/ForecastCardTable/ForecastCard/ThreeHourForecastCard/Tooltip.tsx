'use client';

import { ReactNode, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    children: ReactNode;
    text: string;
    align?: 'left' | 'right';
}

export default function Tooltip({ children, text, align = 'left' }: TooltipProps) {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const ref = useRef<HTMLSpanElement>(null);

    const show = () => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setPos({
                top: rect.top - 8,
                left: align === 'right' ? rect.right : rect.left,
            });
        }
        setVisible(true);
    };

    const transformStyle = align === 'right'
        ? 'translate(-100%, -100%)'
        : 'translateY(-100%)';

    return (
        <span ref={ref} className="inline-block" onMouseEnter={show} onMouseLeave={() => setVisible(false)}>
            {children}
            {visible && createPortal(
                <span
                    className="fixed w-max max-w-[240px] rounded bg-gray-900 border border-gray-600 px-2.5 py-1.5 text-sm text-gray-200 leading-snug z-[9999] text-left whitespace-pre-line pointer-events-none"
                    style={{ top: pos.top, left: pos.left, transform: transformStyle }}
                >
                    {text}
                </span>,
                document.body
            )}
        </span>
    );
}
