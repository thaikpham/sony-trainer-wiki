import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc } from 'firebase/firestore';
import { cleanupStaleSessions } from '@/services/analytics';

const SESSION_TIMEOUT_MS = 60000; // 1 minute

/**
 * Hook to get real-time top features, active user count, and total users/pulse.
 */
export function useRealTimeAnalytics() {
    const [topFeatures, setTopFeatures] = useState([]);
    const [activeUserCount, setActiveUserCount] = useState(0);
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [totalPulseCount, setTotalPulseCount] = useState(0);

    useEffect(() => {
        // Listen to top 10 features
        const featuresCol = collection(db, 'analytics_features');
        const qFeatures = query(featuresCol, orderBy('usageCount', 'desc'), limit(10));

        const unsubFeatures = onSnapshot(qFeatures, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setTopFeatures(data);
        });

        // Listen to active sessions count
        const sessionsCol = collection(db, 'active_sessions');
        const unsubSessions = onSnapshot(sessionsCol, (snapshot) => {
            setActiveUserCount(snapshot.size);
        });

        // Listen to total registered users
        const unsubUsers = onSnapshot(doc(db, 'metadata', 'users'), (doc) => {
            if (doc.exists()) setTotalUsersCount(doc.data().totalUsersCount || 0);
        });

        // Listen to total interaction pulse
        const unsubPulse = onSnapshot(doc(db, 'metadata', 'interactions'), (doc) => {
            if (doc.exists()) setTotalPulseCount(doc.data().totalPulseCount || 0);
        });

        // Periodic cleanup of stale sessions
        const cleanupInterval = setInterval(cleanupStaleSessions, SESSION_TIMEOUT_MS);

        return () => {
            unsubFeatures();
            unsubSessions();
            unsubUsers();
            unsubPulse();
            clearInterval(cleanupInterval);
        };
    }, []);

    return { topFeatures, activeUserCount, totalUsersCount, totalPulseCount };
}
