'use client';

import React, { useRef, useEffect } from 'react';
import { useLiveStream } from './LiveStreamContext';
import useLutFilter from '@/hooks/useLutFilter';

export default function LivePreview() {
    const { 
        videoStream, 
        brightness, 
        saturation, 
        isMirror,
        isStreaming
    } = useLiveStream();

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const { applyLut, isLutActive } = useLutFilter(videoRef, canvasRef);

    useEffect(() => {
        if (videoRef.current && videoStream) {
            videoRef.current.srcObject = videoStream;
        }
    }, [videoStream]);

    const filterStyle = {
        filter: `brightness(${brightness}%) saturate(${saturation}%)`,
        transform: isMirror ? 'scaleX(-1)' : 'none',
        transition: 'filter 0.2s ease, transform 0.3s ease'
    };

    return (
        <div className="relative w-full h-full bg-black rounded-[24px] overflow-hidden shadow-2xl border border-white/10 group">
            {!videoStream && !isStreaming && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center mb-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-slate-400 text-[13px] font-medium uppercase tracking-widest">No Signal</p>
                </div>
            )}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isLutActive ? 'hidden' : 'block'}`}
                style={filterStyle}
            />

            <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover ${isLutActive ? 'block' : 'hidden'}`}
                style={filterStyle}
            />
            
            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Live</span>
                </div>
                <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                    <span className="text-white/80 text-[10px] font-bold">1080p 60fps</span>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white/60 text-[10px] font-medium">Preview Engine v1.0</span>
            </div>
        </div>
    );
}
