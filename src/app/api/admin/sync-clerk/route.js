import { createClerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

        // Fetch total user count from Clerk
        const count = await clerkClient.users.getCount();

        // Update Firestore metadata
        const metadataRef = doc(db, 'metadata', 'users');
        await setDoc(metadataRef, {
            totalUsersCount: count,
            lastSyncedAt: new Date().toISOString()
        }, { merge: true });

        return NextResponse.json({ success: true, count });
    } catch (error) {
        console.error('Error syncing Clerk users:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
