export default async function Page() {
    return (
        <article className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="relative flex items-center justify-center">
                <a href="/" className="absolute left-0 flex items-center justify-center w-10 h-10 text-xl text-gray-400 border border-gray-600 rounded-lg hover:text-white hover:border-gray-400 active:bg-gray-800" aria-label="Back to forecast">
                    ↩
                </a>
                <h1 className="text-2xl font-bold text-white">How to Read the Forecast</h1>
            </div>

            <section className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Format</h2>
                <p className="text-white font-mono text-lg">RealFeel(H) &nbsp;StormRating(W)(T) &nbsp;😊</p>
                <ul className="space-y-1 text-gray-300 text-sm">
                    <li><span className="text-white font-semibold">RealFeel</span> — 'feels like' temperature rounded to the nearest 5th°</li>
                    <li><span className="text-white font-semibold">(H)</span> — appears when humidity is high</li>
                    <li><span className="text-white font-semibold">(W)</span> — appears when it is windy</li>
                    <li><span className="text-white font-semibold">(T)</span> — appears when there is a chance of thunderstorms</li>
                    <li><span className="text-white font-semibold">⚠️</span> — A caution symbol shows if the storm factor is particularly unstable over the averaged three hour window, this may be times near a storm or a thundershower. This basically means 'use caution weather could be worse than shown.'</li>

                </ul>
            </section>

            <section className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Color Coding</h2>
                <ul className="space-y-1 text-sm">
                    <li className="text-green-400 font-semibold">Green — best</li>
                    <li className="text-gray-400 font-semibold">Grey — decent</li>
                    <li className="text-yellow-400 font-semibold">Yellow — not great</li>
                    <li className="text-red-400 font-semibold">Red — pretty bad</li>
                    <li className="text-red-200 font-bold">Bright — really bad</li>
                </ul>
            </section>

            <section className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-2">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Smiley Face</h2>
                <ul className="space-y-1 text-gray-300 text-sm">
                    <li><span className="text-white font-semibold">😎</span> — RealFeel and storm rating are both green, and humidity is not a factor (excellent conditions)</li>
                    <li><span className="text-white font-semibold">😊</span> — Conditions are decently nice, such as a grey and green combination</li>
                </ul>
            </section>

            <section className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Storm Rating Guide</h2>
                <p className="text-gray-400 text-sm">A composite of cloud cover, precipitation, wind, and thunder — rounded to 1 sig fig under 10 or nearest 5 over 10.</p>
                <div className="divide-y divide-gray-800 text-sm">
                    {[
                        { range: '< 10', label: 'Not Overcast', description: 'Max cloud cover is rating × 10% (e.g. 5 = 50% clouds). May dip lower if W or T are present.' },
                        { range: '10–15', label: 'Overcast', description: 'Likely overcast but precipitation unlikely. Could be partially clear if winds or thunder are present.' },
                        { range: '20–25', label: 'Drizzle / Flurry', description: 'Light precipitation, winds, or thunder possible. Definitely overcast.' },
                        { range: '30–35', label: 'Stormy', description: 'Precipitation likely, sky noticeably darker, strong wind or thunderstorms possible.' },
                        { range: '40–45', label: 'Strong Storm', description: 'Precipitation effectively guaranteed, sky much darker, strong wind or thunderstorms likely.' },
                        { range: '50', label: 'Severe Storm', description: 'Heavier precipitation and very strong winds or thunderstorms guaranteed. Possible major storm like a hurricane — check other forecasts.' },
                    ].map(({ range, label, description }) => (
                        <div key={range} className="py-3 flex gap-4 items-start">
                            <span className="text-white font-mono w-14 shrink-0">{range}</span>
                            <div className="text-left">
                                <span className="text-white font-semibold">{label}</span>
                                <p className="text-gray-400 mt-0.5">{description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </article>
    );
}
