import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { academyService } from '@/services/academyService';
import { initializeProgressAction, completeNodeAction, getUserProgressAction, getUserBadgesAction } from '@/app/academy/actions';

export function useAcademy(initialPathId) {
  const { user, isLoaded } = useUser();
  const [activePathId, setActivePathId] = useState(initialPathId);
  const [paths, setPaths] = useState([]);
  const [allNodes, setAllNodes] = useState([]); // ALL nodes across all paths
  const [nodes, setNodes] = useState([]);       // nodes for current active path only
  const [progress, setProgress] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch ALL paths then ALL their nodes
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await academyService.getPaths();
        setPaths(data);

        // Fetch nodes for ALL paths in parallel
        if (data.length > 0) {
          const allNodeResults = await Promise.all(
            data.map(p => academyService.getNodes(p.id))
          );
          const combined = allNodeResults.flat();
          setAllNodes(combined);

          // Set active path
          const firstId = initialPathId || data[0]?.id;
          setActivePathId(firstId);
          const activeNodes = allNodeResults[0] || [];
          setNodes(activeNodes);
        }
      } catch (err) {
        console.error('Failed to fetch paths/nodes', err);
      }
    };
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- only on mount

  // When active path changes, update the nodes slice
  useEffect(() => {
    if (!activePathId || allNodes.length === 0) return;
    const filtered = allNodes.filter(n => n.path_id === activePathId);
    setNodes(filtered);
  }, [activePathId, allNodes]);

  // Fetch progress + badges for the user
  const fetchUserData = useCallback(async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const [fetchedProgress, fetchedBadges] = await Promise.all([
        user ? getUserProgressAction() : Promise.resolve([]),
        user ? getUserBadgesAction() : Promise.resolve([])
      ]);
      setProgress(fetchedProgress);
      setBadges(fetchedBadges);

      // Initialize first node of first path if user has zero progress
      if (user && allNodes.length > 0 && fetchedProgress.length === 0) {
        const firstNode = [...allNodes].sort((a, b) => a.order_index - b.order_index)[0];
        await initializeProgressAction(firstNode.id);
        const newProgress = await getUserProgressAction();
        setProgress(newProgress);
      }
    } catch (err) {
      console.error('fetchUserData Error:', err);
      setError(err?.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, user, allNodes]);

  useEffect(() => {
    if (allNodes.length > 0 && isLoaded) {
      fetchUserData();
    }
  }, [fetchUserData]); // eslint-disable-line react-hooks/exhaustive-deps -- intentional: run when fetchUserData identity changes

  // Enrich a list of nodes with progress state
  const enrichNodes = (nodeList) =>
    nodeList.map(node => {
      const p = progress.find(pr => pr.node_id === node.id);
      return { ...node, status: p ? p.status : 'locked', completedAt: p?.completed_at || null };
    });

  const completeNode = async (nodeId) => {
    if (!user) return;
    try {
      // Find next node across ALL nodes (sorted by path order_index then node order_index)
      const sorted = [...allNodes].sort((a, b) => a.order_index - b.order_index);
      const idx = sorted.findIndex(n => n.id === nodeId);
      const current = sorted[idx];
      const nextNodeId = idx < sorted.length - 1 ? sorted[idx + 1].id : null;

      await completeNodeAction(current.id, nextNodeId, current.is_milestone, current.badge_name);
      await fetchUserData();
    } catch (err) {
      console.error('Failed to complete node', err);
      throw err;
    }
  };

  return {
    paths,
    nodes: enrichNodes(nodes),       // current active path nodes
    allNodes: enrichNodes(allNodes),  // ALL nodes across ALL paths (for the journey map)
    badges,
    loading,
    error,
    activePathId,
    setActivePathId,
    completeNode,
    refreshUserProgress: fetchUserData,
  };
}
