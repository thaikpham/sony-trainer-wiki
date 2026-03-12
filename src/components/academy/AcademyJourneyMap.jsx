'use client';

import { useState, Fragment } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star, Crown, CheckCircle2, ChevronRight } from 'lucide-react';
import AcademyLessonModal from './AcademyLessonModal';
import confetti from 'canvas-confetti';
import soundEngine from '@/lib/audio';

/* ── Color palette per world ─────────────────────────────────────────────── */
const WORLD_COLORS = [
  { bg: 'from-orange-500 to-amber-400',   ring: 'ring-orange-400', dot: '#f97316', label: 'bg-orange-50  text-orange-700 border-orange-200' },
  { bg: 'from-violet-500 to-purple-500',  ring: 'ring-violet-400', dot: '#8b5cf6', label: 'bg-violet-50  text-violet-700 border-violet-200' },
  { bg: 'from-cyan-500   to-sky-400',     ring: 'ring-cyan-400',   dot: '#06b6d4', label: 'bg-cyan-50    text-cyan-700   border-cyan-200'   },
  { bg: 'from-emerald-500 to-teal-400',   ring: 'ring-emerald-400',dot: '#10b981', label: 'bg-emerald-50 text-emerald-700 border-emerald-200'},
  { bg: 'from-rose-500   to-pink-400',    ring: 'ring-rose-400',   dot: '#f43f5e', label: 'bg-rose-50    text-rose-700   border-rose-200'   },
];

/* ── Mini node dot ───────────────────────────────────────────────────────── */
function NodeDot({ node, color, onClick }) {
  const isCompleted = node.status === 'completed';
  const isActive = node.status === 'active';
  const isLocked = node.status === 'locked';
  const isMilestone = node.is_milestone;

  const size = isMilestone ? 'w-14 h-14' : 'w-11 h-11';

  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <motion.button
        onClick={() => { if (!isLocked) { soundEngine.playClick?.(); onClick(node); } }}
        whileHover={!isLocked ? { scale: 1.12, y: -3 } : {}}
        whileTap={!isLocked ? { scale: 0.92 } : {}}
        disabled={isLocked}
        className={`relative flex items-center justify-center rounded-full transition-all duration-300
          ${size}
          ${isCompleted ? 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg' : ''}
          ${isActive ? 'bg-white shadow-xl ring-2' : ''}
          ${isActive ? `ring-[${color.dot}]` : ''}
          ${isLocked ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={isActive ? { boxShadow: `0 0 20px ${color.dot}55`, ring: color.dot } : {}}
        aria-label={node.title}
      >
        {/* Active glow */}
        {isActive && (
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${color.dot}40, transparent 70%)` }}
          />
        )}
        {/* Icon */}
        {isLocked && <Lock className="w-4 h-4 text-gray-300" />}
        {!isLocked && isMilestone && (
          <Crown className={`w-6 h-6 drop-shadow-sm`} style={{ color: isCompleted ? '#FF5500' : color.dot }} />
        )}
        {!isLocked && !isMilestone && isCompleted && (
          <CheckCircle2 className="w-5 h-5 text-[#FF5500]" />
        )}
        {!isLocked && !isMilestone && isActive && (
          <Star className="w-5 h-5" style={{ color: color.dot }} />
        )}
      </motion.button>

      {/* Label */}
      <span className={`text-[10px] font-semibold text-center leading-tight max-w-[80px] px-1.5 py-0.5 rounded-md border ${color.label} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
        {node.title.replace(/^(Trạm \d+:|⚔️|🏆)\s*/i, '')}
      </span>
    </div>
  );
}

/* ── Full Journey Map ─────────────────────────────────────────────────────── */
export default function AcademyJourneyMap({ paths, allNodes, onCompleteNode }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleComplete = async (nodeId) => {
    const node = allNodes.find(n => n.id === nodeId);
    setSelectedNode(null);
    setTimeout(() => {
      if (node?.is_milestone) {
        const end = Date.now() + 2000;
        const colors = ['#FF5500', '#1F2937', '#F3F4F6'];
        const tick = () => {
          if (Date.now() > end) return;
          confetti({ particleCount: 40, spread: 360, origin: { x: Math.random() * 0.6 + 0.2, y: 0.5 }, colors });
          requestAnimationFrame(tick);
        };
        tick();
      } else {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#FF5500', '#1F2937'] });
      }
    }, 300);
    await onCompleteNode(nodeId);
  };

  // Group nodes by path_id, sorted
  const nodesByPath = paths.reduce((acc, p) => {
    acc[p.id] = allNodes
      .filter(n => n.path_id === p.id)
      .sort((a, b) => a.order_index - b.order_index);
    return acc;
  }, {});

  // Count completed overall
  const totalNodes = allNodes.length;
  const completedCount = allNodes.filter(n => n.status === 'completed').length;
  const progressPct = totalNodes > 0 ? Math.round((completedCount / totalNodes) * 100) : 0;

  return (
    <>
      <div className="w-full max-w-5xl mx-auto px-4 py-8">

        {/* ── Overall progress bar ─────────────────────── */}
        <div className="mb-10">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-sm font-bold text-gray-700">Tổng tiến độ hành trình</p>
            <p className="text-sm font-bold text-gray-500">{completedCount} / {totalNodes} <span className="text-gray-400 font-normal">nodes</span></p>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden ring-1 ring-black/5">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF5500] to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-right text-xs text-gray-400 mt-1">{progressPct}% hoàn thành</p>
        </div>

        {/* ── World cards in vertical flow ─────────────── */}
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-100 to-transparent pointer-events-none" />

          <div className="space-y-6">
            {paths.map((path, worldIdx) => {
              const color = WORLD_COLORS[worldIdx % WORLD_COLORS.length];
              const pathNodes = nodesByPath[path.id] || [];
              const pathCompleted = pathNodes.filter(n => n.status === 'completed').length;
              const pathTotal = pathNodes.length;
              const pathPct = pathTotal > 0 ? Math.round((pathCompleted / pathTotal) * 100) : 0;
              const pathActive = pathNodes.some(n => n.status === 'active');
              const pathDone = pathCompleted === pathTotal && pathTotal > 0;

              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: worldIdx * 0.08, type: 'spring', stiffness: 200, damping: 25 }}
                  className="relative pl-16"
                >
                  {/* World indicator dot on the left spine */}
                  <div className={`absolute left-4 top-6 w-7 h-7 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center shadow-md z-10`}>
                    <span className="text-white text-[10px] font-black">{worldIdx + 1}</span>
                  </div>

                  {/* World card */}
                  <div className={`bg-white rounded-3xl ring-1 ring-black/5 shadow-sm overflow-hidden transition-all duration-300 ${pathActive ? 'shadow-md ring-2 ' + color.ring : ''} ${pathDone ? 'opacity-80' : ''}`}>

                    {/* Card header */}
                    <div className={`px-5 py-4 bg-gradient-to-r ${color.bg} flex items-center justify-between`}>
                      <div>
                        <h3 className="text-white font-black text-base leading-snug drop-shadow-sm">{path.title}</h3>
                        {path.description && (
                          <p className="text-white/80 text-xs mt-0.5 leading-snug max-w-[420px] line-clamp-1">{path.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-white/90 text-xs font-semibold">{pathCompleted}/{pathTotal}</span>
                        {pathDone && <CheckCircle2 className="text-white w-5 h-5" />}
                        {pathActive && <Star className="text-white w-4 h-4 animate-pulse" />}
                      </div>
                    </div>

                    {/* Progress bar inside */}
                    <div className="h-1 bg-gray-100">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${color.bg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pathPct}%` }}
                        transition={{ duration: 0.8, delay: worldIdx * 0.1, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Nodes row */}
                    <div className="px-5 py-5 flex items-center gap-4 overflow-x-auto scrollbar-hide">
                      {pathNodes.map((node, ni) => (
                        <Fragment key={node.id}>
                          <NodeDot node={node} color={color} onClick={setSelectedNode} />
                          {ni < pathNodes.length - 1 && (
                            <ChevronRight className="text-gray-200 shrink-0 w-4 h-4" />
                          )}
                        </Fragment>
                      ))}
                      {pathNodes.length === 0 && (
                        <p className="text-gray-300 text-xs italic">Chưa có nodes.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lesson modal */}
      <AcademyLessonModal
        node={selectedNode}
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
        onComplete={handleComplete}
      />
    </>
  );
}
