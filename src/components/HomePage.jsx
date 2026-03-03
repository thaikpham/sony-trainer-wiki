import dynamic from 'next/dynamic';
import { Sparkles, BookOpenText } from 'lucide-react';
import Link from 'next/link';
import HeroCyclingWord from '@/components/HeroCyclingWord';

// Dynamic import for the heavier analytics component
const AnalyticsDashboard = dynamic(() => import('./AnalyticsDashboard'), {
    loading: () => <div className="w-full h-48 animate-pulse bg-black/5 dark:bg-white/5 rounded-[48px] mt-6 mb-10" />,
    ssr: false // Analytics often rely on client-side data/window
});

const CATEGORY_WORDS = [
    { label: 'Máy Ảnh', gradient: 'from-blue-500 to-cyan-400', glow: 'rgba(59,130,246,0.4)' },
    { label: 'Ống Kính', gradient: 'from-violet-500 to-purple-400', glow: 'rgba(139,92,246,0.4)' },
    { label: 'Tai Nghe', gradient: 'from-rose-500 to-pink-400', glow: 'rgba(244,63,94,0.4)' },
    { label: 'Loa', gradient: 'from-amber-500 to-orange-400', glow: 'rgba(245,158,11,0.4)' },
    { label: 'BRAVIA TV', gradient: 'from-emerald-500 to-teal-400', glow: 'rgba(16,185,129,0.4)' },
    { label: 'Soundbar', gradient: 'from-orange-500 to-red-400', glow: 'rgba(249,115,22,0.4)' },
    { label: 'Xperia', gradient: 'from-sky-500 to-indigo-400', glow: 'rgba(14,165,233,0.4)' },
    { label: 'Phụ Kiện', gradient: 'from-fuchsia-500 to-pink-500', glow: 'rgba(217,70,239,0.4)' },
];

/**
 * HomeHero — hero content rendered inside <Layout>.
 * Background orbs are fixed-positioned to cover the full viewport.
 * Cycling word uses justify='start' to align with the rest of the left-aligned headline.
 */
export default function HomeHero() {
    return (
        <>
            {/* ── BG ORBS (fixed = cover full viewport regardless of Layout structure) ── */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div style={{ animation: 'orb-drift 20s ease-in-out infinite' }}
                    className="absolute -top-1/3 -left-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/25 via-cyan-300/15 to-transparent rounded-full blur-[120px]" />
                <div style={{ animation: 'orb-drift 26s ease-in-out infinite', animationDelay: '-9s' }}
                    className="absolute -bottom-1/3 -right-1/4 w-[900px] h-[900px] bg-gradient-to-tl from-violet-400/20 via-fuchsia-300/15 to-transparent rounded-full blur-[130px]" />
                <div style={{ animation: 'orb-drift 32s ease-in-out infinite', animationDelay: '-18s' }}
                    className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-rose-300/10 via-amber-200/10 to-transparent rounded-full blur-[90px]" />
            </div>

            {/* ── HERO CONTENT ── */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center pt-8 text-center select-none">

                {/* Headline block — vertical stack (3 lines) */}
                <div style={{ animation: 'slide-up 0.55s ease-out forwards', opacity: 0, animationDelay: '0.06s' }}>
                    <div className="text-[clamp(52px,6.5vw,96px)] font-black tracking-[-0.035em] leading-[0.92] text-foreground">
                        Khám phá
                    </div>

                    <div className="text-[clamp(52px,6.5vw,96px)] leading-[0.92] py-[0.06em] w-full">
                        <HeroCyclingWord words={CATEGORY_WORDS} intervalMs={2200} />
                    </div>

                    <div className="text-[clamp(52px,6.5vw,96px)] font-black tracking-[-0.035em] leading-[0.92] text-foreground">
                        của Sony.
                    </div>
                </div>

                {/* Accent bar */}
                <div style={{ animation: 'slide-up 0.55s ease-out forwards', opacity: 0, animationDelay: '0.18s' }}
                    className="mt-8 mb-5 w-10 h-[3px] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />

                {/* CTA Buttons */}
                <div style={{ animation: 'slide-up 0.55s ease-out forwards', opacity: 0, animationDelay: '0.3s' }} className="mt-10 flex flex-wrap justify-center gap-4">
                    <Link href="/ai" className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f] font-bold text-[15px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/10 dark:shadow-white/5">
                        <Sparkles size={18} />
                        Bắt đầu Tư vấn AI
                    </Link>
                    <Link href="/wiki" className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/50 dark:bg-white/5 text-foreground font-bold text-[15px] border border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 hover:scale-105 active:scale-95 transition-all backdrop-blur-md">
                        <BookOpenText size={18} />
                        Thư viện Wiki
                    </Link>
                </div>

                {/* Real-Time Analytics Dashboard */}
                <div style={{ animation: 'slide-up 0.6s ease-out forwards', opacity: 0, animationDelay: '0.45s' }} className="w-full mt-6 mb-10">
                    <AnalyticsDashboard />
                </div>

            </div>
        </>
    );
}
