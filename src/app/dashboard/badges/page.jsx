'use client';

import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import BadgeShowcase from '@/components/BadgeShowcase';
import { getRoleKeys } from '@/lib/roles';

export default function BadgesPage() {
    const { isLoaded, isSignedIn, user } = useUser();

    if (!isLoaded || !isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
                <span className="animate-pulse font-bold tracking-tight text-slate-400">Đang tải bộ sưu tập...</span>
            </div>
        );
    }

    const email = user.primaryEmailAddress?.emailAddress;
    const roleKeys = getRoleKeys(email);

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1d1d1f] font-sans selection:bg-blue-200 flex flex-col items-center overflow-x-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-5xl px-4 sm:px-8 py-6 md:py-8 z-10 flex flex-col min-h-screen animate-fade-in relative">

                {/* Header */}
                <header className="flex justify-between items-center mb-10 pb-4 border-b border-black/5">
                    <Link href="/dashboard" className="flex items-center gap-2 group text-[#1d1d1f] hover:opacity-70 transition-opacity">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Quay lại Dashboard</span>
                    </Link>
                </header>

                <main className="flex flex-col gap-8 pb-20">
                    {/* Hero Section */}
                    <div className="flex flex-col items-center text-center mb-4">
                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 mb-6 transform hover:scale-110 transition-transform duration-500">
                            <Trophy size={32} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-b from-[#1d1d1f] to-[#1d1d1f]/60 bg-clip-text text-transparent">
                            Bộ sưu tập Huy hiệu
                        </h1>
                        <p className="text-slate-500 max-w-lg text-[16px] font-medium leading-relaxed">
                            Khám phá những cột mốc quan trọng và thành tựu cá nhân bạn đã đạt được trong hành trình chinh phục kiến thức Alpha.
                        </p>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white p-6 rounded-[28px] shadow-sm ring-1 ring-black/5 flex flex-col items-center">
                            <span className="text-2xl font-black mb-1">{roleKeys.length}</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Đã mở khóa</span>
                        </div>
                        <div className="bg-white p-6 rounded-[28px] shadow-sm ring-1 ring-black/5 flex flex-col items-center">
                            <span className="text-2xl font-black mb-1 text-amber-500">
                                {roleKeys.filter(k => k === 'DEV' || k === 'LENS_CONNOISSEUR' || k === 'LIVE_LEGEND').length}
                            </span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Legendary</span>
                        </div>
                        <div className="bg-white p-6 rounded-[28px] shadow-sm ring-1 ring-black/5 flex flex-col items-center">
                            <span className="text-2xl font-black mb-1 text-purple-500">100%</span>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nhiệt huyết</span>
                        </div>
                        <div className="bg-white p-6 rounded-[28px] shadow-sm ring-1 ring-black/5 flex flex-col items-center">
                            <Sparkles className="text-blue-500 mb-1" size={24} />
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Alpha Elite</span>
                        </div>
                    </div>

                    <BadgeShowcase userRoleKeys={roleKeys} />
                </main>
            </div>
        </div>
    );
}
