import { supabase } from '@/lib/supabaseClient';

export const academyService = {
  // Get all paths, ordered by order_index
  async getPaths() {
    const { data, error } = await supabase
      .from('academy_paths')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get all nodes for a specific path
  async getNodes(pathId) {
    const { data, error } = await supabase
      .from('academy_nodes')
      .select('*')
      .eq('path_id', pathId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get user's progress on nodes
  async getUserProgress(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('academy_user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  // Get user's earned badges
  async getUserBadges(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('academy_user_badges')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  // Mark a node as completed and unlock the next one
  async completeNode(userId, completedNode, nextNode) {
    if (!userId) throw new Error("User required");
    
    // 1. Mark current node as completed
    const { error: completeErr } = await supabase
      .from('academy_user_progress')
      .upsert({ 
        user_id: userId, 
        node_id: completedNode.id, 
        status: 'completed',
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,node_id' });
      
    if (completeErr) throw completeErr;

    // 2. Unlock next node if exists
    if (nextNode) {
      // only unlock if it doesn't exist or is locked
      const { data: existNext } = await supabase
        .from('academy_user_progress')
        .select('status')
        .eq('user_id', userId)
        .eq('node_id', nextNode.id)
        .maybeSingle();
        
      if (!existNext || existNext.status === 'locked') {
         const { error: unlockErr } = await supabase
          .from('academy_user_progress')
          .upsert({ 
            user_id: userId, 
            node_id: nextNode.id, 
            status: 'active'
          }, { onConflict: 'user_id,node_id' });
          
         if (unlockErr) throw unlockErr;
      }
    }

    // 3. Check milestone and award badge
    if (completedNode.is_milestone && completedNode.badge_name) {
       const { error: badgeErr } = await supabase
        .from('academy_user_badges')
        .upsert({ 
          user_id: userId, 
          badge_name: completedNode.badge_name 
        }, { onConflict: 'user_id,badge_name' });
        
       if (badgeErr) throw badgeErr;
    }
    
    return true;
  },
  
  // Initialize progress by setting first node to active
  async initializeProgress(userId, firstNodeId) {
    if (!userId || !firstNodeId) return;
    const { error } = await supabase
        .from('academy_user_progress')
        .upsert({ 
            user_id: userId, 
            node_id: firstNodeId, 
            status: 'active'
        }, { onConflict: 'user_id,node_id' });
    if (error) throw error;
  }
};
