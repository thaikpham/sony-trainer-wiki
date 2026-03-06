import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(req) {
    try {
        const user = await currentUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const dataStoreRef = collection(db, 'DataStore');
        const snapshot = await getDocs(dataStoreRef);

        let count = 0;
        const promises = [];

        snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            if (data.highlights) {
                const docRef = doc(db, 'DataStore', docSnapshot.id);
                promises.push(updateDoc(docRef, { highlights: '' }));
                count++;
            }
        });

        await Promise.all(promises);

        return NextResponse.json({ message: `Successfully wiped highlights for ${count} products.` });
    } catch (error) {
        console.error('Error wiping highlights:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
