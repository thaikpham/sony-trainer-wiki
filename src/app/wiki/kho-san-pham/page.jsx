'use client';

import WikiShell from '@/components/wiki/WikiShell';
import WikiProductWarehouse from '@/components/wiki/WikiProductWarehouse';

export default function WikiProductsPage() {
    return (
        <WikiShell>
            <WikiProductWarehouse />
        </WikiShell>
    );
}
