import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function ToggleCardBtn({ onClick, icon: Icon, title, desc, active }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full text-left p-4 lg:p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between min-h-[110px] sm:min-h-[120px] lg:min-h-[140px] border hover:shadow-md active:scale-95 group",
                active
                    ? "bg-slate-900 dark:bg-white border-transparent shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)] scale-[1.02]"
                    : "bg-white dark:bg-[#1d1d1f] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 shadow-sm"
            )}
        >
            <div className="flex justify-between items-start w-full mb-3 sm:mb-4">
                <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    active ? "bg-white/10 dark:bg-black/5 text-white dark:text-slate-900" : "bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white group-hover:bg-slate-100 dark:group-hover:bg-white/10"
                )}>
                    {Icon && <Icon strokeWidth={2} size={20} className="sm:w-6 sm:h-6" />}
                </div>
                <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                    active ? "border-white dark:border-slate-900 bg-white dark:bg-slate-900" : "border-slate-300 dark:border-slate-600"
                )}>
                    {active && <div className="w-2 h-2 rounded-full bg-slate-900 dark:bg-white scale-in" />}
                </div>
            </div>
            <div>
                <div className={cn(
                    "text-sm sm:text-base font-bold tracking-tight mb-1 transition-colors",
                    active ? "text-white dark:text-slate-900" : "text-slate-700 dark:text-slate-300"
                )}>
                    {title}
                </div>
                <div className={cn(
                    "text-[10px] sm:text-xs font-medium leading-snug line-clamp-2",
                    active ? "text-slate-300 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"
                )}>
                    {desc}
                </div>
            </div>
        </button>
    );
}
