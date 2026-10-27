import { ReactNode } from 'react';

interface AboutSectionProps {
    title: string;
    spacingClass?: string;
    children: ReactNode;
}

export default function AboutSection({ title, spacingClass = 'space-y-3', children }: AboutSectionProps) {
    return (
        <section className={`bg-gray-900 border border-gray-700 rounded-xl p-5 ${spacingClass}`}>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">{title}</h2>
            {children}
        </section>
    );
}
