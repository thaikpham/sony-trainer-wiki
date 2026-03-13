'use client';

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
        position: { x: 50, y: 20 },
        data: { label: 'Sony C80', subLabel: 'Microphone (XLR)' },
        draggable: true,
    },
    {
        id: 'audio-interface',
        type: 'capture',
        position: { x: 250, y: 20 },
        data: { label: 'Elgato Wave XLR', subLabel: 'Audio Interface' },
        draggable: true,
    },
    // --- Camera Nodes (Middle-Top) ---
    {
        id: 'cam1',
        type: 'camera',
        position: { x: 50, y: 200 },
        data: {
            label: 'Camera 01',
            subLabel: 'Cận - Talking Head',
            colorClass: 'bg-orange-50 text-orange-600 ring-orange-500/20'
        },
    },
    {
        id: 'cam2',
        type: 'camera',
        position: { x: 300, y: 200 },
        data: {
            label: 'Camera 02',
            subLabel: 'Toàn - Host & Guest',
            colorClass: 'bg-blue-50 text-blue-600 ring-blue-500/20'
        },
    },
    {
        id: 'cam3',
        type: 'camera',
        position: { x: 550, y: 200 },
        data: {
            label: 'Camera 03',
            subLabel: 'Top-down - Review',
            colorClass: 'bg-teal-50 text-teal-600 ring-teal-500/20'
        },
    },
    {
        id: 'cam4',
        type: 'camera',
        position: { x: 800, y: 200 },
        data: {
            label: 'Camera 04',
            subLabel: 'Góc phụ / Smartphone',
            colorClass: 'bg-indigo-50 text-indigo-600 ring-indigo-500/20'
        },
    },
    // --- Capture Hub Node (Middle) ---
    {
        id: 'hub1',
        type: 'capture',
        position: { x: 350, y: 420 },
        data: { label: 'Elgato Cam Link Pro', subLabel: 'PCIe Capture Card' },
    },
    // --- Control Node ---
    {
        id: 'streamdeck',
        type: 'capture',
        position: { x: 100, y: 620 },
        data: { label: 'Elgato Stream Deck', subLabel: 'Controller (USB)' },
    },
    // --- Computer Nodes (Bottom) ---
    {
        id: 'pc1',
        type: 'laptop',
        position: { x: 350, y: 620 },
        data: {
            label: 'PC Live Stream',
            subLabel: '(Trung tâm vận hành)',
            colorClass: 'bg-indigo-50 text-indigo-600 ring-indigo-500/20',
            isMain: true
        },
    }
];

// Vertical Flow Edges
const initialEdges = [
    {
        id: 'e-mic-audio',
        source: 'mic1',
        target: 'audio-interface',
        type: 'editable',
        animated: true,
        data: { label: 'XLR Cable' },
        style: { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' }
    },
    {
        id: 'e-audio-pc',
        source: 'audio-interface',
        target: 'pc1',
        type: 'editable',
        animated: true,
        data: { label: 'USB' },
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
        data: { label: 'HDMI' },
        style: { stroke: '#14b8a6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#14b8a6' },
    },
    {
        id: 'e-cam4-hub',
        source: 'cam4',
        target: 'hub1',
        targetHandle: 'cam4',
        type: 'editable',
        animated: true,
        data: { label: 'HDMI' },
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
    },
    {
        id: 'e-streamdeck-pc',
        source: 'streamdeck',
        target: 'pc1',
        type: 'editable',
        animated: true,
        data: { label: 'USB' },
        style: { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
    },
    {
        id: 'e-hub-pc1',
        source: 'hub1',
        target: 'pc1',
        type: 'editable',
        animated: true,
        data: { label: 'PCIe Slot' },
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
        <div className="w-full h-[600px] lg:h-[750px] rounded-[32px] overflow-hidden bg-transparent border-t lg:border-t-0 border-black/5 relative z-0" ref={reactFlowWrapper}>
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
                nodesDraggable={true}
                nodesConnectable={false}
                elementsSelectable={true}
                zoomOnScroll={true}
                panOnDrag={true}
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
