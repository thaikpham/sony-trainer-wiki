'use client';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
        if (!db) return;

        const docRef = doc(db, 'settings', 'rolesConfig');
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setMatrix({ ...DEFAULT_PERMISSIONS, ...snap.data() });
            } else {
                setDoc(docRef, DEFAULT_PERMISSIONS).catch(console.error);
                setMatrix(DEFAULT_PERMISSIONS);
            }
        }, (err) => {
            console.error("Error fetching rolesConfig:", err);
            setMatrix(DEFAULT_PERMISSIONS);
        });

        return () => unsubscribe();
    }, []);

    // 2. Fetch User Overrides (Live Achievements/Roles)
    useEffect(() => {
        if (!isLoaded || !user?.primaryEmailAddress?.emailAddress || !db) return;

        const email = user.primaryEmailAddress.emailAddress;
        const id = email.replace(/[@.]/g, '_');
        const overrideRef = doc(db, 'user_overrides', id);

        const unsubscribe = onSnapshot(overrideRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setOverrides({
                    roles: data.roles || [],
                    badges: data.badges || []
                });
            } else {
                setOverrides({ roles: [], badges: [] });
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching user_overrides:", err);
            setLoading(false);
        });

        return () => unsubscribe();
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
