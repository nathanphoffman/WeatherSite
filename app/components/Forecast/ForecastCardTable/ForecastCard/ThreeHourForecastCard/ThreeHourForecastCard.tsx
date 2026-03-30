'use client';

import Link from 'next/link';
import { ThreeHourGroup } from '@/app/lib/noaa/types/forecast';
import ThreeHourEntry from './ThreeHourEntry';

interface ThreeHourForecastCardProps {
    groups: ThreeHourGroup[];
}

export default function ThreeHourForecastCard({ groups }: ThreeHourForecastCardProps) {
    return (
        <table className="w-full text-xl border-collapse">
            <thead>
                <tr className="text-sm text-gray-500 uppercase tracking-wide border-b border-gray-700">
                    <th className="text-left font-normal py-1 pr-4 border-r border-dotted border-gray-700">Time</th>
                    <th className="text-center font-normal border-r border-dotted border-gray-700">
                        <Link href="/about" onClick={(e) => e.stopPropagation()} className="flex justify-center items-center gap-1 py-1 px-4 hover:text-gray-300">
                            Real Feel <span className="text-gray-600">(?)</span>
                        </Link>
                    </th>
                    <th className="text-center font-normal border-r border-dotted border-gray-700">
                        <Link href="/about" onClick={(e) => e.stopPropagation()} className="flex justify-center items-center gap-1 py-1 px-2 hover:text-gray-300">
                            Storm Factor <span className="text-gray-600">(?)</span>
                        </Link>
                    </th>
                    <th className="py-1 pl-4" />
                </tr>
            </thead>
            <tbody>
                {groups.map((group) => (
                    <ThreeHourEntry key={group.regularTime} group={group} />
                ))}
            </tbody>
        </table>
    );
}
