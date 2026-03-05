import { NextResponse } from 'next/server';
import { trackAction } from '@/services/achievements';
import { auth, createClerkClient } from '@clerk/nextjs/server';

export async function POST(request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const user = await clerkClient.users.getUser(userId);
        const email = user?.emailAddresses?.[0]?.emailAddress;

        if (!email) {
            return NextResponse.json({ error: 'No email found' }, { status: 400 });
        }

        const body = await request.json();
        const { action, count = 1 } = body;

        if (!action) {
            return NextResponse.json({ error: 'Missing action type' }, { status: 400 });
        }

        // Track the action and asynchronously grant badges if milestone hit
        const unlockedBadges = await trackAction(email, action, count) || [];

        return NextResponse.json({ success: true, unlockedBadges });
    } catch (err) {
        console.error('[POST /api/track_action]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
