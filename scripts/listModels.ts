import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
async function list() {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
}
list().catch(console.error);
