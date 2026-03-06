import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
// Load environment variables from .env file if present
dotenv.config();
let app;
let db;
export const initializeFirebase = () => {
    if (db) {
        return db;
    }
    try {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        // Replace literal \n with actual newlines to support .env single-line strings
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
        if (!projectId || !clientEmail || !privateKey) {
            throw new Error('Missing necessary Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
        }
        // Check if an app is already initialized to prevent duplicate initialization
        if (getApps().length === 0) {
            app = initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.error('Firebase Admin successfully initialized.');
        }
        else {
            app = getApps()[0];
        }
        db = getFirestore(app);
        return db;
    }
    catch (error) {
        console.error('Failed to initialize Firebase:', error);
        // Rethrow to stop the server if DB is required to function
        throw error;
    }
};
// Export a getter so handlers can access the db safely
export const getDb = () => {
    if (!db) {
        return initializeFirebase();
    }
    return db;
};
