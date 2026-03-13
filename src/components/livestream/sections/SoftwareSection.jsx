'use client';

import React from 'react';
import { Monitor, MonitorPlay, Upload, KeyRound, Download, ChevronLeft, ChevronRight, Youtube, Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';
import { useLiveStream } from '../LiveStreamContext';

function renderPlatformIcon(platformId, size = 24) {
    switch (platformId) {
        case 'tiktok': return <div className="font-black italic text-[24px]">TikTok</div>;
        case 'youtube': return <Youtube size={size} />;
        case 'facebook': return <Facebook size={size} />;
        case 'instagram': return <Instagram size={size} />;
        case 'shopee': return <div className="font-black text-[24px]">S</div>;
        default: return <MonitorPlay size={size} />;
    }
}

export default function SoftwareSection() {
    const { 
        platforms,
        activePlatformIndex,
        setActivePlatformIndex
    } = useLiveStream();

    const activePlatform = platforms[activePlatformIndex];

    return (
        <div className="flex flex-col w-full animate-fade-in gap-6">
            <div className="w-full flex justify-center sticky top-0 bg-white/80 backdrop-blur-xl z-30 py-4 mb-4 border-b border-black/5 rounded-t-[40px]">
                <div className="flex overflow-x-auto gap-3 custom-scrollbar px-2 max-w-full">
                    {/* Desktop Software Apps (OBS, etc) */}
                    <div className="flex bg-[#F5F5F7] p-1.5 rounded-[20px] gap-1 ring-1 ring-black/5 shadow-sm shrink-0">
                        {platforms.filter(p => p.software && p.software.type === 'obs').map((plat) => {
                            const idx = platforms.findIndex(p => p.id === plat.id);
                            const isActive = activePlatformIndex === idx;
                            return (
                                <button
                                    key={plat.id}
                                    onClick={() => setActivePlatformIndex(idx)}
                                    className={`px-5 py-2.5 rounded-2xl text-[14px] font-bold whitespace-nowrap transition-all duration-300 ${isActive ? plat.activeColor + ' shadow-[0_4px_16px_rgba(0,0,0,0.12)] scale-100 ring-2 ring-white/20' : 'text-[#86868b] hover:bg-black/5'}`}
                                >
                                    {plat.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Separator */}
                    <div className="w-px bg-black/5 my-3 mx-1 hidden sm:block"></div>

                    {/* Mobile Apps (TikTok Studio, etc) */}
                    <div className="flex gap-2 items-center shrink-0">
                        {platforms.filter(p => !p.software || p.software.type !== 'obs').map((plat) => {
                            const idx = platforms.findIndex(p => p.id === plat.id);
                            const isActive = activePlatformIndex === idx;
                            return (
                                <button
                                    key={plat.id}
                                    onClick={() => setActivePlatformIndex(idx)}
                                    className={`px-5 py-2.5 rounded-2xl text-[14px] font-bold whitespace-nowrap transition-all duration-300 ring-1 ring-black/5 ${isActive ? plat.activeColor + ' shadow-[0_4px_16px_rgba(0,0,0,0.12)] scale-105 z-10 ring-2 ring-white/20' : 'bg-[#F5F5F7] text-[#86868b] hover:bg-black/5 hover:shadow-sm'}`}
                                >
                                    {plat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="w-full flex flex-col glass-panel p-6 sm:p-8 lg:p-12 rounded-[40px] bg-white relative overflow-hidden h-full min-h-[500px]">
                {/* Dynamic Background Glow based on Active Platform */}
                {activePlatform && (
                    <div className={`absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 -z-10 transition-colors duration-700 pointer-events-none ${activePlatform.activeColor.split(' ')[0]}`}></div>
                )}

                {/* Tutorial Content Wrapper */}
                {activePlatform ? (
                    <div className="flex-grow flex flex-col relative z-10 animate-fade-in w-full max-w-4xl mx-auto" key={activePlatform.id}>
                        <div className="flex flex-col pb-6">
                            {/* Platform Setup */}
                            <div className="flex flex-col border-black/5 pb-8">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className={`p-4 rounded-[20px] text-white shadow-lg flex-shrink-0 ${activePlatform.activeColor} scale-110 shadow-[0_8px_20px_rgba(0,0,0,0.15)]`}>
                                        {renderPlatformIcon(activePlatform.id, 32)}
                                    </div>
                                    <h4 className="text-[32px] md:text-[36px] font-black text-[#1d1d1f] tracking-tight leading-tight">{activePlatform.name}</h4>
                                </div>
                                <p className="text-[15px] text-[#86868b] mb-8 font-medium leading-relaxed pr-4">{activePlatform.description}</p>

                                {/* Stream Specs */}
                                {activePlatform.streamSpecs && (
                                    <div className="mb-8 grid grid-cols-3 gap-3">
                                        <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col items-center justify-center text-center ring-1 ring-black/5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                            <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5 flex items-center gap-1"><Monitor size={12} /> Độ Phân Giải</div>
                                            <div className="text-[14px] font-black text-[#1d1d1f]">{activePlatform.streamSpecs.resolution}</div>
                                        </div>
                                        <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col items-center justify-center text-center ring-1 ring-black/5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                            <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5 flex items-center gap-1"><MonitorPlay size={12} /> Khung Hình</div>
                                            <div className="text-[14px] font-black text-[#1d1d1f]">{activePlatform.streamSpecs.framerate}</div>
                                        </div>
                                        <div className="bg-[#F5F5F7] rounded-2xl p-4 flex flex-col items-center justify-center text-center ring-1 ring-black/5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                                            <div className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider mb-1.5 flex items-center gap-1"><Upload size={12} /> Bitrate</div>
                                            <div className="text-[14px] font-black text-[#1d1d1f]">{activePlatform.streamSpecs.bitrate}</div>
                                        </div>
                                    </div>
                                )}

                                {/* Software */}
                                {activePlatform.software && (
                                    <div className="mb-8 flex flex-col gap-3">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#F5F5F7] rounded-[20px] p-5 ring-1 ring-black/5 shadow-sm hover:shadow-md transition-shadow gap-4 sm:gap-0">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 shadow-sm rounded-[14px] bg-white flex items-center justify-center text-[#1d1d1f] ring-1 ring-black/5 shrink-0">
                                                    {activePlatform.software.type === 'obs' ? <KeyRound size={22} className="text-teal-600" /> : <MonitorPlay size={22} className="text-indigo-600" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11.5px] font-bold text-[#86868b] uppercase tracking-wider mb-0.5">
                                                        {activePlatform.software.streamKeyRequired ? 'Yêu cầu Stream Key' : 'Phần mềm khuyên dùng'}
                                                    </span>
                                                    <span className="text-[16px] font-black text-[#1d1d1f] leading-tight">
                                                        {activePlatform.software.name}
                                                    </span>
                                                </div>
                                            </div>
                                            {activePlatform.software.url && (
                                                <a
                                                    href={activePlatform.software.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all shadow-sm bg-white text-[#1d1d1f] ring-1 ring-black/5 hover:bg-slate-50 active:scale-95 whitespace-nowrap lg:ml-4 shrink-0"
                                                >
                                                    <Download size={16} /> Tải
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Setup Steps */}
                                <div className="space-y-6 lg:space-y-8 mt-2">
                                    {activePlatform.steps.map((step, idx) => (
                                        <div key={idx} className="flex gap-5 group">
                                            <div className="flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center text-[15px] font-black shadow-lg z-10 ring-4 ring-white group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all flex-shrink-0 duration-300">
                                                    {idx + 1}
                                                </div>
                                                {idx < activePlatform.steps.length - 1 && (
                                                    <div className="w-0.5 h-full bg-slate-200 mt-3 mb-1 group-hover:bg-teal-200 transition-colors duration-300"></div>
                                                )}
                                            </div>
                                            <div className="pb-6 pt-1.5 w-full">
                                                <h5 className="text-[17px] font-bold text-[#1d1d1f] mb-2 leading-tight group-hover:text-teal-700 transition-colors duration-300">{step.title}</h5>
                                                <p className="text-[15px] text-[#86868b] leading-relaxed font-medium">{step.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center flex-grow py-12">
                        <p className="text-slate-500 font-medium text-[15px]">Không có dữ liệu nền tảng.</p>
                    </div>
                )}
            </div>
            
            <div className="flex justify-between mt-8">
                <Link
                    href="/livestream/camera"
                    className="px-6 py-3 rounded-xl bg-slate-100 text-[#1d1d1f] font-bold text-[14px] flex items-center gap-2 hover:bg-slate-200 transition-colors"
                >
                    <ChevronLeft size={16} /> Quay lại
                </Link>
                <Link
                    href="/livestream/lighting"
                    className="px-6 py-3 rounded-xl bg-[#1d1d1f] text-white font-bold text-[14px] flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    Tiếp tục <ChevronRight size={16} />
                </Link>
            </div>
        </div>
    );
}
