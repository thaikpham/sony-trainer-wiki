import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  if (typeof window === 'undefined') {
    console.warn('[SupabaseAdmin] Missing environment variables for admin client.');
  }
}

// THIS SHOULD ONLY BE IMPORTED IN SERVER-SIDE CODE (SERVER ACTIONS, API ROUTES, SERVER COMPONENTS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
