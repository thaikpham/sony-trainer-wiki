'use client';
import { useState, useRef, useEffect } from 'react';
import { X, Trash2, Check, Plus } from 'lucide-react';

// Predefined color palette for tags
export const TAG_COLORS = [
    { id: 'blue', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    { id: 'violet', bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500' },
    { id: 'rose', bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
    { id: 'amber', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    { id: 'emerald', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    { id: 'sky', bg: 'bg-sky-100', text: 'text-sky-700', dot: 'bg-sky-500' },
    { id: 'orange', bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
    { id: 'pink', bg: 'bg-pink-100', text: 'text-pink-700', dot: 'bg-pink-500' },
    { id: 'teal', bg: 'bg-teal-100', text: 'text-teal-700', dot: 'bg-teal-500' },
    { id: 'slate', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-500' },
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

    const selectedValues = Array.isArray(value)
        ? value.filter(v => v !== null && v !== undefined).map(v => String(v))
        : value !== null && value !== undefined && String(value).trim() !== ''
            ? [String(value)]
            : [];

    const suggestionValues = Array.isArray(suggestions)
        ? suggestions.filter(s => s !== null && s !== undefined).map(s => String(s))
        : [];

    const emitChange = (nextValues) => {
        if (typeof onChange === 'function') {
            onChange(nextValues);
        }
    };

    const filtered = suggestionValues.filter(s =>
        s.toLowerCase().includes(input.toLowerCase())
    );

    const toggleTag = (tag) => {
        if (selectedValues.includes(tag)) {
            emitChange(selectedValues.filter(v => v !== tag));
        } else {
            emitChange([...selectedValues, tag]);
        }
        setInput('');
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 0);
    };

    const addTag = (tag) => {
        const trimmed = tag.trim();
        if (trimmed && !selectedValues.includes(trimmed)) {
            emitChange([...selectedValues, trimmed]);
        }
        setInput('');

        // Re-focus input to keep dropdown naturally open
        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 0);
    };

    const removeTag = (tag) => emitChange(selectedValues.filter(v => v !== tag));

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault();
            if (onAddSuggestion && !suggestionValues.includes(input.trim())) {
                onAddSuggestion(input.trim());
            }
            addTag(input);
        } else if (e.key === 'Backspace' && !input && selectedValues.length > 0) {
            removeTag(selectedValues[selectedValues.length - 1]);
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
                className="min-h-[44px] w-full flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-xl border border-black/10 bg-white cursor-text transition-colors focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-blue-400"
            >
                {selectedValues.map(tag => (
                    <TagPill key={tag} tag={tag} onRemove={removeTag} />
                ))}
                <div className="flex-1 min-w-[120px] relative">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={e => { setInput(e.target.value); setOpen(true); }}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                            if (input.trim()) addTag(input);
                            // Delay setOpen(false) to allow clicking dropdown items
                            setTimeout(() => setOpen(false), 200);
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder={selectedValues.length === 0 ? placeholder : ''}
                        className="w-full bg-transparent text-[13px] text-foreground placeholder:text-slate-400 outline-none h-full py-0.5 pr-8"
                    />
                    {input.trim() && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (onAddSuggestion && !suggestionValues.includes(input.trim())) {
                                    onAddSuggestion(input.trim());
                                }
                                addTag(input);
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md bg-transparent text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                            title="Tạo tag mới"
                        >
                            <Plus size={16} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1.5 w-full max-h-[280px] overflow-y-auto custom-scrollbar rounded-xl border border-black/[0.08] bg-white shadow-2xl py-1.5 top-full left-0">
                    <div className="px-3 py-1.5 mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Chọn một tùy chọn hoặc tạo mới
                    </div>
                    {filtered.length > 0 ? (
                        filtered.map(s => (
                            <div key={s} className="w-full flex items-center justify-between hover:bg-slate-50 transition-colors group px-1">
                                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleTag(s); }}
                                    className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-left hover:bg-slate-100 transition-colors">
                                    <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors flex-shrink-0 ${selectedValues.includes(s) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'}`}>
                                        {selectedValues.includes(s) && <Check size={12} strokeWidth={3} />}
                                    </div>
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ` + getTagColor(s).dot} />
                                    <span className="font-medium text-slate-700">{s}</span>
                                </button>
                                {onRemoveSuggestion && (
                                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemoveSuggestion(s); }}
                                        className="px-3 py-2 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-md hover:bg-rose-50 ml-1"
                                        title="Xóa tag này vĩnh viễn">
                                        <Trash2 size={13} />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        input.trim() === '' && (
                            <div className="px-4 py-3 text-[13px] text-slate-500 text-center">
                                Không tìm thấy tags nào. Hãy gõ từ khóa để tạo mới.
                            </div>
                        )
                    )}
                    {input.trim() && !selectedValues.includes(input.trim()) && !filtered.includes(input.trim()) && (
                        <div className="px-2 pt-1 border-t border-black/[0.06] mt-1">
                            <button type="button" onClick={(e) => {
                                e.preventDefault();
                                if (onAddSuggestion && !suggestionValues.includes(input.trim())) {
                                    onAddSuggestion(input.trim());
                                }
                                addTag(input);
                            }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-left text-[#1d1d1f] hover:bg-[#F5F5F7] transition-all group">
                                <span className="flex items-center justify-center w-5 h-5 rounded-md bg-blue-100 text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Plus size={14} strokeWidth={3} />
                                </span>
                                Tạo tag mới: <strong className="text-blue-600">{input.trim()}</strong>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
