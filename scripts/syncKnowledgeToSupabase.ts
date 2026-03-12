import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseKey || !geminiKey) {
    console.error('Missing environment variables: URL, KEY, or GEMINI_API_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function sync() {
    console.log('--- Starting Sony Wiki Knowledge Sync ---');

    // 2. Fetch Products
    const { data: products, error: pError } = await supabase.from('products').select('*');
    if (pError) throw pError;
    console.log(`> Syncing ${products.length} products...`);

    for (const item of products) {
        try {
            const content = `[PRODUCT]
Name: ${item.name}
Category: ${item.category}
Details: ${JSON.stringify(item.data)}`;

            const result = await model.embedContent({
                content: { role: 'user', parts: [{ text: content }] },
                taskType: TaskType.RETRIEVAL_DOCUMENT,
                outputDimensionality: 768
            });
            const embedding = result.embedding.values;
            if (item === products[0]) console.log(`Detected dimension: ${embedding.length}`);

            const { error: upsertError } = await supabase.from('knowledge_chunks').upsert({
                source_type: 'product',
                source_id: item.id,
                content: content,
                embedding: embedding
            }, { onConflict: 'source_id' });

            if (upsertError) console.error(`Failed to sync product ${item.name}:`, upsertError.message);
            await sleep(4000); // 4000ms delay for 15 RPM limit
        } catch (e) {
            console.error(`Error processing product ${item.name}:`, e);
        }
    }

    // 3. Fetch Tutorials
    const { data: tutorials, error: tError } = await supabase.from('tutorials').select('*');
    if (tError) throw tError;
    console.log(`> Syncing ${tutorials.length} tutorials...`);

    for (const item of tutorials) {
        try {
            const content = `[TUTORIAL]
Title: ${item.title}
Content: ${JSON.stringify(item.data)}`;

            const result = await model.embedContent({
                content: { role: 'user', parts: [{ text: content }] },
                taskType: TaskType.RETRIEVAL_DOCUMENT,
                outputDimensionality: 768
            });
            const embedding = result.embedding.values;

            const { error: upsertError } = await supabase.from('knowledge_chunks').upsert({
                source_type: 'tutorial',
                source_id: item.id,
                content: content,
                embedding: embedding
            }, { onConflict: 'source_id' });

            if (upsertError) console.error(`Failed to sync tutorial ${item.title}:`, upsertError.message);
            await sleep(4000);
        } catch (e) {
            console.error(`Error processing tutorial ${item.title}:`, e);
        }
    }

    // 4. Fetch Color Profiles
    const { data: profiles, error: prError } = await supabase.from('color_profiles').select('*');
    if (prError) throw prError;
    console.log(`> Syncing ${profiles.length} color profiles...`);

    for (const item of profiles) {
        try {
            const content = `[COLOR_PROFILE]
Name: ${item.name}
Settings: ${JSON.stringify(item.data)}`;

            const result = await model.embedContent({
                content: { role: 'user', parts: [{ text: content }] },
                taskType: TaskType.RETRIEVAL_DOCUMENT,
                outputDimensionality: 768
            });
            const embedding = result.embedding.values;

            const { error: upsertError } = await supabase.from('knowledge_chunks').upsert({
                source_type: 'color_profile',
                source_id: item.id,
                content: content,
                embedding: embedding
            }, { onConflict: 'source_id' });

            if (upsertError) console.error(`Failed to sync profile ${item.name}:`, upsertError.message);
            await sleep(500);
        } catch (e) {
            console.error(`Error processing profile ${item.name}:`, e);
        }
    }

    console.log('--- Sync Completed Successfully ---');
}

sync().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
