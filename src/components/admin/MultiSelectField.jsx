'use client';
import { useState, useRef, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';

// Predefined color palette for tags
export const TAG_COLORS = [
    { id: 'blue', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    { id: 'violet', bg: 'bg-violet-100 dark:bg-violet-900/40', text: 'text-violet-700 dark:text-violet-300', dot: 'bg-violet-500' },
    { id: 'rose', bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
    { id: 'amber', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
    { id: 'emerald', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
    { id: 'sky', bg: 'bg-sky-100 dark:bg-sky-900/40', text: 'text-sky-700 dark:text-sky-300', dot: 'bg-sky-500' },
    { id: 'orange', bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
    { id: 'pink', bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500' },
    { id: 'teal', bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500' },
    { id: 'slate', bg: 'bg-slate-100 dark:bg-slate-700/40', text: 'text-slate-600 dark:text-slate-300', dot: 'bg-slate-500' },
];

// Assign a consistent color to a tag string
export function getTagColor(tag) {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

/**
 * Renders a single colored tag pill.
 */
export function TagPill({ tag, onRemove }) {
    const color = getTagColor(tag);
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${color.bg} ${color.text} whitespace-nowrap`}>
            {tag}
            {onRemove && (
                <button type="button" onClick={() => onRemove(tag)}
                    className="ml-0.5 hover:opacity-70 transition-opacity">
                    <X size={10} strokeWidth={3} />
                </button>
            )}
        </span>
    );
}

/**
 * MultiSelectField — Modern-style multi-select with colored tags.
 * Props:
 *   value: string[]
 *   onChange: (newValue: string[]) => void
 *   suggestions?: string[]   — predefined option list
 *   placeholder?: string
 */
export default function MultiSelectField({ value = [], onChange, suggestions = [], onAddSuggestion, onRemoveSuggestion, placeholder = 'Thêm tag...' }) {
    const [input, setInput] = useState('');
    const [open, setOpen] = useState(false);
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const filtered = suggestions.filter(s =>
        s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
    );

    const addTag = (tag) => {
        const trimmed = tag.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
        }
        setInput('');

        // Re-focus input to keep dropdown naturally open
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 0);
    };

    const removeTag = (tag) => onChange(value.filter(v => v !== tag));

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault();
            if (onAddSuggestion && !suggestions.includes(input.trim())) {
                onAddSuggestion(input.trim());
            }
            addTag(input);
        } else if (e.key === 'Backspace' && !input && value.length > 0) {
            removeTag(value[value.length - 1]);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={containerRef} className="relative">
            <div
                onClick={() => { setOpen(true); inputRef.current?.focus(); }}
                className="min-h-[40px] w-full flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 cursor-text transition-colors focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-400"
            >
                {value.map(tag => (
                    <TagPill key={tag} tag={tag} onRemove={removeTag} />
                ))}
                <input
                    ref={inputRef}
                    value={input}
                    onChange={e => { setInput(e.target.value); setOpen(true); }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setOpen(true)}
                    placeholder={value.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[80px] bg-transparent text-[13px] text-foreground placeholder:text-slate-400 outline-none"
                />
            </div>

            {/* Dropdown */}
            {open && (filtered.length > 0) && (
                <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto custom-scrollbar rounded-xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#1c1c1e] shadow-xl py-1">
                    {filtered.map(s => (
                        <div key={s} className="w-full flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); addTag(s); }}
                                className="flex-1 flex items-center gap-2 px-3 py-2 text-[13px] text-left">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getTagColor(s).dot}`} />
                                {s}
                            </button>
                            {onRemoveSuggestion && (
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveSuggestion(s); }}
                                    className="px-3 py-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </div>
                    ))}
                    {input.trim() && !value.includes(input.trim()) && (
                        <button type="button" onClick={(e) => {
                            e.preventDefault();
                            if (onAddSuggestion && !suggestions.includes(input.trim())) {
                                onAddSuggestion(input.trim());
                            }
                            addTag(input);
                        }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-t border-black/[0.05] dark:border-white/5 transition-colors">
                            <span className="text-blue-400">+</span>
                            Tạo tag &quot;<strong>{input.trim()}</strong>&quot;

                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
