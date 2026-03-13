'use client';

import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, NodeResizer } from 'reactflow';
import { Camera, Laptop, RadioReceiver, Video, RefreshCw, Zap } from 'lucide-react';
import { useLiveStream } from './LiveStreamContext';

const EditableLabel = ({ id, label, subLabel, labelStyle, subLabelStyle }) => {
    const { setNodes } = useReactFlow();
    const [localLabel, setLocalLabel] = useState(label);
    const [localSubLabel, setLocalSubLabel] = useState(subLabel);

    // Sync local state when node data is updated externally (e.g. undo/redo)
    /* eslint-disable react-hooks/set-state-in-effect -- sync from React Flow node data */
    useEffect(() => {
        setLocalLabel(label);
        setLocalSubLabel(subLabel);
    }, [label, subLabel]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleChange = (field, value) => {
        if (field === 'label') setLocalLabel(value);
        if (field === 'subLabel') setLocalSubLabel(value);

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            [field]: value,
                        },
                    };
                }
                return node;
            })
        );
    };

    return (
        <div className="flex flex-col flex-1 min-w-0">
            <input
                type="text"
                value={localLabel}
                onChange={(e) => handleChange('label', e.target.value)}
                className={`bg-transparent outline-none border-none p-0 w-full truncate placeholder-slate-400 nodrag ${labelStyle} hover:bg-black/5 focus:bg-black/5 rounded transition-colors`}
                placeholder="Tên thiết bị..."
            />
            <input
                type="text"
                value={localSubLabel}
                onChange={(e) => handleChange('subLabel', e.target.value)}
                className={`bg-transparent outline-none border-none p-0 w-full truncate placeholder-slate-400/50 nodrag ${subLabelStyle} hover:bg-black/5 focus:bg-black/5 rounded transition-colors font-medium`}
                placeholder="Mô tả phụ..."
            />
        </div>
    );
};


export const CameraNode = ({ id, data, isConnectable, selected }) => {
    return (
        <div className="bg-white p-4 rounded-2xl ring-1 ring-black/[0.08] shadow-[0_4px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 w-full h-full min-w-[220px] min-h-[90px] relative group hover:ring-orange-500/40 hover:shadow-xl transition-all duration-300">
            <NodeResizer minWidth={220} minHeight={90} isVisible={selected} lineClassName="border-orange-500" handleClassName="h-3 w-3 bg-white border-2 border-orange-500 rounded" />

            {/* Input from Mic */}
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-3.5 h-3.5 bg-red-500 border-2 border-white top-[-7px] shadow-sm"
            />

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ring-1 shadow-inner transition-transform group-hover:scale-110 ${data.colorClass}`}>
                <Camera size={28} />
            </div>

            <EditableLabel
                id={id}
                label={data.label}
                subLabel={data.subLabel}
                labelStyle="text-[15px] font-black text-[#1d1d1f] leading-tight tracking-tight"
                subLabelStyle="text-[11px] text-[#86868b] font-bold"
            />

            {/* Output to Capture Card */}
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3.5 h-3.5 bg-orange-500 border-2 border-white bottom-[-7px] shadow-sm"
            />
        </div>
    );
};

export const CaptureCardNode = ({ id, data, isConnectable, selected }) => {
    const { isStreaming } = useLiveStream();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSwitchAngle = () => {
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 800);
    };

    return (
        <div className={`p-4 rounded-2xl ring-2 transition-all duration-500 w-full h-full min-w-[260px] min-h-[90px] flex items-center gap-4 relative group shadow-2xl ${isProcessing ? 'ring-teal-500 scale-[1.02] bg-slate-800' : 'ring-white/10 bg-[#1d1d1f] hover:ring-white/30'}`}>
            <NodeResizer minWidth={260} minHeight={90} isVisible={selected} lineClassName="border-slate-400" handleClassName="h-3 w-3 bg-[#1d1d1f] border-2 border-slate-400 rounded" />

            {/* Icon Left */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg transition-transform duration-500 ${isProcessing ? 'rotate-180 bg-teal-600' : 'bg-slate-800 ring-1 ring-white/10 group-hover:scale-110'}`}>
                <Video size={28} className={isProcessing ? 'animate-spin-slow' : ''} />
            </div>

            {/* Content Right */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
                <EditableLabel
                    id={id}
                    label={data.label}
                    subLabel={data.subLabel}
                    labelStyle="text-[15px] font-black text-white text-left leading-tight tracking-tight"
                    subLabelStyle="text-[11px] text-slate-400 font-bold text-left mb-2 uppercase tracking-widest"
                />
                <button 
                    onClick={handleSwitchAngle}
                    className={`group/btn w-full relative h-8 rounded-lg overflow-hidden transition-all active:scale-95 ${isProcessing ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                >
                    <div className="absolute inset-0 flex items-center justify-center gap-2">
                        {isProcessing ? (
                            <RefreshCw size={14} className="animate-spin" />
                        ) : (
                            <Zap size={14} className="text-amber-400 group-hover/btn:animate-bounce" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isProcessing ? 'ĐANG CHUYỂN...' : 'Chuyển Góc / Xử Lý'}
                        </span>
                    </div>
                </button>
            </div>

            {/* Input Handles for Cameras */}
            <Handle
                type="target"
                position={Position.Top}
                id="cam1"
                style={{ left: '20%' }}
                isConnectable={isConnectable}
                className="w-3.5 h-3.5 bg-orange-500 border-2 border-[#1d1d1f] top-[-7px] shadow-lg"
            />
            <Handle
                type="target"
                position={Position.Top}
                id="cam2"
                style={{ left: '40%' }}
                isConnectable={isConnectable}
                className="w-3.5 h-3.5 bg-blue-500 border-2 border-[#1d1d1f] top-[-7px] shadow-lg"
            />
            <Handle
                type="target"
                position={Position.Top}
                id="cam3"
                style={{ left: '60%' }}
                isConnectable={isConnectable}
                className="w-3.5 h-3.5 bg-teal-500 border-2 border-[#1d1d1f] top-[-7px] shadow-lg"
            />
            <Handle
                type="target"
                position={Position.Top}
                id="cam4"
                style={{ left: '80%' }}
                isConnectable={isConnectable}
                className="w-3.5 h-3.5 bg-indigo-500 border-2 border-[#1d1d1f] top-[-7px] shadow-lg"
            />

            {/* Output Handle to PC */}
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3.5 h-3.5 bg-indigo-500 border-2 border-[#1d1d1f] bottom-[-7px] shadow-lg"
            />
        </div>
    );
};

export const LaptopNode = ({ id, data, isConnectable, selected }) => {
    return (
        <div className={`bg-white p-4 rounded-2xl ring-1 shadow-sm flex items-center gap-4 w-full h-full min-w-[200px] min-h-[80px] relative overflow-hidden group hover:shadow-md transition-all ${data.isMain ? 'ring-indigo-500/30 shadow-[0_8px_20px_rgba(99,102,241,0.1)]' : 'ring-black/5'}`}>
            <NodeResizer minWidth={200} minHeight={80} isVisible={selected} lineClassName={data.isMain ? "border-indigo-500" : "border-slate-400"} handleClassName={`h-3 w-3 bg-white border-2 rounded ${data.isMain ? "border-indigo-500" : "border-slate-400"}`} />

            {data.isMain && <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rotate-45 transform translate-x-8 -translate-y-8 blur-md pointer-events-none"></div>}

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 z-10 ${data.colorClass || 'bg-slate-100 text-[#1d1d1f]'}`}>
                <Laptop size={24} />
            </div>

            <EditableLabel
                id={id}
                label={data.label}
                subLabel={data.subLabel}
                labelStyle="text-[14px] font-bold text-[#1d1d1f] leading-tight"
                subLabelStyle="text-[11px] text-[#86868b] font-medium"
            />

            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className={`w-3 h-3 border-2 border-white top-[-6px] ${data.isMain ? 'bg-indigo-500' : 'bg-slate-400'}`}
            />
        </div>
    );
};

export const MicNode = ({ id, data, isConnectable, selected }) => {
    return (
        <div className="bg-white p-3 rounded-[16px] ring-1 ring-black/5 shadow-md inline-flex items-center gap-3 w-full h-full min-w-[140px] min-h-[48px] relative hover:ring-red-500/50 transition-all pointer-events-auto cursor-grab">
            <NodeResizer minWidth={140} minHeight={48} isVisible={selected} lineClassName="border-red-500" handleClassName="h-3 w-3 bg-white border-2 border-red-500 rounded" />

            <RadioReceiver size={20} className="text-red-500 shrink-0" />

            <EditableLabel
                id={id}
                label={data.label}
                subLabel={data.subLabel}
                labelStyle="text-[12px] font-bold text-[#1d1d1f] leading-tight min-w-[80px]"
                subLabelStyle="text-[10px] text-[#86868b] font-medium"
            />

            {/* Output to Camera */}
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-2.5 h-2.5 bg-red-500 border-2 border-white bottom-[-5px]"
            />
        </div>
    );
};
