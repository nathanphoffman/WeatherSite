'use client';

import { useEffect, useState } from 'react';
import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import WeatherEntry from './WeatherEntry';
import RealFeelGraph from './RealFeelGraph';

interface WeatherDayProps {
    forecastDate: string;
    groups: ThreeHourGroup[];
    allGroups: ThreeHourGroup[];
    allFlipped: boolean;
}

export default function WeatherDay({ forecastDate, groups, allGroups, allFlipped }: WeatherDayProps) {
    const [flipped, setFlipped] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        setFlipped(allFlipped);
        setExpanded(false);
    }, [allFlipped]);

    const faceClasses = "bg-gray-900 border border-gray-700 rounded-xl p-4 pb-10";

    return (
        <div
            className={`flip-card w-[calc(100vw-3rem)] sm:w-[290px] cursor-pointer${expanded && flipped ? ' flip-card-expanded' : ''}`}
            onClick={() => { setExpanded(false); setFlipped((previous) => !previous); }}
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
                    <RealFeelGraph groups={groups} allGroups={allGroups} onExpandChange={setExpanded} />
                </div>
            </div>
        </div>
    );
}
