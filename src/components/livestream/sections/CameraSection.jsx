'use client';

import React, { useState } from 'react';
import { BookOpen, Camera, PowerOff, Link as LinkIcon, Monitor, Settings, Star, CheckCircle2, ChevronLeft, ChevronRight, Cpu, Film, Zap } from 'lucide-react';
import Link from 'next/link';
import { useLiveStream } from '../LiveStreamContext';
import { updateLiveStreamConfig } from '@/lib/supabaseClient';

export default function CameraSection() {
    const { 
        isEmployee, 
        liveConfig, 
        setLiveConfig
    } = useLiveStream();

    const [isEditingPP, setIsEditingPP] = useState(false);
    const [tempPPText, setTempPPText] = useState(liveConfig.pictureProfile);

    const handleSavePP = async () => {
        try {
            await updateLiveStreamConfig({ pictureProfile: tempPPText });
            setLiveConfig(prev => ({ ...prev, pictureProfile: tempPPText }));
            setIsEditingPP(false);
        } catch (err) {
            alert('Lỗi cập nhật: ' + err.message);
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-fade-in">
            <div className="glass-panel p-6 sm:p-10 rounded-[40px] bg-white">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                    <h4 className="text-[20px] font-black text-[#1d1d1f] flex items-center gap-2">
                        <BookOpen size={24} className="text-teal-600" />
                        Cẩm nang cài đặt Máy ảnh & Luồng phát
                    </h4>
                    <span className="text-[11px] font-bold bg-[#F5F5F7] text-[#86868b] px-3 py-1.5 rounded-lg uppercase tracking-wider ring-1 ring-black/5 shadow-sm">
                        Step 3
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-8">
                        {/* 1. Định dạng điểm ảnh - Capture Card */}
                        <div>
                            <h5 className="text-[14.5px] font-bold text-[#1d1d1f] mb-3 flex items-center gap-2">
                                <Cpu size={18} className="text-teal-600" /> 1. Định dạng điểm ảnh (Capture Card)
                            </h5>
                            <p className="text-[13px] text-[#86868b] font-medium mb-3 leading-relaxed">Chọn đúng Video format trên thiết bị bắt hình (Cam Link Pro, v.v.) để cân bằng chất lượng và hiệu năng.</p>
                            <div className="space-y-2 text-[13px]">
                                <div className="bg-[#F5F5F7] p-3 rounded-xl ring-1 ring-black/5">
                                    <strong className="text-[#1d1d1f]">NV12</strong> (4:2:0) — Rất nhẹ nhưng màu và viền chi tiết không tối đa.
                                </div>
                                <div className="bg-[#F5F5F7] p-3 rounded-xl ring-1 ring-black/5">
                                    <strong className="text-[#1d1d1f]">RGB24 / RGBA</strong> — Chất lượng tuyệt đối nhưng rất nặng; chỉ nên dùng đồ họa/hậu kỳ.
                                </div>
                                <div className="bg-teal-50 p-3 rounded-xl ring-2 ring-teal-500/30 border-l-4 border-l-teal-500">
                                    <strong className="text-teal-800">YUY2 (Khuyên dùng)</strong> — 4:2:2. Cân bằng tối ưu: màu và nét biên tốt, nhẹ hơn RGB, phù hợp livestream.
                                </div>
                            </div>
                        </div>

                        {/* 2. FPS cho nền tảng di động */}
                        <div>
                            <h5 className="text-[14.5px] font-bold text-[#1d1d1f] mb-3 flex items-center gap-2">
                                <Film size={18} className="text-teal-600" /> 2. Tối ưu FPS cho TikTok / OBS
                            </h5>
                            <p className="text-[13px] text-[#86868b] font-medium mb-3 leading-relaxed">Màn hình điện thoại thường 60Hz/120Hz. Live <strong className="text-[#1d1d1f]">50fps</strong> dễ gây giật (frame judder) vì không chia đều. Nếu phần mềm bị kẹt 50fps, máy ảnh đang ở <strong className="text-[#1d1d1f]">PAL</strong> — cần chuyển sang <strong className="text-[#1d1d1f]">NTSC</strong>.</p>
                            <ul className="space-y-2 text-[13px] text-[#86868b] font-medium list-disc pl-5">
                                <li><strong className="text-[#1d1d1f]">30fps</strong> — An toàn, đồng bộ 60Hz, tiết kiệm CPU/băng thông. Phù hợp livestream bán hàng, trò chuyện.</li>
                                <li><strong className="text-[#1d1d1f]">60fps</strong> — Mượt tối đa; cần máy và mạng đủ mạnh.</li>
                            </ul>
                        </div>

                        {/* 3. Cài đặt máy Sony (FX3 & dòng tương tự) */}
                        <div>
                            <h5 className="text-[14.5px] font-bold text-[#1d1d1f] mb-3 flex items-center gap-2">
                                <Camera size={18} className="text-teal-600" /> 3. Cài đặt máy ảnh (Sony FX3 / ZV-E10 / A6700...)
                            </h5>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[13px] font-bold text-[#1d1d1f] block mb-1">Hệ thống & HDMI</span>
                                    <ul className="text-[13px] text-[#86868b] font-medium space-y-1 list-disc pl-5">
                                        <li><strong className="text-[#1d1d1f]">NTSC:</strong> Menu → Setup → Area/Date → NTSC/PAL Selector → NTSC (máy khởi động lại).</li>
                                        <li><strong className="text-[#1d1d1f]">Clean HDMI:</strong> Setup → External Output → HDMI Info. Display → Off (ẩn OSD trên luồng).</li>
                                        <li><strong className="text-[#1d1d1f]">Độ phân giải:</strong> HDMI Resolution → 1080p (giảm tải capture card).</li>
                                        <li><strong className="text-[#1d1d1f]">Frame rate:</strong> 60p hoặc 30p.</li>
                                    </ul>
                                </div>
                                <div>
                                    <span className="text-[13px] font-bold text-[#1d1d1f] block mb-1">Lấy nét (AF)</span>
                                    <ul className="text-[13px] text-[#86868b] font-medium space-y-1 list-disc pl-5">
                                        <li>Focus Mode: <strong className="text-[#1d1d1f]">Continuous AF (AF-C)</strong>.</li>
                                        <li>Focus Area: <strong className="text-[#1d1d1f]">Wide</strong> hoặc <strong className="text-[#1d1d1f]">Zone</strong>.</li>
                                        <li>Menu → Focus → Face/Eye AF: bật <strong className="text-[#1d1d1f]">Face/Eye Priority</strong>, Subject Recognition = <strong className="text-[#1d1d1f]">Human</strong>.</li>
                                    </ul>
                                </div>
                                <div>
                                    <span className="text-[13px] font-bold text-[#1d1d1f] block mb-1">Nguồn & tản nhiệt</span>
                                    <ul className="text-[13px] text-[#86868b] font-medium space-y-1 list-disc pl-5">
                                        <li>Menu → Setup → Power Setting Option → Auto Power OFF Temp. → <strong className="text-[#1d1d1f]">High</strong>.</li>
                                        <li>Sạc PD (USB-C) hoặc <strong className="text-[#1d1d1f]">pin giả (Dummy Battery)</strong> để live nhiều giờ.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Phương pháp trích xuất - giữ ngắn */}
                        <div>
                            <h5 className="text-[14.5px] font-bold text-[#1d1d1f] mb-3">4. Phương pháp trích xuất hình</h5>
                            <div className="flex flex-col gap-2">
                                <div className="bg-[#F5F5F7] p-4 rounded-2xl ring-1 ring-black/5 border-l-4 border-l-teal-500">
                                    <strong className="text-[13px] text-[#1d1d1f]">USB-C trực tiếp</strong> — Đơn giản (ZV-E10, A7C II...). Cáp USB-C xịn, PC nhận webcam.
                                </div>
                                <div className="bg-[#F5F5F7] p-4 rounded-2xl ring-1 ring-black/5 border-l-4 border-l-indigo-500">
                                    <strong className="text-[13px] text-[#1d1d1f]">Capture Card</strong> — Micro-HDMI → Capture Card → PC. Sắc nét, có thể giữ 10-bit.
                                </div>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div>
                            <h5 className="text-[14.5px] font-bold text-[#1d1d1f] mb-4 bg-amber-50 text-amber-800 px-4 py-2.5 rounded-xl inline-flex items-center gap-2 ring-1 ring-amber-500/20 shadow-sm">
                                <CheckCircle2 size={18} className="text-amber-600" />
                                Kiểm tra trước khi Lên Sóng
                            </h5>
                            <ul className="space-y-3.5 text-[14px] text-[#86868b] font-medium list-none">
                                <li className="flex gap-4 p-1">
                                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 size={12} /></div>
                                    <span className="leading-relaxed"><strong className="text-[#1d1d1f]">Ánh sáng:</strong> Không backlit quá mạnh. Tắt Auto ISO, cố định thông số để tránh Flicker.</span>
                                </li>
                                <li className="flex gap-4 p-1">
                                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 size={12} /></div>
                                    <span className="leading-relaxed"><strong className="text-[#1d1d1f]">Âm thanh:</strong> Đếm &quot;1..2..3..Alo&quot;, kiểm tra sóng âm trên OBS/TikTok.</span>
                                </li>
                                <li className="flex gap-4 p-1">
                                    <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><CheckCircle2 size={12} /></div>
                                    <span className="leading-relaxed"><strong className="text-[#1d1d1f]">Thu âm:</strong> Chế độ quay phim → tab đỏ (shooting) → Audio Recording ON.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Thông số phơi sáng đồng bộ đèn */}
                        <div className="bg-[#F5F5F7] p-6 sm:p-8 rounded-3xl ring-1 ring-black/5 shadow-sm">
                            <h5 className="text-[16px] font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                                <Zap size={20} className="text-teal-600" />
                                Thông số phơi sáng (Manual M) — Đồng bộ đèn
                            </h5>
                            <p className="text-[13px] text-[#86868b] font-medium mb-4 leading-relaxed">Cố định thông số máy trước; nếu thiếu/dư sáng thì tăng/giảm công suất đèn (đặc biệt Key Light), hạn chế chỉnh lại máy.</p>
                            <ul className="space-y-3 text-[14px] text-[#86868b] font-medium list-disc pl-5">
                                <li><strong className="text-[#1d1d1f]">Picture Profile:</strong> PP11 (S-Cinetone) — tông da đẹp, điện ảnh, không cần hậu kỳ.</li>
                                <li><strong className="text-[#1d1d1f]">White Balance:</strong> Khóa <strong className="text-[#1d1d1f]">5600K</strong> (khớp đèn). Không dùng Auto WB.</li>
                                <li><strong className="text-[#1d1d1f]">Shutter:</strong> 30fps → <strong className="text-[#1d1d1f]">1/60s</strong>; 60fps → <strong className="text-[#1d1d1f]">1/125s</strong>.</li>
                                <li><strong className="text-[#1d1d1f]">Khẩu độ:</strong> <strong className="text-[#1d1d1f]">f/2.8 – f/4</strong> — xóa phông vừa, vùng nét đủ sâu.</li>
                                <li><strong className="text-[#1d1d1f]">ISO:</strong> Base <strong className="text-[#1d1d1f]">320</strong> (S-Cinetone) hoặc <strong className="text-[#1d1d1f]">400–800</strong> — hình trong trẻo, ít noise.</li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
                                <Star size={140} />
                            </div>
                            <h5 className="text-[18px] font-bold mb-3 relative z-10 flex items-center gap-2">
                                <Star size={24} className="text-yellow-300 fill-yellow-300" />
                                Picture Profile Khuyên Dùng
                            </h5>
                            <p className="text-[15px] text-teal-50 font-medium mb-5 relative z-10 leading-relaxed">
                                Để da người sáng đẹp, tương phản vùng tối sáng tốt mà không cần hậu kỳ màu phức tạp, vui lòng sang tab ColorLab và thiết lập công thức sau:
                            </p>
                            {isEditingPP ? (
                                <div className="relative z-10 font-mono flex flex-col gap-2">
                                    <textarea
                                        value={tempPPText}
                                        onChange={(e) => setTempPPText(e.target.value)}
                                        className="w-full bg-black/20 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-[14px] font-bold tracking-wide text-white outline-none resize-none min-h-[80px]"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => setIsEditingPP(false)} className="px-4 py-2 rounded-lg bg-white/10 text-white text-[12px] font-bold hover:bg-white/20 transition-colors">Hủy</button>
                                        <button onClick={handleSavePP} className="px-4 py-2 rounded-lg bg-white text-teal-700 text-[12px] font-bold hover:bg-white/90 transition-colors">Lưu</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-black/20 backdrop-blur-md px-5 py-4 rounded-xl border border-white/20 relative z-10 font-mono text-[14px] font-bold tracking-wide group flex flex-col gap-2">
                                    {(liveConfig.pictureProfile || "").split('\n').map((line, idx) => {
                                        const trimmed = line.trim();
                                        if (!trimmed) return null;
                                        
                                        if (trimmed.startsWith('-')) {
                                            const parts = trimmed.split(':');
                                            const label = parts[0].replace(/^- /, '');
                                            const value = parts.length > 1 ? parts.slice(1).join(':').trim() : '';
                                            return (
                                                <div key={idx} className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-2 border border-white/10 hover:bg-white/10 transition-colors">
                                                    <span className="text-white/70 font-medium">{label}</span>
                                                    <span className="text-white text-right font-black">{value}</span>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={idx} className="text-center text-yellow-300 font-black text-[15px] mb-2 uppercase tracking-widest">{trimmed}</div>
                                            );
                                        }
                                    })}
                                    {isEmployee && (
                                        <button onClick={() => { setTempPPText(liveConfig.pictureProfile); setIsEditingPP(true); }} className="absolute top-3 right-3 p-2 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md hover:bg-white/20">
                                            <Settings size={16} className="text-white" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between mt-8">
                <Link
                    href="/livestream/connection"
                    className="px-6 py-3 rounded-xl bg-slate-100 text-[#1d1d1f] font-bold text-[14px] flex items-center gap-2 hover:bg-slate-200 transition-colors"
                >
                    <ChevronLeft size={16} /> Quay lại
                </Link>
                <Link
                    href="/livestream/software"
                    className="px-6 py-3 rounded-xl bg-[#1d1d1f] text-white font-bold text-[14px] flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    Tiếp tục <ChevronRight size={16} />
                </Link>
            </div>
        </div>
    );
}
