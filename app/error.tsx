'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
    return (
        <section className="p-6 text-center">
            <p className="text-red-400">The page could not be displayed.</p>
            <button type="button" onClick={reset} className="mt-4 underline">Try again</button>
        </section>
    );
}
