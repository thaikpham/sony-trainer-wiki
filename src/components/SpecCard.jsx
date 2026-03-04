import { Info, Plus, Check } from 'lucide-react';
import FeatureStar from './FeatureStar';

/** Format a number as Vietnamese Dong (VND) currency. */
const formatVND = (value) =>
    new Intl.NumberFormat('en-US').format(value ?? 0) + ' ₫';

export default function SpecCard({ data, isRecommended, onViewSpecs, onToggleCompare, compareList = [] }) {
    const isCameraSelected = compareList.some(item => item.productName === data.camName);
    const isLensSelected = compareList.some(item => item.productName === data.lensName);

    return (
        <div className={`group/card flex-none w-[88vw] md:w-auto md:flex-1 p-8 md:p-10 flex flex-col relative snap-center transition-all duration-700 rounded-[40px] overflow-hidden
      ${isRecommended
                ? 'bg-slate-950 text-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/10 scale-[1.03] md:scale-[1.05] z-10'
                : 'bg-background text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.05] dark:ring-white/[0.05] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1'
            }`}>

            {/* Premium Animated Gradient Border for Recommended */}
            {isRecommended && (
                <>
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 opacity-90" />
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl -z-10 opacity-50" />
                </>
            )}

            {/* Header Badge & Tag */}
            <div className="flex justify-between items-start mb-12">
                <div className={`flex flex-col gap-1`}>
                    <div className={`text-[10px] font-black tracking-[0.25em] uppercase px-3 py-1 rounded-lg w-fit
            ${isRecommended ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'}
          `}>
                        {data.tierCode || 'ALPHA'}
                    </div>
                    <div className={`text-[11px] font-bold opacity-40 ml-1 tracking-tight`}>
                        {data.label || 'Standard Kit'}
                    </div>
                </div>

                {isRecommended && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 rounded-2xl shadow-lg shadow-blue-500/20 text-[11px] font-black text-white uppercase tracking-wider">
                        <Sparkles size={14} className="animate-pulse" />
                        Best Value
                    </div>
                )}
            </div>

            <div className="space-y-10 flex-grow relative z-10">
                {/* Camera Section */}
                <div className="group/item">
                    <div className="flex justify-between items-end mb-4 pr-1">
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1 ${isRecommended ? 'text-slate-500' : 'text-slate-400'}`}>Body</span>
                            <button
                                onClick={() => onViewSpecs && onViewSpecs(data.camName, 'camera')}
                                className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                            >
                                <h3 className={`text-2xl md:text-3xl font-black tracking-tighter ${isRecommended ? 'text-white' : 'text-foreground'}`}>
                                    {data.camName}
                                </h3>
                                <FeatureStar featureId={`prod_${data.camName.replace(/\s+/g, '_')}`} />
                            </button>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`text-[14px] font-black tabular-nums ${isRecommended ? 'text-blue-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                {formatVND(data.camPrice)}
                            </span>
                            <button
                                onClick={() => onToggleCompare && onToggleCompare(data.camName, 'camera')}
                                className={`p-2 rounded-xl transition-all ${isCameraSelected
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-blue-500 hover:text-white'
                                    }`}
                            >
                                {isCameraSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                            </button>
                        </div>
                    </div>
                    <p className={`text-[14px] leading-relaxed line-clamp-2 font-medium ${isRecommended ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {data.camDesc}
                    </p>
                </div>

                {/* Refined Divider */}
                <div className="flex items-center gap-4">
                    <div className={`h-px flex-grow ${isRecommended ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/5'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${isRecommended ? 'bg-blue-500/40' : 'bg-slate-200 dark:bg-white/10'}`} />
                    <div className={`h-px flex-grow ${isRecommended ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/5'}`} />
                </div>

                {/* Lens Section */}
                <div className="group/item">
                    <div className="flex justify-between items-end mb-4 pr-1">
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-black uppercase tracking-[0.15em] mb-1 ${isRecommended ? 'text-slate-500' : 'text-slate-400'}`}>Lens</span>
                            <button
                                onClick={() => onViewSpecs && onViewSpecs(data.lensName, 'lens')}
                                className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                            >
                                <h3 className={`text-xl md:text-2xl font-black tracking-tighter ${isRecommended ? 'text-white' : 'text-foreground'}`}>
                                    {data.lensName}
                                </h3>
                                <FeatureStar featureId={`prod_${data.lensName.replace(/\s+/g, '_')}`} />
                            </button>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`text-[14px] font-black tabular-nums ${isRecommended ? 'text-blue-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                {formatVND(data.lensPrice)}
                            </span>
                            <button
                                onClick={() => onToggleCompare && onToggleCompare(data.lensName, 'lens')}
                                className={`p-2 rounded-xl transition-all ${isLensSelected
                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-blue-500 hover:text-white'
                                    }`}
                            >
                                {isLensSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                            </button>
                        </div>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold ${isRecommended ? 'bg-white/5 text-blue-300' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'}`}>
                        {data.lensType}
                    </div>
                </div>
            </div>

            {/* Impactful Total Footer */}
            <div className={`mt-12 pt-10 border-t ${isRecommended ? 'border-white/10' : 'border-slate-100 dark:border-white/5'}`}>
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <div className={`text-[11px] font-black uppercase tracking-[0.2em] ${isRecommended ? 'text-slate-500' : 'text-slate-400'}`}>
                            Total Investment
                        </div>
                        <div className={`text-4xl md:text-5xl font-black tracking-tighter tabular-nums ${isRecommended ? 'text-white' : 'text-foreground'}`}>
                            {formatVND(data.totalPrice || 0)}
                        </div>
                    </div>
                    {isRecommended && (
                        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/40 transform rotate-12 group-hover/card:rotate-0 transition-transform duration-500">
                            <Check size={24} strokeWidth={3} />
                        </div>
                    )}
                </div>

                {isRecommended && (
                    <div className="mt-8 py-4 px-5 rounded-[20px] bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-3 text-[12px] font-bold text-blue-400">
                            <Info size={16} />
                            <span>AI Analysis: Superior dynamic range & focus tracking.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const Sparkles = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);

