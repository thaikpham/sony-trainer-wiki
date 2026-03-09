'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { COLORLAB_SECTION_TO_SLUG } from '@/lib/wikiColorLabSections';

const ColorLab = dynamic(() => import('@/components/ColorLab'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
    ),
});

export default function WikiColorLabSection({ section }) {
    const router = useRouter();

    const handleNavigateSection = (nextSection) => {
        const targetSlug = COLORLAB_SECTION_TO_SLUG[nextSection];
        if (!targetSlug) {
            router.push('/wiki/colorlab/picture-profiles');
            return;
        }
        router.push(`/wiki/colorlab/${targetSlug}`);
    };

    return <ColorLab section={section} onNavigateSection={handleNavigateSection} />;
}
