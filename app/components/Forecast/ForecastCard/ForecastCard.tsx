'use client';

import { useEffect, useRef, useState } from 'react';
import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import WeatherEntry from './WeatherEntry';
import RealFeelGraph from './RealFeelGraph';

interface ForecastCardProps {
    forecastDate: string;
    groups: ThreeHourGroup[];
    allGroups: ThreeHourGroup[];
    allFlipped: boolean;
    flipNonce: number;
    allExpanded: boolean;
    onFlipChange?: (flipped: boolean) => void;
    onExpandChange?: (expanded: boolean) => void;
}

export default function ForecastCard({ forecastDate, groups, allGroups, allFlipped, flipNonce, allExpanded, onFlipChange, onExpandChange }: ForecastCardProps) {
    const [flipped, setFlipped] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scheduleExpand = () => {
        if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
        expandTimerRef.current = setTimeout(() => setExpanded(true), 650);
    };

    const cancelAndCollapse = () => {
        if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
        setExpanded(false);
    };

    useEffect(() => {
        setFlipped(allFlipped);
        if (!allFlipped) {
            cancelAndCollapse();
        } else if (allExpanded) {
            scheduleExpand();
        }
    }, [flipNonce]);

    useEffect(() => {
        onFlipChange?.(flipped);
    }, [flipped]);

    const faceClasses = "bg-gray-900 border border-gray-700 rounded-xl p-4 pb-10";

    return (
        <div
            className={`flip-card w-[calc(100vw-3rem)] sm:w-[290px] cursor-pointer${expanded && flipped ? ' flip-card-expanded' : ''}`}
            onClick={() => {
                const nextFlipped = !flipped;
                setFlipped(nextFlipped);
                if (!nextFlipped) {
                    cancelAndCollapse();
                } else if (allExpanded) {
                    scheduleExpand();
                }
            }}
        >
            <div className={`flip-card-inner${flipped ? ' flipped' : ''}`}>
                <div className={`flip-card-front ${faceClasses}`}>
                    <div className="text-base font-semibold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-700">
                        {forecastDate}
                    </div>
                    {groups.map((group) => (
                        <WeatherEntry key={group.regularTime} group={group} />
                    ))}
                </div>
                <div className={`flip-card-back ${faceClasses}`}>
                    <div className="text-base font-semibold text-gray-400 uppercase tracking-wide mb-3 pb-2 border-b border-gray-700">
                        {forecastDate}
                    </div>
                    <RealFeelGraph groups={groups} allGroups={allGroups} allExpanded={allExpanded} onExpandChange={(value) => { setExpanded(value); onExpandChange?.(value); }} />
                </div>
            </div>
        </div>
    );
}
