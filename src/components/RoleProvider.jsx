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
    const [matrix, setMatrix] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) {
            setMatrix(DEFAULT_PERMISSIONS);
            setLoading(false);
            return;
        }

        const docRef = doc(db, 'settings', 'rolesConfig');
        const unsubscribe = onSnapshot(docRef, (snap) => {
            if (snap.exists()) {
                setMatrix({ ...DEFAULT_PERMISSIONS, ...snap.data() });
            } else {
                setDoc(docRef, DEFAULT_PERMISSIONS).catch(console.error);
                setMatrix(DEFAULT_PERMISSIONS);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error fetching rolesConfig:", err);
            setMatrix(DEFAULT_PERMISSIONS);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const access = useMemo(() => {
        if (!isLoaded || loading || !matrix) {
            return { isAdmin: false, isDataMaster: false, isDev: false, canViewReport: false, matrix: null, loading: true };
        }

        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) {
            return { isAdmin: false, isDataMaster: false, isDev: false, canViewReport: false, matrix, loading: false };
        }

        const keys = getRoleKeys(email);

        let isAdmin = false;
        let isDataMaster = false;
        let isDev = false;
        let canViewReport = false;

        for (const k of keys) {
            const m = matrix[k] || DEFAULT_PERMISSIONS.USER;
            if (m.adminAccess || m.isAdmin) isAdmin = true; // Support legacy if needed
            if (m.canManageData) isDataMaster = true;
            if (m.canDeleteData) isDev = true;
            if (m.canViewLiveReport) canViewReport = true;
        }

        return { isAdmin, isDataMaster, isDev, canViewReport, matrix, loading: false };
    }, [user, isLoaded, matrix, loading]);

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
