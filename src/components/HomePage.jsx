'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BookOpenText, Sparkles, GraduationCap, Video, LayoutDashboard, ArrowRight } from 'lucide-react';

const CARDS = [
  {
    href: '/wiki',
    label: 'Wiki',
    desc: 'Tra cứu thông số, ColorLab, kho sản phẩm Sony',
    icon: BookOpenText,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    href: '/ai',
    label: 'AI Tư vấn',
    desc: 'Gemini gợi ý thiết bị theo nhu cầu của bạn',
    icon: Sparkles,
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    href: '/academy',
    label: 'Academy',
    desc: 'Học bài bản, tích lũy huy hiệu',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    href: '/livestream',
    label: 'Livestream',
    desc: 'Studio diagram, SOP, báo cáo live',
    icon: Video,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    desc: 'Tổng quan và thống kê',
    icon: LayoutDashboard,
    gradient: 'from-slate-600 to-slate-700',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function HomeDashboard() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <motion.div
        className="mb-10 sm:mb-12"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl sm:text-3xl font-black text-[#1d1d1f] tracking-tight mb-2">
          Bảng điều khiển
        </h1>
        <p className="text-slate-600 font-medium">
          Chọn mục dưới đây để khám phá.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {CARDS.map(({ href, label, desc, icon: Icon, gradient }) => (
          <motion.div key={href} variants={item}>
            <Link
              href={href}
              className="group block p-6 rounded-2xl bg-white ring-1 ring-black/[0.06] hover:ring-black/10 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 text-left h-full"
            >
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform`}
              >
                <Icon size={22} />
              </div>
              <h2 className="text-lg font-bold text-[#1d1d1f] tracking-tight mb-1.5">{label}</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{desc}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 group-hover:text-[#1d1d1f] transition-colors">
                Vào
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
