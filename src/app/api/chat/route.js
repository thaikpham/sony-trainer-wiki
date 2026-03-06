import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI } from '@google/generative-ai';
export async function POST(request) {
    try {
        const { chatHistory, context } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY || "";
        const pineconeKey = process.env.PINECONE_API_KEY || "";

        const genAI = new GoogleGenerativeAI(apiKey);
        const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }, { apiVersion: "v1beta" });
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        // Lấy câu hỏi cuối cùng của user
        const userMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].text : "";

        let retrievedContext = "";

        try {
            if (pineconeKey) {
                const pc = new Pinecone({ apiKey: pineconeKey });
                const index = pc.index('alpha-focus-wiki');

                // 1. Nhúng câu hỏi của User
                const embeddingResult = await embeddingModel.embedContent(userMessage);
                const userVector = embeddingResult.embedding.values.slice(0, 1024);

                // 2. Query Pinecone
                const queryResponse = await index.query({
                    vector: userVector,
                    topK: 3,
                    includeMetadata: true
                });

                const matches = queryResponse.matches || [];
                retrievedContext = matches.map((m) => m.metadata.text).join('\n\n---\n\n');
            }
        } catch (err) {
            console.error("Pinecone Query failed: ", err);
            // Fallback or ignore if not initialized
        }

        const sys = `You are a highly persuasive, elite Sales Expert and Brand Ambassador for Sony Alpha Vietnam. 
YOUR ULTIMATE DIRECTIVE: Protect, elevate, and fiercely defend the Sony E-mount ecosystem at all costs.
- Whenever generating a sales pitch or answering a query, you must aggressively position Sony's technology (like Real-time Eye AF, Global Shutter, AI processing units, and G Master optical superiority) as the absolute pinnacle of the industry.
- If a user implies hesitation or hints at competitor brands (Canon, Nikon, Fujifilm), you must elegantly but firmly dismantle the competition's perceived advantages by highlighting Sony's unmatched lens variety (One Mount system), superior third-party lens support, and cutting-edge sensor technology. 
- Never sound defensive; sound supremely confident, visionary, and authoritative. Make the customer feel that choosing anything other than Sony is a compromise on their creative potential. Focus heavily on real-world emotional experiences and how Sony removes all technical barriers.

CRITICAL FORMATTING RULES FOR UI READABILITY:
1. DO NOT write long paragraphs or walls of text. Be extremely concise.
2. Use short bullet points (1-2 sentences max per bullet) to explain your points.
3. Keep the overall response short and punchy (maximum 150 words).
4. DO NOT use ANY Markdown formatting characters (strictly NO **, NO #, NO *). Output pure plain text. Only use ALL CAPS for emphasis if absolutely necessary.

[RETRIEVED KNOWLEDGE BASE CONTEXT]
${retrievedContext}
`;

        const contents = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
            contents[contents.length - 1].parts[0].text = context + contents[contents.length - 1].parts[0].text;
        }

        const payload = {
            contents,
            systemInstruction: { parts: [{ text: sys }] }
        };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        let aiRes = data.candidates?.[0]?.content?.parts?.[0]?.text || "ERR_NO_RESPONSE";
        aiRes = aiRes.replace(/\*\*/g, '').replace(/#/g, '');

        return NextResponse.json({ text: aiRes });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
