'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ClipboardList, Cable, Camera, Laptop, Lightbulb, Wand2, CheckCircle2, ChevronLeft, Monitor } from 'lucide-react';
import { LiveStreamProvider } from '@/components/livestream/LiveStreamContext';

const steps = [
    { id: 1, title: 'Chuẩn bị', icon: ClipboardList, path: '/livestream/equipment' },
    { id: 2, title: 'Kết nối', icon: Cable, path: '/livestream/connection' },
    { id: 3, title: 'Máy ảnh', icon: Camera, path: '/livestream/camera' },
    { id: 4, title: 'Phần mềm', icon: Laptop, path: '/livestream/software' },
    { id: 5, title: 'Ánh sáng', icon: Lightbulb, path: '/livestream/lighting' },
    { id: 6, title: 'Kịch Bản', icon: Wand2, path: '/livestream/content' },
    { id: 7, title: 'Báo cáo', icon: CheckCircle2, path: '/livestream/report' }
];

export default function LiveStreamLayout({ children }) {
    const pathname = usePathname();

    const getCurrentStepIndex = () => {
        const index = steps.findIndex(step => pathname.includes(step.path));
        return index !== -1 ? index : 0;
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <LiveStreamProvider>
            <div className="w-full animate-slide-up flex flex-col mx-auto min-h-[85vh] print:min-h-0 print:w-full">
                <div className="mb-6 px-2 print:hidden">
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 font-semibold text-[11px] px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider ring-1 ring-teal-500/20">
                        <Monitor size={12} className="mr-1" />
                        <span>Live Studio Hub</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-[#1d1d1f] tracking-tight mb-2">Trung tâm Livestream</h2>
                    <p className="text-[#86868b] text-[15px] font-medium">Bản xem trước Camera trực tiếp và Hướng dẫn thiết lập cho từng nền tảng. <Link href="/livestream/sop" className="text-teal-600 hover:underline font-semibold">Quy trình SOP Livestream</Link> — training & vận hành phòng live.</p>
                </div>

                <div className="flex flex-col gap-6 px-2 flex-grow h-full pb-12 print:pb-0 print:p-0">
                    {/* Premium Step Navigation */}
                    <div className="w-full relative py-8 px-4 sm:px-10 mb-8 bg-white/40 backdrop-blur-xl rounded-[40px] ring-1 ring-black/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden print:hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 blur-[100px] -z-10"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10"></div>

                        <div className="overflow-x-auto scrollbar-hide py-4 -my-4">
                            <div className="relative flex justify-between items-center min-w-[600px] sm:min-w-0 max-w-5xl mx-auto px-4 mt-2">
                                <div className="absolute top-[24px] sm:top-[28px] left-0 right-0 h-[2px] z-0 mx-6 sm:mx-[28px]">
                                    <div className="absolute inset-0 bg-slate-200 rounded-full"></div>
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-emerald-400 z-0 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-full shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                                        style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                    ></div>
                                </div>

                                {steps.map((step, idx) => {
                                    const Icon = step.icon;
                                    const isActive = pathname.includes(step.path) || (pathname === '/livestream' && idx === 0);
                                    const isPast = currentStepIndex > idx;

                                    return (
                                        <Link
                                            key={step.id}
                                            href={step.path}
                                            className={`relative z-10 flex flex-col items-center group transition-all duration-500 ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                                        >
                                            <div className={`
                                                w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 relative
                                                ${isActive
                                                    ? 'bg-[#1d1d1f] text-white shadow-[0_15px_30px_rgba(0,0,0,0.2)] scale-110'
                                                    : isPast
                                                        ? 'bg-white text-teal-600 ring-2 ring-teal-500/20 shadow-sm'
                                                        : 'bg-white text-slate-400 ring-1 ring-black/5 shadow-sm group-hover:ring-slate-300'
                                                }
                                            `}>
                                                {isActive && (
                                                    <div className="absolute inset-0 rounded-[20px] bg-teal-500/20 animate-ping -z-10"></div>
                                                )}

                                                <Icon size={isActive ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-500" />

                                                {isPast && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white ring-2 ring-white shadow-lg animate-fade-in-up">
                                                        <CheckCircle2 size={12} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-4 flex flex-col items-center">
                                                <span className={`
                                                    text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-500 whitespace-nowrap
                                                    ${isActive
                                                        ? 'text-[#1d1d1f] translate-y-0 opacity-100'
                                                        : isPast
                                                            ? 'text-teal-600/80 opacity-80'
                                                            : 'text-slate-400 opacity-60 group-hover:opacity-100'
                                                    }
                                                `}>
                                                    {step.title}
                                                </span>
                                                <div className={`h-[3px] rounded-full bg-teal-500 transition-all duration-700 mt-1.5 ${isActive ? 'w-4 opacity-100' : 'w-0 opacity-0'}`}></div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex-grow">
                        {children}
                    </div>
                </div>
            </div>
        </LiveStreamProvider>
    );
}
