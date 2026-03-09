'use client';
import { useState, useRef, useEffect } from 'react';
import { ROLES } from '@/lib/roles';
import RoleBadge from './RoleBadge';
import { ChevronDown, Trophy } from 'lucide-react';

export default function RoleBadgeDropdown({ roleKeys = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Sort roles by rarity first, then priority
    const rarityWeight = {
        'Legendary': 0,
        'Epic': 1,
        'Rare': 2,
        'Uncommon': 3,
        'Common': 4
    };

    const sortedKeys = [...roleKeys].sort((a, b) => {
        const rarityA = ROLES[a]?.rarity || 'Common';
        const rarityB = ROLES[b]?.rarity || 'Common';

        if (rarityWeight[rarityA] !== rarityWeight[rarityB]) {
            return rarityWeight[rarityA] - rarityWeight[rarityB];
        }

        return (ROLES[a]?.priority || 99) - (ROLES[b]?.priority || 99);
    });

    const primaryKey = sortedKeys[0];
    const otherCount = sortedKeys.length - 1;

    // Handle clicking outside to close
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!primaryKey) return null;

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1 p-1 pr-2 rounded-full transition-all duration-300 group ${isOpen
                    ? 'bg-black/5 ring-1 ring-black/10'
                    : 'hover:bg-black/5'
                    }`}
            >
                <RoleBadge roleKey={primaryKey} size="sm" />

                {otherCount > 0 && (
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full ring-1 ring-black/5 group-hover:text-blue-500 transition-colors">
                        +{otherCount}
                    </span>
                )}

                <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-64 z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-[0_20px_40px_rgba(0,0,0,0.15)] ring-1 ring-black/5 border border-white/20 overflow-hidden">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Trophy size={16} className="text-amber-500" />
                            <span className="text-[12px] font-black uppercase tracking-widest text-slate-400">Huy hiệu sở hữu</span>
                        </div>

                        <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                            {sortedKeys.map((key) => {
                                const role = ROLES[key];
                                return (
                                    <div
                                        key={key}
                                        className="group/item flex items-center justify-between p-2 rounded-2xl hover:bg-black/[0.03] transition-colors border border-transparent hover:border-black/[0.05]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-[16px] shadow-sm transform group-hover/item:scale-110 transition-transform`}>
                                                {role.emoji}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-[#1d1d1f] leading-none mb-1">{role.label}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{role.rarity}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 pt-4 border-t border-black/[0.05] flex justify-center">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    window.location.href = '/dashboard';
                                }}
                                className="text-[11px] font-black text-blue-500 hover:text-blue-600 transition-colors uppercase tracking-widest"
                            >
                                Xem tất cả
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
