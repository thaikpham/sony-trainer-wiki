import { supabase } from '@/lib/supabaseClient';
import { getUserOverride, setUserOverride } from './db';

// Milestone definitions — each action type can have multiple tiers.
const MILESTONES = {
    // AI Assistant
    ai_chats: [
        { threshold: 50,  badgeKey: 'AI_ENTHUSIAST' },
        { threshold: 200, badgeKey: 'AI_ADDICT' }
    ],
    // Wiki / Spec reading
    wiki_reads: [
        { threshold: 50,  badgeKey: 'TOP_READER' },
        { threshold: 200, badgeKey: 'SCHOLAR' }
    ],
    // Compare tool
    compare_tool_uses: [
        { threshold: 20,  badgeKey: 'COMPARISON_EXPERT' },
        { threshold: 100, badgeKey: 'COMPARE_MASTER' }
    ],
    // ColorLab — profile views
    color_profile_views: [
        { threshold: 20, badgeKey: 'COLORLAB_VETERAN' },
        { threshold: 80, badgeKey: 'COLOR_MAGICIAN' }
    ],
    // Livestream reports
    live_reports_submitted: [
        { threshold: 20, badgeKey: 'LIVE_LEGEND' },
        { threshold: 50, badgeKey: 'LIVE_PRO' }
    ],
    // LUT downloads
    lut_downloads: [
        { threshold: 15, badgeKey: 'LUT_HOARDER' }
    ],
    // Creative Look tab
    creative_look_views: [
        { threshold: 10, badgeKey: 'CREATIVE_EXPLORER' }
    ],
    // Dashboard visits
    dashboard_views: [
        { threshold: 30, badgeKey: 'DASHBOARD_STALKER' }
    ],
    // Dev panel visits
    dev_panel_views: [
        { threshold: 5, badgeKey: 'DEV_UI_PEEKER' }
    ],
    // Easter egg: rapid logo clicks
    logo_clicks: [
        { threshold: 10, badgeKey: 'EASTER_EGG' }
    ],
    // Filter / search behavior
    filter_uses: [
        { threshold: 30, badgeKey: 'FILTER_NINJA' }
    ],
    // Time-based
    night_actions: [
        { threshold: 20, badgeKey: 'NIGHT_OWL' }
    ],
    morning_actions: [
        { threshold: 20, badgeKey: 'EARLY_BIRD' }
    ],
    // Weekend activity
    weekend_actions: [
        { threshold: 50, badgeKey: 'WEEKEND_GAMER' }
    ],
    // Camera & Lens spec views
    camera_views: [
        { threshold: 30, badgeKey: 'GEAR_MASTER' }
    ],
    lens_views: [
        { threshold: 30, badgeKey: 'LENS_CONNOISSEUR' }
    ],
    // Total interaction milestones
    total_actions: [
        { threshold: 100,  badgeKey: 'CENTURION' },
        { threshold: 1000, badgeKey: 'MILLENNIUM' }
    ]
};

/**
 * Grant a badge to a user if they don't already have it.
 * Writes to Supabase user_overrides.
 */
export async function grantBadge(email, badgeKey) {
    if (!email || !badgeKey) return false;

    const currentOverride = await getUserOverride(email);
    const existingRoles  = currentOverride?.roles  || [];
    const existingBadges = currentOverride?.badges || [];

    if (existingBadges.includes(badgeKey)) return false;

    await setUserOverride(email, {
        roles:  existingRoles,
        badges: [...existingBadges, badgeKey]
    });

    return true;
}

/**
 * Track a user action and check if any milestone badges are earned.
 * Uses Supabase user_stats table instead of Firebase.
 */
export async function trackAction(email, actionType, incrementBy = 1) {
    if (!email || !actionType) return null;

    try {
        const now    = new Date();
        const hour   = now.getHours();
        const day    = now.getDay();

        // --- Build column increments ---
        // We fetch the current row, then upsert the incremented values.
        const { data: current } = await supabase
            .from('user_stats')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        const row = current || {};

        const inc = (col) => (row[col] || 0) + incrementBy;

        const updated = {
            email,
            total_actions: inc('total_actions'),
            [actionType]:  inc(actionType),
            last_active:   now.toISOString(),
        };

        // Time-based counters
        if (hour >= 23 || hour <= 4) updated.night_actions   = inc('night_actions');
        if (hour > 4 && hour <= 8)   updated.morning_actions = inc('morning_actions');
        if (day === 0 || day === 6)  updated.weekend_actions  = inc('weekend_actions');

        const { data: saved, error } = await supabase
            .from('user_stats')
            .upsert(updated, { onConflict: 'email' })
            .select('*')
            .single();

        if (error) throw error;

        // --- Check milestones ---
        const stats = saved || updated;
        const newBadgesGranted = [];

        for (const [key, configs] of Object.entries(MILESTONES)) {
            const statValue = stats[key] || 0;
            for (const config of configs) {
                if (statValue >= config.threshold) {
                    const granted = await grantBadge(email, config.badgeKey);
                    if (granted) newBadgesGranted.push(config.badgeKey);
                }
            }
        }

        return newBadgesGranted;
    } catch (e) {
        console.error('[Achievements] Error tracking action:', e);
        return null;
    }
}
