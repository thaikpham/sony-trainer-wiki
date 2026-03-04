import { X, Calendar, Clock, Users, ShoppingBag, BarChart3, TrendingUp, Info, MessageSquare, Monitor, MousePointerClick, Heart, User, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useRef } from 'react';

export default function LiveReportDetailModal({ report, onClose }) {
    const modalRef = useRef(null);

    if (!report) return null;

    const handleExport = async () => {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        const isDark = document.documentElement.classList.contains('dark');

        // Temporarily force light mode for professional export visibility
        if (isDark) document.documentElement.classList.remove('dark');

        // Wait for theme transition to settle before capture
        await new Promise(resolve => setTimeout(resolve, 150));

        try {
            const dataUrl = await toPng(modalElement, {
                backgroundColor: '#ffffff',
                cacheBust: true,
                pixelRatio: 2, // 2x quality for clear text
                filter: (node) => {
                    // Exclude navigation and action buttons from the image
                    return node.tagName !== 'BUTTON' && !node.classList?.contains('z-10');
                },
                style: {
                    borderRadius: '0',
                    margin: '0',
                    padding: '0'
                }
            });

            // Generate Blob for more reliable browser download behavior
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `Live-Report-${report.topic?.replace(/\s+/g, '-') || 'Alpha'}-${new Date().getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (err) {
            console.error('Export failed:', err);
            alert('Có lỗi xảy ra khi xuất ảnh. Vui lòng thử lại.');
        } finally {
            // Restore original theme
            if (isDark) document.documentElement.classList.add('dark');
        }
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US').format(amount || 0) + ' ₫';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/[0.02] dark:bg-white/[0.02] backdrop-blur-[20px] backdrop-saturate-[180%] animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="bg-background w-full max-w-4xl max-h-full rounded-[40px] shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative p-8 sm:p-10 border-b border-black/5 dark:border-white/5 shrink-0">
                    <div className="absolute top-8 right-8 flex items-center gap-2 z-10">
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white font-bold text-[12px] hover:bg-teal-600 transition-all shadow-md active:scale-95"
                        >
                            <Download size={16} /> Xuất ảnh
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full bg-black/5 dark:bg-white/5 text-slate-400 hover:text-foreground transition-all hover:scale-110 active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest rounded-full ring-1 ring-teal-500/20">
                                Chi tiết báo cáo livestream
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                            {report.topic || '(Không có chủ đề)'}
                        </h2>

                        <div className="flex flex-wrap items-center gap-6 mt-2">
                            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500 dark:text-slate-400">
                                <User size={16} className="text-teal-500" />
                                <span>Creator: <span className="text-foreground font-black">{report.userName || 'Alpha User'}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500 dark:text-slate-400">
                                <Calendar size={16} className="text-teal-500" />
                                <span>{formatDate(report.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-500 dark:text-slate-400">
                                <Clock size={16} className="text-teal-500" />
                                <span>{report.startTime || '??:??'} - {report.endTime || '??:??'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-10">
                    <div className="flex flex-col gap-10">

                        {/* Summary Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                icon={<Users size={20} />}
                                label="Tổng Lượt Xem"
                                value={Number(report.views || 0).toLocaleString('vi-VN')}
                                color="blue"
                            />
                            <StatCard
                                icon={<ShoppingBag size={20} />}
                                label="Tổng Đơn Hàng"
                                value={Number(report.orders || 0).toLocaleString('vi-VN')}
                                color="emerald"
                            />
                            <StatCard
                                icon={<BarChart3 size={20} />}
                                label="Tổng Doanh Thu"
                                value={formatCurrency(report.revenue)}
                                color="amber"
                                isCurrency
                            />
                            <StatCard
                                icon={<TrendingUp size={20} />}
                                label="Tỉ lệ CVR"
                                value={`${report.cvr || 0}%`}
                                color="violet"
                            />
                        </div>

                        {/* Additional Metrics Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="flex items-center gap-4 bg-black/5 dark:bg-white/2 p-5 rounded-3xl ring-1 ring-black/5 dark:ring-white/5">
                                <div className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
                                    <Heart size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tổng lượt thích</span>
                                    <span className="text-[16px] font-black text-foreground">{Number(report.likes || 0).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-black/5 dark:bg-white/2 p-5 rounded-3xl ring-1 ring-black/5 dark:ring-white/5">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 shrink-0">
                                    <MousePointerClick size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Click Sản phẩm</span>
                                    <span className="text-[16px] font-black text-foreground">{Number(report.productClicks || 0).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-black/5 dark:bg-white/2 p-5 rounded-3xl ring-1 ring-black/5 dark:ring-white/5">
                                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                                    <TrendingUp size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chỉ số GPM</span>
                                    <span className="text-[16px] font-black text-foreground">{Number(report.gpm || 0).toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>
                        </div>

                        {/* Platforms Breakdown Section */}
                        {report.platforms && report.platforms.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h3 className="text-[14px] font-black text-[#1d1d1f] dark:text-white uppercase tracking-widest flex items-center gap-2">
                                    <Monitor size={18} className="text-teal-500" />
                                    Chi tiết theo nền tảng
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {report.platforms.map((plat, idx) => (
                                        <div key={idx} className="glass-panel p-6 rounded-[32px] ring-1 ring-black/5 dark:ring-white/5 relative overflow-hidden group hover:scale-[1.01] transition-all">
                                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-colors"></div>

                                            <div className="flex items-center justify-between mb-5 relative z-10">
                                                <span className={`px-4 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-widest bg-white dark:bg-white/5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 ${plat.name === 'TikTok' ? 'text-black dark:text-white' :
                                                    plat.name === 'Shopee' ? 'text-orange-600' : 'text-blue-600'
                                                    }`}>
                                                    {plat.name}
                                                </span>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CVR</span>
                                                    <span className="text-[14px] font-black text-emerald-600">{plat.cvr || 0}%</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 relative z-10">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lượt xem</span>
                                                    <span className="text-[15px] font-black text-foreground">{Number(plat.views || 0).toLocaleString('vi-VN')}</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doanh thu</span>
                                                    <span className="text-[15px] font-black text-amber-600">{Number(plat.revenue || 0).toLocaleString('vi-VN')}đ</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kỷ lục xem (PCU)</span>
                                                    <span className="text-[15px] font-black text-foreground">{Number(plat.pcu || 0).toLocaleString('vi-VN')}</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn hàng</span>
                                                    <span className="text-[15px] font-black text-emerald-600">{Number(plat.orders || 0).toLocaleString('vi-VN')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes Section */}
                        {report.note && (
                            <div className="flex flex-col gap-4">
                                <h3 className="text-[14px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare size={18} className="text-teal-500" />
                                    Ghi chú phiên live
                                </h3>
                                <div className="bg-black/5 dark:bg-white/5 p-6 rounded-[32px] text-[14.5px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed italic whitespace-pre-wrap ring-1 ring-black/5 dark:ring-white/5">
                                    {report.note}
                                </div>
                            </div>
                        )}

                        {/* Footer Info */}
                        <div className="mt-4 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                            <div className="flex items-center gap-4">
                                <div className="text-[20px] font-black text-black dark:text-white italic tracking-tighter">SONY</div>
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div>
                                <div className="text-[12px] font-black tracking-[0.3em] uppercase opacity-60">Sony Training Wiki</div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <Info size={14} />
                                ID: {report.id} • Create Date: {new Date(report.timestamp).toLocaleString('vi-VN')}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color, isCurrency = false }) {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10',
        amber: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
        violet: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10',
    };

    return (
        <div className="bg-white dark:bg-[#1d1d1f] p-5 sm:p-6 rounded-[32px] ring-1 ring-black/5 dark:ring-white/5 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className={`w-10 h-10 rounded-2xl ${colorClasses[color]} flex items-center justify-center mb-4 shrink-0`}>
                {icon}
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-2">{label}</span>
            <div className={`text-xl sm:text-2xl font-black truncate ${isCurrency ? 'text-emerald-600' : 'text-foreground'}`} title={value}>
                {value}
            </div>
        </div>
    );
}
