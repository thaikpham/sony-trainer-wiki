'use client';

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    ClipboardList,
    FileText,
    Save,
    Package,
    Radio,
    Users,
    ShoppingBag,
    Wrench,
    Building2,
} from 'lucide-react';
import { saveLiveReport } from '@/lib/supabaseClient';

const PLATFORMS = [
    { value: 'TikTok', label: 'TikTok Live' },
    { value: 'Shopee', label: 'Shopee Live' },
    { value: 'Facebook', label: 'Facebook Live' },
    { value: 'YouTube', label: 'YouTube Live' },
    { value: 'Other', label: 'Khác' },
];

export default function ReportSection() {
    const { user } = useUser();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [topic, setTopic] = useState('');
    const [platform, setPlatform] = useState('TikTok');
    const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [userName, setUserName] = useState('');

    const [views, setViews] = useState('');
    const [pcu, setPcu] = useState('');
    const [likes, setLikes] = useState('');
    const [comments, setComments] = useState('');
    const [newFollowers, setNewFollowers] = useState('');
    const [productClicks, setProductClicks] = useState('');
    const [orders, setOrders] = useState('');
    const [revenue, setRevenue] = useState('');
    const [cvr, setCvr] = useState('');
    const [gpm, setGpm] = useState('');

    const [technicalIssues, setTechnicalIssues] = useState('');
    const [equipmentCheckOk, setEquipmentCheckOk] = useState(false);
    const [equipmentNote, setEquipmentNote] = useState('');
    const [note, setNote] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const email = user?.primaryEmailAddress?.emailAddress || '';
        if (!email) {
            setError('Vui lòng đăng nhập để gửi báo cáo.');
            return;
        }
        if (!topic.trim()) {
            setError('Vui lòng nhập chủ đề / tên phiên live.');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                userEmail: email,
                topic: topic.trim(),
                userName: userName.trim() || user?.fullName || user?.firstName || 'Kỹ thuật viên',
                platform,
                timestamp: startTime ? `${reportDate}T${startTime}:00` : reportDate,
                reportDate,
                startTime: startTime || null,
                endTime: endTime || null,
                views: views ? Number(views) : 0,
                pcu: pcu ? Number(pcu) : 0,
                likes: likes ? Number(likes) : 0,
                comments: comments ? Number(comments) : 0,
                newFollowers: newFollowers ? Number(newFollowers) : 0,
                productClicks: productClicks ? Number(productClicks) : 0,
                orders: orders ? Number(orders) : 0,
                revenue: revenue ? Number(revenue.replace(/\D/g, '')) : 0,
                cvr: cvr ? Number(cvr) : 0,
                gpm: gpm ? Number(gpm.replace(/\D/g, '')) : 0,
                technicalIssues: technicalIssues.trim() || null,
                equipmentCheckOk,
                equipmentNote: equipmentNote.trim() || null,
                note: note.trim() || null,
                platforms: [{ name: platform, views: views ? Number(views) : 0, orders: orders ? Number(orders) : 0, revenue: revenue ? Number(revenue.replace(/\D/g, '')) : 0, cvr: cvr ? Number(cvr) : 0, pcu: pcu ? Number(pcu) : 0 }],
            };
            await saveLiveReport(payload);
            setSuccess(true);
        } catch (err) {
            console.error('Save report error:', err);
            setError(err?.message || 'Không thể lưu báo cáo. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col w-full animate-fade-in gap-6 pb-10">
            <div className="glass-panel p-6 sm:p-10 rounded-[40px] bg-white">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[18px] bg-teal-50 flex items-center justify-center ring-1 ring-teal-500/10">
                            <FileText size={24} className="text-teal-600" />
                        </div>
                        <div>
                            <h4 className="text-[22px] font-black text-[#1d1d1f]">Báo Cáo Phiên Livestream</h4>
                            <p className="text-[13px] text-[#86868b] font-medium mt-0.5">
                                Chuẩn benchmark ngành — Hiệu suất phiên live & Quản lý thiết bị · Phù hợp báo cáo Giám đốc Kinh doanh & Marketing
                            </p>
                        </div>
                    </div>
                    <span className="text-[11px] font-bold bg-teal-50 text-teal-600 px-3 py-1.5 rounded-lg uppercase tracking-wider ring-1 ring-teal-500/20 hidden sm:inline-flex">
                        Step 7
                    </span>
                </div>

                {success && (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-50 ring-2 ring-emerald-500/20 flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
                        <div>
                            <p className="font-bold text-emerald-800">Đã lưu báo cáo thành công.</p>
                            <p className="text-[13px] text-emerald-700">Quản trị có thể xem tại Wiki → Báo cáo live.</p>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-50 ring-2 ring-red-500/20 text-red-800 text-[14px] font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    {/* 1. Thông tin phiên */}
                    <section className="flex flex-col gap-4">
                        <h5 className="text-[14px] font-black text-[#1d1d1f] uppercase tracking-widest flex items-center gap-2">
                            <Radio size={18} className="text-teal-600" />
                            Thông tin phiên live
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="sm:col-span-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Chủ đề / Tên phiên *</label>
                                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="VD: Livestream Ra mắt ZV-E10 II" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" required />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Nền tảng</label>
                                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50">
                                    {PLATFORMS.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Ngày phát</label>
                                <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Giờ bắt đầu</label>
                                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Giờ kết thúc</label>
                                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Người dẫn / Kỹ thuật viên</label>
                                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder={user?.fullName || 'Họ tên'} className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                        </div>
                    </section>

                    {/* 2. Hiệu suất (benchmark ngành) */}
                    <section className="flex flex-col gap-4">
                        <h5 className="text-[14px] font-black text-[#1d1d1f] uppercase tracking-widest flex items-center gap-2">
                            <BarChart3 size={18} className="text-teal-600" />
                            Hiệu suất phiên live (Core KPIs)
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tổng lượt xem</label>
                                <input type="number" min="0" value={views} onChange={(e) => setViews(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Số xem đồng thời cao nhất (PCU)</label>
                                <input type="number" min="0" value={pcu} onChange={(e) => setPcu(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Lượt thích</label>
                                <input type="number" min="0" value={likes} onChange={(e) => setLikes(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Bình luận</label>
                                <input type="number" min="0" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tăng follow mới</label>
                                <input type="number" min="0" value={newFollowers} onChange={(e) => setNewFollowers(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Click sản phẩm</label>
                                <input type="number" min="0" value={productClicks} onChange={(e) => setProductClicks(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Đơn hàng</label>
                                <input type="number" min="0" value={orders} onChange={(e) => setOrders(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Doanh thu (đ)</label>
                                <input type="text" value={revenue} onChange={(e) => setRevenue(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">CVR (%)</label>
                                <input type="number" min="0" step="0.01" value={cvr} onChange={(e) => setCvr(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">GPM (đ/1000 view)</label>
                                <input type="text" value={gpm} onChange={(e) => setGpm(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-teal-500/50" />
                            </div>
                        </div>
                    </section>

                    {/* 3. Kỹ thuật & Sự cố */}
                    <section className="flex flex-col gap-4">
                        <h5 className="text-[14px] font-black text-[#1d1d1f] uppercase tracking-widest flex items-center gap-2">
                            <Wrench size={18} className="text-teal-600" />
                            Sự cố kỹ thuật (nếu có)
                        </h5>
                        <textarea value={technicalIssues} onChange={(e) => setTechnicalIssues(e.target.value)} placeholder="VD: Mất hình 2 phút, mic nhiễu..." className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-3 text-[14px] min-h-[80px] resize-y outline-none focus:ring-2 focus:ring-teal-500/50" />
                    </section>

                    {/* 4. Quản lý thiết bị & cơ sở vật chất */}
                    <section className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-50 ring-1 ring-black/5">
                        <h5 className="text-[14px] font-black text-[#1d1d1f] uppercase tracking-widest flex items-center gap-2">
                            <Building2 size={18} className="text-teal-600" />
                            Quản lý thiết bị & cơ sở vật chất phòng live
                        </h5>
                        <p className="text-[13px] text-slate-600 font-medium">
                            Đối chiếu với bản kiểm kê Pre-live (tab Chuẩn bị thiết bị). Xác nhận thiết bị đủ, không mất mát/hư hỏng sau phiên live.
                        </p>
                        <div className="flex flex-col gap-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={equipmentCheckOk} onChange={(e) => setEquipmentCheckOk(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                                <span className="text-[14px] font-bold text-[#1d1d1f]">Đã kiểm kê lại thiết bị sau live — đủ số lượng, không mất/hư (hoặc đã ghi chú bên dưới)</span>
                            </label>
                            <textarea value={equipmentNote} onChange={(e) => setEquipmentNote(e.target.value)} placeholder="Ghi chú thiết bị: thiếu, hư hỏng, bàn giao..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] min-h-[70px] resize-y outline-none focus:ring-2 focus:ring-teal-500/50" />
                            <Link href="/livestream/equipment" className="inline-flex items-center gap-2 text-[13px] font-bold text-teal-600 hover:text-teal-700">
                                <ClipboardList size={16} />
                                Mở tab Chuẩn bị thiết bị để in kiểm kê / đối chiếu
                            </Link>
                        </div>
                    </section>

                    {/* Ghi chú chung */}
                    <section>
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Ghi chú phiên live</label>
                        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Đánh giá, ý kiến, đề xuất..." className="w-full bg-[#F5F5F7] border border-slate-200 rounded-xl px-4 py-3 text-[14px] min-h-[90px] resize-y outline-none focus:ring-2 focus:ring-teal-500/50" />
                    </section>

                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-black/5">
                        <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl bg-[#1d1d1f] text-white font-bold text-[14px] flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md">
                            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                            {saving ? 'Đang lưu...' : 'Lưu báo cáo'}
                        </button>
                        <Link href="/wiki/bao-cao-live" className="text-[13px] font-bold text-teal-600 hover:underline">
                            Xem danh sách báo cáo (Wiki)
                        </Link>
                    </div>
                </form>
            </div>

            <div className="flex justify-between flex-wrap gap-4">
                <Link href="/livestream/content" className="px-6 py-3 rounded-xl bg-slate-100 text-[#1d1d1f] font-bold text-[14px] flex items-center gap-2 hover:bg-slate-200 transition-colors">
                    <ChevronLeft size={16} /> Quay lại Kịch bản
                </Link>
                <Link href="/livestream/equipment" className="px-6 py-3 rounded-xl bg-teal-50 text-teal-700 font-bold text-[14px] flex items-center gap-2 hover:bg-teal-100 transition-colors ring-1 ring-teal-500/20">
                    <ClipboardList size={16} /> Kiểm kê thiết bị
                </Link>
            </div>
        </div>
    );
}
