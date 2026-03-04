import { useState, useEffect } from 'react';
import { Aperture, BookOpenText, Sparkles, Video, Database, Sun, Moon, Monitor, ChevronDown, Terminal } from 'lucide-react';
import RoleBadgeDropdown from '@/components/RoleBadgeDropdown';
import { getRoleKeys, hasAdminAccess } from '@/lib/roles';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trackUserRegistration } from '@/services/analytics';
import { useTheme } from 'next-themes';

const ThemePicker = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const options = [
        { value: 'light', label: 'Sáng', icon: Sun },
        { value: 'dark', label: 'Tối', icon: Moon },
        { value: 'system', label: 'Hệ thống', icon: Monitor }
    ];

    return (
        <div className="flex flex-col gap-5 p-1">
            <div>
                <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#F5F5F7] mb-1.5">Giao diện hiển thị</h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400">Chọn giao diện thiết kế cho ứng dụng. Mặc định sẽ tự động đồng bộ theo hệ thống của bạn.</p>
            </div>

            <div className="flex bg-black/[0.04] dark:bg-white/[0.04] p-1.5 rounded-[20px] w-full max-w-sm border border-black/[0.05] dark:border-white/[0.05]">
                {options.map(({ value, label, icon: Icon }) => {
                    const isActive = theme === value;
                    return (
                        <button
                            key={value}
                            onClick={() => setTheme(value)}
                            className={`flex-1 flex flex-col items-center justify-center py-3.5 gap-2.5 rounded-2xl text-[13px] font-medium transition-all duration-300 ${isActive ? 'bg-white dark:bg-[#2d2d2f] text-[#1d1d1f] dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                            {label}
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default function Layout({ children }) {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();

    const email = user?.primaryEmailAddress?.emailAddress;
    const roleKeys = getRoleKeys(email);
    const isAdmin = hasAdminAccess(email);
    const isDev = roleKeys.includes('DEV');

    useEffect(() => {
        if (isLoaded && user) {
            trackUserRegistration(user);

            // Tự động bung Fullscreen khi User vừa mới đăng nhập thành công (nếu chưa full)
            if (typeof window !== 'undefined' && document.documentElement) {
                // Sử dụng try-catch và requestAnimationFrame để tránh lỗi "user activation required" 
                // xảy ra quá nhanh nếu click của Clerk chưa kịp nhả.
                const requestFull = async () => {
                    try {
                        if (!document.fullscreenElement) {
                            await document.documentElement.requestFullscreen();
                        }
                    } catch (err) {
                        console.log("Could not auto-fullscreen:", err);
                    }
                };

                // Trì hoãn một chút để đảm bảo event click từ Clerk UI đã hoàn tất
                setTimeout(requestFull, 100);
            }

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

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('#nav-dropdown')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    // Close menu on route change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMenuOpen(false);
    }, [pathname]);

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-black text-[#1d1d1f] dark:text-[#F5F5F7] font-sans selection:bg-blue-200 dark:selection:bg-blue-900/50 selection:text-blue-900 dark:selection:text-blue-200 flex flex-col items-center overflow-x-hidden">
            {/* Subtle mesh/noise background typical for modern Apple-like sites */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] dark:invert z-0 transition-opacity duration-500"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                }}
            />

            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-6 md:py-8 z-10 flex flex-col min-h-screen">
                <header className="flex flex-row justify-between items-center mb-8 gap-4 md:gap-0 relative z-50">

                    {/* Left: Logo & Dropdown Trigger */}
                    <div className="relative" id="nav-dropdown">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2.5 px-3 py-2 -ml-3 rounded-2xl group hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-300 ease-in-out"
                            aria-expanded={isMenuOpen}
                            aria-haspopup="true"
                        >
                            <Aperture className="text-[#1d1d1f] dark:text-[#F5F5F7] group-hover:rotate-90 transition-transform duration-500 ease-in-out" size={28} strokeWidth={2.5} />
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1d1d1f] dark:text-[#F5F5F7]">Sony Training Wiki</h1>
                            <ChevronDown
                                size={18}
                                strokeWidth={2.5}
                                className={`text-slate-400 group-hover:text-[#1d1d1f] dark:group-hover:text-white transition-transform duration-300 ml-1 ${isMenuOpen ? 'rotate-180 text-[#1d1d1f] dark:text-white' : ''}`}
                            />
                        </button>

                        {/* Dropdown Menu Panel (Absolute positioning anchor to Logo) */}
                        <div
                            className={`absolute top-full left-0 mt-2 w-64 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.08] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 transition-all duration-300 origin-top-left ${isMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                        >
                            <div className="flex flex-col gap-1">
                                {navItems.map(({ href, label, icon: Icon, match }) => {
                                    const isActive = match(pathname);
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 ${isActive ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:text-[#1d1d1f] dark:hover:text-white'}`}
                                        >
                                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-500 dark:text-blue-400' : ''} />
                                            {label}
                                        </Link>
                                    );
                                })}

                                {isAdmin && (
                                    <>
                                        <div className="w-full h-px bg-black/5 dark:bg-white/5 my-1" />
                                        <Link
                                            href="/admin"
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 ${pathname.startsWith('/admin') ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:text-violet-600 dark:hover:text-violet-400'}`}
                                        >
                                            <Database size={18} strokeWidth={pathname.startsWith('/admin') ? 2.5 : 2} className={pathname.startsWith('/admin') ? 'text-violet-500' : ''} />
                                            Admin System
                                        </Link>
                                        {isDev && (
                                            <Link
                                                href="/dev"
                                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 ${pathname.startsWith('/dev') ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] hover:text-amber-600 dark:hover:text-amber-400'}`}
                                            >
                                                <Terminal size={18} strokeWidth={pathname.startsWith('/dev') ? 2.5 : 2} className={pathname.startsWith('/dev') ? 'text-amber-500' : ''} />
                                                Dev Panel
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Clerk Auth Integration Only */}
                    <div className="flex items-center justify-end h-12">
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
                            }}>
                                <UserButton.UserProfilePage
                                    label="Giao diện"
                                    url="appearance"
                                    labelIcon={<Monitor size={14} />}
                                >
                                    <ThemePicker />
                                </UserButton.UserProfilePage>
                            </UserButton>
                        </SignedIn>
                    </div>
                </header>
                <main className="flex-grow flex flex-col justify-center">
                    {children}
                </main>
            </div>
        </div>
    );
}
