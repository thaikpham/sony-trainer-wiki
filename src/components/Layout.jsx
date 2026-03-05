import { useState, useEffect } from 'react';
import { Aperture, BookOpenText, Sparkles, Video, ChevronDown, Terminal } from 'lucide-react';
import RoleBadgeDropdown from '@/components/RoleBadgeDropdown';
import { getRoleKeys } from '@/lib/roles';
import { useRoleAccess } from '@/components/RoleProvider';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trackUserRegistration } from '@/services/analytics';

export default function Layout({ children }) {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();

    const email = user?.primaryEmailAddress?.emailAddress;
    const roleKeys = getRoleKeys(email);
    const { isAdmin, isDev } = useRoleAccess();

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

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Easter Egg: track rapid logo clicks
    const logoClickCount = useState(0);
    const logoClickTimer = useState(null);

    const handleLogoAreaClick = () => {
        setIsMenuOpen(!isMenuOpen);
        logoClickCount[0]++;
        if (logoClickTimer[0]) clearTimeout(logoClickTimer[0]);
        logoClickTimer[0] = setTimeout(() => {
            logoClickCount[0] = 0;
        }, 2000);
        if (logoClickCount[0] >= 5) {
            logoClickCount[0] = 0;
            fetch('/api/track_action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'logo_clicks' })
            }).then(r => r.json()).then(data => {
                if (data.unlockedBadges && data.unlockedBadges.length > 0) {
                    window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: { unlockedBadges: data.unlockedBadges } }));
                }
            }).catch(() => { });
        }
    };

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
        <div className="min-h-screen bg-[#F5F5F7] text-[#1d1d1f] font-sans selection:bg-blue-200 selection:text-blue-900 flex flex-col items-center overflow-x-hidden">
            {/* Subtle mesh/noise background typical for modern Apple-like sites */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 transition-opacity duration-500"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
                }}
            />

            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 py-6 md:py-8 z-10 flex flex-col min-h-screen">
                <header className="flex flex-row justify-between items-center mb-8 gap-4 md:gap-0 relative z-50">

                    {/* Left: Logo & Dropdown Trigger */}
                    <div className="relative" id="nav-dropdown">
                        <button
                            onClick={handleLogoAreaClick}
                            className="flex items-center gap-2.5 px-3 py-2 -ml-3 rounded-2xl group hover:bg-black/[0.04] transition-all duration-300 ease-in-out"
                            aria-expanded={isMenuOpen}
                            aria-haspopup="true"
                        >
                            <Aperture className="text-[#1d1d1f] group-hover:rotate-90 transition-transform duration-500 ease-in-out" size={28} strokeWidth={2.5} />
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1d1d1f]">Sony Training Wiki</h1>
                            <ChevronDown
                                size={18}
                                strokeWidth={2.5}
                                className={`text-slate-400 group-hover:text-[#1d1d1f] transition-transform duration-300 ml-1 ${isMenuOpen ? 'rotate-180 text-[#1d1d1f]' : ''}`}
                            />
                        </button>

                        {/* Dropdown Menu Panel (Absolute positioning anchor to Logo) */}
                        <div
                            className={`absolute top-full left-0 mt-2 w-64 bg-white/80 backdrop-blur-2xl border border-black/[0.08] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 transition-all duration-300 origin-top-left ${isMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                        >
                            <div className="flex flex-col gap-1">
                                {navItems.map(({ href, label, icon: Icon, match }) => {
                                    const isActive = match(pathname);
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 ${isActive ? 'bg-black/[0.06] text-[#1d1d1f]' : 'text-slate-600 hover:bg-black/[0.03] hover:text-[#1d1d1f]'}`}
                                        >
                                            <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-500' : ''} />
                                            {label}
                                        </Link>
                                    );
                                })}

                                {isAdmin && (
                                    <>
                                        <div className="w-full h-px bg-black/5 my-1" />
                                        {isDev && (
                                            <Link
                                                href="/dev"
                                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 ${pathname.startsWith('/dev') ? 'bg-amber-500/10 text-amber-600' : 'text-slate-600 hover:bg-black/[0.03] hover:text-amber-600'}`}
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
                                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-[#1d1d1f] text-white hover:bg-black transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                                    Đăng nhập
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <div className="hidden sm:flex flex-col items-end gap-1.5 mr-2">
                                <span className="text-[13px] font-bold text-slate-500 leading-none">
                                    {displayName}
                                </span>
                                <RoleBadgeDropdown roleKeys={roleKeys} />
                            </div>
                            <UserButton redirectUrl="/" />
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
