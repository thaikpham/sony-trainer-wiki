import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { academyService } from '@/services/academyService';

import { initializeProgressAction, completeNodeAction, getUserProgressAction, getUserBadgesAction } from '@/app/academy/actions';

export function useAcademy(initialPathId) {
  const { user, isLoaded } = useUser();
  const [activePathId, setActivePathId] = useState(initialPathId);
  const [paths, setPaths] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [progress, setProgress] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch paths
  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const data = await academyService.getPaths();
        setPaths(data);
        if (!activePathId && data.length > 0) {
          setActivePathId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch paths", err);
      }
    };
    fetchPaths();
  }, [activePathId]);

  // Fetch nodes, progress, badges for selected path
  const fetchGraphData = useCallback(async () => {
    if (!activePathId || !isLoaded) {
      if (!activePathId && isLoaded) setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [fetchedNodes, fetchedProgress, fetchedBadges] = await Promise.all([
        academyService.getNodes(activePathId),
        user ? getUserProgressAction() : Promise.resolve([]),
        user ? getUserBadgesAction() : Promise.resolve([])
      ]);
      
      setNodes(fetchedNodes);
      setProgress(fetchedProgress);
      setBadges(fetchedBadges);
      
      // Initialize first node if user is logged in and has 0 progress
      if (user && fetchedNodes.length > 0 && fetchedProgress.length === 0) {
        await initializeProgressAction(fetchedNodes[0].id);
        const newProgress = await getUserProgressAction();
        setProgress(newProgress);
      }
      
    } catch (err) {
      console.error("fetchGraphData Error:", err);
      setError(err?.message || err?.error_description || JSON.stringify(err) || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [activePathId, isLoaded, user]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Merge node details with progress state
  const enrichedNodes = nodes.map(node => {
     const p = progress.find(pr => pr.node_id === node.id);
     return {
       ...node,
       status: p ? p.status : 'locked',
       completedAt: p ? p.completed_at : null
     };
  });

  const completeNode = async (nodeId) => {
    if (!user) return;
    try {
      const currentNodeIndex = nodes.findIndex(n => n.id === nodeId);
      if (currentNodeIndex === -1) return;
      
      const currentNode = nodes[currentNodeIndex];
      const nextNodeId = currentNodeIndex < nodes.length - 1 ? nodes[currentNodeIndex + 1].id : null;
      
      await completeNodeAction(currentNode.id, nextNodeId, currentNode.is_milestone, currentNode.badge_name);
      // Refresh
      await fetchGraphData();
    } catch (err) {
      console.error("Failed to complete node", err);
      throw err;
    }
  };

  return {
    paths,
    nodes: enrichedNodes,
    badges,
    loading,
    error,
    completeNode,
    refreshUserProgress: fetchGraphData
  };
}
