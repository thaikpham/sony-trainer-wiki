import { getLivestreamTutorials } from '../services/db.js';

async function dump() {
    const data = await getLivestreamTutorials();
}

dump();
