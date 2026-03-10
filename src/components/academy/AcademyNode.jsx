import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, Crown, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import soundEngine from '@/lib/audio';

export default function AcademyNode({ node, onClick }) {
  const isCompleted = node.status === 'completed';
  const isActive = node.status === 'active';
  const isLocked = node.status === 'locked';
  const isMilestone = node.is_milestone;

  const baseClasses = "relative flex items-center justify-center transition-all duration-500 ease-out outline-none rounded-full group";
  
  const sizeClasses = isMilestone 
    ? "w-24 h-24 sm:w-28 sm:h-28" 
    : "w-[72px] h-[72px] sm:w-[84px] sm:h-[84px]";

  // --- Premium Styling Logic ---
  const getContainerStyles = () => {
    if (isCompleted) {
      return `
        bg-gradient-to-br from-gray-800 to-gray-900 
        border border-gray-700
        shadow-[0_8px_30px_rgb(0,0,0,0.12)]
        hover:shadow-[0_8px_30px_rgba(255,85,0,0.2)]
      `;
    }
    if (isActive) {
      return `
        bg-gradient-to-br from-white to-gray-50
        border-0
      `;
    }
    return `
      bg-gray-50/80 backdrop-blur-sm
      border border-gray-200
      shadow-inner
    `;
  };

  const getIcon = () => {
    const iconProps = {
      className: clsx(
        "transition-all duration-500",
        isMilestone ? "w-10 h-10 sm:w-12 sm:h-12" : "w-8 h-8 sm:w-10 sm:h-10",
        {
          "text-[#FF5500] drop-shadow-[0_0_8px_rgba(255,85,0,0.6)]": (isCompleted || isActive) && !isLocked,
          "text-gray-300": isLocked
        }
      ),
      strokeWidth: isActive || isCompleted ? 2.5 : 2
    };

    if (isLocked) return <Lock {...iconProps} />;
    if (isMilestone) return <Crown {...iconProps} />;
    if (isCompleted) return <CheckCircle2 {...iconProps} className={iconProps.className.replace('text-[#FF5500]', 'text-[#FF5500]')} />;
    return <Star {...iconProps} />;
  };

  return (
    <div className="relative flex flex-col items-center select-none font-sans z-10 w-32">
      
      {/* Outer Glow & Rings for Active State */}
      {isActive && (
        <>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={clsx(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF5500]/20 blur-xl pointer-events-none",
              isMilestone ? "w-40 h-40" : "w-32 h-32"
            )}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className={clsx(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF5500]/30 border-dashed pointer-events-none",
              isMilestone ? "w-[124px] h-[124px]" : "w-[96px] h-[96px]"
            )}
          />
          <div 
            className={clsx(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FF5500] pointer-events-none",
              isMilestone ? "w-[116px] h-[116px]" : "w-[88px] h-[88px]"
            )}
            style={{ boxShadow: '0 0 20px rgba(255,85,0,0.3), inset 0 0 20px rgba(255,85,0,0.1)' }}
          />
        </>
      )}

      {/* Main Node Button */}
      <motion.button
        onClick={() => {
          if (!isLocked) {
             soundEngine.playClick();
             onClick(node);
          }
        }}
        whileHover={!isLocked ? { scale: 1.05, y: -4 } : {}}
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        className={clsx(
          baseClasses, 
          sizeClasses, 
          getContainerStyles(),
          isActive && "shadow-[0_10px_40px_rgba(255,85,0,0.25)]",
          isLocked && "cursor-not-allowed opacity-80",
          !isLocked && "cursor-pointer"
        )}
        aria-label={node.title}
        disabled={isLocked}
      >
        {getIcon()}
        
        {/* Subtle inner reflection for premium glass feel */}
        {isActive && (
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent rounded-t-full pointer-events-none mix-blend-overlay" />
        )}
        {isCompleted && (
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none" />
        )}
      </motion.button>
      
      {/* Exquisite Label */}
      {isActive && (
        <motion.div 
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
           className="absolute top-[calc(100%+24px)] text-center w-[220px] z-30 pointer-events-none"
        >
          <div className="inline-block relative">
            {/* Tooltip Arrow */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#111827] rotate-45 rounded-sm" />
            
            {/* Tooltip Body */}
            <div className="relative bg-[#111827] text-white px-5 py-3 rounded-2xl shadow-[0_10px_30px_rgba(17,24,39,0.5)] border border-gray-800">
              <p className="font-extrabold text-[13px] tracking-wide text-[#FF5500] mb-0.5 uppercase">Current Lesson</p>
              <p className="font-semibold text-[15px] leading-snug">{node.title}</p>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Completed Label (Optional subtlety) */}
      {isCompleted && !isActive && (
        <div className="absolute top-[calc(100%+16px)] text-center w-[160px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
           <span className="bg-gray-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
             {node.title}
           </span>
        </div>
      )}
    </div>
  );
}
