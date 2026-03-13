'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabaseClient';
import { getRoleKeys } from '@/lib/roles';
import GlobalBadgeToast from './GlobalBadgeToast';

export interface RolePermission {
  adminAccess?: boolean;
  isAdmin?: boolean;
  canManageData?: boolean;
  canDeleteData?: boolean;
  canViewLiveReport?: boolean;
}

export type RoleMatrix = Record<string, RolePermission>;

interface RoleAccess {
  isAdmin: boolean;
  isDataMaster: boolean;
  isDev: boolean;
  canViewReport: boolean;
  matrix: RoleMatrix | null;
  roleKeys: string[];
  loading: boolean;
}

const RoleContext = createContext<RoleAccess>({
  isAdmin: false,
  isDataMaster: false,
  isDev: false,
  canViewReport: false,
  matrix: null,
  roleKeys: [],
  loading: true,
});

export const DEFAULT_PERMISSIONS: RoleMatrix = {
  DEV: { adminAccess: true, canManageData: true, canDeleteData: true, canViewLiveReport: true },
  TRAINER: { adminAccess: true, canManageData: true, canDeleteData: false, canViewLiveReport: true },
  PRODUCT_MARKETING: { adminAccess: true, canManageData: true, canDeleteData: false, canViewLiveReport: true },
  DATA: { adminAccess: true, canManageData: true, canDeleteData: false, canViewLiveReport: true },
  PROMOTER: { adminAccess: false, canManageData: false, canDeleteData: false, canViewLiveReport: true },
  SALESMAN: { adminAccess: false, canManageData: false, canDeleteData: false, canViewLiveReport: true },
  USER: { adminAccess: false, canManageData: false, canDeleteData: false, canViewLiveReport: false },
};

interface OverridesState {
  roles: string[];
  badges: string[];
}

interface RoleProviderProps {
  children: React.ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const { user, isLoaded } = useUser();
  const [matrix, setMatrix] = useState<RoleMatrix>(DEFAULT_PERMISSIONS);
  const [loading, setLoading] = useState(true);
  const [overrides, setOverrides] = useState<OverridesState>({ roles: [], badges: [] });

  useEffect(() => {
    const fetchMatrix = async () => {
      const { data } = await supabase.from('settings').select('*').eq('id', 'rolesConfig').single();
      if (data?.data) {
        setMatrix({ ...DEFAULT_PERMISSIONS, ...data.data });
      } else {
        setMatrix(DEFAULT_PERMISSIONS);
        supabase.from('settings').upsert({ id: 'rolesConfig', data: DEFAULT_PERMISSIONS }).then(() => {});
      }
    };
    fetchMatrix();
    const channel = supabase.channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings', filter: 'id=eq.rolesConfig' }, (payload: { new?: { data?: RoleMatrix } }) => {
        if (payload.new?.data) {
          setMatrix({ ...DEFAULT_PERMISSIONS, ...payload.new.data });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !user?.primaryEmailAddress?.emailAddress) return;
    const email = user.primaryEmailAddress.emailAddress;
    const fetchOverrides = async () => {
      const { data } = await supabase.from('user_overrides').select('*').eq('email', email).single();
      if (data) {
        setOverrides({ roles: (data as { roles?: string[] }).roles || [], badges: (data as { badges?: string[] }).badges || [] });
      } else {
        setOverrides({ roles: [], badges: [] });
      }
      setLoading(false);
    };
    fetchOverrides();
    const channel = supabase.channel('public:user_overrides')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_overrides', filter: `email=eq.${email}` }, (payload: { new?: { roles?: string[]; badges?: string[] }; eventType?: string }) => {
        if (payload.new) {
          setOverrides({ roles: payload.new.roles || [], badges: payload.new.badges || [] });
        } else if (payload.eventType === 'DELETE') {
          setOverrides({ roles: [], badges: [] });
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoaded, user]);

  const access = useMemo<RoleAccess>(() => {
    if (!isLoaded || !matrix) {
      return { isAdmin: false, isDataMaster: false, isDev: false, canViewReport: false, matrix: null, roleKeys: [], loading: true };
    }
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) {
      return { isAdmin: false, isDataMaster: false, isDev: false, canViewReport: false, matrix, roleKeys: [], loading: false };
    }
    const staticKeys = getRoleKeys(email);
    const dynamicRoles = overrides.roles || [];
    const dynamicBadges = overrides.badges || [];
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

export function useRoleAccess(): RoleAccess {
  return useContext(RoleContext);
}
