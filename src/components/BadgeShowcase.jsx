import React, { useMemo, useCallback } from 'react';
import { ROLES } from '@/lib/roles';
import { Lock, Sparkles, Star, Award as Trophy } from 'lucide-react';

export default function BadgeShowcase({ userRoleKeys = [] }) {
    const allRoles = useMemo(() => Object.keys(ROLES).sort((a, b) => ROLES[a].priority - ROLES[b].priority), []);
    const sortBadges = useCallback((keys) => {
        return [...keys].sort((a, b) => {
            const isUnlockedA = userRoleKeys.includes(a);
            const isUnlockedB = userRoleKeys.includes(b);

            // 1. Unlocked first
            if (isUnlockedA !== isUnlockedB) {
                return isUnlockedA ? -1 : 1;
            }

            // 2. Then by rarity/priority
            return (ROLES[a].priority || 99) - (ROLES[b].priority || 99);
        });
    }, [userRoleKeys]);

    const coreRoles = useMemo(() => {
        const keys = allRoles.filter(k => ROLES[k].category === 'core');
        return sortBadges(keys);
    }, [allRoles, sortBadges]);

    const achievementRoles = useMemo(() => {
        const keys = allRoles.filter(k => ROLES[k].category === 'achievement');
        return sortBadges(keys);
    }, [allRoles, sortBadges]);

    const renderBadgeGrid = (keys) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {keys.map(key => {
                const role = ROLES[key];
                const isUnlocked = userRoleKeys.includes(key);
                const isLegendary = role.rarity === 'Legendary';
                const isEpic = role.rarity === 'Epic';

                return (
                    <div
                        key={key}
                        className={`group relative overflow-hidden rounded-[24px] p-5 transition-all duration-500 ${isUnlocked
                            ? 'bg-background shadow-[0_4px_20px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1'
                            : 'bg-black/[0.02] ring-1 ring-black/[0.05] saturate-[0.1] opacity-60'
                            }`}
                    >
                        {/* Rare Badge Shimmer/Glow */}
                        {isUnlocked && (isLegendary || isEpic) && (
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                        )}

                        <div className="flex items-start justify-between mb-4">
                            <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${isUnlocked ? `bg-gradient-to-br ${role.gradient} ${role.textColor || 'text-white'}` : 'bg-slate-200 text-slate-400'
                                    }`}
                                style={isUnlocked ? { boxShadow: `0 8px 16px ${role.glow}` } : {}}
                            >
                                {isUnlocked ? role.emoji : <Lock size={20} />}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full ${isUnlocked
                                    ? (isLegendary ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500')
                                    : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {role.rarity}
                                </span>
                                {isUnlocked && (isLegendary || isEpic) && (
                                    <Sparkles size={12} className="text-amber-400 mt-1 animate-pulse" />
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <h3 className={`text-[15px] font-bold tracking-tight mb-1 ${isUnlocked ? 'text-foreground' : 'text-slate-400'}`}>
                                {role.label}
                            </h3>
                            <p className={`text-[12px] leading-relaxed line-clamp-2 ${isUnlocked ? 'text-slate-500' : 'text-slate-300'}`}>
                                {role.description}
                            </p>
                        </div>

                        {/* Unlock Status Footer */}
                        {!isUnlocked && (
                            <div className="mt-4 pt-4 border-t border-black/[0.03] flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                <Lock size={12} />
                                <span>CHƯA MỞ KHÓA</span>
                            </div>
                        )}
                        {isUnlocked && (
                            <div className="mt-4 pt-4 border-t border-black/[0.03] flex items-center justify-between">
                                <div className="flex items-center gap-1 text-[11px] font-bold text-teal-600">
                                    <Star size={12} fill="currentColor" />
                                    <span>ĐÃ SỞ HỮU</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium">#{role.priority + 1}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="bg-background rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02] flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 ring-1 ring-amber-500/20">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <h2 className="text-[20px] font-black text-foreground tracking-tight leading-tight">Hệ thống Huy hiệu</h2>
                        <p className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">Bộ sưu tập thành tựu cá nhân</p>
                    </div>
                </div>
            </div>

            <div className="space-y-10">
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400">Vị trí & Chức danh</h3>
                    </div>
                    {renderBadgeGrid(coreRoles)}
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                        <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-400">Thành tựu Alpha</h3>
                    </div>
                    {renderBadgeGrid(achievementRoles)}
                </section>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite linear;
                }
            `}</style>
        </div>
    );
}
