'use client';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';

// LiveStream is 117KB — load only when on this page, never on server
const LiveStream = dynamic(() => import('@/components/LiveStream'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
    ),
});

export default function LiveStreamPage() {
    return (
        <Layout>
            <LiveStream />
        </Layout>
    );
}
