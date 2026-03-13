'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ClipboardList, Cable, Camera, Laptop, Lightbulb, Wand2, CheckCircle2, ChevronLeft, Target, Zap } from 'lucide-react';

const STEPS = [
    { id: 1, title: 'Chuẩn bị Thiết bị', path: '/livestream/equipment', icon: ClipboardList, purpose: 'Kiểm soát tài sản, chống trộm cắp, trách nhiệm hư hỏng. In 2 bản (trước + sau live), ký.' },
    { id: 2, title: 'Kết nối', path: '/livestream/connection', icon: Cable, purpose: 'Đấu nối phần cứng: máy ảnh → capture card → PC, mic, nguồn, LAN.' },
    { id: 3, title: 'Máy ảnh', path: '/livestream/camera', icon: Camera, purpose: 'Cài Sony (NTSC, HDMI, AF, PP11, WB 5600K, shutter/khẩu/ISO). YUY2 trên capture card.' },
    { id: 4, title: 'Phần mềm', path: '/livestream/software', icon: Laptop, purpose: 'OBS / TikTok Live Studio: nguồn video, âm thanh, output 1080p 30/60fps.' },
    { id: 5, title: 'Ánh sáng', path: '/livestream/lighting', icon: Lightbulb, purpose: 'Setup 4 điểm (Key, Fill, Rim, Background), tắt đèn phòng, đồng bộ 5600K.' },
    { id: 6, title: 'Kịch bản', path: '/livestream/content', icon: Wand2, purpose: 'Timeline / script, AI Studio Bot hỗ trợ. Sẵn sàng nội dung trước khi lên sóng.' },
    { id: 7, title: 'Báo cáo', path: '/livestream/report', icon: CheckCircle2, purpose: 'Báo cáo hiệu suất (KPIs) & quản lý thiết bị. Đối chiếu thiết bị sau live, ký lưu trữ.' },
];

export default function LiveStreamSopPage() {
    return (
        <div className="flex flex-col w-full animate-fade-in gap-6 pb-10">
            <div className="glass-panel p-6 sm:p-10 rounded-[40px] bg-white">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                    <div className="w-12 h-12 rounded-[18px] bg-teal-50 flex items-center justify-center ring-1 ring-teal-500/10">
                        <FileText size={24} className="text-teal-600" />
                    </div>
                    <div>
                        <h4 className="text-[22px] font-black text-[#1d1d1f]">Quy trình vận hành chuẩn (SOP) Livestream</h4>
                        <p className="text-[13px] text-[#86868b] font-medium mt-0.5">Training & vận hành phòng live Sony — theo thứ tự logic, khoa học.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-5 rounded-2xl bg-slate-50 ring-1 ring-black/5">
                        <h5 className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Target size={14} /> Mục đích
                        </h5>
                        <ul className="text-[13px] text-slate-700 font-medium space-y-1.5">
                            <li>· Chất lượng: hình ảnh, âm thanh đạt chuẩn (1080p, ánh sáng 4 điểm).</li>
                            <li>· Tài sản: kiểm soát thiết bị, chống trộm, trách nhiệm hư hỏng.</li>
                            <li>· Lặp lại được: cùng quy trình cho mọi kỹ thuật viên.</li>
                        </ul>
                    </div>
                    <div className="p-5 rounded-2xl bg-teal-50/50 ring-1 ring-teal-500/10">
                        <h5 className="text-[12px] font-black text-teal-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Zap size={14} /> Ba giai đoạn
                        </h5>
                        <p className="text-[13px] text-teal-800 font-medium">
                            <strong>Pre-live</strong> (Bước 1–6) → <strong>Live</strong> (lên sóng) → <strong>Post-live</strong> (Bước 7 + kiểm kê lại thiết bị, ký).
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <h5 className="text-[14px] font-black text-[#1d1d1f] uppercase tracking-widest">7 bước theo tab Livestream</h5>
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        return (
                            <Link
                                key={step.id}
                                href={step.path}
                                className="flex items-start gap-4 p-4 rounded-2xl bg-[#F5F5F7] ring-1 ring-black/5 hover:ring-teal-500/30 hover:bg-teal-50/30 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-teal-600 ring-1 ring-black/5 group-hover:bg-teal-500 group-hover:text-white shrink-0">
                                    <Icon size={18} />
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Bước {step.id}</span>
                                    <p className="font-bold text-[#1d1d1f] mt-0.5">{step.title}</p>
                                    <p className="text-[13px] text-slate-600 font-medium mt-1">{step.purpose}</p>
                                </div>
                                <ChevronLeft size={18} className="text-slate-300 rotate-180 shrink-0 mt-1 group-hover:text-teal-500" />
                            </Link>
                        );
                    })}
                </div>

                <p className="text-[12px] text-slate-500 font-medium mt-6 pt-4 border-t border-black/5">
                    Tài liệu đầy đủ: <strong>LIVESTREAM-SOP.md</strong> trong repo (checklist chi tiết, ghi chú training, nguyên tắc ra quyết định).
                </p>
            </div>

            <div className="flex justify-between">
                <Link href="/livestream" className="px-6 py-3 rounded-xl bg-slate-100 text-[#1d1d1f] font-bold text-[14px] flex items-center gap-2 hover:bg-slate-200 transition-colors">
                    <ChevronLeft size={16} /> Về Trung tâm Livestream
                </Link>
            </div>
        </div>
    );
}
