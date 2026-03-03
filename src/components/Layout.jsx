import { useState, useEffect } from 'react';
import { Aperture, BookOpenText, Sparkles, Video, Database } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import RoleBadgeDropdown from '@/components/RoleBadgeDropdown';
import { getRoleKeys, hasAdminAccess } from '@/lib/roles';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trackUserRegistration } from '@/services/analytics';

export default function Layout({ children }) {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();

    const email = user?.primaryEmailAddress?.emailAddress;
    const roleKeys = getRoleKeys(email);
    const isAdmin = hasAdminAccess(email);

    useEffect(() => {
        if (isLoaded && user) {
            trackUserRegistration(user);

            // If admin, trigger a silent sync of Clerk user count to Firestore
            if (isAdmin) {
                fetch('/api/admin/sync-clerk').catch(() => { });
            }
        }
    }, [user, isLoaded, isAdmin]);
    const displayName = user?.firstName
        ? `${user.firstName}${user.lastName ? ' ' + user.lastName[0] + '.' : ''}`
        : user?.username || 'Người dùng';

    const navItems = [
        { href: '/', label: 'Trang chủ', labelShort: 'Home', icon: Aperture, match: (p) => p === '/' },
        { href: '/ai', label: 'AI Tư vấn', labelShort: 'AI', icon: Sparkles, match: (p) => p.startsWith('/ai') },
        { href: '/wiki', label: 'Wiki', labelShort: 'Wiki', icon: BookOpenText, match: (p) => p.startsWith('/wiki') },
        { href: '/livestream', label: 'Livestream', labelShort: 'Live', icon: Video, match: (p) => p.startsWith('/livestream') },
    ];

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-black text-[#1d1d1f] dark:text-[#F5F5F7] font-sans selection:bg-blue-200 dark:selection:bg-blue-900/50 selection:text-blue-900 dark:selection:text-blue-200 flex flex-col items-center overflow-x-hidden">
            {/* Subtle mesh/noise background typical for modern Apple-like sites */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] dark:invert z-0 transition-opacity duration-500"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                }}
            />

            <div className="w-full px-4 sm:px-8 md:px-12 py-6 md:py-8 z-10 flex flex-col min-h-screen">
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6 md:gap-0">
                    <Link href="/" className="flex items-center space-x-2.5 group">
                        <Aperture className="text-[#1d1d1f] dark:text-[#F5F5F7] group-hover:rotate-90 transition-transform duration-500 ease-in-out" size={28} strokeWidth={2.5} />
                        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#F5F5F7] hover:opacity-70 transition-opacity">Sony Training Wiki</h1>
                    </Link>

                    {/* Top Right Navigation Switcher and Theme Toggle */}
                    <div className="flex items-center justify-center w-full md:w-auto gap-4">
                        <div className="flex flex-wrap lg:flex-nowrap bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-[20px] items-center justify-center backdrop-blur-xl border border-black/[0.02] dark:border-white/[0.05]">
                            {navItems.map(({ href, label, labelShort, icon: Icon, match }) => {
                                const isActive = match(pathname);
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center justify-center gap-1.5 px-3 md:px-5 py-2 rounded-2xl text-[13px] font-medium transition-all duration-300 ${isActive ? 'bg-white dark:bg-[#2d2d2f] shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] text-[#1d1d1f] dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                    >
                                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="hidden sm:inline">{label}</span>
                                        <span className="sm:hidden">{labelShort}</span>
                                    </Link>
                                );
                            })}

                            {isAdmin && (
                                <>
                                    <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1" />
                                    <Link
                                        href="/admin"
                                        className={`flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 rounded-2xl text-[13px] font-medium transition-all duration-300 ${pathname.startsWith('/admin') ? 'bg-gradient-to-r from-violet-500 to-blue-500 shadow-[0_2px_8px_rgba(139,92,246,0.3)] text-white' : 'text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400'}`}
                                    >
                                        <Database size={15} strokeWidth={pathname.startsWith('/admin') ? 2.5 : 2} />
                                        <span className="hidden sm:inline">Admin</span>
                                    </Link>
                                </>
                            )}
                        </div>
                        <ThemeToggle />

                        {/* Clerk Auth Integration */}
                        <div className="flex items-center ml-2 border-l border-black/10 dark:border-white/10 pl-4 h-8 gap-3">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-[#1d1d1f] text-white hover:bg-black dark:bg-white dark:text-[#1d1d1f] dark:hover:bg-slate-200 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                                        Đăng nhập
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <div className="hidden sm:flex flex-col items-end gap-1.5 mr-2">
                                    <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400 leading-none">
                                        {displayName}
                                    </span>
                                    <RoleBadgeDropdown roleKeys={roleKeys} />
                                </div>
                                <UserButton redirectUrl="/" appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-8 h-8 rounded-full ring-2 ring-transparent dark:ring-[#2d2d2f]"
                                    }
                                }} />
                            </SignedIn>
                        </div>
                    </div>
                </header>
                <main className="flex-grow flex flex-col justify-center">
                    {children}
                </main>
            </div>
        </div>
    );
}
