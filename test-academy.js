import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
    console.log("Fetching paths...");
    const paths = await supabase.from('academy_paths').select('*').order('order_index', { ascending: true });
    console.log("Paths:", paths.error || paths.data);
    
    if (paths.data?.length > 0) {
       const pathId = paths.data[0].id;
       console.log("Fetching nodes for path", pathId);
       const nodes = await supabase.from('academy_nodes').select('*').eq('path_id', pathId).order('order_index', { ascending: true });
       console.log("Nodes:", nodes.error || nodes.data);
    }

    const userId = "test-user-id";
    console.log("Fetching progress for user", userId);
    const progress = await supabase.from('academy_user_progress').select('*').eq('user_id', userId);
    console.log("Progress:", progress.error || progress.data);

    console.log("Inserting progress for user", userId);
    const insert = await supabase.from('academy_user_progress').upsert({
        user_id: userId,
        node_id: "11111111-1111-1111-1111-111111111111",
        status: 'active'
    });
    console.log("Insert Output:", insert);
}

testFetch().catch(console.error);
