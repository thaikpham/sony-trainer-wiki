import { createClerkClient } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

        // Fetch total user count from Clerk
        const count = await clerkClient.users.getCount();

        // Update Supabase settings table
        await supabase.from('settings').upsert({
            id: 'users',
            data: {
                totalUsersCount: count,
                lastSyncedAt: new Date().toISOString()
            }
        });

        return NextResponse.json({ success: true, count });
    } catch (error) {
        console.error('Error syncing Clerk users:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
