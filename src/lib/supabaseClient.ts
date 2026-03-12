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
// Live Stream Configs (Settings)
// ============================================
export async function getLiveStreamConfig() {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 'livestream').single();
    if (!error && data?.data) {
        return data.data;
    }
    return { 
        pictureProfile: `Công thức PROCOLOR-001: ClearCast Pro
- Black Level: -5
- Gamma: S-Cinetone
- Black Gamma: Wide -7
- Knee: Auto
- Color Mode: S-Cinetone
- Saturation: +8
- Color Phase: 0
- Color Depth: R-1, G-1, B+1, C+1, M+1, Y-1
- Detail: Lvl 0, Mode Manual, V/H Bal 2, B/W Bal Type 3, Limit 3, Crisp 7, Hi-Light 4` 
    };
}

export async function updateLiveStreamConfig(config: any) {
    await supabase.from('settings').upsert({ id: 'livestream', data: config });
}

// ============================================
// Live Stream Equipment (Settings)
// ============================================
export async function getLiveStreamEquipment() {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 'livestream_equipment').single();
    if (!error && data?.data) {
        return data.data;
    }
    return [
        { id: 1, group: 'Live Computer', brand: 'Asus', gearList: 'PC', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 2, group: 'Live Computer', brand: 'Asus', gearList: 'ProArt Monitor', quantity: 2, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 3, group: 'Capture Card', brand: 'Elgato', gearList: 'Stream Deck', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 4, group: 'Capture Card', brand: 'Elgato', gearList: 'Wave XLR', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 5, group: 'Accessories', brand: '', gearList: 'XLR Cables', quantity: '', serialNumber: '', source: '', status: '', checked: false },
        { id: 6, group: 'Accessories', brand: '', gearList: 'HDMI Cables', quantity: '', serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 7, group: 'Lighting', brand: 'Elgato', gearList: 'Key Light Air', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 8, group: 'Lighting', brand: 'Nanlite', gearList: 'Forza 60B II', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 9, group: 'Lighting', brand: 'Nanlite', gearList: 'FS-300B', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 10, group: 'Lighting', brand: 'Nanlite', gearList: 'Tube 30C', quantity: 2, serialNumber: '', source: 'Trainer', status: 'Good', checked: false },
        { id: 11, group: 'Lighting', brand: 'Nanlite', gearList: 'Parvo Slim 120C & Pack', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 12, group: 'Lighting', brand: 'Amaran', gearList: '200X', quantity: 2, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 13, group: 'Lighting', brand: 'Zhiyun', gearList: '20W RGB', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 14, group: 'Lighting', brand: 'Zhiyun', gearList: '40W', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 15, group: 'Light Mods', brand: 'Apurture', gearList: 'Fresnel', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 16, group: 'Light Mods', brand: 'Apurture', gearList: 'Light Dome', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 17, group: 'Light Mods', brand: 'Nanlite', gearList: 'Softbox 60 FMM', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 18, group: 'Light Stands', brand: '', gearList: 'Black', quantity: 2, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 19, group: 'Light Stands', brand: '', gearList: 'Chrome', quantity: 1, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 20, group: 'Light Stands', brand: '', gearList: 'Chrome', quantity: 1, serialNumber: '', source: 'Trainer', status: 'Good', checked: false },
        { id: 21, group: 'Tripod', brand: 'Benro', gearList: 'KH26', quantity: 3, serialNumber: '', source: 'VDK', status: 'Good', checked: false },
        { id: 22, group: 'Camera', brand: '', gearList: '', quantity: '', serialNumber: '', source: 'DI-MKT', status: 'Good', checked: false },
        { id: 23, group: 'Camera', brand: '', gearList: '', quantity: '', serialNumber: '', source: 'DI-MKT', status: 'Good', checked: false },
        { id: 24, group: 'Camera', brand: '', gearList: '', quantity: '', serialNumber: '', source: 'DI-MKT', status: 'Good', checked: false },
        { id: 25, group: 'Lens', brand: '', gearList: '', quantity: '', serialNumber: '', source: 'DI-MKT', status: 'Good', checked: false },
        { id: 26, group: 'Lens', brand: '', gearList: '', quantity: '', serialNumber: '', source: 'DI-MKT', status: 'Good', checked: false },
        { id: 27, group: 'Lens', brand: '', gearList: '', quantity: '', serialNumber: '', source: 'DI-MKT', status: 'Good', checked: false },
        { id: 28, group: 'Microphone', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 29, group: 'Microphone', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 30, group: 'Microphone', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 31, group: '', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 32, group: '', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 33, group: '', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 34, group: '', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 35, group: '', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 36, group: '', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 37, group: '', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 38, group: '', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false },
        { id: 39, group: '', brand: '', gearList: '', quantity: '', serialNumber: '', source: '', status: 'Good', checked: false }
    ];
}

export async function updateLiveStreamEquipment(equipmentList: any[]) {
    await supabase.from('settings').upsert({ id: 'livestream_equipment', data: equipmentList });
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
