'use client';

import { SignIn } from '@clerk/nextjs';
import { Aperture } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Cột trái: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1d1d1f] text-white flex-col justify-center px-12 xl:px-20">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Aperture className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Sony Training Wiki</span>
          </div>
          <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight mb-6">
            Đào tạo sản phẩm Sony.
            <br />
            <span className="text-white/80">Một nền tảng.</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10">
            Tra cứu thông số, AI tư vấn, Academy và Livestream studio. Đăng nhập bằng tài khoản Google để truy cập.
          </p>
          <ul className="space-y-3 text-white/60 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Wiki & ColorLab
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              AI Tư vấn (Gemini)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Academy & Huy hiệu
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Livestream SOP & Báo cáo
            </li>
          </ul>
        </div>
      </div>

      {/* Cột phải: Clerk Sign In (Gmail / Google) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#F5F5F7] p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Aperture className="w-8 h-8 text-[#1d1d1f]" />
            <span className="text-lg font-bold text-[#1d1d1f]">Sony Training Wiki</span>
          </div>
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04] rounded-[24px] overflow-hidden w-full',
                headerTitle: 'text-[#1d1d1f] font-bold text-xl',
                headerSubtitle: 'text-[#86868b]',
                socialButtonsBlockButton: 'border border-slate-200 hover:bg-slate-50 text-[#1d1d1f] font-semibold',
                socialButtonsBlockButtonText: 'font-semibold',
                dividerLine: 'bg-slate-200',
                dividerText: 'text-[#86868b]',
                formFieldLabel: 'text-[#1d1d1f] font-semibold',
                formFieldInput: 'bg-white border-slate-200 text-[#1d1d1f] focus:ring-2 focus:ring-blue-500',
                formButtonPrimary: 'bg-[#1d1d1f] text-white hover:bg-black',
                footerActionText: 'text-[#86868b]',
                footerActionLink: 'text-blue-600 hover:text-blue-700 font-semibold',
              },
              variables: {
                colorPrimary: '#1d1d1f',
                colorText: '#1d1d1f',
                colorTextSecondary: '#86868b',
              },
            }}
            fallbackRedirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
}
