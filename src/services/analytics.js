import { db } from '../lib/firebase';
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    where,
    runTransaction,
} from 'firebase/firestore';

/**
 * Tracks a unique user registration/login.
 * Increments the global member count if this is a first-time user.
 */
export async function trackUserRegistration(user) {
    if (!user?.primaryEmailAddress?.emailAddress) return;
    const email = user.primaryEmailAddress.emailAddress;

    try {
        const userRef = doc(db, 'registered_users', email);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // New unique user - register and increment global count
            await runTransaction(db, async (transaction) => {
                const metadataRef = doc(db, 'metadata', 'users');
                const metaSnap = await transaction.get(metadataRef);

                transaction.set(userRef, {
                    email,
                    displayName: user.fullName || user.username || 'Alpha Member',
                    registeredAt: serverTimestamp(),
                });

                if (metaSnap.exists()) {
                    transaction.update(metadataRef, { totalUsersCount: increment(1) });
                } else {
                    transaction.set(metadataRef, { totalUsersCount: 1 });
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
        const metadataRef = doc(db, 'metadata', 'interactions');
        await setDoc(metadataRef, {
            totalPulseCount: increment(1),
            lastInteraction: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error("Error tracking global pulse:", error);
    }
}

// ============================================
// Feature Usage Tracking
// ============================================

/**
 * Increments the usage count for a specific feature.
 * @param {string} featureId - Unique ID of the feature (e.g., 'ai_recommend', 'colorlab')
 * @param {string} label - Human readable name for the dashboard
 */
export async function trackFeatureUsage(featureId, label) {
    if (!featureId) return;
    try {
        const featureRef = doc(db, 'analytics_features', featureId);
        await setDoc(featureRef, {
            label: label || featureId,
            usageCount: increment(1),
            lastUsed: serverTimestamp()
        }, { merge: true });

        // Also track as a global interaction pulse
        await trackGlobalPulse();
    } catch (error) {
        console.error("Error tracking feature usage:", error);
    }
}

// ============================================
// Active User Heartbeat
// ============================================

const SESSION_TIMEOUT_MS = 60000; // 1 minute timeout for stale sessions

/**
 * Updates a heartbeat for the current user to track them as "active".
 * @param {string} userId - Unique user ID (clerk ID or email)
 */
export async function trackActiveUser(userId) {
    if (!userId) return;
    try {
        const sessionRef = doc(db, 'active_sessions', userId);
        await setDoc(sessionRef, {
            lastSeen: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error("Error tracking active user:", error);
    }
}

/**
 * Cleanup stale sessions (best-effort client-side; ideally a Cloud Function).
 */
export async function cleanupStaleSessions() {
    try {
        const cutoff = new Date(Date.now() - SESSION_TIMEOUT_MS);
        const sessionsCol = collection(db, 'active_sessions');
        const q = query(sessionsCol, where('lastSeen', '<', cutoff));
        const snapshot = await getDocs(q);
        await Promise.all(snapshot.docs.map(d => deleteDoc(d.ref)));
    } catch (error) {
        console.error("Error cleaning up stale sessions:", error);
    }
}

// NOTE: useRealTimeAnalytics hook has been moved to src/hooks/useRealTimeAnalytics.js
// Import it from there to comply with React Rules of Hooks.
