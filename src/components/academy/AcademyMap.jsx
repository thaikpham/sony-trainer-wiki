import React, { useState } from 'react';
import AcademyNode from './AcademyNode';
import AcademyLessonModal from './AcademyLessonModal';
import confetti from 'canvas-confetti';

export default function AcademyMap({ nodes, onCompleteNode }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleComplete = async (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    setSelectedNode(null);
    
    // Wait for modal to close before showing celebration
    setTimeout(() => {
      if (node?.is_milestone) {
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100, colors: ['#FF5500', '#1F2937', '#F3F4F6'] };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
      } else {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF5500', '#1F2937', '#D1D5DB']
        });
      }
    }, 300);

    await onCompleteNode(nodeId);
  };

  // Reverse nodes so start is at bottom
  const displayNodes = [...nodes].reverse();

  // Winding path logic
  const getOffset = (index) => {
    const phase = (index % 8) / 8 * Math.PI * 2;
    return Math.sin(phase) * 80; // offset in px
  };

  return (
    <div className="relative w-full py-16 flex flex-col items-center justify-end overflow-x-hidden min-h-[calc(100vh-100px)]">
      
      {/* Decorate background to feel like a sleek technical grid */}
      <div className="absolute inset-0 bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-xl mx-auto pb-10">
        
        {/* Draw a fake path line behind using SVG */}
        <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none z-0 overflow-visible flex justify-center">
            <svg width="200" height="100%" className="-translate-x-[200px]" preserveAspectRatio="none">
               <defs>
                 <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#FF5500" stopOpacity="0.8" />
                   <stop offset="30%" stopColor="#e5e7eb" stopOpacity="0.8" />
                   <stop offset="100%" stopColor="#e5e7eb" stopOpacity="0.3" />
                 </linearGradient>
                 <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                   <feGaussianBlur stdDeviation="8" result="blur" />
                   <feComposite in="SourceGraphic" in2="blur" operator="over" />
                 </filter>
               </defs>
               
               {/* Glowing Background Line */}
               <path 
                 d={`M 100 0 L 100 10000`} 
                 stroke="#FF5500" 
                 strokeWidth="10" 
                 strokeOpacity="0.2"
                 filter="url(#glow)"
                 fill="none" 
               />
               {/* Core Line */}
               <path 
                 d={`M 100 0 L 100 10000`} 
                 stroke="url(#lineGradient)" 
                 strokeWidth="6" 
                 strokeLinecap="round" 
                 fill="none" 
               />
            </svg>
        </div>

        {displayNodes.map((node, i) => {
          // logical index from start (0 is first node, rendered last)
          const logicalIndex = nodes.length - 1 - i;
          const translateX = getOffset(logicalIndex);
          
          return (
            <div 
              key={node.id} 
              // We use negative margin top to overlap the blocks slightly like a condensed map
              className="relative flex justify-center w-full mt-[-20px] sm:mt-[-10px] pb-[60px]"
              style={{ transform: `translateX(${translateX}px)` }}
            >
              <AcademyNode node={node} onClick={handleNodeClick} />
            </div>
          );
        })}
      </div>

      <AcademyLessonModal 
        node={selectedNode} 
        isOpen={!!selectedNode} 
        onClose={() => setSelectedNode(null)} 
        onComplete={handleComplete} 
      />
    </div>
  );
}
