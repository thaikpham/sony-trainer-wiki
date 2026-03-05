'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { CATEGORY_OPTIONS } from './SingleSelectField';

/**
 * MultiSelectCategoryField — styled dropdown for selecting multiple categories with color preview.
 */
export default function MultiSelectCategoryField({
    value = [],
    onChange,
    options = CATEGORY_OPTIONS,
    placeholder = 'Chọn ngành hàng...',
    readOnly = false
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleOption = (label) => {
        if (readOnly) return;
        const newValue = value.includes(label)
            ? value.filter(v => v !== label)
            : [...value, label];
        onChange(newValue);
    };

    const removeOption = (label, e) => {
        e.stopPropagation();
        if (readOnly) return;
        onChange(value.filter(v => v !== label));
    };

    return (
        <div ref={ref} className="relative">
            <div
                onClick={() => !readOnly && setOpen(v => !v)}
                className={`min-h-[44px] w-full flex flex-wrap gap-1.5 items-center px-3 py-2 rounded-xl border border-black/10 bg-white transition-all ${!readOnly ? 'cursor-pointer focus-within:ring-2 focus-within:ring-blue-500/40' : 'cursor-default'
                    }`}
            >
                {value.length > 0 ? (
                    value.map(label => {
                        const opt = options.find(o => o.label === label);
                        return (
                            <span
                                key={label}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${opt?.color || 'bg-slate-100 text-slate-700'}`}
                            >
                                {label}
                                {!readOnly && (
                                    <button
                                        type="button"
                                        onClick={(e) => removeOption(label, e)}
                                        className="hover:opacity-60 transition-opacity"
                                    >
                                        <X size={10} strokeWidth={3} />
                                    </button>
                                )}
                            </span>
                        );
                    })
                ) : (
                    <span className="text-slate-400 text-[13px]">{placeholder}</span>
                )}
                {!readOnly && (
                    <ChevronDown
                        size={14}
                        className={`text-slate-400 ml-auto flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                )}
            </div>

            {open && !readOnly && (
                <div className="absolute z-50 mt-1.5 w-full max-h-[300px] overflow-y-auto custom-scrollbar rounded-xl border border-black/[0.08] bg-white shadow-2xl py-1">
                    {options.map(opt => {
                        const isSelected = value.includes(opt.label);
                        return (
                            <button
                                key={opt.label}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); toggleOption(opt.label); }}
                                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                            >
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${opt.color}`}>
                                    {opt.label}
                                </span>
                                {isSelected && <Check size={14} strokeWidth={3} className="text-blue-500 flex-shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
