'use client';

import { useEffect, useRef, useState, useId } from 'react';

export function StaleClosureDemo() {
    const [count, setCount] = useState(0);
    const [name, setName] = useState('nate');

    const countRef = useRef(count);
    countRef.current = count;

    const idizzle = useId();
    console.log("idizzle is ", idizzle)
    console.log("idizzle 2 is ", idizzle)

    // Effect 1: empty deps — captures initial values forever (stale closure)
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('[stale]   count:', count, '| name:', name);
        }, 2000);
        return () => clearInterval(interval);
    }, [name]);

    // Effect 2: ref — always reads current value without re-running the effect
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('[ref]     count:', countRef.current, '| name:', name);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Effect 3: full deps — always fresh, but re-runs (and re-registers interval) on every change
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('[deps]    count:', count, '| name:', name);
        }, 2000);
        return () => clearInterval(interval);
    }, [count, name]);

    return (
        <div style={{ padding: '1rem', fontFamily: 'monospace' }}>
            <h2>Stale Closure Demo</h2>
            <p>Open the console and watch the logs every 2 seconds.</p>
            <p>
                <strong>count:</strong> {count} &nbsp;
                <button onClick={() => setCount((c) => c + 1)}>increment</button>
            </p>
            <p>
                <strong>name:</strong> {name} &nbsp;
                <button onClick={() => setName((n) => n === 'nate' ? 'bob' : 'nate')}>toggle</button>
            </p>
            <ul>
                <li><code>[stale]</code> — empty deps, sees initial values forever</li>
                <li><code>[ref]</code> — ref for count, empty deps, count is always fresh but name is still stale</li>
                <li><code>[deps]</code> — full deps, always fresh, but interval resets on every change</li>
            </ul>
        </div>
    );
}
