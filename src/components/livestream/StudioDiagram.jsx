import React, { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    MarkerType,
    ReactFlowProvider
} from 'reactflow';
import { Plus, Camera, Laptop, RadioReceiver, Video } from 'lucide-react';
import 'reactflow/dist/style.css';

// Import our custom UI nodes and edges
import { CameraNode, CaptureCardNode, LaptopNode, MicNode } from './CustomNodes';
import { EditableEdge } from './CustomEdges';

// Vertical Flow Nodes
const initialNodes = [
    // --- Audio Source Node (Top) ---
    {
        id: 'mic1',
        type: 'mic',
        position: { x: 350, y: 50 },
        data: { label: 'Sony ECM-G1', subLabel: 'Gắn chui mic camera chính' },
    },
    // --- Camera Nodes (Middle-Top) ---
    {
        id: 'cam1',
        type: 'camera',
        position: { x: 100, y: 200 },
        data: {
            label: 'Alpha 7 IV + 28-70 GM',
            subLabel: 'Cam Cận (Sản Phẩm)',
            colorClass: 'bg-orange-50 text-orange-600 ring-orange-500/20'
        },
    },
    {
        id: 'cam2',
        type: 'camera',
        position: { x: 350, y: 200 },
        data: {
            label: 'FX30 + 12-24 G',
            subLabel: 'Cam Chính (Khách/Chủ)',
            colorClass: 'bg-blue-50 text-blue-600 ring-blue-500/20'
        },
    },
    {
        id: 'cam3',
        type: 'camera',
        position: { x: 600, y: 200 },
        data: {
            label: 'Sony ZV-E10L',
            subLabel: 'Cam Cận (Sản Phẩm)',
            colorClass: 'bg-teal-50 text-teal-600 ring-teal-500/20'
        },
    },
    // --- Capture Hub Node (Middle) ---
    {
        id: 'hub1',
        type: 'capture',
        position: { x: 350, y: 380 },
        data: { label: 'Blackmagic ATEM', subLabel: '(Hoặc Elgato Camlink 4K)' },
    },
    // --- Computer Nodes (Bottom) ---
    {
        id: 'pc1',
        type: 'laptop',
        position: { x: 350, y: 550 },
        data: {
            label: 'Laptop + Tiktok Live Studio',
            subLabel: 'Máy chính phụ trách Stream',
            colorClass: 'bg-indigo-50 text-indigo-600 ring-indigo-500/20',
            isMain: true
        },
    }
];

// Vertical Flow Edges
const initialEdges = [
    {
        id: 'e-mic-cam2',
        source: 'mic1',
        target: 'cam2',
        type: 'editable',
        animated: true,
        data: { label: 'Hotshoe' },
        style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '4 4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
    },
    {
        id: 'e-cam1-hub',
        source: 'cam1',
        target: 'hub1',
        targetHandle: 'cam1',
        type: 'editable',
        animated: true,
        data: { label: 'HDMI' },
        style: { stroke: '#f97316', strokeWidth: 2, cursor: 'pointer' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
    },
    {
        id: 'e-cam2-hub',
        source: 'cam2',
        target: 'hub1',
        targetHandle: 'cam2',
        type: 'editable',
        animated: true,
        data: { label: 'HDMI' },
        style: { stroke: '#3b82f6', strokeWidth: 2, cursor: 'pointer' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    },
    {
        id: 'e-cam3-hub',
        source: 'cam3',
        target: 'hub1',
        targetHandle: 'cam2',
        type: 'editable',
        animated: true,
        data: { label: 'Micro HDMI' },
        style: { stroke: '#14b8a6', strokeWidth: 2, cursor: 'pointer' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#14b8a6' },
    },
    {
        id: 'e-hub-pc1',
        source: 'hub1',
        target: 'pc1',
        type: 'editable',
        animated: true,
        data: { label: 'Type-C / USB 3.0' },
        style: { stroke: '#6366f1', strokeWidth: 3, cursor: 'pointer' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
    }
];

// Helper to generate unique IDs
let idList = 0;
const getId = () => `node_v_${idList++}`;

function DiagramCanvas() {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);

    // Register our custom UI component blueprints
    const nodeTypes = useMemo(() => ({
        camera: CameraNode,
        capture: CaptureCardNode,
        laptop: LaptopNode,
        mic: MicNode
    }), []);

    const edgeTypes = useMemo(() => ({
        editable: EditableEdge,
    }), []);

    // Handlers for interacting with diagram state
    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    const onConnect = useCallback(
        (params) => setEdges((eds) =>
            addEdge({ ...params, type: 'editable', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' } }, eds)
        ),
        []
    );

    // --- Reconnect Handlers ---
    const edgeReconnectSuccessful = useRef(true);

    const onReconnectStart = useCallback(() => {
        edgeReconnectSuccessful.current = false;
    }, []);

    const onReconnect = useCallback((oldEdge, newConnection) => {
        edgeReconnectSuccessful.current = true;
        setEdges((els) => els.map(e => e.id === oldEdge.id
            ? { ...e, ...newConnection }
            : e
        ));
    }, []);

    const onReconnectEnd = useCallback((_, edge) => {
        if (!edgeReconnectSuccessful.current) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }
        edgeReconnectSuccessful.current = true;
    }, []);

    // --- Toolbar Handlers ---
    const addNode = (type, label, iconType) => {
        let colorClass = 'bg-slate-100 text-[#1d1d1f]';
        if (type === 'camera') colorClass = 'bg-blue-50 text-blue-600 ring-blue-500/20';

        const newNode = {
            id: getId(),
            type,
            position: {
                x: 350 + Math.random() * 50,
                y: 100 + Math.random() * 50,
            },
            data: { label, subLabel: 'Thiết bị mới', colorClass },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    return (
        <div className="w-full h-full min-h-[550px] lg:min-h-[700px] rounded-[32px] overflow-hidden bg-transparent border-t lg:border-t-0 border-black/5 relative z-0" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onReconnect={onReconnect}
                onReconnectStart={onReconnectStart}
                onReconnectEnd={onReconnectEnd}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                deleteKeyCode={['Backspace', 'Delete']}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                minZoom={0.3}
                maxZoom={1.5}
                className="custom-react-flow-theme"
            >
                <Background color="#86868b" gap={20} size={1} opacity={0.25} />
                <Controls
                    className="bg-white shadow-lg border-none rounded-xl overflow-hidden fill-[#1d1d1f]"
                    showInteractive={false}
                />

                {/* --- Floating Toolbar --- */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-lg ring-1 ring-black/5 flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mr-1 hidden sm:block">Toolbar</span>

                    <button onClick={() => addNode('camera', 'Camera Mới')} className="group flex items-center gap-2 px-3 py-2 bg-[#F5F5F7] hover:bg-orange-50 rounded-xl transition-colors ring-1 ring-transparent hover:ring-orange-500/20 focus:outline-none">
                        <Camera size={16} className="text-slate-500 group-hover:text-orange-500 transition-colors" />
                        <span className="text-[12px] font-bold text-[#1d1d1f] hidden md:block">Camera</span>
                    </button>

                    <button onClick={() => addNode('mic', 'Micro Mới')} className="group flex items-center gap-2 px-3 py-2 bg-[#F5F5F7] hover:bg-red-50 rounded-xl transition-colors ring-1 ring-transparent hover:ring-red-500/20 focus:outline-none">
                        <RadioReceiver size={16} className="text-slate-500 group-hover:text-red-500 transition-colors" />
                        <span className="text-[12px] font-bold text-[#1d1d1f] hidden md:block">Audio</span>
                    </button>

                    <button onClick={() => addNode('capture', 'Capture Card')} className="group flex items-center gap-2 px-3 py-2 bg-[#F5F5F7] hover:bg-indigo-50 rounded-xl transition-colors ring-1 ring-transparent hover:ring-indigo-500/20 focus:outline-none">
                        <Video size={16} className="text-slate-500 group-hover:text-indigo-500 transition-colors" />
                        <span className="text-[12px] font-bold text-[#1d1d1f] hidden md:block">Capture</span>
                    </button>

                    <button onClick={() => addNode('laptop', 'Laptop Mới')} className="group flex items-center gap-2 px-3 py-2 bg-[#F5F5F7] hover:bg-teal-50 rounded-xl transition-colors ring-1 ring-transparent hover:ring-teal-500/20 focus:outline-none">
                        <Laptop size={16} className="text-slate-500 group-hover:text-teal-500 transition-colors" />
                        <span className="text-[12px] font-bold text-[#1d1d1f] hidden md:block">PC</span>
                    </button>
                </div>

                <div className="absolute bottom-4 left-4 z-10 hidden sm:block">
                    <div className="bg-white/80 backdrop-blur-xl px-3 py-1.5 rounded-lg shadow-sm ring-1 ring-black/5 flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span>Drag nodes or connections. Select & press Delete to remove wires.</span>
                    </div>
                </div>
            </ReactFlow>
        </div>
    );
}

// Wrap in ReactFlowProvider to allow child nodes to use `useReactFlow` hook for editing text.
export default function StudioDiagram() {
    return (
        <ReactFlowProvider>
            <DiagramCanvas />
        </ReactFlowProvider>
    );
}
