'use client';

import React from 'react';
import { Lightbulb, Sun, Moon, Sparkles, Layout, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LightingSection() {
    return (
        <div className="flex flex-col w-full animate-fade-in gap-6 pb-8">
            <div className="glass-panel p-6 sm:p-10 rounded-[40px] bg-white">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                    <h4 className="text-[20px] font-black text-[#1d1d1f] flex items-center gap-2">
                        <Lightbulb size={24} className="text-teal-600" />
                        Hướng dẫn Ánh sáng Studio — Setup 4 điểm
                    </h4>
                    <span className="text-[11px] font-bold bg-[#F5F5F7] text-[#86868b] px-3 py-1.5 rounded-lg uppercase tracking-wider ring-1 ring-black/5 shadow-sm">
                        Step 4
                    </span>
                </div>

                {/* Nguyên tắc quan trọng */}
                <div className="w-full max-w-4xl mx-auto mb-8 p-4 rounded-2xl bg-amber-50 ring-2 ring-amber-500/20 flex gap-3">
                    <AlertCircle size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[14px] text-amber-900 font-medium leading-relaxed">
                        <strong>Tắt hoàn toàn đèn phòng</strong> khi quay — tránh sai lệch màu và hiện tượng chớp nháy (flicker). Chỉ dùng hệ đèn studio dưới đây.
                    </p>
                </div>

                {/* Youtube Embedded Video */}
                <div className="w-full max-w-4xl mx-auto mb-8 rounded-3xl overflow-hidden ring-1 ring-black/5 shadow-lg aspect-video isolate bg-black">
                    <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/6p13FqFdgDc"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>

                {/* Setup 4 điểm - Cấu hình tham khảo Nanlite + Elgato */}
                <div className="w-full max-w-4xl mx-auto mb-6">
                    <h5 className="text-[16px] font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                        <Layout size={20} className="text-teal-600" />
                        Cấu hình ánh sáng 4 điểm (4-Point Lighting)
                    </h5>
                </div>
                <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key Light */}
                    <div className="bg-[#F5F5F7] p-6 rounded-3xl ring-1 ring-black/5">
                        <h5 className="text-[16px] font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center"><Sun size={16} /></div>
                            Key Light (Đèn chính) — Nanlite FS-300
                        </h5>
                        <ul className="space-y-3 text-[14px] text-[#86868b] font-medium">
                            <li><strong className="text-[#1d1d1f]">Vị trí:</strong> Góc 45° phía trước mặt, cao hơn đỉnh đầu, chúi lồng tản sáng xuống 45°.</li>
                            <li><strong className="text-[#1d1d1f]">Nhiệt độ màu:</strong> 5600K.</li>
                            <li><strong className="text-[#1d1d1f]">Công suất:</strong> 20% – 30% (chỉ cần mở nhẹ).</li>
                        </ul>
                    </div>
                    {/* Fill Light */}
                    <div className="bg-[#F5F5F7] p-6 rounded-3xl ring-1 ring-black/5">
                        <h5 className="text-[16px] font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><Lightbulb size={16} /></div>
                            Fill Light (Bù sáng) — Elgato Key Light
                        </h5>
                        <ul className="space-y-3 text-[14px] text-[#86868b] font-medium">
                            <li><strong className="text-[#1d1d1f]">Vị trí:</strong> Góc 45° đối diện Key Light để xóa vùng bóng râm trên mặt.</li>
                            <li><strong className="text-[#1d1d1f]">Nhiệt độ màu:</strong> 5600K.</li>
                            <li><strong className="text-[#1d1d1f]">Công suất:</strong> 10% – 15% (luôn yếu hơn phân nửa Key để giữ khối lập thể tự nhiên).</li>
                        </ul>
                    </div>
                    {/* Rim / Hair Light */}
                    <div className="bg-[#F5F5F7] p-6 rounded-3xl ring-1 ring-black/5">
                        <h5 className="text-[16px] font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><Sparkles size={16} /></div>
                            Rim / Hair Light (Đèn ven) — Nanlite Forza 60B
                        </h5>
                        <ul className="space-y-3 text-[14px] text-[#86868b] font-medium">
                            <li><strong className="text-[#1d1d1f]">Vị trí:</strong> Phía sau lưng, ngoài khung hình, chiếu xéo xuống tóc và vai — tạo viền sáng tách chủ thể khỏi nền.</li>
                            <li><strong className="text-[#1d1d1f]">Nhiệt độ màu:</strong> 4500K – 5000K (hiệu ứng tia nắng ấm).</li>
                            <li><strong className="text-[#1d1d1f]">Công suất:</strong> 30% – 40%.</li>
                        </ul>
                    </div>
                    {/* Background Light */}
                    <div className="bg-[#F5F5F7] p-6 rounded-3xl ring-1 ring-black/5">
                        <h5 className="text-[16px] font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center"><Moon size={16} /></div>
                            Background Light (Đèn nền) — Nanlite PavoPanel 120
                        </h5>
                        <ul className="space-y-3 text-[14px] text-[#86868b] font-medium">
                            <li><strong className="text-[#1d1d1f]">Vị trí:</strong> Đặt thấp phía sau, đánh hắt lên tường/kệ tủ tạo chiều sâu.</li>
                            <li><strong className="text-[#1d1d1f]">Nhiệt độ màu:</strong> 5600K (hoặc màu tùy concept).</li>
                            <li><strong className="text-[#1d1d1f]">Công suất:</strong> 20% – 40%.</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between mt-8">
                <Link
                    href="/livestream/software"
                    className="px-6 py-3 rounded-xl bg-slate-100 text-[#1d1d1f] font-bold text-[14px] flex items-center gap-2 hover:bg-slate-200 transition-colors"
                >
                    <ChevronLeft size={16} /> Quay lại
                </Link>
                <Link
                    href="/livestream/content"
                    className="px-6 py-3 rounded-xl bg-[#1d1d1f] text-white font-bold text-[14px] flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    Tiếp tục <ChevronRight size={16} />
                </Link>
            </div>
        </div>
    );
}
