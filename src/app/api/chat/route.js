import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';

export async function POST(request) {
    try {
        const { chatHistory, context } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY || "";
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!apiKey || !supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { error: 'missing_credentials' },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const genAI = new GoogleGenerativeAI(apiKey);
        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        // Lấy câu hỏi cuối cùng của user
        const userMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].text : "";

        let retrievedContext = "";

        try {
            // 1. Nhúng câu hỏi của User bằng Gemini (768 dims)
            const embeddingResult = await embeddingModel.embedContent({
                content: { role: 'user', parts: [{ text: userMessage }] },
                taskType: TaskType.RETRIEVAL_QUERY,
                outputDimensionality: 768
            });
            const userVector = embeddingResult.embedding.values;

            // 2. Query Supabase Vector Search
            const { data: matches, error: searchError } = await supabase.rpc('match_knowledge_chunks', {
                query_embedding: userVector,
                match_threshold: 0.5,
                match_count: 3
            });

            if (searchError) throw searchError;
            
            if (matches && matches.length > 0) {
                retrievedContext = matches.map((m) => m.content).join('\n\n---\n\n');
            }
        } catch (err) {
            console.error("Supabase Vector Query failed: ", err);
            // Fallback
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

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
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
