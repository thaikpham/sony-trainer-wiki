import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { hasAdminAccess } from '@/lib/roles';
import { getProducts, updateProduct } from '@/services/db';

export async function POST(req) {
    try {
        const user = await currentUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email || !hasAdminAccess(email)) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const products = await getProducts();
        let count = 0;
        const promises = [];

        products.forEach((product) => {
            if (product.highlights) {
                // Wipe highlights property correctly using updateProduct to avoid losing other jsonb fields
                promises.push(updateProduct(product.id, { ...product, highlights: '' }));
                count++;
            }
        });

        await Promise.all(promises);

        return NextResponse.json({ message: `Successfully wiped highlights for ${count} products.` });
    } catch (error) {
        console.error('Error wiping highlights:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
