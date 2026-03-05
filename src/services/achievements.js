import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { getUserOverride } from './db';

// Milestone definitions — each action type can have multiple tiers.
// Existing "old" badges (NIGHT_OWL, EARLY_BIRD, GEAR_MASTER, LENS_CONNOISSEUR, COLOR_MAGICIAN)
// are earned first; new premium tiers supersede them for the same domain.
const MILESTONES = {
    // AI Assistant
    ai_chats: [
        { threshold: 50, badgeKey: 'AI_ENTHUSIAST' },   // "Chiến thần AI"
        { threshold: 200, badgeKey: 'AI_ADDICT' }         // "Kẻ Nghiện AI"
    ],
    // Wiki / Spec reading
    wiki_reads: [
        { threshold: 50, badgeKey: 'TOP_READER' },       // "Mọt sách Sony"
        { threshold: 200, badgeKey: 'SCHOLAR' }            // "Khổng Minh"
    ],
    // Compare tool
    compare_tool_uses: [
        { threshold: 20, badgeKey: 'COMPARISON_EXPERT' },// "Chuyên gia cân não"
        { threshold: 100, badgeKey: 'COMPARE_MASTER' }    // "Chiến Thần Phân Tích"
    ],
    // ColorLab — profile views
    color_profile_views: [
        { threshold: 20, badgeKey: 'COLORLAB_VETERAN' }, // "ColorLab Veterans"
        { threshold: 80, badgeKey: 'COLOR_MAGICIAN' }    // "Phù thủy màu sắc" (old badge, new trigger)
    ],
    // Livestream reports
    live_reports_submitted: [
        { threshold: 20, badgeKey: 'LIVE_LEGEND' },      // "Huyền thoại Live"
        { threshold: 50, badgeKey: 'LIVE_PRO' }          // "Ông Trùm Livestream"
    ],
    // LUT downloads
    lut_downloads: [
        { threshold: 15, badgeKey: 'LUT_HOARDER' }       // "Kẻ Tích Trữ LUT"
    ],
    // Creative Look tab
    creative_look_views: [
        { threshold: 10, badgeKey: 'CREATIVE_EXPLORER' } // "Nhà Thám Hiểm Sáng Tạo"
    ],
    // Dashboard visits
    dashboard_views: [
        { threshold: 30, badgeKey: 'DASHBOARD_STALKER' } // "Nhà Phân Tích Số Liệu"
    ],
    // Dev panel visits (curious users & devs)
    dev_panel_views: [
        { threshold: 5, badgeKey: 'DEV_UI_PEEKER' }     // "Kẻ Dòm Ngó"
    ],
    // Easter egg: rapid logo clicks
    logo_clicks: [
        { threshold: 10, badgeKey: 'EASTER_EGG' }        // "Thợ Săn Trứng"
    ],
    // Filter / search behavior — single badge covers both
    filter_uses: [
        { threshold: 30, badgeKey: 'FILTER_NINJA' }      // "Ninja Bộ Lọc"
    ],
    // Time-based — night & morning covered by OLD badges (unique theme)
    night_actions: [
        { threshold: 20, badgeKey: 'NIGHT_OWL' }         // "Cú đêm Alpha"
    ],
    morning_actions: [
        { threshold: 20, badgeKey: 'EARLY_BIRD' }        // "Người dậy sớm"
    ],
    // Weekend activity
    weekend_actions: [
        { threshold: 50, badgeKey: 'WEEKEND_GAMER' }     // "Dân Chơi Cuối Tuần"
    ],
    // Camera & Lens spec views — OLD badges cover these domains
    camera_views: [
        { threshold: 30, badgeKey: 'GEAR_MASTER' }       // "Tín đồ phần cứng"
    ],
    lens_views: [
        { threshold: 30, badgeKey: 'LENS_CONNOISSEUR' }  // "Chân lý G Master"
    ],
    // Total interaction milestones (2 tiers only — 10 removed as trivial)
    total_actions: [
        { threshold: 100, badgeKey: 'CENTURION' },       // "Bách Nhân Trưởng"
        { threshold: 1000, badgeKey: 'MILLENNIUM' }        // "Vương Giả Văn Hiến"
    ]
};

/**
 * Grant a badge to a user if they don't already have it
 */
export async function grantBadge(email, badgeKey) {
    if (!email || !badgeKey) return false;

    // 1. Get current overrides (or create default)
    const currentOverride = await getUserOverride(email);
    const existingRoles = currentOverride?.roles || [];
    const existingBadges = currentOverride?.badges || [];

    // 2. Check if user already has this badge
    if (existingBadges.includes(badgeKey)) {
        return false; // Already granted
    }

    // 3. Add the new badge and save back to user_overrides
    const newBadges = [...existingBadges, badgeKey];

    const id = email.replace(/[@.]/g, '_');
    const docRef = doc(db, 'user_overrides', id);

    await setDoc(docRef, {
        email,
        roles: existingRoles,
        badges: newBadges,
        updatedAt: serverTimestamp()
    }, { merge: true });

    return true; // Successfully granted
}

/**
 * Track a user action and check if any milestones are hit
 */
export async function trackAction(email, actionType, incrementBy = 1) {
    if (!email || !actionType) return null;

    const id = email.replace(/[@.]/g, '_');
    const docRef = doc(db, 'user_stats', id);

    try {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();

        // 1. Prepare increments based on time logic
        const increments = {
            [actionType]: increment(incrementBy),
            total_actions: increment(incrementBy)
        };

        if (hour >= 23 || hour <= 4) increments.night_actions = increment(incrementBy);
        if (hour > 4 && hour <= 8) increments.morning_actions = increment(incrementBy);
        if (day === 0 || day === 6) increments.weekend_actions = increment(incrementBy);

        // 2. Increment the specific action counters
        await setDoc(docRef, {
            email,
            ...increments,
            lastActive: serverTimestamp()
        }, { merge: true });

        // 3. Fetch the updated stats to check milestones
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;
        const currentStats = snap.data();

        // 4. Check for milestones
        const newBadgesGranted = [];

        for (const [key, configs] of Object.entries(MILESTONES)) {
            const statValue = currentStats[key] || 0;
            // Iterate through every tier for this key
            for (const config of configs) {
                if (statValue >= config.threshold) {
                    const granted = await grantBadge(email, config.badgeKey);
                    if (granted) {
                        newBadgesGranted.push(config.badgeKey);
                    }
                }
            }
        }

        return newBadgesGranted;
    } catch (e) {
        console.error("[Achievements] Error tracking action:", e);
        return null;
    }
}
