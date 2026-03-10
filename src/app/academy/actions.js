'use server';

import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function getUserProgressAction() {
    const { userId } = await auth();
    if (!userId) return [];
    
    // Uses Service Role to bypass client-side JWT RLS limits
    const { data } = await supabaseAdmin
        .from('academy_user_progress')
        .select('*')
        .eq('user_id', userId);
        
    return data || [];
}

export async function getUserBadgesAction() {
    const { userId } = await auth();
    if (!userId) return [];
    
    const { data } = await supabaseAdmin
        .from('academy_user_badges')
        .select('*')
        .eq('user_id', userId);
        
    return data || [];
}

export async function initializeProgressAction(firstNodeId) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const { error } = await supabaseAdmin
        .from('academy_user_progress')
        .upsert({ 
            user_id: userId, 
            node_id: firstNodeId, 
            status: 'active'
        }, { onConflict: 'user_id,node_id' });
        
    if (error) throw new Error(error.message);
    return true;
}

export async function completeNodeAction(currentNodeId, nextNodeId, isMilestone, badgeName) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // 1. Mark current as completed
    const { error: completeErr } = await supabaseAdmin
        .from('academy_user_progress')
        .upsert({ 
            user_id: userId, 
            node_id: currentNodeId, 
            status: 'completed',
            completed_at: new Date().toISOString()
        }, { onConflict: 'user_id,node_id' });
        
    if (completeErr) throw new Error(completeErr.message);

    // 2. Unlock next node if any
    if (nextNodeId) {
        const { data: existNext } = await supabaseAdmin
            .from('academy_user_progress')
            .select('status')
            .eq('user_id', userId)
            .eq('node_id', nextNodeId)
            .maybeSingle();

        if (!existNext || existNext.status === 'locked') {
            const { error: unlockErr } = await supabaseAdmin
                .from('academy_user_progress')
                .upsert({ 
                    user_id: userId, 
                    node_id: nextNodeId, 
                    status: 'active'
                }, { onConflict: 'user_id,node_id' });
            
            if (unlockErr) throw new Error(unlockErr.message);
        }
    }

    // 3. Check milestone and award badge
    if (isMilestone && badgeName) {
        const { error: badgeErr } = await supabaseAdmin
            .from('academy_user_badges')
            .upsert({ 
                user_id: userId, 
                badge_name: badgeName 
            }, { onConflict: 'user_id,badge_name' });
            
        if (badgeErr) throw new Error(badgeErr.message);
    }

    return true;
}
