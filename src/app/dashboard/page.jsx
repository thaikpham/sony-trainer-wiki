'use client';

import { useUser, SignOutButton } from "@clerk/nextjs";
import { ArrowLeft, Hexagon, LogOut, Settings, Award, ShieldCheck, Box, Bookmark, Camera, Trophy, BarChart3 } from "lucide-react";
import Link from "next/link";
import BadgeShowcase from '@/components/BadgeShowcase';
import { getRoleKeys, ROLES } from '@/lib/roles';
import { useRoleAccess } from '@/components/RoleProvider';
import { getLiveReports } from '@/services/db';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    const { isLoaded, isSignedIn, user } = useUser();
    const { roleKeys, canViewReport, loading: rolesLoading } = useRoleAccess();
    const [liveReports, setLiveReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);

    useEffect(() => {
        if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
            const fetchReports = async () => {
                try {
                    const data = await getLiveReports(user.primaryEmailAddress.emailAddress);
                    setLiveReports(data);
                } catch (err) {
                    console.error("Error fetching live reports:", err);
                } finally {
                    setLoadingReports(false);
                }
            };
            fetchReports();

            // Track dashboard view action
            fetch('/api/track_action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'dashboard_views' })
            }).then(r => r.json()).then(data => {
                if (data.unlockedBadges && data.unlockedBadges.length > 0) {
                    window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: { unlockedBadges: data.unlockedBadges } }));
                }
            }).catch(e => console.error("Failed to track dashboard view", e));
        }
    }, [isSignedIn, user]);

    if (!isLoaded || rolesLoading || !isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] text-[#1d1d1f]">
                <span className="animate-pulse font-bold tracking-tight">Đang tải dữ liệu định danh...</span>
            </div>
        );
    }

    const email = user.primaryEmailAddress?.emailAddress;
    // Any of these roles consider as employee for the UI purposes here
    const isEmployee = roleKeys.some(k => ['DEV', 'TRAINER', 'PRODUCT_MARKETING', 'DATA'].includes(k));

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1d1d1f] font-sans selection:bg-blue-200 selection:text-blue-900 flex flex-col items-center overflow-x-hidden">
            {/* Background Noise */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 transition-opacity duration-500"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                }}
            />

            <div className="w-full max-w-5xl px-4 sm:px-8 py-6 md:py-8 z-10 flex flex-col min-h-screen animate-fade-in relative">

                {/* Header Navbar */}
                <header className="flex justify-between items-center mb-10 pb-4 border-b border-black/5">
                    <Link href="/" className="flex items-center gap-2 group text-[#1d1d1f] hover:opacity-70 transition-opacity">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold">Quay lại Trang Chủ</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <SignOutButton redirectUrl="/">
                            <button className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-[#1d1d1f] text-white hover:bg-black transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                                <LogOut size={16} /> Đăng xuất
                            </button>
                        </SignOutButton>
                    </div>
                </header>

                {/* Dashboard Main View */}
                <main className="flex flex-col gap-8 pb-20">

                    {/* Profile Banner */}
                    <div className="glass-panel p-6 sm:p-10 rounded-[40px] flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">

                        {/* Status Backdrop Glow */}
                        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -z-0 opacity-20 ${isEmployee ? 'bg-indigo-500' : 'bg-teal-500'}`}></div>

                        <img src={user.imageUrl} alt="Profile Avatar" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-white shadow-lg relative z-10 object-cover" />

                        <div className="flex flex-col text-center sm:text-left relative z-10">
                            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{user.fullName || "Alpha User"}</h1>
                                {isEmployee && (
                                    <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-indigo-500/20 shadow-sm mt-1 sm:mt-0">
                                        <ShieldCheck size={14} /> Sony Staff
                                    </span>
                                )}
                                {!isEmployee && (
                                    <span className="flex items-center gap-1 bg-teal-50 text-teal-600 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-teal-500/20 shadow-sm mt-1 sm:mt-0">
                                        <Award size={14} /> Alpha Member
                                    </span>
                                )}
                            </div>
                            <p className="text-slate-500 font-medium text-[15px] mb-4">{email}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-4">
                                <div className="text-center">
                                    <div className="text-xl font-black text-[#1d1d1f]">0</div>
                                    <div className="text-[11px] text-[#86868b] uppercase tracking-wider font-bold">Lược tải LUT</div>
                                </div>
                                <div className="w-px h-8 bg-black/10"></div>
                                <div className="text-center">
                                    <div className="text-xl font-black text-[#1d1d1f]">0</div>
                                    <div className="text-[11px] text-[#86868b] uppercase tracking-wider font-bold">Bản ghi AI</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Achievement & Badges Hub - NEW */}
                        <Link href="/dashboard/badges" className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02] flex flex-col group hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-transparent blur-2xl group-hover:bg-amber-400/20 transition-all duration-500"></div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 ring-1 ring-amber-500/20 group-hover:scale-110 transition-transform duration-500">
                                    <Trophy size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <h2 className="text-[20px] font-black text-[#1d1d1f] tracking-tight">Hệ thống Huy hiệu</h2>
                                    <p className="text-[12px] text-[#86868b] font-medium uppercase tracking-wider">Bộ sưu tập thành tựu Alpha</p>
                                </div>
                            </div>

                            <div className="flex flex-col flex-grow">
                                <div className="flex -space-x-3 mb-6">
                                    {roleKeys.slice(0, 5).map(key => (
                                        <div key={key} className={`w-10 h-10 rounded-full bg-gradient-to-r ${ROLES[key]?.gradient || 'from-slate-400 to-slate-500'} border-4 border-white flex items-center justify-center text-[18px] shadow-sm relative z-10`} title={ROLES[key]?.label || key}>
                                            {/* We'll just show the icons here for preview */}
                                            {key === 'DEV' ? '⚡' : key === 'TRAINER' ? '🎓' : '👤'}
                                        </div>
                                    ))}
                                    {roleKeys.length > 5 && (
                                        <div className="w-10 h-10 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-[12px] font-black text-slate-500 relative z-0">
                                            +{roleKeys.length - 5}
                                        </div>
                                    )}
                                </div>

                                <p className="text-[14px] text-slate-500 font-medium mb-4">
                                    Bạn đã mở khóa <span className="text-amber-500 font-black">{roleKeys.length}</span> trên tổng số 26 huy hiệu danh giá.
                                </p>
                            </div>

                            <div className="mt-auto flex items-center gap-1.5 text-[13px] font-black text-blue-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                Xem bộ sưu tập <ArrowLeft size={16} className="rotate-180" />
                            </div>
                        </Link>

                        {/* Livestream History - Only for Authorized Roles */}
                        {canViewReport && (
                            <div className="bg-white rounded-[32px] p-6 sm:p-8 flex flex-col ring-1 ring-black/5 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl -z-0"></div>
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-600">
                                            <BarChart3 size={20} />
                                        </div>
                                        <h4 className="text-[18px] font-black text-[#1d1d1f] tracking-tight">Lịch sử Livestream</h4>
                                    </div>
                                    <span className="px-3 py-1 bg-teal-500/10 text-teal-600 text-[11px] font-black rounded-xl uppercase tracking-widest">
                                        {liveReports.length} Phiên
                                    </span>
                                </div>

                                {loadingReports ? (
                                    <div className="flex-grow flex items-center justify-center py-12">
                                        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : liveReports.length > 0 ? (
                                    <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                        {liveReports.map((report) => (
                                            <div key={report.id} className="bg-white p-4 rounded-2xl ring-1 ring-black/5 hover:shadow-md transition-all group overflow-hidden relative">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 blur-2xl -z-0"></div>

                                                <div className="flex items-center justify-between mb-2 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${report.platform === 'TikTok' ? 'bg-black text-white' :
                                                            report.platform === 'Shopee' ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                                                            }`}>
                                                            {report.platform}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                                            {new Date(report.timestamp).toLocaleDateString('vi-VN')}
                                                            {report.startTime && (
                                                                <span className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                                                                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                                                                    {report.startTime} - {report.endTime || '??'}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="text-[11px] font-black text-emerald-600">
                                                        +{Number(report.revenue || 0).toLocaleString('vi-VN')}đ
                                                    </div>
                                                </div>

                                                <h5 className="text-[14px] font-black text-[#1d1d1f] mb-3 line-clamp-1 relative z-10">
                                                    {report.topic || 'Phiên Livestream không tên'}
                                                </h5>

                                                <div className="grid grid-cols-3 gap-2 relative z-10">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Views / PCU</span>
                                                        <span className="text-[13px] font-black text-[#1d1d1f]">
                                                            {Number(report.views || 0).toLocaleString('vi-VN')} <span className="text-[10px] text-slate-400 font-bold">({Number(report.pcu || 0).toLocaleString('vi-VN')})</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Orders / CVR</span>
                                                        <span className="text-[13px] font-black text-[#1d1d1f]">
                                                            {Number(report.orders || 0).toLocaleString('vi-VN')} <span className="text-[10px] text-slate-400 font-bold">({report.cvr || 0}%)</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Duration</span>
                                                        <span className="text-[13px] font-black text-[#1d1d1f]">
                                                            {report.duration} <span className="text-[10px] text-slate-400 font-bold">min</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-grow flex flex-col items-center justify-center py-6 text-center">
                                        <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center text-slate-300 mb-4">
                                            <BarChart3 size={32} />
                                        </div>
                                        <h5 className="text-[14px] font-black text-[#1d1d1f] mb-1">Chưa có báo cáo</h5>
                                        <p className="text-[12px] text-slate-400 font-bold">Dữ liệu livestream sẽ xuất hiện tại đây.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Admin Tools for Sony Staff or Personal Gear for Customers */}
                        <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02] h-full flex flex-col relative overflow-hidden md:col-span-2">

                            {isEmployee ? (
                                <>
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 ring-1 ring-indigo-500/20">
                                            <Settings size={20} />
                                        </div>
                                        <h2 className="text-[20px] font-bold text-[#1d1d1f] tracking-tight">Control Panel</h2>
                                    </div>
                                    <div className="flex-grow flex flex-col gap-3 relative z-10">
                                        <button className="w-full bg-[#F5F5F7]/80 hover:bg-[#F5F5F7] ring-1 ring-black/5 px-5 py-4 rounded-2xl text-left flex items-center justify-between group transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-bold text-[#1d1d1f] group-hover:text-indigo-600 transition-colors">Quản lý Dữ liệu AI (RAG Sync)</span>
                                                <span className="text-[12px] text-[#86868b] font-medium">Đồng bộ Pineapple Vector DB</span>
                                            </div>
                                            <ArrowLeft size={16} className="text-[#86868b] group-hover:text-indigo-500 group-hover:-translate-x-1 transition-all rotate-180" />
                                        </button>
                                        <button className="w-full bg-[#F5F5F7]/80 hover:bg-[#F5F5F7] ring-1 ring-black/5 px-5 py-4 rounded-2xl text-left flex items-center justify-between group transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-bold text-[#1d1d1f] group-hover:text-amber-600 transition-colors">Cập nhật Kho màu (ColorLab)</span>
                                                <span className="text-[12px] text-[#86868b] font-medium">Thêm Recipe / LUT mới</span>
                                            </div>
                                            <ArrowLeft size={16} className="text-[#86868b] group-hover:text-amber-500 group-hover:-translate-x-1 transition-all rotate-180" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <div className="w-10 h-10 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#1d1d1f] ring-1 ring-black/5">
                                            <Box size={20} />
                                        </div>
                                        <h2 className="text-[20px] font-bold text-[#1d1d1f] tracking-tight">Thiết bị sở hữu</h2>
                                    </div>
                                    <div className="flex-grow flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center text-slate-300 mb-4">
                                            <Camera size={24} />
                                        </div>
                                        <p className="text-[#86868b] font-medium text-sm">Quản lý danh sách ống kính và máy ảnh.</p>
                                        <button className="mt-4 px-5 py-2 rounded-full bg-[#1d1d1f] text-white text-[13px] font-bold shadow-sm hover:scale-105 active:scale-95 transition-all">
                                            + Thêm thiết bị
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
