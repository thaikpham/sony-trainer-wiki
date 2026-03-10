"use client";

import React, { useState, useEffect } from 'react';
import { useAcademy } from '@/hooks/useAcademy';
import AcademyHeader from '@/components/academy/AcademyHeader';
import AcademyMap from '@/components/academy/AcademyMap';
import { Loader2 } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import soundEngine from '@/lib/audio';

export default function AcademyPage() {
  const { paths, nodes, badges, progress, loading, error, completeNode, refreshUserProgress } = useAcademy();
  const [isMuted, setIsMuted] = useState(true);

  // Allow clicking on body to initialize audio context securely
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundEngine.init();
      window.removeEventListener('click', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, []);

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-[#FF5500] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-600 p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p>{error}</p>
        <button onClick={refreshUserProgress} className="mt-4 px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600 transition-colors">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#FF5500]/20 pb-20">
      <AcademyHeader progress={progress} badges={badges} isMuted={isMuted} onToggleMute={toggleMute} />

      <main className="w-full">
         <SignedOut>
            <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-100">
                 <span className="text-4xl text-gray-800">📸</span>
               </div>
               <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Sony Academy</h2>
               <p className="text-gray-500 font-medium mb-8 leading-relaxed">Sign in to track your progress, unlock masterclasses, and earn specialized photography badges.</p>
               <SignInButton forceRedirectUrl="/academy">
                 <button className="w-full py-4 bg-gray-900 hover:bg-gray-800 transition-all text-white font-bold rounded-xl shadow-md text-lg tracking-wide">
                   Sign In to Start Learning
                 </button>
               </SignInButton>
            </div>
         </SignedOut>

         <SignedIn>
            {paths.length > 0 && nodes.length > 0 ? (
               <AcademyMap nodes={nodes} onCompleteNode={completeNode} />
            ) : (
               <div className="flex flex-col items-center justify-center mt-32 text-gray-500">
                  <div className="text-6xl mb-4">🚧</div>
                  <p className="font-medium text-lg">No paths available yet. Check back soon!</p>
               </div>
            )}
         </SignedIn>
      </main>
    </div>
  );
}
