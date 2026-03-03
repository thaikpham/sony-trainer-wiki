'use client';
import { useState, useEffect, useRef } from 'react';

/**
 * HeroCyclingWord
 * Cycles through an array of { label, gradient, glow } objects,
 * animating each word in/out with blur + translate transitions.
 */
export default function HeroCyclingWord({ words, intervalMs = 2000, justify = 'center' }) {
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState('in'); // 'in' | 'out'
    const timerRef = useRef(null);

    useEffect(() => {
        // After "in" settles, wait then trigger "out"
        timerRef.current = setTimeout(() => {
            setPhase('out');
        }, intervalMs - 450); // Leave ~450ms for the out-animation

        return () => clearTimeout(timerRef.current);
    }, [index, intervalMs]);

    useEffect(() => {
        if (phase !== 'out') return;
        // After "out" animation (~400ms), advance to next word
        const t = setTimeout(() => {
            setIndex(prev => (prev + 1) % words.length);
            setPhase('in');
        }, 420);
        return () => clearTimeout(t);
    }, [phase, words.length]);

    const word = words[index];

    const style = phase === 'in'
        ? {
            animation: 'word-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            filter: 'drop-shadow(0 0 32px ' + word.glow + ')',
        }
        : {
            animation: 'word-out 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards',
        };

    return (
        <div className="relative flex items-center my-1" style={{ height: '1.12em', minHeight: '1.1em', justifyContent: justify === 'start' ? 'flex-start' : justify === 'end' ? 'flex-end' : 'center' }} aria-live="polite">
            <span
                key={`${index}-${phase}`}
                style={style}
                className={`inline-block text-[clamp(52px,6.5vw,96px)] font-black tracking-[-0.04em] leading-[1] select-none text-transparent bg-clip-text bg-gradient-to-r ${word.gradient}`}
            >
                {word.label}
            </span>
        </div>
    );
}
