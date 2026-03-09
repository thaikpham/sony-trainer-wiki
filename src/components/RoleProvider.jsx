'use client';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { supabase } from '@/lib/supabaseClient';
import { getRoleKeys } from '@/lib/roles';
import GlobalBadgeToast from './GlobalBadgeToast';

const RoleContext = createContext({
    isAdmin: false,
    isDataMaster: false,
    isDev: false,
    canViewReport: false,
    matrix: null,
    loading: true
});

export const DEFAULT_PERMISSIONS = {
    DEV: { adminAccess: true, canManageData: true, canDeleteData: true, canViewLiveReport: true },
    TRAINER: { adminAccess: true, canManageData: true, canDeleteData: false, canViewLiveReport: true },
    PRODUCT_MARKETING: { adminAccess: true, canManageData: true, canDeleteData: false, canViewLiveReport: true },
    DATA: { adminAccess: true, canManageData: true, canDeleteData: false, canViewLiveReport: true },
    PROMOTER: { adminAccess: false, canManageData: false, canDeleteData: false, canViewLiveReport: true },
    SALESMAN: { adminAccess: false, canManageData: false, canDeleteData: false, canViewLiveReport: true },
    USER: { adminAccess: false, canManageData: false, canDeleteData: false, canViewLiveReport: false }
};

export function RoleProvider({ children }) {
    const { user, isLoaded } = useUser();
    const [matrix, setMatrix] = useState(DEFAULT_PERMISSIONS);
    const [loading, setLoading] = useState(true);
    const [overrides, setOverrides] = useState({ roles: [], badges: [] });

    // 1. Fetch the Global Role Matrix
    useEffect(() => {
        const fetchMatrix = async () => {
            const { data } = await supabase.from('settings').select('*').eq('id', 'rolesConfig').single();
            if (data?.data) {
                setMatrix({ ...DEFAULT_PERMISSIONS, ...data.data });
            } else {
                setMatrix(DEFAULT_PERMISSIONS);
                // Optionally insert default
                supabase.from('settings').upsert({ id: 'rolesConfig', data: DEFAULT_PERMISSIONS }).then();
            }
        };

        fetchMatrix();

        const channel = supabase.channel('public:settings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.rolesConfig' }, (payload) => {
                if (payload.new?.data) {
                    setMatrix({ ...DEFAULT_PERMISSIONS, ...payload.new.data });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // 2. Fetch User Overrides (Live Achievements/Roles)
    useEffect(() => {
        if (!isLoaded || !user?.primaryEmailAddress?.emailAddress) return;

        const email = user.primaryEmailAddress.emailAddress;

        const fetchOverrides = async () => {
            const { data } = await supabase.from('user_overrides').select('*').eq('email', email).single();
            if (data) {
                setOverrides({ roles: data.roles || [], badges: data.badges || [] });
            } else {
                setOverrides({ roles: [], badges: [] });
            }
            setLoading(false);
        };
        fetchOverrides();

        const channel = supabase.channel('public:user_overrides')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'user_overrides', filter: `email=eq.${email}` }, (payload) => {
                if (payload.new) {
                    setOverrides({ roles: payload.new.roles || [], badges: payload.new.badges || [] });
                } else if (payload.eventType === 'DELETE') {
                    setOverrides({ roles: [], badges: [] });
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [isLoaded, user]);

    const access = useMemo(() => {
        if (!isLoaded || !matrix) {
            return { isAdmin: false, isDataMaster: false, isDev: false, canViewReport: false, matrix: null, roleKeys: [], loading: true };
        }

        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) {
            return { isAdmin: false, isDataMaster: false, isDev: false, canViewReport: false, matrix, roleKeys: [], loading: false };
        }

        // Merge Static Roles + Dynamic Firestore Overrides
        const staticKeys = getRoleKeys(email);
        const dynamicRoles = overrides.roles || [];
        const dynamicBadges = overrides.badges || [];

        // Unique set of all keys
        const roleKeys = Array.from(new Set([...staticKeys, ...dynamicRoles, ...dynamicBadges]));

        let isAdmin = false;
        let isDataMaster = false;
        let isDev = false;
        let canViewReport = false;

        for (const k of roleKeys) {
            const m = matrix[k] || DEFAULT_PERMISSIONS.USER;
            if (m.adminAccess || m.isAdmin) isAdmin = true;
            if (m.canManageData) isDataMaster = true;
            if (m.canDeleteData) isDev = true;
            if (m.canViewLiveReport) canViewReport = true;
        }

        return { isAdmin, isDataMaster, isDev, canViewReport, matrix, roleKeys, loading: false };
    }, [user, isLoaded, matrix, overrides]);

    return (
        <RoleContext.Provider value={access}>
            {children}
            <GlobalBadgeToast />
        </RoleContext.Provider>
    );
}

export function useRoleAccess() {
    return useContext(RoleContext);
}
