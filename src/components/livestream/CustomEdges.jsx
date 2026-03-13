'use client';

import React, { useState, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from 'reactflow';

export const EditableEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
}) => {
    const { setEdges } = useReactFlow();
    const [localLabel, setLocalLabel] = useState(data?.label || '');

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    // Keep state synced if the edge label is updated externally (e.g. from undo/redo)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalLabel(data?.label || '');
    }, [data?.label]);

    const onLabelChange = (e) => {
        const newValue = e.target.value;
        setLocalLabel(newValue);

        setEdges((eds) =>
            eds.map((edge) => {
                if (edge.id === id) {
                    return {
                        ...edge,
                        data: {
                            ...edge.data,
                            label: newValue,
                        }
                    };
                }
                return edge;
            })
        );
    };

    return (
        <>
            <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        // Required for pointer events to work inside EdgeLabelRenderer
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <input
                        type="text"
                        value={localLabel}
                        placeholder="Tên dây cáp..."
                        onChange={onLabelChange}
                        className="bg-[#F5F5F7]/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-[#86868b] outline-none border border-transparent focus:border-indigo-500/50 hover:bg-white text-center shadow-sm w-[100px] transition-colors"
                        style={{ cursor: 'text' }}
                    />
                </div>
            </EdgeLabelRenderer>
        </>
    );
};
