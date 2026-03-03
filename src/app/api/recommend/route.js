import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

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

        const geminiModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.2, // Low temp for more accurate data retrieval
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        // Build the search query
        const queryText = `Recommend Sony E-mount cameras and lenses for: ${userNeeds.join(', ')}. 
        Experience Level: ${experienceLevel}. 
        Sensor preference: ${prefs?.sensorPref || 'any'}. 
        Lens preference: ${prefs?.lensPref || 'any'}. 
        Body type preference: ${prefs?.bodyPref || 'any'}.
        Current Gear: ${prefs?.currentGear || 'None'}.`;

        let retrievedContext = "";

        // Retrieval Phase (Pinecone)
        try {
            if (pineconeKey) {
                const pc = new Pinecone({ apiKey: pineconeKey });
                const index = pc.index('alpha-focus-wiki');

                const embeddingResult = await embeddingModel.embedContent(queryText);
                const queryVector = embeddingResult.embedding.values.slice(0, 1024);

                const queryResponse = await index.query({
                    vector: queryVector,
                    topK: 15, // Retrieve plenty of data for options
                    includeMetadata: true
                });

                const matches = queryResponse.matches || [];
                retrievedContext = matches.map((m) => m.metadata.text).join('\n\n---\n\n');
            }
        } catch (err) {
            console.warn("Pinecone Query failed in /api/recommend: ", err);
            // We'll proceed without context if Pinecone fails, though it's not ideal for RAG
        }

        // Generation Phase (Gemini)
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
        - Investment Priority Constraint: 
          - If INVESTMENT PREFERENCE is "body": You must aggressively prioritize the budget and tier towards a superior, newer camera body (pushing the upper bounds of the requested experience level), while settling for a highly affordable standard lens.
          - If INVESTMENT PREFERENCE is "lens": You must aggressively prioritize the budget and tier towards an ultra-premium elite lens (e.g. pushing into G Master territory even for lower experience tiers if possible), while settling for an older or lower-tier body to compensate.
          - If INVESTMENT PREFERENCE is "balanced": Pair equally matched tiers of body and lens.
        - Upgrade Path Constraint (CRITICAL):
          - The user's CURRENT GEAR is: "${prefs?.currentGear || 'None'}".
          - If the user has provided current gear, you MUST analyze it to suggest an intelligent UPGRADE PATH.
          - For example, if they currently own an APS-C body (like A6000 or A6400) and are looking for intermediate/advanced gear, strongly consider recommending Full-Frame (FE) lenses even for APS-C bodies, so they don't waste money when they eventually upgrade to a Full-Frame body. Conversely, if they have good FE lenses already, recommend investing heavily in a new Full-Frame body. Mention this strategy explicitly in 'camDesc' or 'lensType' to show you understand their upgrade journey.

        DIRECTIVE 2 (SONY EXCLUSIVITY): You MUST ONLY recommend Sony lenses (Sony G, Sony GM, Sony Zeiss, or standard Sony E/FE). UNDER NO CIRCUMSTANCES should you recommend third-party lenses like Tamron, Sigma, Samyang, or Viltrox. You are representing Sony.

        DIRECTIVE 3 (BRAND PROTECTOR): Defend and elevate the Sony E-mount ecosystem at all costs. Justify your combos by highlighting Sony's technological dominance (Real-time Eye AF, Global Shutter, G Master optics) over competitors like Canon or Nikon. Make choosing Sony feel like the only professional choice.
        
        DIRECTIVE 4 (REAL-TIME DATA INTEGRITY): You have access to Google Search to verify the latest gear. You MUST NEVER use information from rumor websites (e.g. Sony Alpha Rumors). If you need to verify the existence or specs of a new lens or body, you MUST rely ONLY on official Sony sources or highly reputable retailers like B&H Photo Video or Adorama.

        The 'camDesc' field should contain your persuasive justification for the body, and the 'lensType' field should describe the lens's role (e.g., 'Zoom Đa Dụng', 'Prime Chân Dung').
        The 'label' fields should be: 'TỐT / CƠ BẢN', 'TỐT HƠN / ĐỀ XUẤT', and 'TỐT NHẤT / CAO CẤP'.
        The 'tierCode' fields should be: 'TR-01', 'TR-02', and 'TR-03'.
        Ensure 'totalPrice' is an integer representing the combined price in VND.

        CRITICAL OUTPUT FORMATTING: You must return the output AS A PURE, PARSEABLE JSON STRING. DO NOT wrap it in markdown code blocks like \`\`\`json. DO NOT add any conversational text before or after the JSON. The JSON MUST follow this exact structure:
        {
          "good": { "camName": "", "camDesc": "", "camPrice": 0, "lensName": "", "lensType": "", "lensPrice": 0, "totalPrice": 0, "label": "TỐT / CƠ BẢN", "tierCode": "TR-01" },
          "better": { "camName": "", "camDesc": "", "camPrice": 0, "lensName": "", "lensType": "", "lensPrice": 0, "totalPrice": 0, "label": "TỐT HƠN / ĐỀ XUẤT", "tierCode": "TR-02" },
          "best": { "camName": "", "camDesc": "", "camPrice": 0, "lensName": "", "lensType": "", "lensPrice": 0, "totalPrice": 0, "label": "TỐT NHẤT / CAO CẤP", "tierCode": "TR-03" },
          "courseRecommendation": { "name": "", "instructor": "" }
        }

        [RETRIEVED KNOWLEDGE BASE CONTEXT]
        ${retrievedContext}
        `;

        const userPrompt = `Generate the recommendations for:
        Needs (IDs): ${userNeeds.join(', ') || 'General Photography'}
        Experience Level: ${experienceLevel}
        Preferences: Sensor=[${prefs?.sensorPref || 'all'}], Lens=[${prefs?.lensPref || 'all'}], Body=[${prefs?.bodyPref || 'all'}], Investment Priority=[${prefs?.investmentPref || 'balanced'}], Current Gear=[${prefs?.currentGear || 'None'}]`;

        const result = await geminiModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
            systemInstruction: sysPrompt
        });

        let responseText = result.response.text();
        // Remove markdown formatting if the model still decides to use it
        responseText = responseText.replace(/^\`\`\`json\s*/, '').replace(/\`\`\`$/, '').trim();

        // Since we enforced JSON schema, the responseText will be a valid JSON string
        const structuredData = JSON.parse(responseText);

        return NextResponse.json(structuredData);

    } catch (error) {
        console.error("Matchmaking LLM Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
