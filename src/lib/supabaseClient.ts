import { createClient } from '@supabase/supabase-js';

// Environment variables required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.warn('[Supabase] Missing environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// In-memory Promise Caches (matching original db.js)
// ============================================
let colorProfilesCache: Promise<any[]> | null = null;
let tutorialsCache: Promise<any[]> | null = null;
let productsCache: Promise<any[]> | null = null;
let globalTagsCache: Promise<string[]> | null = null;

// Helper to structure Supabase data back to exactly what components expect: { id, ...data }
const mapDataToDoc = (row: any) => {
    return { id: row.id, ...row.data, created_at: row.created_at, updated_at: row.updated_at };
};

// ============================================
// CRUD for Color Profiles
// ============================================
export function getColorProfiles() {
    if (colorProfilesCache) return colorProfilesCache;

    colorProfilesCache = (async () => {
        try {
            const { data, error } = await supabase.from('color_profiles').select('*');
            if (error) throw error;
            return (data || []).map(mapDataToDoc);
        } catch (e) {
            colorProfilesCache = null;
            throw e;
        }
    })();
    return colorProfilesCache;
}

export async function getColorProfile(id: string) {
    const { data, error } = await supabase.from('color_profiles').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDataToDoc(data);
}

// ============================================
// Global Tags (Settings)
// ============================================
export async function getGlobalTags() {
    if (globalTagsCache) return await globalTagsCache;
    const { data, error } = await supabase.from('settings').select('*').eq('id', 'tags').single();
    if (!error && data?.data?.list) {
        globalTagsCache = Promise.resolve(data.data.list);
        return data.data.list;
    }
    return [];
}

export async function updateGlobalTags(tags: string[]) {
    globalTagsCache = Promise.resolve(tags);
    await supabase.from('settings').upsert({ id: 'tags', data: { list: tags } });
}

// ============================================
// CRUD for Tutorials
// ============================================
export function getLivestreamTutorials() {
    if (tutorialsCache) return tutorialsCache;

    tutorialsCache = (async () => {
        try {
            const { data, error } = await supabase.from('tutorials').select('*');
            if (error) throw error;
            return (data || []).map(mapDataToDoc);
        } catch (e) {
            tutorialsCache = null;
            throw e;
        }
    })();
    return tutorialsCache;
}

// ============================================
// CRUD for Products
// ============================================
export function getProducts() {
    if (productsCache) return productsCache;

    productsCache = (async () => {
        try {
            const { data, error } = await supabase.from('products').select('*');
            if (error) throw error;
            return (data || []).map(mapDataToDoc);
        } catch (e) {
            productsCache = null;
            throw e;
        }
    })();
    return productsCache;
}

export function invalidateProductsCache() {
    productsCache = null;
}

export async function getAllProductsAdmin() {
    const { data } = await supabase.from('products').select('*');
    return (data || []).map(mapDataToDoc);
}

export async function addProduct(productData: any) {
    const { id, category, line, name, ...restData } = productData;
    const { data, error } = await supabase.from('products').insert({
        category, name, data: restData
    }).select('id').single();

    if (error) throw error;
    invalidateProductsCache();
    return data.id;
}

export async function updateProduct(id: string, productData: any) {
    const { id: ignoredId, category, line, name, ...restData } = productData;
    
    // Only include fields that actually exist in productData to avoid overwriting with undefined
    const updatePayload: any = {
        updated_at: new Date().toISOString()
    };
    if (category !== undefined) updatePayload.category = category;
    if (name !== undefined) updatePayload.name = name;
    
    // Merge existing data if we are doing a partial update (like saving tags in admin)
    if (Object.keys(restData).length > 0) {
        // Fetch current data first to merge jsonb correctly
        const { data: currentDoc } = await supabase.from('products').select('data').eq('id', id).single();
        updatePayload.data = { ...(currentDoc?.data || {}), ...restData };
    }

    await supabase.from('products').update(updatePayload).eq('id', id);
    invalidateProductsCache();
}

export async function deleteProduct(id: string) {
    await supabase.from('products').delete().eq('id', id);
    invalidateProductsCache();
}

// ============================================
// CRUD for Live Reports
// ============================================
export async function saveLiveReport(reportData: any) {
    const { userEmail, ...restData } = reportData;
    const { data } = await supabase.from('live_reports').insert({
        user_email: userEmail, data: restData
    }).select('id').single();
    return data?.id;
}

export async function getLiveReports(email: string) {
    const { data } = await supabase.from('live_reports').select('*').eq('user_email', email).order('created_at', { ascending: false });
    return (data || []).map(mapDataToDoc);
}

export async function getAllLiveReportsAdmin() {
    const { data } = await supabase.from('live_reports').select('*').order('created_at', { ascending: false });
    return (data || []).map(mapDataToDoc);
}

export async function deleteLiveReport(id: string) {
    await supabase.from('live_reports').delete().eq('id', id);
}

// ============================================
// User Overrides
// ============================================
export async function getUserOverride(email: string) {
    const { data } = await supabase.from('user_overrides').select('*').eq('email', email).single();
    return data || null;
}

export async function setUserOverride(email: string, overrideData: any) {
    await supabase.from('user_overrides').upsert({ email, ...overrideData });
}

export async function deleteUserOverride(email: string) {
    await supabase.from('user_overrides').delete().eq('email', email);
}

export async function getAllUserOverrides() {
    const { data } = await supabase.from('user_overrides').select('*');
    return data || [];
}
