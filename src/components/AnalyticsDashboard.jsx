'use client';
import { useState, useEffect } from 'react';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { Users, TrendingUp, Zap, Star, Activity } from 'lucide-react';


export default function AnalyticsDashboard() {
    const { topFeatures, activeUserCount, totalUsersCount, totalPulseCount } = useRealTimeAnalytics();

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-0 animate-fade-in relative z-10">
            {/* Header with Active Counter */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Live System Performance</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Thống kê Thời gian thực</h2>
                </div>

                <div className="flex items-center gap-6 bg-white p-4 sm:p-6 rounded-[32px] ring-1 ring-black/5 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
                            <Users size={24} />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                                <span className="text-[24px] font-black text-foreground">{activeUserCount}</span>
                                <span className="text-[14px] font-black text-emerald-500">Live</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Members</span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-black/5"></div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col text-right">
                            <span className="text-[11px] font-black text-emerald-500 uppercase">Stable</span>
                            <span className="text-[10px] font-bold text-slate-400">Low Latency</span>
                        </div>
                        <Activity size={20} className="text-emerald-500 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Top 10 Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Ranking Card */}
                <div className="glass-panel p-8 md:p-10 rounded-[48px] flex flex-col relative overflow-hidden group h-full text-left">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -z-0"></div>

                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="text-[18px] font-black text-[#1d1d1f]">Top 10 Xu Hướng</h3>
                    </div>

                    <div className="space-y-4 relative z-10">
                        {topFeatures.length > 0 ? (
                            topFeatures
                                .filter(f => f.id !== 'admin')
                                .slice(0, 10)
                                .map((feature, index) => (
                                    <div key={feature.id} className="flex items-center justify-between group/item">
                                        <div className="flex items-center gap-4">
                                            <span className={`w-6 text-[12px] font-black ${index < 3 ? 'text-amber-500' : 'text-slate-300'}`}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-bold text-foreground group-hover/item:translate-x-1 transition-transform">
                                                    {feature.label}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{feature.id.startsWith('prod_') ? 'Product' : 'Feature'} ID: {feature.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[13px] font-black text-foreground">
                                                {feature.usageCount.toLocaleString()}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Clicks</span>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <div className="py-10 text-center text-slate-400 font-bold italic opacity-50">
                                Đang thu thập dữ liệu thông minh...
                            </div>
                        )}
                    </div>
                </div>

                {/* Grand Counter Card */}
                <div className="flex flex-col gap-8 h-full">
                    <div className="flex-1 glass-panel p-8 md:p-10 rounded-[48px] flex flex-col justify-center items-center text-center relative overflow-hidden group">
                        {/* Dramatic Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent opacity-30"></div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 blur-[80px] rounded-full"></div>

                        <div className="inline-flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-2xl mb-8 ring-1 ring-blue-500/20 backdrop-blur-md">
                            <Star size={14} className="text-blue-500 fill-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest text-shadow-glow">Community Milestone</span>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <div className="flex items-baseline gap-1">
                                <CountUp end={totalUsersCount} duration={3} className="text-6xl md:text-8xl font-black text-foreground tracking-tighter drop-shadow-2xl" />
                                <span className="text-2xl font-black text-blue-500">+</span>
                            </div>
                            <h4 className="text-[14px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">Tổng số thành viên Alpha</h4>
                        </div>

                        <div className="flex items-center gap-3 py-3 px-6 rounded-2xl bg-black/5 backdrop-blur-md ring-1 ring-black/5 group-hover:scale-105 transition-transform duration-500">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                            <span className="text-[12px] font-black text-foreground tracking-tight uppercase">Verified Alpha Network</span>
                        </div>
                    </div>

                    {/* Milestone Progress Card */}
                    <div className="glass-panel p-8 md:p-10 rounded-[48px] relative overflow-hidden group">
                        <div className="flex justify-between items-end mb-6">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap size={14} className="text-amber-500 fill-amber-500" />
                                    <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest">Ecosystem Pulse</span>
                                </div>
                                <h4 className="text-[20px] font-black text-foreground tracking-tight">Active Interactions</h4>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] font-black text-slate-400 uppercase">Real-time Pulse</span>
                                <div className="text-[24px] font-black text-foreground leading-none mt-1">
                                    <CountUp end={totalPulseCount} duration={2} />
                                </div>
                            </div>
                        </div>

                        {/* Premium Progress Bar */}
                        <div className="w-full h-4 bg-slate-100 rounded-full p-1 relative overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-shimmer" style={{ width: `${Math.min((totalUsersCount / 1000) * 100, 100)}%` }}></div>
                            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-r from-transparent to-white/20 -skew-x-12 translate-x-full animate-shimmer-fast"></div>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target: 1,000 Members</span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Scale: Phase 01</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Simple CountUp effect component */
function CountUp({ end, duration = 2, className }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return <span className={className}>{count.toLocaleString()}</span>;
}
