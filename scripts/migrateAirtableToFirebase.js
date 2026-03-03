import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import 'dotenv/config'; // Required to load .env.local

// --- Firebase Configuration ---
// Make sure this matches your personal project credentials
const firebaseConfig = {
    apiKey: "AIzaSyCpIRmEaisOYWyWRdIIU55cXhbP-f6CllA",
    authDomain: "wiki-portal-47be7.firebaseapp.com",
    projectId: "wiki-portal-47be7",
    storageBucket: "wiki-portal-47be7.firebasestorage.app",
    messagingSenderId: "321148320222",
    appId: "1:321148320222:web:c779316705053af392054f",
    measurementId: "G-Z5HK165QBG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Airtable Configuration ---
// Read these from wherever process.env gets them. We'll simulate the load if run standalone.
// For Next.js scripts, it's best to run with: npx dotenv-cli -v .env.local -- node scripts/migrateAirtableToFirebase.js
const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;
const cameraTableId = process.env.AIRTABLE_CAMERA_TABLE_ID || process.env.AIRTABLE_TABLE_ID;
const lensTableId = process.env.AIRTABLE_LENS_TABLE_ID;

async function migrate() {
    console.log("Starting migration from Airtable to Firestore...");

    if (!token || !baseId || (!cameraTableId && !lensTableId)) {
        console.error("Missing Airtable credentials. Please ensure .env.local variables are loaded.");
        process.exit(1);
    }

    try {
        const fetchOptions = {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        };

        const fetchPromises = [];

        if (cameraTableId) {
            console.log(`Fetching from Camera Table: ${cameraTableId}`);
            fetchPromises.push(
                fetch(`https://api.airtable.com/v0/${baseId}/${cameraTableId}`, fetchOptions)
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (data && data.records) {
                            return data.records.map(record => ({ ...record, _autoType: 'Body' }));
                        }
                        return [];
                    })
            );
        }

        if (lensTableId) {
            console.log(`Fetching from Lens Table: ${lensTableId}`);
            fetchPromises.push(
                fetch(`https://api.airtable.com/v0/${baseId}/${lensTableId}`, fetchOptions)
                    .then(res => res.ok ? res.json() : null)
                    .then(data => {
                        if (data && data.records) {
                            return data.records.map(record => ({ ...record, _autoType: 'Lens' }));
                        }
                        return [];
                    })
            );
        }

        const results = await Promise.all(fetchPromises);
        let allRecords = [];

        results.forEach(records => {
            if (records && Array.isArray(records)) {
                allRecords = [...allRecords, ...records];
            }
        });

        console.log(`Fetched ${allRecords.length} records in total from Airtable.`);

        if (allRecords.length === 0) {
            console.log("No records found to migrate.");
            return;
        }

        // Map data to the standardized format
        const mappedProducts = allRecords.map(record => {
            const fields = record.fields;

            const rawName = fields['Product Name'] || fields['Name'];
            const rawTags = fields['Product Type'] || fields['Assignee'] || [];
            const rawModel = fields['Model Name'] || fields['Notes'] || '';
            const rawHighlights = fields['Key Features'] || 'Chưa cập nhật thông số nổi bật';
            const rawUrl = fields['URL'] || fields['Attachments'] || '';

            let type = record._autoType || 'Khác';

            if (type === 'Khác' && rawTags.length > 0) {
                if (rawTags.includes('Body') || rawTags.includes('Camera')) type = 'Body';
                else if (rawTags.includes('Lens') || rawTags.includes('Ống kính rời')) type = 'Lens';
                else if (rawTags.includes('Phụ kiện')) type = 'Phụ kiện';
            }

            return {
                id: record.id,
                name: rawName || 'Unknown Product',
                type: type,
                category: rawModel,
                tags: rawTags,
                highlights: rawHighlights,
                url: rawUrl,
                price: 'N/A',
                weight: 'N/A'
            };
        });

        // Write to Firestore in batches (Firestore limit is 500 writes per batch)
        const productsCol = collection(db, 'products');
        let batch = writeBatch(db);
        let count = 0;
        let batchCount = 1;

        console.log("Writing to Firestore 'products' collection...");

        for (const product of mappedProducts) {
            // Use Airtable ID as the Firestore Document ID, or let Firestore generate one
            const docRef = doc(productsCol, product.id);

            // Clean up the object to remove undefined values which Firestore rejects
            const cleanProduct = {
                name: product.name,
                type: product.type,
                category: product.category || '',
                tags: Array.isArray(product.tags) ? product.tags : [],
                highlights: product.highlights || '',
                url: product.url || '',
                price: product.price,
                weight: product.weight
            };

            batch.set(docRef, cleanProduct);
            count++;

            // Commit batch when it reaches 450
            if (count === 450) {
                console.log(`Committing batch ${batchCount}...`);
                await batch.commit();
                console.log(`Batch ${batchCount} committed.`);
                batch = writeBatch(db); // creating new batch instance
                count = 0;
                batchCount++;
            }
        }

        // Commit any remaining writes
        if (count > 0) {
            console.log(`Committing final batch ${batchCount} (${count} items)...`);
            await batch.commit();
            console.log(`Final batch committed.`);
        }

        console.log("Migration completed successfully!");

    } catch (error) {
        console.error('Error during migration:', error);
    }
}

migrate()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
