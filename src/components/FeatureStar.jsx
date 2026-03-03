'use client';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { Star } from 'lucide-react';


export default function FeatureStar({ featureId }) {
    const { topFeatures } = useRealTimeAnalytics();

    const isTop = topFeatures.some(f => f.id === featureId);

    if (!isTop) return null;

    return (
        <div className="inline-flex items-center justify-center relative group" title="Top Trending Feature">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-amber-400 blur-md opacity-20 group-hover:opacity-40 animate-pulse transition-opacity"></div>

            {/* The Badge */}
            <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 p-1 rounded-md shadow-lg shadow-amber-500/20 transform hover:scale-125 transition-all duration-300">
                <Star size={10} className="text-white fill-white" />
            </div>

            {/* Tooltip hint on hover */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-foreground text-background text-[9px] font-black px-2 py-1 rounded-lg shadow-2xl z-50 uppercase tracking-widest">
                Top Trending
            </div>
        </div>
    );
}
