'use client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import { getRoleKeys } from '@/lib/roles';
import { trackClientAction } from '@/lib/trackActionClient';

const DevUserPanel = dynamic(() => import('@/components/admin/DevUserPanel'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
    ),
});

export default function DevPage() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const email = user?.primaryEmailAddress?.emailAddress;
    const isDev = getRoleKeys(email).includes('DEV');

    useEffect(() => {
        if (isLoaded && !isDev) {
            // They peeked! Track the failed/curious attempt
            trackClientAction('dev_panel_views');
            router.replace('/');
        } else if (isLoaded && isDev) {
            // Also track for devs visiting their own panel
            trackClientAction('dev_panel_views');
        }
    }, [isLoaded, isDev, router]);

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7]">
                <Loader2 size={32} className="animate-spin text-slate-400" />
            </div>
        );
    }

    if (!isDev) return null;

    return (
        <Layout>
            <DevUserPanel />
        </Layout>
    );
}
