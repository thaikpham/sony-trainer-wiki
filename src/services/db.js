import { db } from '../lib/firebase';
import {
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    updateDoc,
    addDoc,
    serverTimestamp,
    query,
    where,
    orderBy,
} from 'firebase/firestore';

// ============================================
// In-memory Promise Caches
// ============================================
let colorProfilesCache = null;
let tutorialsCache = null;
let productsCache = null;

// ============================================
// CRUD cho Color Profiles (ColorLab)
// ============================================

/**
 * Lấy toàn bộ danh sách Color Profiles từ Firebase
 */
export function getColorProfiles() {
    if (colorProfilesCache) {
        return colorProfilesCache;
    }

    colorProfilesCache = async function fetchColorProfiles() {
        try {
            const profilesCol = collection(db, 'color_profiles');
            const profileSnapshot = await getDocs(profilesCol);
            return profileSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            colorProfilesCache = null;
            throw error;
        }
    }();

    return colorProfilesCache;
}

/**
 * Lấy một Color Profile theo ID
 */
export async function getColorProfile(id) {
    const docRef = doc(db, 'color_profiles', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}

// ============================================
// Global Tags (Settings)
// ============================================
export async function getGlobalTags() {
    const docRef = doc(db, 'settings', 'tags');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().list) {
        return snap.data().list;
    }
    const defaultTags = [
        // Máy Ảnh & Máy Quay Film tags (từ Airtable DI)
        'Full-Frame', 'APS-C', '1-inch', 'Compact', 'ZV', 'Cinemaline',
        'Ống kính rời', '4K 120p', '8K', 'Mirrorless', 'S-Log3', 'S-Cinetone',
        // Ống kính
        'G Master', 'G Lens', 'OSS', 'Zeiss', 'Macro', 'Cinema',
        // Âm thanh & Tai nghe
        'Noise Cancelling', 'LDAC', 'Hi-Res Audio', '360 RA',
        // Tivi
        'Bravia XR', 'OLED', 'Mini LED', '4K HDR',
        // Khác
        '5G Ready', 'IP68', 'ZEISS Optics',
    ];
    await setDoc(docRef, { list: defaultTags });
    return defaultTags;
}

export async function updateGlobalTags(tags) {
    await setDoc(doc(db, 'settings', 'tags'), { list: tags });
}

// ============================================
// CRUD cho Livestream Tutorials
// ============================================

/**
 * Lấy toàn bộ danh sách Hướng dẫn Livestream từ Firebase
 */
export function getLivestreamTutorials() {
    if (tutorialsCache) {
        return tutorialsCache;
    }

    tutorialsCache = async function fetchTutorials() {
        try {
            const tutorialsCol = collection(db, 'tutorials');
            const tutorialSnapshot = await getDocs(tutorialsCol);
            return tutorialSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            tutorialsCache = null;
            throw error;
        }
    }();

    return tutorialsCache;
}

// ============================================
// CRUD cho All Products (Camera & Lens)
// ============================================

/**
 * Lấy toàn bộ danh sách Sản phẩm thiết bị (Camera, Lenses...) từ Firebase
 */
export function getProducts() {
    if (productsCache) {
        return productsCache;
    }

    productsCache = async function fetchProducts() {
        try {
            const productsCol = collection(db, 'products');
            const productSnapshot = await getDocs(productsCol);
            return productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            productsCache = null;
            throw error;
        }
    }();

    return productsCache;
}

/** Invalidate the products cache (call after any write). */
export function invalidateProductsCache() {
    productsCache = null;
}

/**
 * Fetch all products fresh (no cache) — for Admin Panel use.
 */
export async function getAllProductsAdmin() {
    const productsCol = collection(db, 'products');
    const productSnapshot = await getDocs(productsCol);
    return productSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Add a new product document. Returns the new document ID.
 */
export async function addProduct(data) {
    const productsCol = collection(db, 'products');
    const docRef = await addDoc(productsCol, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    invalidateProductsCache();
    return docRef.id;
}

/**
 * Update an existing product document by ID.
 */
export async function updateProduct(id, data) {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
    });
    invalidateProductsCache();
}

/**
 * Delete a product document by ID.
 */
export async function deleteProduct(id) {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
    invalidateProductsCache();
}

// ============================================
// CRUD cho Livestream Reports (Post-Live)
// ============================================

/**
 * Lưu báo cáo sau phiên live vào Firestore
 */
export async function saveLiveReport(data) {
    const reportsCol = collection(db, 'live_reports');
    const docRef = await addDoc(reportsCol, {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

/**
 * Lấy danh sách báo cáo của một người dùng cụ thể
 */
export async function getLiveReports(email) {
    const reportsCol = collection(db, 'live_reports');
    const q = query(
        reportsCol,
        where('userEmail', '==', email),
        orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Lấy toàn bộ báo cáo (Dành cho Admin)
 */
export async function getAllLiveReportsAdmin() {
    const reportsCol = collection(db, 'live_reports');
    const q = query(reportsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Xóa báo cáo livestream theo ID (Chỉ dành cho DEV)
 */
export async function deleteLiveReport(id) {
    const docRef = doc(db, 'live_reports', id);
    await deleteDoc(docRef);
}

// ============================================
// CRUD cho User Overrides (Dev Panel)
// Lưu override roles/badges theo email vào Firestore
// ============================================

/**
 * Lấy override roles/badges của 1 email (nếu có).
 */
export async function getUserOverride(email) {
    const id = email.replace(/[@.]/g, '_');
    const docRef = doc(db, 'user_overrides', id);
    const snap = await getDoc(docRef);
    if (snap.exists()) return { id: snap.id, email, ...snap.data() };
    return null;
}

/**
 * Lưu (hoặc cập nhật) override roles/badges cho 1 email.
 * data: { roles: string[], badges: string[] }
 */
export async function setUserOverride(email, data) {
    const id = email.replace(/[@.]/g, '_');
    const docRef = doc(db, 'user_overrides', id);
    await setDoc(docRef, { email, ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Xóa override (khôi phục về ROLE_EMAIL_MAP defaults).
 */
export async function deleteUserOverride(email) {
    const id = email.replace(/[@.]/g, '_');
    const docRef = doc(db, 'user_overrides', id);
    await deleteDoc(docRef);
}

/**
 * Lấy toàn bộ overrides (dành cho Dev Panel).
 */
export async function getAllUserOverrides() {
    const col = collection(db, 'user_overrides');
    const snapshot = await getDocs(col);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}
