'use client';

import { useEffect, useRef, useState } from 'react';
import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import ThreeHourForecastCard from './ThreeHourForecastCard/ThreeHourForecastCard';
import GraphCard from './GraphCard/GraphCard';

interface ForecastCardProps {
    forecastDate: string;
    groups: ThreeHourGroup[];
    allGroups: ThreeHourGroup[];
    allFlipped: boolean;
    flipNonce: number;
    allExpanded: boolean;
    currentHour?: number;
    onFlipChange?: (flipped: boolean) => void;
    onExpandChange?: (expanded: boolean) => void;
}

export default function ForecastCard({ forecastDate, groups, allGroups, allFlipped, flipNonce, allExpanded, currentHour, onFlipChange, onExpandChange }: ForecastCardProps) {
    const [flipped, setFlipped] = useState(false);
    const [cardExpanded, setCardExpanded] = useState(false);
    const [graphsOpen, setGraphsOpen] = useState(false);
    const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = () => {
        if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
        if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    };

    // Collapse graphs (0.4s animation), then flip to forecast side
    const collapseAndFlip = () => {
        clearTimers();
        setGraphsOpen(false);
        flipTimerRef.current = setTimeout(() => {
            setFlipped(false);
            setCardExpanded(false);
        }, 150);
    };

    // Flip to graph side, then after flip completes expand graphs (same animation as clicking "more")
    const flipAndExpand = () => {
        clearTimers();
        setFlipped(true);
        expandTimerRef.current = setTimeout(() => {
            setCardExpanded(true);
            setGraphsOpen(true);
        }, 250);
    };

    useEffect(() => {
        clearTimers();
        setFlipped(allFlipped);
        if (!allFlipped) {
            setGraphsOpen(false);
            setCardExpanded(false);
        } else if (allExpanded) {
            expandTimerRef.current = setTimeout(() => {
                setCardExpanded(true);
                setGraphsOpen(true);
            }, 650);
        }
    }, [flipNonce]);

    useEffect(() => {
        if (allExpanded && flipped && !graphsOpen) {
            setCardExpanded(true);
            setGraphsOpen(true);
        } else if (!allExpanded && graphsOpen) {
            setGraphsOpen(false);
            setCardExpanded(false);
        }
    }, [allExpanded]);

    useEffect(() => {
        onFlipChange?.(flipped);
    }, [flipped]);

    const faceClasses = "bg-gray-900 border border-gray-700 rounded-xl p-4 pb-10 min-h-[430px]";

    return (
        <article
            className={`flip-card w-[calc(100vw-3rem)] sm:w-[290px] cursor-pointer${cardExpanded && flipped ? ' flip-card-expanded' : ''}`}
            onClick={() => {
                if (!flipped) {
                    if (allExpanded) {
                        flipAndExpand();
                    } else {
                        clearTimers();
                        setFlipped(true);
                    }
                } else {
                    if (graphsOpen) {
                        collapseAndFlip();
                    } else {
                        clearTimers();
                        setFlipped(false);
                        setCardExpanded(false);
                    }
                }
            }}
        >
            <div className={`flip-card-inner${flipped ? ' flipped' : ''}`}>
                <div className={`flip-card-front ${faceClasses}`}>
                    <div className="text-base font-semibold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-700">
                        {forecastDate}
                    </div>
                    <ThreeHourForecastCard groups={groups} />
                </div>
                <div className={`flip-card-back ${faceClasses}`}>
                    <div className="text-base font-semibold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-700">
                        {forecastDate}
                    </div>
                    <GraphCard
                        groups={groups}
                        allGroups={allGroups}
                        allExpanded={graphsOpen}
                        currentHour={currentHour}
                        onExpandChange={(value) => {
                            setGraphsOpen(value);
                            setCardExpanded(value);
                            onExpandChange?.(value);
                        }}
                    />
                </div>
            </div>
        </article>
    );
}
