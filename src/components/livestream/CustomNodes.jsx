import React, { useState, useEffect } from 'react';
import { Handle, Position, useReactFlow, NodeResizer } from 'reactflow';
import { Camera, Laptop, RadioReceiver, Video } from 'lucide-react';

const EditableLabel = ({ id, label, subLabel, labelStyle, subLabelStyle }) => {
    const { setNodes } = useReactFlow();
    const [localLabel, setLocalLabel] = useState(label);
    const [localSubLabel, setLocalSubLabel] = useState(subLabel);

    // Sync local state when node data is updated externally (e.g. undo/redo)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalLabel(label);
        setLocalSubLabel(subLabel);
    }, [label, subLabel]);

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
                className={`bg-transparent outline-none border-none p-0 w-full truncate placeholder-slate-400/50 nodrag ${subLabelStyle} hover:bg-black/5 focus:bg-black/5 rounded transition-colors`}
                placeholder="Mô tả phụ..."
            />
        </div>
    );
};


export const CameraNode = ({ id, data, isConnectable, selected }) => {
    return (
        <div className="bg-white p-4 rounded-2xl ring-1 ring-black/5 shadow-sm flex items-center gap-4 w-full h-full min-w-[200px] min-h-[80px] relative group hover:ring-orange-500/50 transition-all">
            <NodeResizer minWidth={200} minHeight={80} isVisible={selected} lineClassName="border-orange-500" handleClassName="h-3 w-3 bg-white border-2 border-orange-500 rounded" />

            {/* Input from Mic */}
            <Handle
                type="target"
                position={Position.Top}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-red-500 border-2 border-white top-[-6px]"
            />

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ring-1 ${data.colorClass}`}>
                <Camera size={24} />
            </div>

            <EditableLabel
                id={id}
                label={data.label}
                subLabel={data.subLabel}
                labelStyle="text-[14px] font-bold text-[#1d1d1f] leading-tight"
                subLabelStyle="text-[11px] text-[#86868b] font-medium"
            />

            {/* Output to Capture Card */}
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-orange-500 border-2 border-white bottom-[-6px]"
            />
        </div>
    );
};

export const CaptureCardNode = ({ id, data, isConnectable, selected }) => {
    return (
        <div className="bg-[#1d1d1f] p-4 rounded-2xl ring-2 ring-white/20 shadow-xl w-full h-full min-w-[240px] min-h-[80px] flex items-center gap-4 relative group hover:ring-indigo-500/50 transition-all">
            <NodeResizer minWidth={240} minHeight={80} isVisible={selected} lineClassName="border-slate-400" handleClassName="h-3 w-3 bg-[#1d1d1f] border-2 border-slate-400 rounded" />

            {/* Icon Left */}
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white shrink-0 ring-1 ring-white/10">
                <Video size={24} />
            </div>

            {/* Content Right */}
            <div className="flex flex-col flex-1 min-w-0 justify-center">
                <EditableLabel
                    id={id}
                    label={data.label}
                    subLabel={data.subLabel}
                    labelStyle="text-[14px] font-black text-white text-left leading-tight"
                    subLabelStyle="text-[11px] text-slate-400 font-bold text-left mb-1.5"
                />
                <div className="w-max bg-slate-800/80 rounded p-1 px-2 text-[9px] font-bold text-slate-300 uppercase tracking-widest ring-1 ring-white/10 whitespace-nowrap">
                    Xử Lý Hình / Chuyển Góc
                </div>
            </div>

            {/* Input Handles for Cameras */}
            <Handle
                type="target"
                position={Position.Top}
                id="cam1"
                style={{ left: '20%' }}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-indigo-500 border-2 border-[#1d1d1f] top-[-6px]"
            />
            <Handle
                type="target"
                position={Position.Top}
                id="cam2"
                style={{ left: '40%' }}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-indigo-500 border-2 border-[#1d1d1f] top-[-6px]"
            />
            <Handle
                type="target"
                position={Position.Top}
                id="cam3"
                style={{ left: '60%' }}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-indigo-500 border-2 border-[#1d1d1f] top-[-6px]"
            />
            <Handle
                type="target"
                position={Position.Top}
                id="cam4"
                style={{ left: '80%' }}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-indigo-500 border-2 border-[#1d1d1f] top-[-6px]"
            />

            {/* Output Handle to PC */}
            <Handle
                type="source"
                position={Position.Bottom}
                isConnectable={isConnectable}
                className="w-3 h-3 bg-indigo-500 border-2 border-[#1d1d1f] bottom-[-6px]"
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
