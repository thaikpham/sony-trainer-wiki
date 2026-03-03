import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7] dark:bg-black w-full">
            <div className="w-full max-w-md mx-auto relative z-10 animate-fade-in p-4 sm:p-0">
                <SignIn appearance={{
                    elements: {
                        rootBox: "w-full",
                        card: "bg-white dark:bg-[#1d1d1f] shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02] dark:ring-white/[0.05] rounded-[24px] overflow-hidden",
                        headerTitle: "text-[#1d1d1f] dark:text-white font-bold",
                        headerSubtitle: "text-[#86868b] dark:text-slate-400",
                        socialButtonsBlockButton: "border border-slate-200 dark:border-white/10 hover:bg-[#F5F5F7] dark:hover:bg-white/5",
                        socialButtonsBlockButtonText: "text-[#1d1d1f] dark:text-white font-semibold",
                        dividerLine: "bg-slate-200 dark:bg-white/10",
                        dividerText: "text-[#86868b] dark:text-slate-500",
                        formFieldLabel: "text-[#1d1d1f] dark:text-white font-semibold",
                        formFieldInput: "bg-white dark:bg-[#2d2d2f] border-slate-200 dark:border-white/10 text-[#1d1d1f] dark:text-white focus:ring-2 focus:ring-teal-500",
                        formButtonPrimary: "bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] hover:bg-black dark:hover:bg-slate-200 shadow-sm",
                        footerActionText: "text-[#86868b] dark:text-slate-400",
                        footerActionLink: "text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold",
                    }
                }} />
            </div>
        </div>
    );
}
