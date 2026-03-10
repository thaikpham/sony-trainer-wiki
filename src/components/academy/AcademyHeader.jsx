import React from 'react';
import { Flame, Trophy, Volume2, VolumeX } from 'lucide-react';

export default function AcademyHeader({ progress, badges, isMuted, onToggleMute }) {
  // Compute dummy streak for now based on recent progress
  const streak = progress && progress.length > 0 ? 1 : 0;
  
  return (
    <div className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm flex items-center justify-between">
      <div className="font-black text-xl text-gray-900 tracking-tight flex items-center">
        <span className="text-[#FF5500] mr-2">SONY</span> <span className="text-gray-400 font-normal ml-1">ACADEMY</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={onToggleMute} 
          className="p-2 text-gray-400 hover:text-gray-800 transition-colors"
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>

        <div className="flex items-center font-semibold text-gray-800 bg-gray-50 px-3 py-1.5 rounded-full ring-1 ring-gray-200">
          <Flame className="w-4 h-4 mr-1.5 text-[#FF5500]" strokeWidth={2.5} />
          <span>{streak}</span>
        </div>
        
        <div className="flex items-center font-semibold text-gray-800 bg-gray-50 px-3 py-1.5 rounded-full ring-1 ring-gray-200">
          <Trophy className="w-4 h-4 mr-1.5 text-gray-700" strokeWidth={2.5} />
          <span>{badges?.length || 0}</span>
        </div>
      </div>
    </div>
  );
}
