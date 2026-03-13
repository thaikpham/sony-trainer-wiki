'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LiveStreamPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect the main /livestream path to the first step
        router.push('/livestream/equipment');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#86868b] font-medium animate-pulse">Đang tải Sony Wiki Studio...</p>
            </div>
        </div>
    );
}
