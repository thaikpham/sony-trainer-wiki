import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; // Allow more time for this route as it does web search and embeddings

export async function POST(request) {
    // Basic API Key authentication to prevent abuse
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY || "";
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!apiKey || !supabaseUrl || !supabaseKey) {
            throw new Error("Missing API keys or Supabase credentials");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Step 1: Scout Agent (Gemini + Google Search)
        const geminiModel = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                temperature: 0.1,
            }
        });

        const scoutPrompt = `
        You are an elite Sony camera equipment researcher. 
        Your task is to use Google Search to find ANY Sony E-mount cameras or lenses that have been announced or released in the last 6 months.
        You MUST ONLY use information from official Sony websites, B&H Photo Video, or Adorama. Do NOT use rumor sites (like Sony Alpha Rumors).

        For any new product found, you must return a JSON array containing objects with the following structure:
        [
            {
                "productName": "Full name of the product (e.g., Sony FE 100mm F2.8 Macro GM)",
                "category": "Camera Body OR Lens",
                "tier": "Entry-level, Enthusiast, Professional, or Flagship",
                "keySpecs": "2-3 short sentences summarizing the most important technical specifications (megapixels, aperture, special features).",
                "estimatedPriceVND": "Integer estimate of the price in VND (e.g. 50000000)",
                "targetUser": "1 sentence describing who this is for (e.g., Professional portrait and macro photographers)."
            }
        ]

        CRITICAL INSTRUCTION: Return ONLY the raw JSON array. Do not wrap it in markdown blockticks like \`\`\`json. Return an empty array [] if no new significant gear was released in the last 6 months.
        `;

        const searchResult = await geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: scoutPrompt }] }],
            tools: [{ googleSearch: {} }]
        });

        let responseText = searchResult.response.text();
        responseText = responseText.replace(/^\`\`\`json\s*/, '').replace(/\`\`\`$/, '').trim();

        const newProducts = JSON.parse(responseText);

        if (!Array.isArray(newProducts) || newProducts.length === 0) {
            return NextResponse.json({ message: "No new products found adjusting the last 6 months window.", productsFound: 0 });
        }

        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        let syncedCount = 0;

        for (const product of newProducts) {
            // Check if product already exists in knowledge_chunks (prevent duplicates)
            const sourceId = product.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            const { data: existing } = await supabase
                .from('knowledge_chunks')
                .select('id')
                .eq('source_id', sourceId)
                .single();

            if (existing) continue;

            // Generate Embedding
            const textChunk = `[AUTO-INGESTED PRODUCT]
Name: ${product.productName}
Category: ${product.category}
Tier: ${product.tier}
Specs: ${product.keySpecs}
Target User: ${product.targetUser}
Price: ~${(product.estimatedPriceVND || 0).toLocaleString()} VND`;

            const embResult = await embeddingModel.embedContent({
                content: { role: 'user', parts: [{ text: textChunk }] },
                taskType: TaskType.RETRIEVAL_DOCUMENT,
                outputDimensionality: 768
            });

            // Upsert into Supabase
            const { error: upsertError } = await supabase.from('knowledge_chunks').insert({
                source_type: 'auto-ingested-product',
                source_id: sourceId,
                content: textChunk,
                embedding: embResult.embedding.values
            });

            if (!upsertError) syncedCount++;
        }

        return NextResponse.json({
            message: "Successfully synced new knowledge to the AI Brain in Supabase.",
            productsSynced: syncedCount,
            details: newProducts
        });

    } catch (error) {
        console.error("Autonomous Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
