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
        position: { x: 100, y: 50 },
        data: { label: 'Microphone', subLabel: 'Thu âm giọng nói' },
        draggable: false,
    },
    // --- Camera Nodes (Middle-Top) ---
    {
        id: 'cam1',
        type: 'camera',
        position: { x: 100, y: 200 },
        data: {
            label: 'Camera-01',
            subLabel: 'Cam Toàn - Host & KOL',
            colorClass: 'bg-orange-50 text-orange-600 ring-orange-500/20'
        },
        draggable: false,
    },
    {
        id: 'cam2',
        type: 'camera',
        position: { x: 350, y: 200 },
        data: {
            label: 'Camera-02',
            subLabel: 'Cam Trung - Talking Head',
            colorClass: 'bg-blue-50 text-blue-600 ring-blue-500/20'
        },
        draggable: false,
    },
    {
        id: 'cam3',
        type: 'camera',
        position: { x: 600, y: 200 },
        data: {
            label: 'Camera-03',
            subLabel: 'Cam Cận - Sản phẩm',
            colorClass: 'bg-teal-50 text-teal-600 ring-teal-500/20'
        },
        draggable: false,
    },
    // --- Capture Hub Node (Middle) ---
    {
        id: 'hub1',
        type: 'capture',
        position: { x: 350, y: 380 },
        data: { label: 'Capture Card', subLabel: '(Elgato / Black Magic)' },
        draggable: false,
    },
    // --- Computer Nodes (Bottom) ---
    {
        id: 'pc1',
        type: 'laptop',
        position: { x: 350, y: 550 },
        data: {
            label: 'Live-Stream PC',
            subLabel: '(Trung tâm vận hành)',
            colorClass: 'bg-indigo-50 text-indigo-600 ring-indigo-500/20',
            isMain: true
        },
        draggable: false,
    }
];

// Vertical Flow Edges
const initialEdges = [
    {
        id: 'e-mic-cam1',
        source: 'mic1',
        target: 'cam1',
        type: 'editable',
        animated: true,
        data: { label: 'Hotshoe / XLR' },
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
        style: { stroke: '#f97316', strokeWidth: 2 },
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
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    },
    {
        id: 'e-cam3-hub',
        source: 'cam3',
        target: 'hub1',
        targetHandle: 'cam3',
        type: 'editable',
        animated: true,
        data: { label: 'Micro HDMI' },
        style: { stroke: '#14b8a6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#14b8a6' },
    },
    {
        id: 'e-hub-pc1',
        source: 'hub1',
        target: 'pc1',
        type: 'editable',
        animated: true,
        data: { label: 'Type-C / USB 3.0' },
        style: { stroke: '#6366f1', strokeWidth: 3 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
    }
];

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

    return (
        <div className="w-full h-full min-h-[550px] lg:min-h-[700px] rounded-[32px] overflow-hidden bg-transparent border-t lg:border-t-0 border-black/5 relative z-0" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{ padding: 0.15 }}
                minZoom={0.3}
                maxZoom={1.5}
                className="custom-react-flow-theme"
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={false}
                zoomOnScroll={false}
                panOnDrag={false}
            >
                <Background color="#86868b" gap={20} size={1} opacity={0.25} />
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
