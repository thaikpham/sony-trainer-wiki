"use client";

import { useState, useEffect } from 'react';
import { useAcademy } from '@/hooks/useAcademy';
import AcademyJourneyMap from '@/components/academy/AcademyJourneyMap';
import { Loader2, Flame, Trophy, Volume2, VolumeX } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import soundEngine from '@/lib/audio';

export default function AcademyPage() {
  const { paths, allNodes, badges, progress, loading, error, completeNode, refreshUserProgress } = useAcademy();
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const handleFirstInteraction = () => {
      soundEngine.init?.();
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted?.(next);
  };

  const completedCount = allNodes?.filter(n => n.status === 'completed').length ?? 0;
  const streak = completedCount > 0 ? 1 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#FF5500] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-red-600 p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Có lỗi xảy ra</h2>
        <p>{error}</p>
        <button onClick={refreshUserProgress} className="mt-4 px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600 transition-colors">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="w-full pb-24">
      {/* Academy sub-bar */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between sticky top-[60px] z-30">
        <p className="text-sm font-bold text-gray-700">
          🎓 <span className="text-gray-900">Sony Academy</span>
          <span className="ml-2 text-gray-400 font-normal">— Lộ trình tự học Nhiếp Ảnh &amp; Làm Phim</span>
        </p>
        <div className="flex items-center gap-3">
          <button onClick={toggleMute} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Toggle Sound">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1 rounded-full ring-1 ring-gray-200">
            <Flame className="w-3.5 h-3.5 text-[#FF5500]" strokeWidth={2.5} />
            <span>{streak}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1 rounded-full ring-1 ring-gray-200">
            <Trophy className="w-3.5 h-3.5 text-gray-600" strokeWidth={2.5} />
            <span>{badges?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Page content */}
      <main>
        <SignedOut>
          <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-100">
              <span className="text-4xl">📸</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Sony Academy</h2>
            <p className="text-gray-500 font-medium mb-8 leading-relaxed">Đăng nhập để theo dõi tiến độ, mở khóa bài học và nhận huy hiệu nhiếp ảnh.</p>
            <SignInButton forceRedirectUrl="/academy">
              <button className="w-full py-4 bg-gray-900 hover:bg-gray-800 transition-all text-white font-bold rounded-xl shadow-md text-lg tracking-wide">
                Đăng nhập để bắt đầu học
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          {paths.length > 0 && allNodes.length > 0 ? (
            <AcademyJourneyMap
              paths={paths}
              allNodes={allNodes}
              onCompleteNode={completeNode}
            />
          ) : (
            <div className="flex flex-col items-center justify-center mt-32 text-gray-400">
              <div className="text-6xl mb-4">🚧</div>
              <p className="font-medium text-lg">Chưa có nội dung. Quay lại sau nhé!</p>
            </div>
          )}
        </SignedIn>
      </main>
    </div>
  );
}
