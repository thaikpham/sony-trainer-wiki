'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import WikiShell from '@/components/wiki/WikiShell';
import WikiProductWarehouse from '@/components/wiki/WikiProductWarehouse';
import { PRODUCT_CATEGORY_BY_SLUG } from '@/lib/wikiCategories';

export default function WikiCategoryProductsPage() {
    const params = useParams();
    const router = useRouter();
    const categoryParam = Array.isArray(params?.category) ? params.category[0] : params?.category;
    const categoryName = PRODUCT_CATEGORY_BY_SLUG[categoryParam];

    useEffect(() => {
        if (!categoryName) {
            router.replace('/wiki/kho-san-pham');
        }
    }, [categoryName, router]);

    if (!categoryName) {
        return null;
    }

    return (
        <WikiShell>
            <WikiProductWarehouse category={categoryName} />
        </WikiShell>
    );
}
