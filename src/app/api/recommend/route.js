import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { callMcpTool } from '@/lib/mcp';

export async function POST(request) {
    try {
        const { userNeeds, experienceLevel, prefs } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY || "";
        const pineconeKey = process.env.PINECONE_API_KEY || "";

        const genAI = new GoogleGenerativeAI(apiKey);

        // Ensure structured JSON output using responseSchema
        const responseSchema = {
            type: SchemaType.OBJECT,
            properties: {
                good: {
                    type: SchemaType.OBJECT,
                    properties: {
                        camName: { type: SchemaType.STRING },
                        camDesc: { type: SchemaType.STRING },
                        camPrice: { type: SchemaType.NUMBER },
                        lensName: { type: SchemaType.STRING },
                        lensType: { type: SchemaType.STRING },
                        lensPrice: { type: SchemaType.NUMBER },
                        totalPrice: { type: SchemaType.NUMBER },
                        tierCode: { type: SchemaType.STRING },
                        label: { type: SchemaType.STRING }
                    },
                    required: ["camName", "camDesc", "camPrice", "lensName", "lensType", "lensPrice", "totalPrice", "tierCode", "label"]
                },
                better: {
                    type: SchemaType.OBJECT,
                    properties: {
                        camName: { type: SchemaType.STRING },
                        camDesc: { type: SchemaType.STRING },
                        camPrice: { type: SchemaType.NUMBER },
                        lensName: { type: SchemaType.STRING },
                        lensType: { type: SchemaType.STRING },
                        lensPrice: { type: SchemaType.NUMBER },
                        totalPrice: { type: SchemaType.NUMBER },
                        tierCode: { type: SchemaType.STRING },
                        label: { type: SchemaType.STRING }
                    },
                    required: ["camName", "camDesc", "camPrice", "lensName", "lensType", "lensPrice", "totalPrice", "tierCode", "label"]
                },
                best: {
                    type: SchemaType.OBJECT,
                    properties: {
                        camName: { type: SchemaType.STRING },
                        camDesc: { type: SchemaType.STRING },
                        camPrice: { type: SchemaType.NUMBER },
                        lensName: { type: SchemaType.STRING },
                        lensType: { type: SchemaType.STRING },
                        lensPrice: { type: SchemaType.NUMBER },
                        totalPrice: { type: SchemaType.NUMBER },
                        tierCode: { type: SchemaType.STRING },
                        label: { type: SchemaType.STRING }
                    },
                    required: ["camName", "camDesc", "camPrice", "lensName", "lensType", "lensPrice", "totalPrice", "tierCode", "label"]
                },
                courseRecommendation: {
                    type: SchemaType.OBJECT,
                    properties: {
                        name: { type: SchemaType.STRING },
                        instructor: { type: SchemaType.STRING }
                    },
                    required: ["name", "instructor"]
                }
            },
            required: ["good", "better", "best", "courseRecommendation"]
        };

        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        // Build the search query
        const queryText = `Recommend Sony E-mount cameras and lenses for: ${userNeeds.join(', ')}. 
        Experience Level: ${experienceLevel}. 
        Sensor preference: ${prefs?.sensorPref || 'any'}. 
        Lens preference: ${prefs?.lensPref || 'any'}. 
        Body type preference: ${prefs?.bodyPref || 'any'}.
        Current Gear: ${prefs?.currentGear || 'None'}.`;

        let retrievedContext = "";

        // Retrieval Phase (MCP Server)
        try {
            retrievedContext = await callMcpTool('search_trainer_wiki_rag', { query: queryText });
        } catch (err) {
            console.warn("MCP RAG Query failed in /api/recommend: ", err);
        }

        const sysPrompt = `You are an elite, highly persuasive Sales Expert for Sony Alpha Vietnam. 
        
        DIRECTIVE 1 (DATA-DRIVEN & EXPERT KNOWLEDGE): You MUST build 3 camera+lens combos (Good, Better, Best). Prioritize using the provided RETRIEVED CONTEXT for models and prices. However, if the retrieved context lacks specific lens recommendations or pricing data, you MUST use your elite expert knowledge of the Sony E-mount ecosystem to fill in the gaps with highly realistic camera models, precise lens names, and market prices in VND. DO NOT output 0 for prices. You must estimate the current realistic retail price in VND for BOTH the body and the lens, and sum them up accurately for the 'totalPrice'.
        Critically, you must tailor the tier of equipment to the user's requested EXPERIENCE LEVEL:
        - If "newbie": 
          - Bodies: Restrict to Entry/Vlog APS-C (e.g., ZV-E10 II, A6400, A6700) or premium compacts like the RX100 VII.
          - Lenses: Standard Sony E lenses or affordable G lenses (e.g., E 11mm F1.8, E 15mm F1.4 G, 18-135mm).
          - Constraint: STRICTLY FORBID G Master (GM) lenses.
        - If "advanced": 
          - Bodies: Enthusiast APS-C or Entry Full-frame (e.g., A6700, Alpha 7 IV, Alpha 7C II, Alpha 7C R).
          - Lenses: Sony G lenses, F1.8/F1.4 primes, or standard F4 / F2.8 zooms.
          - Constraint: STRICTLY FORBID ultra-premium F1.2 primes or F2.0 zooms.
        - If "professional":
          - Bodies: Professional workhorses (e.g., Alpha 7R V, Alpha 7S III, FX3, FX30).
          - Lenses: Strictly G Master (e.g., F1.4 GM primes, F2.8 GM II zooms).
        - If "hi-end" or "flagship": 
          - Bodies: Focus on absolute top-tier. CRITICAL: You MUST recommend the newest generation models available (e.g., Alpha 1 II instead of Alpha 1, Alpha 9 III instead of Alpha 9 II) for ALL tiers (Good, Better, Best). The 'Good' tier MUST still be a high-end model like the Alpha 7R V or FX3, NEVER an Alpha 7 IV. For an ultimate full-frame compact option, you may suggest the RX1R III.
          - Lenses: ONLY the elite G Master tier. If a Zoom lens is recommended, you MUST prioritize the newest ultra-premium F2.0 zooms (e.g., Sony FE 28-70mm F2.0 GM). If Prime, prioritize F1.2 GM. If Macro is requested, you MUST recommend the brand new Sony FE 100mm F2.8 Macro GM.
        - Universal Constraint: If strict preferences (e.g. forcing Full-frame) conflict with the experience level (e.g. "newbie"), prioritize the hardware requirement but select the absolute cheapest body available in that category (e.g. A7C or original A7). If suggesting a fixed-lens compact (like RX100 VII or RX1R III), set 'lensName' and 'lensType' to 'Tích hợp sẵn (Fixed Lens)' and price it at 0 if the total price includes the lens.
        - Upgrade Path Constraint: User current gear is "${prefs?.currentGear || 'None'}". Suggest a path that minimizes waste.

        DIRECTIVE 2 (SONY EXCLUSIVITY): Recommend ONLY Sony lenses. No third-party.
        DIRECTIVE 3 (BRAND PROTECTOR): Defend Sony's ecosystem.
        DIRECTIVE 4 (COURSES): You MUST also recommend 1 Alpha Academy course relevant to the gear (e.g., 'Cơ bản về Mirrorless' if newbie, 'Quay phim chuyên nghiệp' if FX3/A7SIII). Place this in the 'courseRecommendation' field with 'name' and 'instructor'.
        
        [RETRIEVED KNOWLEDGE BASE CONTEXT]
        ${retrievedContext}
        `;

        const geminiModel = genAI.getGenerativeModel(
            {
                model: "gemini-2.0-flash",
                systemInstruction: sysPrompt,
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json",
                    responseSchema: responseSchema
                }
            },
            { apiVersion: "v1beta" }
        );

        const userPrompt = `Generate the recommendations for:
        Needs (IDs): ${userNeeds.join(', ') || 'General Photography'}
        Experience Level: ${experienceLevel}
        Preferences: Sensor=[${prefs?.sensorPref || 'all'}], Lens=[${prefs?.lensPref || 'all'}], Body=[${prefs?.bodyPref || 'all'}], Investment Priority=[${prefs?.investmentPref || 'balanced'}], Current Gear=[${prefs?.currentGear || 'None'}]`;

        const result = await geminiModel.generateContent(userPrompt);
        let responseText = result.response.text();

        // Final fallback to clean potential markdown
        if (responseText.includes('```')) {
            responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        const structuredData = JSON.parse(responseText);
        return NextResponse.json(structuredData);

    } catch (error) {
        console.error("Matchmaking LLM Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
