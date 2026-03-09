import { supabase } from '../lib/supabaseClient';

/**
 * Tracks a unique user registration/login.
 */
export async function trackUserRegistration(user) {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    const email = user.primaryEmailAddress.emailAddress;

    try {
        const { data: userSnap } = await supabase.from('registered_users').select('email').eq('email', email).single();

        if (!userSnap) {
            // New unique user - register
            await supabase.from('registered_users').insert({
                email,
                display_name: user.fullName || user.username || 'Alpha Member'
            });

            // Update global user count in settings metadata
            const { data: meta } = await supabase.from('settings').select('data').eq('id', 'users').single();
            const currentCount = meta?.data?.totalUsersCount || 0;

            await supabase.from('settings').upsert({
                id: 'users',
                data: {
                    totalUsersCount: currentCount + 1,
                    lastSyncedAt: new Date().toISOString()
                }
            });
        }
    } catch (error) {
        console.error("Error tracking user registration:", error);
    }
}

/**
 * Increments the global interaction pulse.
 */
export async function trackGlobalPulse() {
    try {
        const { data: meta } = await supabase.from('settings').select('data').eq('id', 'interactions').single();
        const currentCount = meta?.data?.totalPulseCount || 0;

        await supabase.from('settings').upsert({
            id: 'interactions',
            data: {
                totalPulseCount: currentCount + 1,
                lastInteraction: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error("Error tracking global pulse:", error);
    }
}

/**
 * Increments the usage count for a specific feature.
 */
export async function trackFeatureUsage(featureId, label) {
    if (!featureId) return;
    try {
        // Fetch current count to manual increment (Supabase RPC increment could also be used)
        const { data: feature } = await supabase.from('analytics_features').select('usage_count').eq('id', featureId).single();
        const currentCount = feature?.usage_count || 0;

        await supabase.from('analytics_features').upsert({
            id: featureId,
            label: label || featureId,
            usage_count: currentCount + 1,
            last_used: new Date().toISOString()
        });

        await trackGlobalPulse();
    } catch (error) {
        console.error("Error tracking feature usage:", error);
    }
}

/**
 * Updates a heartbeat for the current user.
 */
export async function trackActiveUser(userId) {
    if (!userId) return;
    try {
        await supabase.from('active_sessions').upsert({
            user_id: userId,
            last_seen: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error tracking active user:", error);
    }
}

/**
 * Cleanup stale sessions.
 */
export async function cleanupStaleSessions() {
    try {
        if (process.env.NEXT_PUBLIC_ENABLE_CLIENT_CLEANUP !== '1') return;

        const cutoff = new Date(Date.now() - 60000).toISOString();
        await supabase.from('active_sessions').delete().lt('last_seen', cutoff);
    } catch (error) {
        console.error("Error cleaning up stale sessions:", error);
    }
}

// NOTE: useRealTimeAnalytics hook has been moved to src/hooks/useRealTimeAnalytics.js
// Import it from there to comply with React Rules of Hooks.
