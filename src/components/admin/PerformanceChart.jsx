'use client';
import { useRef, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import { toPng } from 'html-to-image';
import { Download, ChartBar, ChartLine, ChartArea, Image as ImageIcon, Maximize2, Loader2 } from 'lucide-react';


export default function PerformanceChart({ data }) {
    const chartRef = useRef(null);
    const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'area'
    const [isExporting, setIsExporting] = useState(false);

    // Prepare data for recharts
    const chartData = (data || []).map(report => {
        if (!report) return null;
        let dateLabel = '??/??';
        try {
            if (report.timestamp) {
                dateLabel = new Date(report.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            }
        } catch (e) { console.error("Date error:", e); }

        return {
            name: dateLabel,
            views: Number(report.views || 0),
            revenue: Number(report.revenue || 0),
            orders: Number(report.orders || 0),
            cvr: Number(report.cvr || 0),
            fullName: report.userName || 'Alpha User'
        };
    }).filter(Boolean).reverse();

    const exportToImage = async () => {
        if (!chartRef.current) return;
        setIsExporting(true);
        const isDark = document.documentElement.classList.contains('dark');

        // Force light mode
        if (isDark) document.documentElement.classList.remove('dark');

        // Wait for styles
        await new Promise(resolve => setTimeout(resolve, 150));

        try {
            const dataUrl = await toPng(chartRef.current, {
                cacheBust: true,
                backgroundColor: '#ffffff',
                pixelRatio: 2,
                style: {
                    borderRadius: '0px'
                }
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `Sony-Alpha-Focus-Report-${new Date().getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Có lỗi xảy ra khi xuất biểu đồ.');
        } finally {
            if (isDark) document.documentElement.classList.add('dark');
            setIsExporting(false);
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background p-4 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 border-0">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-black/5 pb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-6 mb-1 last:mb-0">
                            <span className="text-[12px] font-bold text-slate-500">{entry.name}:</span>
                            <span className="text-[13px] font-black" style={{ color: entry.color }}>
                                {entry.name === 'Revenue' ? `${entry.value.toLocaleString()}đ` : entry.value.toLocaleString()}
                                {entry.name === 'CVR' ? '%' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-[24px]">
                <div className="flex items-center gap-2 bg-[#F5F5F7] dark:bg-white/5 p-1 rounded-xl">
                    <button
                        onClick={() => setChartType('bar')}
                        className={`p-2 rounded-lg transition-all ${chartType === 'bar' ? 'bg-white dark:bg-white/10 shadow-sm text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Dạng Cột"
                    >
                        <ChartBar size={18} />
                    </button>
                    <button
                        onClick={() => setChartType('line')}
                        className={`p-2 rounded-lg transition-all ${chartType === 'line' ? 'bg-white dark:bg-white/10 shadow-sm text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Dạng Đường"
                    >
                        <ChartLine size={18} />
                    </button>
                    <button
                        onClick={() => setChartType('area')}
                        className={`p-2 rounded-lg transition-all ${chartType === 'area' ? 'bg-white dark:bg-white/10 shadow-sm text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                        title="Dạng Vùng"
                    >
                        <ChartArea size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg text-[11px] font-black uppercase tracking-wider">
                        <Maximize2 size={12} /> Aspect 16:9
                    </div>
                    <button
                        onClick={exportToImage}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] rounded-xl text-[12px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        Xuất Image (16:9)
                    </button>
                </div>
            </div>

            {/* Chart Container - Forced 16:9 Aspect Ratio */}
            <div
                ref={chartRef}
                className="w-full aspect-video bg-background rounded-[32px] ring-1 ring-black/5 dark:ring-white/5 shadow-2xl overflow-hidden p-10 flex flex-col min-h-[400px]"
            >
                <div className="flex flex-col mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                            <ImageIcon size={18} />
                        </div>
                        <h2 className="text-[20px] font-black text-foreground tracking-tight">Báo Cáo Hiệu Suất Sony Training Wiki</h2>
                    </div>
                    <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest pl-11">Thống kê chiến dịch livestream • {new Date().toLocaleDateString('vi-VN')}</p>
                </div>

                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fontWeight: 900 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fontWeight: 900 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '30px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }} />
                                <Bar dataKey="views" name="Views" fill="#14b8a6" radius={[6, 6, 0, 0]} barSize={24} />
                                <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={24} />
                            </BarChart>
                        ) : chartType === 'line' ? (
                            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '30px', fontSize: '11px', fontWeight: 900 }} />
                                <Line type="monotone" dataKey="views" name="Views" stroke="#14b8a6" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        ) : (
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ paddingTop: '30px', fontSize: '11px', fontWeight: 900 }} />
                                <Area type="monotone" dataKey="views" name="Views" stroke="#14b8a6" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-black/5 pt-6">
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hệ thống</span>
                            <span className="text-[12px] font-black text-foreground uppercase truncate">Sony Training Wiki Admin</span>
                        </div>
                        <div className="flex flex-col border-l border-black/5 pl-6">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian tạo</span>
                            <span className="text-[12px] font-black text-foreground uppercase truncate">{new Date().toLocaleString('vi-VN')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 scale-75 opacity-20 filter grayscale">
                        <div className="text-[20px] font-black text-black dark:text-white italic tracking-tighter">SONY</div>
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                        <div className="text-[12px] font-black tracking-[0.3em] uppercase opacity-60">Sony Training Wiki</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
