import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { cleanupStaleSessions } from '@/services/analytics';

const SESSION_TIMEOUT_MS = 60000;

export function useRealTimeAnalytics() {
    const [topFeatures, setTopFeatures] = useState([]);
    const [activeUserCount, setActiveUserCount] = useState(0);
    const [totalUsersCount, setTotalUsersCount] = useState(0);
    const [totalPulseCount, setTotalPulseCount] = useState(0);

    useEffect(() => {
        const fetchAll = async () => {
            const { data: features } = await supabase.from('analytics_features').select('*').order('usage_count', { ascending: false }).limit(10);
            if (features) setTopFeatures(features);

            const { count: activeCount } = await supabase.from('active_sessions').select('*', { count: 'exact', head: true });
            setActiveUserCount(activeCount || 0);

            const { data: userMeta } = await supabase.from('settings').select('data').eq('id', 'users').single();
            if (userMeta?.data) setTotalUsersCount(userMeta.data.totalUsersCount || 0);

            const { data: interactionMeta } = await supabase.from('settings').select('data').eq('id', 'interactions').single();
            if (interactionMeta?.data) setTotalPulseCount(interactionMeta.data.totalPulseCount || 0);
        };

        fetchAll();

        const featuresChannel = supabase.channel('public:analytics_features')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'analytics_features' }, () => {
                supabase.from('analytics_features').select('*').order('usage_count', { ascending: false }).limit(10).then(({ data }) => {
                    if (data) setTopFeatures(data);
                });
            }).subscribe();

        const sessionsChannel = supabase.channel('public:active_sessions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'active_sessions' }, () => {
                supabase.from('active_sessions').select('*', { count: 'exact', head: true }).then(({ count }) => {
                    setActiveUserCount(count || 0);
                });
            }).subscribe();

        const settingsChannel = supabase.channel('public:settings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
                if (payload.new?.id === 'users' && payload.new.data) {
                    setTotalUsersCount(payload.new.data.totalUsersCount || 0);
                }
                if (payload.new?.id === 'interactions' && payload.new.data) {
                    setTotalPulseCount(payload.new.data.totalPulseCount || 0);
                }
            }).subscribe();

        const cleanupInterval = setInterval(cleanupStaleSessions, SESSION_TIMEOUT_MS);

        return () => {
            supabase.removeChannel(featuresChannel);
            supabase.removeChannel(sessionsChannel);
            supabase.removeChannel(settingsChannel);
            clearInterval(cleanupInterval);
        };
    }, []);

    return { topFeatures, activeUserCount, totalUsersCount, totalPulseCount };
}
