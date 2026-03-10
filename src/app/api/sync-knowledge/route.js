import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { callMcpTool } from '@/lib/mcp';

export const maxDuration = 60; // Allow more time for this route as it does web search and embeddings

export async function POST(request) {
    // Basic API Key authentication to prevent abuse
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY || "";
        const pineconeKey = process.env.PINECONE_API_KEY || "";

        if (!apiKey || !pineconeKey) {
            throw new Error("Missing API keys for Gemini or Pinecone");
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // Step 1: Scout Agent (Gemini + Google Search)
        const geminiModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.1, // Low temp for factual data
            }
        });

        // The exact prompt to find new gear
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

        const productsToSync = newProducts.map(product => {
            const textChunk = `
            Product: ${product.productName}
            Category: ${product.category}
            Tier: ${product.tier}
            Specs: ${product.keySpecs}
            Target User: ${product.targetUser}
            Price: ~${(product.estimatedPriceVND || 0).toLocaleString()} VND
            `;
            const vectorId = product.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            return {
                id: vectorId,
                text: textChunk,
                metadata: {
                    type: "auto-ingested-product",
                    category: product.category,
                    tier: product.tier
                }
            };
        });

        // Step 2: Upsert into Pinecone via MCP Server
        await callMcpTool('upsert_trainer_wiki_knowledge', { products: productsToSync });

        return NextResponse.json({
            message: "Successfully synced new knowledge to the AI Brain via MCP Server.",
            productsSynced: productsToSync.length,
            details: newProducts
        });

    } catch (error) {
        console.error("Autonomous Sync Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
