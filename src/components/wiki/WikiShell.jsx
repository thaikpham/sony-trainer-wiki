'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Palette, BarChart3 } from 'lucide-react';
import { trackFeatureUsage } from '@/services/analytics';
import { useRoleAccess } from '@/components/RoleProvider';

const WIKI_TABS = [
    {
        key: 'products',
        href: '/wiki/kho-san-pham',
        label: 'Kho Sản Phẩm',
        icon: BookOpen,
        match: (pathname) => pathname === '/wiki' || pathname.startsWith('/wiki/kho-san-pham'),
        trackId: 'wiki_products',
        trackName: 'Wiki: Kho Sản Phẩm',
    },
    {
        key: 'colorlab',
        href: '/wiki/colorlab',
        label: 'ColorLab',
        icon: Palette,
        match: (pathname) => pathname.startsWith('/wiki/colorlab'),
        trackId: 'wiki_colorlab',
        trackName: 'Wiki: ColorLab',
    },
    {
        key: 'reports',
        href: '/wiki/bao-cao-live',
        label: 'Báo cáo Live',
        icon: BarChart3,
        match: (pathname) => pathname.startsWith('/wiki/bao-cao-live'),
        trackId: 'wiki_reports',
        trackName: 'Wiki: Báo cáo Live',
        adminOnly: true,
    },
];

export default function WikiShell({ children }) {
    const pathname = usePathname();
    const { isAdmin } = useRoleAccess();
    const activeTab = WIKI_TABS.find(tab => tab.match(pathname))?.key ?? 'products';

    return (
        <>
            <div className="flex items-center gap-2 mb-6">
                <div className="flex bg-black/[0.04] p-1 rounded-2xl border border-black/[0.02]">
                    {WIKI_TABS.filter(tab => !tab.adminOnly || isAdmin).map((tab) => {
                        const Icon = tab.icon;
                        const isActive = tab.key === activeTab;
                        return (
                            <Link
                                key={tab.key}
                                href={tab.href}
                                onClick={() => trackFeatureUsage(tab.trackId, tab.trackName)}
                                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 ${isActive
                                    ? tab.key === 'reports'
                                        ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-teal-600'
                                        : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-[#1d1d1f]'
                                    : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>

                {activeTab === 'colorlab' && (
                    <span className="text-[11px] font-bold text-violet-500 bg-violet-50 px-2.5 py-1 rounded-full ring-1 ring-violet-200">
                        Creative Studio
                    </span>
                )}
            </div>

            {children}
        </>
    );
}
