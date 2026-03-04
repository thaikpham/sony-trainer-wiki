'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const CATEGORY_OPTIONS = [
    { label: 'Máy Ảnh', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
    { label: 'Ống Kính', color: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300' },
    { label: 'Tivi Bravia', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
    { label: 'Loa & Âm Thanh', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' },
    { label: 'Tai Nghe', color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300' },
    { label: 'PlayStation', color: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' },
    { label: 'Điện Thoại Xperia', color: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300' },
    { label: 'Máy Quay Film', color: 'bg-slate-100 dark:bg-slate-700/40 text-slate-700 dark:text-slate-300' },
    { label: 'Máy Chiếu', color: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' },
    { label: 'Phụ Kiện', color: 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300' },
];

/**
 * CategoryBadge — renders a colored category pill for display.
 */
export function CategoryBadge({ category }) {
    const opt = CATEGORY_OPTIONS.find(o => o.label === category);
    if (!opt) return <span className="text-slate-400 text-[12px]">{category || '—'}</span>;
    return (
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${opt.color}`}>
            {opt.label}
        </span>
    );
}

/**
 * SingleSelectField — styled dropdown for selecting a single category with color preview.
 */
export default function SingleSelectField({ value, onChange, options = CATEGORY_OPTIONS, placeholder = 'Chọn ngành hàng...' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const selected = options.find(o => o.label === value);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-left text-[13px] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
                {selected
                    ? <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${selected.color}`}>{selected.label}</span>
                    : <span className="text-slate-400">{placeholder}</span>
                }
                <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#1c1c1e] shadow-xl overflow-hidden py-1">
                    {options.map(opt => (
                        <button
                            key={opt.label}
                            type="button"
                            onMouseDown={() => { onChange(opt.label); setOpen(false); }}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${opt.color}`}>{opt.label}</span>
                            {value === opt.label && <Check size={13} className="text-blue-500 flex-shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
