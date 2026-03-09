import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7] w-full">
            <div className="w-full max-w-md mx-auto relative z-10 animate-fade-in p-4 sm:p-0">
                <SignIn appearance={{
                    elements: {
                        rootBox: "w-full",
                        card: "bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.02] rounded-[24px] overflow-hidden",
                        headerTitle: "text-[#1d1d1f] font-bold",
                        headerSubtitle: "text-[#86868b]",
                        socialButtonsBlockButton: "border border-slate-200 hover:bg-[#F5F5F7]",
                        socialButtonsBlockButtonText: "text-[#1d1d1f] font-semibold",
                        dividerLine: "bg-slate-200",
                        dividerText: "text-[#86868b]",
                        formFieldLabel: "text-[#1d1d1f] font-semibold",
                        formFieldInput: "bg-white border-slate-200 text-[#1d1d1f] focus:ring-2 focus:ring-teal-500",
                        formButtonPrimary: "bg-[#1d1d1f] text-white hover:bg-black shadow-sm",
                        footerActionText: "text-[#86868b]",
                        footerActionLink: "text-teal-600 hover:text-teal-700 font-bold",
                    }
                }} />
            </div>
        </div>
    );
}
