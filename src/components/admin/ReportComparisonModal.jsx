'use client';
import { useState, useMemo } from 'react';
import { X, Bot, TrendingUp, Users, ShoppingBag, BarChart3, AlertCircle } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

export default function ReportComparisonModal({ selectedReports, onClose }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);

    // Prepare Radar Data (Normalized)
    const radarData = useMemo(() => {
        if (!selectedReports || selectedReports.length === 0) return [];

        // Find max values for normalization
        const maxViews = Math.max(...selectedReports.map(r => Number(r.views || 0)), 1);
        const maxRevenue = Math.max(...selectedReports.map(r => Number(r.revenue || 0)), 1);
        const maxOrders = Math.max(...selectedReports.map(r => Number(r.orders || 0)), 1);
        const maxCVR = Math.max(...selectedReports.map(r => Number(r.cvr || 0)), 1);

        const metrics = [
            { subject: 'Lượt xem', key: 'views', max: maxViews },
            { subject: 'Doanh thu', key: 'revenue', max: maxRevenue },
            { subject: 'Đơn hàng', key: 'orders', max: maxOrders },
            { subject: 'Tỉ lệ CVR', key: 'cvr', max: maxCVR }
        ];

        return metrics.map(m => {
            const row = { subject: m.subject };
            selectedReports.forEach((r, idx) => {
                row[`report${idx}`] = (Number(r[m.key] || 0) / m.max) * 100;
            });
            return row;
        });
    }, [selectedReports]);

    const handleAIAnalyze = async () => {
        setIsAnalyzing(true);
        // Simulate AI Analysis logic
        await new Promise(r => setTimeout(r, 2000));

        const insights = [
            "Phiên live của " + selectedReports[0].userName + " có hiệu suất chuyển đổi (CVR) cao nhất vượt trội.",
            "Lượng traffic của " + (selectedReports[1]?.userName || 'phiên khác') + " ổn định nhưng cần cải thiện tỷ lệ click sản phẩm.",
            "Khung giờ vàng được xác định là 19:00 - 21:00 cho doanh thu tốt nhất."
        ];

        setAiAnalysis(insights);
        setIsAnalyzing(false);
    };

    if (!selectedReports || selectedReports.length === 0) return null;

    const COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#3b82f6'];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/[0.02] backdrop-blur-[20px] backdrop-saturate-[180%] animate-in fade-in duration-200">
            <div className="bg-background w-full max-w-6xl max-h-full rounded-[40px] shadow-2xl overflow-hidden ring-1 ring-black/5 flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-8 border-b border-black/5 flex items-center justify-between shrink-0">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-teal-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                Comparison Analysis
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-foreground">So Sánh {selectedReports.length} Báo Cáo Live</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-black/5 text-slate-400 hover:text-foreground transition-all hover:scale-110 active:scale-95"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* Visualization */}
                        <div className="flex flex-col gap-6">
                            <div className="glass-panel p-8 rounded-[40px] aspect-square lg:aspect-auto lg:h-[400px]">
                                <h3 className="text-[14px] font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-teal-500" />
                                    Biểu đồ tương quan (Normalized %)
                                </h3>
                                <div className="w-full h-full min-h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                            <PolarGrid stroke="#88888822" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#888' }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            {selectedReports.map((r, idx) => (
                                                <Radar
                                                    key={idx}
                                                    name={r.userName || `Report ${idx + 1}`}
                                                    dataKey={`report${idx}`}
                                                    stroke={COLORS[idx]}
                                                    fill={COLORS[idx]}
                                                    fillOpacity={0.4}
                                                />
                                            ))}
                                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', paddingTop: '20px' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* AI Consultant */}
                            <div className="bg-teal-500/5 ring-1 ring-teal-500/20 p-8 rounded-[40px] flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white">
                                            <Bot size={22} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-black text-teal-600 uppercase tracking-widest">AI Consultant</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Sony Alpha Analytics</span>
                                        </div>
                                    </div>
                                    {!aiAnalysis && (
                                        <button
                                            onClick={handleAIAnalyze}
                                            disabled={isAnalyzing}
                                            className="px-6 py-2 bg-teal-500 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-lg disabled:opacity-50"
                                        >
                                            {isAnalyzing ? 'Đang phân tích...' : 'Phân tích ngay'}
                                        </button>
                                    )}
                                </div>

                                {aiAnalysis ? (
                                    <div className="flex flex-col gap-3 mt-2 animate-fade-in">
                                        {aiAnalysis.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 text-[13.5px] font-medium text-foreground/80 leading-relaxed italic">
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                                                <p>{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[13px] text-slate-400 font-medium italic">
                                        Nhấn &quot;Phân tích ngay&quot; để AI đưa ra nhận định về các phiên live này.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Metric Table */}
                        <div className="flex flex-col gap-4 overflow-hidden">
                            <h3 className="text-[14px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                <BarChart3 size={18} className="text-teal-500" />
                                Chỉ số chi tiết
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-[11px]">
                                    <thead>
                                        <tr className="border-b border-black/5">
                                            <th className="py-4 font-black uppercase tracking-widest text-slate-400">Metric</th>
                                            {selectedReports.map((r, idx) => (
                                                <th key={idx} className="py-4 px-3 font-black uppercase tracking-widest text-foreground truncate max-w-[100px]" style={{ color: COLORS[idx] }}>
                                                    {r.userName || 'User'}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5">
                                        <CompareRow label="Lượt xem" icon={<Users size={12} />} values={selectedReports.map(r => Number(r.views || 0).toLocaleString())} />
                                        <CompareRow label="Đơn hàng" icon={<ShoppingBag size={12} />} values={selectedReports.map(r => Number(r.orders || 0).toLocaleString())} />
                                        <CompareRow label="Doanh thu" icon={<TrendingUp size={12} />} values={selectedReports.map(r => Number(r.revenue || 0).toLocaleString() + 'đ')} />
                                        <CompareRow label="Tỉ lệ CVR" icon={<TrendingUp size={12} />} values={selectedReports.map(r => (r.cvr || 0) + '%')} />
                                        <CompareRow label="Clicks" icon={<TrendingUp size={12} />} values={selectedReports.map(r => Number(r.productClicks || 0).toLocaleString())} />
                                        <CompareRow label="GPM" icon={<TrendingUp size={12} />} values={selectedReports.map(r => Number(r.gpm || 0).toLocaleString() + 'đ')} />
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-auto pt-6 opacity-30 flex items-center gap-4">
                                <span className="text-[18px] font-black italic italic tracking-tighter">SONY</span>
                                <div className="w-1 h-1 rounded-full bg-teal-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sony Training Wiki</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CompareRow({ label, icon, values }) {
    return (
        <tr className="group hover:bg-black/5 transition-colors">
            <td className="py-4 flex items-center gap-2 font-black text-slate-500 uppercase tracking-widest">
                <span className="opacity-0 group-hover:opacity-100 text-teal-500 transition-opacity">{icon}</span>
                {label}
            </td>
            {values.map((v, idx) => (
                <td key={idx} className="py-4 px-3 font-black text-foreground">
                    {v}
                </td>
            ))}
        </tr>
    );
}
