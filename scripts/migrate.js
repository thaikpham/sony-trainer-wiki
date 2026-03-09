import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, deleteField } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('Using Project ID:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
    console.log("Fetching products to migrate...");
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    let count = 0;

    for (const d of snapshot.docs) {
        const data = d.data();
        if (data.model !== undefined) {
            await updateDoc(doc(db, 'products', d.id), {
                kataban: data.model,
                model: deleteField()
            });
            count++;
            console.log(`Migrated ${count}: ${data.name}`);
        }
    }
    console.log(`Successfully migrated ${count} products in Firestore.`);
}

migrate().then(() => {
    console.log("Done");
    process.exit(0);
}).catch(console.error);
