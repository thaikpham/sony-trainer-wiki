'use client';
import { useState, useEffect } from 'react';
import { getAllLiveReportsAdmin } from '@/services/db';
import { BarChart3, Clock, Users, ShoppingBag, ExternalLink, LayoutList, TrendingUp } from 'lucide-react';
import PerformanceChart from './PerformanceChart';
import LiveReportDetailModal from './LiveReportDetailModal';
import ReportComparisonModal from './ReportComparisonModal';

export default function LiveReportsTable() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'
    const [selectedReport, setSelectedReport] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isCompareOpen, setIsCompareOpen] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await getAllLiveReportsAdmin();
                setReports(data);
            } catch (err) {
                console.error("Error fetching all live reports:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-10">
            {/* Header & Toggle */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h3 className="text-[18px] font-black text-foreground">Báo Cáo Hiệu Suất Live</h3>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Dữ liệu từ hệ thống Firestore</p>
                    </div>
                </div>

                <div className="flex items-center gap-1 p-1 bg-[#F5F5F7] dark:bg-white/5 rounded-2xl ring-1 ring-black/5 dark:ring-white/10">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-white dark:bg-white/10 shadow-sm text-teal-600' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        <LayoutList size={16} /> Bảng
                    </button>
                    <button
                        onClick={() => setViewMode('chart')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${viewMode === 'chart' ? 'bg-white dark:bg-white/10 shadow-sm text-teal-600' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        <TrendingUp size={16} /> Biểu Đồ
                    </button>
                    <div className="w-px h-6 bg-black/5 dark:bg-white/10 mx-1" />
                    <div className="px-3 text-[10px] font-black text-teal-600/50 uppercase tracking-widest">
                        {reports.length} Reports
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-background p-5 rounded-[24px] ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Users size={18} />
                        </div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Tổng Lượt Xem</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {reports.reduce((acc, r) => acc + Number(r.views || 0), 0).toLocaleString('vi-VN')}
                    </div>
                </div>
                <div className="bg-background p-5 rounded-[24px] ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <ShoppingBag size={18} />
                        </div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Trung Bình CVR</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {reports.length > 0
                            ? (reports.reduce((acc, r) => acc + Number(r.cvr || 0), 0) / reports.length).toFixed(2)
                            : 0}%
                    </div>
                </div>
                <div className="bg-background p-5 rounded-[24px] ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <BarChart3 size={18} />
                        </div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Tổng Doanh Thu</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-600">
                        {reports.reduce((acc, r) => acc + Number(r.revenue || 0), 0).toLocaleString('vi-VN')}đ
                    </div>
                </div>
                <div className="bg-background p-5 rounded-[24px] ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                            <Clock size={18} />
                        </div>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Tổng Phiên Live</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {reports.length.toLocaleString('vi-VN')}
                    </div>
                </div>
            </div>

            {viewMode === 'table' ? (
                /* Table */
                <div className="bg-background rounded-[32px] ring-1 ring-black/5 dark:ring-white/5 shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[12px]">
                            <thead>
                                <tr className="border-b border-black/5 dark:border-white/5 bg-[#F5F5F7]/30 dark:bg-white/2">
                                    <th className="px-4 py-5 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === reports.length && reports.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedIds(reports.map(r => r.id));
                                                else setSelectedIds([]);
                                            }}
                                            className="w-4 h-4 rounded border-black/10 dark:border-white/10 text-teal-600 focus:ring-teal-500 bg-background transition-all"
                                        />
                                    </th>
                                    <th className="px-4 py-5 font-black uppercase tracking-widest text-[#86868b] text-[10px]">Creator / Topic</th>
                                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[#86868b] text-[10px]">Thời Gian / Platform</th>
                                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[#86868b] text-[10px] text-right">Views / PCU</th>
                                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[#86868b] text-[10px] text-right">Sub/Click</th>
                                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[#86868b] text-[10px] text-right">Orders / CVR</th>
                                    <th className="px-6 py-5 font-black uppercase tracking-widest text-[#86868b] text-[10px] text-right">Revenue / GPM</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5 dark:divide-white/5">
                                {reports.map((report) => (
                                    <tr
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        className={`hover:bg-teal-500/5 transition-colors group cursor-pointer ${selectedIds.includes(report.id) ? 'bg-teal-500/5' : ''}`}
                                    >
                                        <td className="px-4 py-5" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(report.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        if (selectedIds.length >= 4) {
                                                            alert('Tối đa so sánh 4 báo cáo');
                                                            return;
                                                        }
                                                        setSelectedIds([...selectedIds, report.id]);
                                                    } else {
                                                        setSelectedIds(selectedIds.filter(id => id !== report.id));
                                                    }
                                                }}
                                                className="w-4 h-4 rounded border-black/10 dark:border-white/10 text-teal-600 focus:ring-teal-500 bg-background transition-all"
                                            />
                                        </td>
                                        <td className="px-4 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-extrabold text-foreground leading-tight">{report.userName || 'Alpha User'}</span>
                                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1 italic">{report.topic || '(Không có chủ đề)'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${report.platform === 'TikTok' ? 'text-black dark:text-white' :
                                                        report.platform === 'Shopee' ? 'text-orange-600' : 'text-blue-600'
                                                        }`}>{report.platform || (report.platforms && report.platforms[0]?.name) || 'Live'}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                                        {new Date(report.timestamp).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                                <span className="text-[11px] font-black text-slate-400">
                                                    {report.startTime || '??:??'} - {report.endTime || '??:??'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col">
                                                <span className="font-black text-foreground">{Number(report.views || 0).toLocaleString('vi-VN')}</span>
                                                <span className="text-[10px] font-bold text-slate-400">PCU: {Number(report.pcu || 0).toLocaleString('vi-VN')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col">
                                                <span className="font-black text-violet-600">+{Number(report.newFollowers || report.platforms?.reduce((acc, p) => acc + Number(p.followers || 0), 0) || 0).toLocaleString('vi-VN')}</span>
                                                <span className="text-[10px] font-bold text-slate-400">Click: {Number(report.productClicks || 0).toLocaleString('vi-VN')}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col">
                                                <span className="font-black text-emerald-600">{Number(report.orders || 0).toLocaleString('vi-VN')}</span>
                                                <span className="text-[10px] font-bold text-slate-400">CVR: {report.cvr || 0}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col">
                                                <span className="font-black text-amber-600">{Number(report.revenue || 0).toLocaleString('vi-VN')}đ</span>
                                                <span className="text-[10px] font-bold text-slate-400">GPM: {Number(report.gpm || 0).toLocaleString('vi-VN')}đ</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <PerformanceChart data={reports} />
                </div>
            )}

            {/* Detail Modal */}
            {selectedReport && (
                <LiveReportDetailModal
                    report={selectedReport}
                    onClose={() => setSelectedReport(null)}
                />
            )}

            {/* Comparison Modal */}
            {isCompareOpen && (
                <ReportComparisonModal
                    selectedReports={reports.filter(r => selectedIds.includes(r.id))}
                    onClose={() => setIsCompareOpen(false)}
                />
            )}

            {/* Comparison Bar */}
            {selectedIds.length >= 2 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] animate-slide-up">
                    <div className="bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 ring-1 ring-white/10 dark:ring-black/10 backdrop-blur-xl">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">So sánh báo cáo</span>
                            <span className="text-[15px] font-black">{selectedIds.length}/4 đã chọn</span>
                        </div>
                        <div className="h-8 w-px bg-white/10 dark:bg-black/10" />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-4 py-2 text-[12px] font-black uppercase tracking-widest hover:opacity-60 transition-all"
                            >
                                Xóa
                            </button>
                            <button
                                onClick={() => setIsCompareOpen(true)}
                                className="px-6 py-2.5 bg-teal-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-teal-500/20 hover:scale-[1.05] active:scale-95 transition-all"
                            >
                                Bắt đầu so sánh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
