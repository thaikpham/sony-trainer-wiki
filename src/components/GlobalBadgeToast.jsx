import { useEffect, useState } from 'react';
import { ROLES } from '@/lib/roles';
import { Sparkles, Trophy } from 'lucide-react';

export default function GlobalBadgeToast() {
    const [queue, setQueue] = useState([]);
    const [current, setCurrent] = useState(null);

    // Listen for custom badge unlocked events
    useEffect(() => {
        const handleBadgeUnlocked = (event) => {
            const { unlockedBadges } = event.detail;
            if (unlockedBadges && unlockedBadges.length > 0) {
                setQueue(prev => [...prev, ...unlockedBadges]);
            }
        };

        window.addEventListener('badge-unlocked', handleBadgeUnlocked);
        return () => window.removeEventListener('badge-unlocked', handleBadgeUnlocked);
    }, []);

    // Process queue
    useEffect(() => {
        if (!current && queue.length > 0) {
            const nextBadge = queue[0];
            // Defer state update to next tick to avoid cascading renders
            setTimeout(() => {
                setCurrent(nextBadge);
                setQueue(prev => prev.slice(1));
            }, 0);
        }
    }, [queue, current]);

    // Handle single toast lifecycle
    useEffect(() => {
        if (current) {
            const timer = setTimeout(() => {
                setCurrent(null);
            }, 5000); // Show each badge for 5 seconds
            return () => clearTimeout(timer);
        }
    }, [current]);

    if (!current) return null;

    const role = ROLES[current];
    if (!role) return null;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[28px] shadow-2xl border border-white/40 flex items-center gap-4 relative overflow-hidden pointer-events-auto min-w-[320px]">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />

                {/* Badge Icon */}
                <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner relative z-10 
                        bg-gradient-to-br ${role.gradient} ${role.textColor || 'text-white'}`}
                    style={{ boxShadow: `0 8px 16px ${role.glow}` }}
                >
                    {role.emoji}
                </div>

                {/* Badge Details */}
                <div className="flex flex-col relative z-10 flex-1">
                    <div className="flex items-center gap-1 mb-0.5">
                        <Trophy size={12} className="text-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                            Thành tựu mới
                        </span>
                    </div>
                    <h4 className="font-bold text-[15px] text-slate-800 tracking-tight leading-tight">
                        {role.label}
                    </h4>
                    <span className={`text-[11px] font-bold uppercase mt-1 w-max px-2 py-0.5 rounded-md
                        ${role.rarity === 'Legendary' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {role.rarity}
                    </span>
                </div>

                {role.rarity === 'Legendary' && (
                    <Sparkles size={24} className="absolute top-4 right-4 text-amber-400 animate-pulse" />
                )}
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
