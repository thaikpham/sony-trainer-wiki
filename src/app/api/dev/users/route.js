import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getRoleKeys } from '@/lib/roles';
import { getAllUserOverrides, setUserOverride, deleteUserOverride } from '@/services/db';

function isDevEmail(email) {
    return getRoleKeys(email).includes('DEV');
}

async function getCallerEmail() {
    const { userId } = await auth();
    if (!userId) return null;
    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    const user = await clerkClient.users.getUser(userId);
    return user?.emailAddresses?.[0]?.emailAddress ?? null;
}

// GET /api/dev/users
// Returns Clerk user list + override data merged
export async function GET() {
    try {
        const email = await getCallerEmail();
        if (!email || !isDevEmail(email)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const { data: clerkUsers } = await clerkClient.users.getUserList({ limit: 200 });
        const overrides = await getAllUserOverrides();
        const overrideMap = Object.fromEntries(overrides.map(o => [o.email, o]));

        const users = clerkUsers.map(u => {
            const userEmail = u.emailAddresses?.[0]?.emailAddress ?? '';
            const override = overrideMap[userEmail];
            const staticRoles = getRoleKeys(userEmail);
            return {
                id: u.id,
                email: userEmail,
                firstName: u.firstName,
                lastName: u.lastName,
                imageUrl: u.imageUrl,
                createdAt: u.createdAt,
                lastSignInAt: u.lastSignInAt,
                staticRoles,
                overrideRoles: override?.roles ?? null,
                overrideBadges: override?.badges ?? null,
                hasOverride: Boolean(override),
            };
        });

        return NextResponse.json({ users });
    } catch (err) {
        console.error('[GET /api/dev/users]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PATCH /api/dev/users  { emails: [], roles, badges } // also supports legacy { email, roles, badges }
export async function PATCH(request) {
    try {
        const callerEmail = await getCallerEmail();
        if (!callerEmail || !isDevEmail(callerEmail)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { email: singleEmail, emails: emailArray, roles, badges } = body;

        let targetEmails = [];
        if (Array.isArray(emailArray)) {
            targetEmails = emailArray.filter(e => typeof e === 'string' && e.length > 0);
        } else if (typeof emailArray === 'string' && emailArray.length > 0) {
            targetEmails = [emailArray]; // Robustness if frontend sends string in 'emails' key
        } else if (singleEmail) {
            targetEmails = [singleEmail];
        }

        if (targetEmails.length === 0) {
            return NextResponse.json({ error: 'Missing emails' }, { status: 400 });
        }

        // Apply override to all emails concurrently
        await Promise.all(targetEmails.map(targetEmail =>
            setUserOverride(targetEmail, { roles: roles ?? [], badges: badges ?? [] })
        ));

        return NextResponse.json({ success: true, count: targetEmails.length });
    } catch (err) {
        console.error('[PATCH /api/dev/users]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE /api/dev/users  { email }
export async function DELETE(request) {
    try {
        const email = await getCallerEmail();
        if (!email || !isDevEmail(email)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { email: targetEmail } = body;

        if (!targetEmail) {
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        await deleteUserOverride(targetEmail);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[DELETE /api/dev/users]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
