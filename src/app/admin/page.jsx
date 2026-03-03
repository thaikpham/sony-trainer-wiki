'use client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { hasAdminAccess } from '@/lib/roles';

// AdminPanel is heavy — load only on demand
const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
    ),
});

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const email = user?.primaryEmailAddress?.emailAddress;
    const isAdmin = hasAdminAccess(email);

    // Client-side guard: redirect non-admins after Clerk loads
    useEffect(() => {
        if (isLoaded && !isAdmin) {
            router.replace('/');
        }
    }, [isLoaded, isAdmin, router]);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7] dark:bg-black">
                <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <Layout>
            <AdminPanel />
        </Layout>
    );
}
