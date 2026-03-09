/**
 * migrateContent.ts
 * 
 * Script to migrate all collections from Firebase Firestore to Supabase Postgres.
 * Run this via ts-node locally: `npx ts-node scripts/migrateContent.ts`
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env.local' });

// Setup Firebase Admin SDK
// You must download a serviceAccountKey.json from Firebase Project Settings -> Service Accounts
const serviceAccountPath = new URL('../serviceAccountKey.json', import.meta.url);
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const firestore = getFirestore();

// Setup Supabase leveraging Service Role Key to bypass RLS locally
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateCollection(collectionName: string, supabaseTableName: string, mapper: (doc: any) => any) {
    console.log(`Migrating: ${collectionName} -> ${supabaseTableName}`);
    const snapshot = await firestore.collection(collectionName).get();

    const records = [];
    for (const doc of snapshot.docs) {
        const data = doc.data();
        records.push(mapper({ id: doc.id, ...data }));
    }

    if (records.length === 0) {
        console.log(`No records found in ${collectionName}. Skipping.`);
        return;
    }

    // Upsert into Supabase for idempotency (won't duplicate if run twice)
    const { error } = await supabase.from(supabaseTableName).upsert(records);
    if (error) {
        console.error(`Error migrating ${collectionName}:`, error);
    } else {
        console.log(`Successfully migrated ${records.length} records to ${supabaseTableName}.`);
    }
}

async function runMigration() {
    try {
        console.log('--- Migration Started ---');

        // 1. Settings (Tags)
        await migrateCollection('settings', 'settings', (doc) => ({
            id: doc.id,
            data: { list: doc.list }
        }));

        // 2. Products
        await migrateCollection('products', 'products', (doc) => {
            const { id, category, name, ...rest } = doc;
            return {
                // Supplying UUID requires translating Firebase format to UUID if needed, else we can keep Firebase ID natively if we alter Schema ID to TEXT instead of UUID.
                // *Note: The proposed schema uses UUID natively, so we pass no ID to let Supabase generate it, storing former ID inside JSON or altering Schema.*
                // Assuming schema.sql is altered for TEXT IDs or we extract logic.
                category: category || 'Unknown',
                name: name || 'Unnamed',
                data: rest
            };
        });

        // 3. User Overrides
        await migrateCollection('user_overrides', 'user_overrides', (doc) => ({
            email: doc.email,
            roles: doc.roles || [],
            badges: doc.badges || []
        }));

        // 4. Color Profiles
        await migrateCollection('color_profiles', 'color_profiles', (doc) => {
            const { id, name, ...rest } = doc;
            return { name: name || 'Profile', data: rest };
        });

        // 5. Tutorials
        await migrateCollection('tutorials', 'tutorials', (doc) => {
            const { id, title, ...rest } = doc;
            return { title: title || 'Tutorial', data: rest };
        });

        // 6. Live Reports
        await migrateCollection('live_reports', 'live_reports', (doc) => {
            const { id, userEmail, ...rest } = doc;
            return { user_email: userEmail || 'unknown@example.com', data: rest };
        });

        console.log('--- Migration Complete ---');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

runMigration();
