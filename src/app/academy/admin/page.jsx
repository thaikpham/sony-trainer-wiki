'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useRoleAccess } from '@/components/RoleProvider';
import { Loader2 } from 'lucide-react';
import AdminAcademyPanel from '@/components/admin/AdminAcademyPanel';

export default function AcademyAdminPage() {
    const { isLoaded } = useUser();
    const router = useRouter();
    const { isDev, loading: rolesLoading } = useRoleAccess();

    const hasAccess = isDev;

    useEffect(() => {
        if (isLoaded && !rolesLoading && !hasAccess) {
            router.replace('/academy');
        }
    }, [isLoaded, rolesLoading, hasAccess, router]);

    if (!isLoaded || rolesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
        );
    }

    if (!hasAccess) return null;

    return (
        <div className="w-full max-w-[1400px] mx-auto px-4 py-6">
            <AdminAcademyPanel />
        </div>
    );
}
