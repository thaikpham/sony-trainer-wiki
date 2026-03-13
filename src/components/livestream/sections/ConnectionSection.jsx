'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Cable, ChevronLeft, ChevronRight, Video, Mic, Settings2, Maximize2, Monitor, RefreshCw, Sliders, Power, Sun, Palette, Zap } from 'lucide-react';
import Link from 'next/link';
import { useLiveStream } from '../LiveStreamContext';
import LivePreview from '../LivePreview';

const StudioDiagram = dynamic(() => import('../StudioDiagram'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] flex items-center justify-center bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-teal-600/20 border-t-teal-600 rounded-full animate-spin"></div>
                <p className="text-[13px] text-slate-400 font-medium tracking-tight">Đang tải sơ đồ kết nối...</p>
            </div>
        </div>
    )
});

export default function ConnectionSection() {
    const {
        isStreaming, setIsStreaming,
        selectedDevice, setSelectedDevice,
        selectedAudioDevice, setSelectedAudioDevice,
        brightness, setBrightness,
        saturation, setSaturation,
        isMirror, setIsMirror,
        setVideoStream,
        availableCameras, availableMics,
        isConnecting, setIsConnecting
    } = useLiveStream();

    const toggleStream = async () => {
        if (isStreaming) {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
            setVideoStream(null);
            setIsStreaming(false);
            return;
        }

        setIsConnecting(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: selectedDevice ? { exact: selectedDevice } : undefined },
                audio: { deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined }
            });
            window.localStream = stream;
            setVideoStream(stream);
            setIsStreaming(true);
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Không thể truy cập Camera/Mic: " + err.message);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="flex flex-col w-full animate-fade-in gap-6 pb-12">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Main Diagram Area */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                    <div className="glass-panel p-6 sm:p-10 rounded-[40px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.03]">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-[18px] bg-teal-50 flex items-center justify-center ring-1 ring-teal-500/10 shadow-sm">
                                    <Cable size={24} className="text-teal-600" />
                                </div>
                                <div>
                                    <h4 className="text-[22px] font-black text-[#1d1d1f] tracking-tight">Sơ đồ Kết nối Studio</h4>
                                    <p className="text-[13px] text-[#86868b] font-medium mt-0.5">Mô phỏng hệ thống đấu nối thiết bị tiêu chuẩn Sony.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full ring-1 ring-black/5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[11px] font-black text-[#1d1d1f] uppercase tracking-widest">Interactive</span>
                            </div>
                        </div>
                        
                        <div className="w-full bg-[#f8f9fa] rounded-[32px] p-2 sm:p-4 overflow-hidden min-h-[500px] border border-black/[0.03] shadow-inner relative">
                            <StudioDiagram />
                            
                            {/* Floating Instructions */}
                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                                <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl ring-1 ring-black/5 shadow-lg flex items-center gap-2">
                                    <RefreshCw size={14} className="text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-500">Kéo thả để điều chỉnh góc nhìn</span>
                                </div>
                                <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl ring-1 ring-black/5 shadow-lg flex items-center gap-2">
                                    <Zap size={14} className="text-amber-400" />
                                    <span className="text-[11px] font-bold text-slate-500">Chạm nốt để chỉnh sửa tên</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls & Preview */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                    {/* Live Preview Monitor */}
                    <div className="glass-panel p-6 rounded-[40px] bg-[#1d1d1f] shadow-2xl ring-1 ring-white/10 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Monitor size={18} className="text-white/40" />
                                <span className="text-[12px] font-black text-white/60 uppercase tracking-widest">Master Preview</span>
                            </div>
                            <button className="text-white/40 hover:text-white transition-colors">
                                <Maximize2 size={16} />
                            </button>
                        </div>
                        
                        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 ring-1 ring-white/5 shadow-inner">
                            <LivePreview />
                        </div>

                        <button 
                            onClick={toggleStream}
                            disabled={isConnecting}
                            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[14px] transition-all transform active:scale-[0.98] ${
                                isStreaming 
                                ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/50 hover:bg-red-500/20' 
                                : 'bg-teal-500 text-white shadow-[0_10px_25px_rgba(20,184,166,0.3)] hover:shadow-[0_15px_30px_rgba(20,184,166,0.4)]'
                            }`}
                        >
                            {isConnecting ? (
                                <RefreshCw size={20} className="animate-spin" />
                            ) : isStreaming ? (
                                <Power size={20} />
                            ) : (
                                <Video size={20} />
                            )}
                            {isConnecting ? 'ĐANG KẾT NỐI...' : isStreaming ? 'NGẮT KẾT NỐI' : 'KÍCH HOẠT PREVIEW'}
                        </button>
                    </div>

                    {/* Source & Tuning Controls */}
                    <div className="glass-panel p-8 rounded-[40px] bg-white shadow-[0_15px_40px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.03] flex flex-grow flex-col gap-8">
                        <div>
                            <h5 className="text-[14px] font-black text-[#1d1d1f] mb-5 flex items-center gap-2 uppercase tracking-wider">
                                <Settings2 size={18} className="text-teal-600" />
                                Nguồn Đầu Vào
                            </h5>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Video size={12} /> Camera Input
                                    </label>
                                    <select 
                                        value={selectedDevice}
                                        onChange={(e) => setSelectedDevice(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-bold text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/50 transition-all cursor-pointer appearance-none"
                                    >
                                        {availableCameras.map(cam => (
                                            <option key={cam.deviceId} value={cam.deviceId}>{cam.label || `Camera ${cam.deviceId.slice(0,5)}`}</option>
                                        ))}
                                        {availableCameras.length === 0 && <option value="">Không tìm thấy Camera</option>}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Mic size={12} /> Microphone
                                    </label>
                                    <select 
                                        value={selectedAudioDevice}
                                        onChange={(e) => setSelectedAudioDevice(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[13px] font-bold text-[#1d1d1f] outline-none focus:ring-2 focus:ring-teal-500/50 transition-all cursor-pointer appearance-none"
                                    >
                                        {availableMics.map(mic => (
                                            <option key={mic.deviceId} value={mic.deviceId}>{mic.label || `Microphone ${mic.deviceId.slice(0,5)}`}</option>
                                        ))}
                                        {availableMics.length === 0 && <option value="">Không tìm thấy Mic</option>}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h5 className="text-[14px] font-black text-[#1d1d1f] flex items-center gap-2 uppercase tracking-wider border-t border-black/5 pt-6">
                                <Sliders size={18} className="text-teal-600" />
                                Tinh Chỉnh Hình Ảnh
                            </h5>
                            
                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[12px] font-bold">
                                        <span className="text-slate-500 flex items-center gap-2"><Sun size={14} /> Brightness</span>
                                        <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md ring-1 ring-teal-500/20">{brightness}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="200" value={brightness} 
                                        onChange={(e) => setBrightness(e.target.value)}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[12px] font-bold">
                                        <span className="text-slate-500 flex items-center gap-2"><Palette size={14} /> Saturation</span>
                                        <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md ring-1 ring-teal-500/20">{saturation}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="200" value={saturation} 
                                        onChange={(e) => setSaturation(e.target.value)}
                                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                    />
                                </div>

                                <button 
                                    onClick={() => setIsMirror(!isMirror)}
                                    className={`w-full py-3 rounded-xl flex items-center justify-center gap-3 text-[13px] font-bold transition-all ${
                                        isMirror ? 'bg-[#1d1d1f] text-white' : 'bg-slate-100 text-[#1d1d1f] hover:bg-slate-200'
                                    }`}
                                >
                                    <RefreshCw size={16} className={isMirror ? 'rotate-180' : ''} />
                                    {isMirror ? 'MIRROR MODE: ON' : 'MIRROR MODE: OFF'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Detailed Connection Reference & Technical Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Connection Table */}
                <div className="glass-panel p-8 rounded-[40px] bg-white shadow-sm ring-1 ring-black/[0.03]">
                    <h5 className="text-[16px] font-black text-[#1d1d1f] mb-6 flex items-center gap-2 uppercase tracking-tight">
                        <Monitor size={20} className="text-teal-600" />
                        Sơ đồ kết nối trực quan
                    </h5>
                    <div className="overflow-hidden rounded-2xl border border-black/5">
                        <table className="w-full text-left text-[13px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-black/5">
                                    <th className="px-4 py-3 font-black text-[#86868b] uppercase tracking-wider">Thiết bị</th>
                                    <th className="px-4 py-3 font-black text-[#86868b] uppercase tracking-wider">Cổng kết nối</th>
                                    <th className="px-4 py-3 font-black text-[#86868b] uppercase tracking-wider">Điểm đến</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-[#1d1d1f]">Sony C80</td>
                                    <td className="px-4 py-3 font-medium text-slate-500">XLR Cable</td>
                                    <td className="px-4 py-3 font-bold text-teal-600">Elgato Wave XLR</td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-[#1d1d1f]">Elgato Wave XLR</td>
                                    <td className="px-4 py-3 font-medium text-slate-500">USB Cable</td>
                                    <td className="px-4 py-3 font-bold text-indigo-600">PC (Cổng sau MB)</td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-[#1d1d1f]">4x Sony Cameras</td>
                                    <td className="px-4 py-3 font-medium text-slate-500">Micro HDMI to HDMI</td>
                                    <td className="px-4 py-3 font-bold text-orange-600">Cam Link Pro (PCIe)</td>
                                </tr>
                                <tr className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-[#1d1d1f]">Stream Deck</td>
                                    <td className="px-4 py-3 font-medium text-slate-500">USB Cable</td>
                                    <td className="px-4 py-3 font-bold text-indigo-600">PC Live Stream</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-8 p-6 bg-slate-50 rounded-[32px] border border-black/5">
                        <h6 className="text-[14px] font-black text-[#1d1d1f] mb-3 flex items-center gap-2">
                            <Zap size={16} className="text-amber-500" />
                            Lưu ý vận hành
                        </h6>
                        <ul className="space-y-3">
                            <li className="flex gap-2 text-[13px] text-slate-600 font-medium">
                                <span className="text-teal-600 font-black">•</span>
                                <span><b>Băng thông PCIe:</b> Cắm Card Cam Link Pro vào khe PCIe x4 trở lên để đủ băng thông 4 luồng 4K/1080p.</span>
                            </li>
                            <li className="flex gap-2 text-[13px] text-slate-600 font-medium">
                                <span className="text-teal-600 font-black">•</span>
                                <span><b>Tản nhiệt:</b> Card PCIe sẽ tỏa nhiệt lớn khi chạy cả 4 cam, cần lưu thông khí tốt trong thùng PC.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Hardware Details Sections */}
                <div className="flex flex-col gap-6">
                    {/* Audio System */}
                    <div className="glass-panel p-8 rounded-[40px] bg-white shadow-sm ring-1 ring-black/[0.03]">
                        <h5 className="text-[16px] font-black text-[#1d1d1f] mb-4 flex items-center gap-2 uppercase tracking-tight">
                            <Mic size={20} className="text-teal-600" />
                            Hệ Thống Âm Thanh
                        </h5>
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-4">
                            Đảm bảo giọng nói &quot;trong và sáng&quot; với <b>Sony C80</b> kết nối qua <b>Wave XLR</b>. Sử dụng Wave Link để trộn nhạc và game trước khi đưa vào OBS.
                        </p>
                        <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-2xl border border-teal-100">
                            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0">
                                <Zap size={20} />
                            </div>
                            <span className="text-[12px] font-bold text-teal-700">Mẹo: Cài đặt Wave Link để quản lý đa kênh âm thanh.</span>
                        </div>
                    </div>

                    {/* Video System */}
                    <div className="glass-panel p-8 rounded-[40px] bg-white shadow-sm ring-1 ring-black/[0.03]">
                        <h5 className="text-[16px] font-black text-[#1d1d1f] mb-4 flex items-center gap-2 uppercase tracking-tight">
                            <Video size={20} className="text-orange-600" />
                            Hệ Thống Hình Ảnh
                        </h5>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-black/5">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">CAM 01</span>
                                <span className="text-[13px] font-bold text-[#101010]">Cận - Talking Head</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-black/5">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">CAM 02</span>
                                <span className="text-[13px] font-bold text-[#101010]">Toàn - Space Look</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-black/5">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">CAM 03</span>
                                <span className="text-[13px] font-bold text-[#101010]">Top-down - Review</span>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-2xl border border-black/5">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">CAM 04</span>
                                <span className="text-[13px] font-bold text-[#101010]">Smartphone / Side</span>
                            </div>
                        </div>
                    </div>

                    {/* Control System */}
                    <div className="glass-panel p-8 rounded-[40px] bg-[#1d1d1f] shadow-xl ring-1 ring-white/10">
                        <h5 className="text-[16px] font-black text-white mb-4 flex items-center gap-2 uppercase tracking-tight">
                            <Settings2 size={20} className="text-indigo-400" />
                            Hệ Thống Điều Khiển
                        </h5>
                        <p className="text-[13px] text-white/60 font-medium leading-relaxed">
                            <b>Elgato Stream Deck</b> là bộ não điều khiển. Cài plugin &quot;Multi Action&quot; để vừa chuyển góc cam, vừa chạy pop-up chỉ với 1 nút bấm duy nhất.
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-between mt-8 print:hidden">
                <Link
                    href="/livestream/equipment"
                    className="px-8 py-4 rounded-2xl bg-slate-100/80 backdrop-blur-md text-[#1d1d1f] font-black text-[15px] flex items-center gap-3 hover:bg-slate-200 transition-all active:scale-95 ring-1 ring-black/5"
                >
                    <ChevronLeft size={20} /> Quay lại
                </Link>
                <Link
                    href="/livestream/camera"
                    className="px-10 py-4 rounded-2xl bg-[#1d1d1f] text-white font-black text-[15px] flex items-center gap-3 hover:opacity-95 shadow-[0_15px_35px_rgba(0,0,0,0.1)] transition-all active:scale-95"
                >
                    Tiếp tục <ChevronRight size={20} />
                </Link>
            </div>
        </div>
    );
}

