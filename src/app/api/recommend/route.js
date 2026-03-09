import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { callMcpTool } from '@/lib/mcp';
import { buildFallbackLoadout } from '@/lib/recommendationFallback';

const TIER_SCHEMA = {
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
    required: ['camName', 'camDesc', 'camPrice', 'lensName', 'lensType', 'lensPrice', 'totalPrice', 'tierCode', 'label']
};

const RESPONSE_SCHEMA = {
    type: SchemaType.OBJECT,
    properties: {
        good: TIER_SCHEMA,
        better: TIER_SCHEMA,
        best: TIER_SCHEMA,
        courseRecommendation: {
            type: SchemaType.OBJECT,
            properties: {
                name: { type: SchemaType.STRING },
                instructor: { type: SchemaType.STRING }
            },
            required: ['name', 'instructor']
        }
    },
    required: ['good', 'better', 'best', 'courseRecommendation']
};

const MCP_TIMEOUT_MS = Number(process.env.RECOMMEND_MCP_TIMEOUT_MS || 1800);
const GEMINI_TIMEOUT_MS = Number(process.env.RECOMMEND_GEMINI_TIMEOUT_MS || 5500);

function withTimeout(promise, timeoutMs, label) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`${label} timeout after ${timeoutMs}ms`));
        }, timeoutMs);

        promise
            .then((result) => {
                clearTimeout(timeoutId);
                resolve(result);
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}

function sanitizeResponseText(text) {
    if (typeof text !== 'string') return '';
    let clean = text.trim();
    if (clean.includes('```')) {
        clean = clean.replace(/```json/gi, '').replace(/```/g, '').trim();
    }
    return clean;
}

function toSafeText(value, fallback) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    return fallback;
}

function toSafeNumber(value, fallback) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return Math.round(value);
    return fallback;
}

function mergeTier(modelTier, fallbackTier, defaults) {
    const camPrice = toSafeNumber(modelTier?.camPrice, fallbackTier.camPrice);
    const lensPrice = toSafeNumber(modelTier?.lensPrice, fallbackTier.lensPrice);
    const totalPrice = toSafeNumber(modelTier?.totalPrice, camPrice + lensPrice);

    return {
        camName: toSafeText(modelTier?.camName, fallbackTier.camName),
        camDesc: toSafeText(modelTier?.camDesc, fallbackTier.camDesc),
        camPrice,
        lensName: toSafeText(modelTier?.lensName, fallbackTier.lensName),
        lensType: toSafeText(modelTier?.lensType, fallbackTier.lensType),
        lensPrice,
        totalPrice,
        tierCode: toSafeText(modelTier?.tierCode, fallbackTier.tierCode || defaults.tierCode),
        label: toSafeText(modelTier?.label, fallbackTier.label || defaults.label)
    };
}

function mergeLoadout(modelData, fallbackLoadout) {
    return {
        good: mergeTier(modelData?.good, fallbackLoadout.good, { tierCode: 'GOOD', label: 'Tiet kiem' }),
        better: mergeTier(modelData?.better, fallbackLoadout.better, { tierCode: 'BETTER', label: 'De xuat' }),
        best: mergeTier(modelData?.best, fallbackLoadout.best, { tierCode: 'BEST', label: 'Nang cap' }),
        courseRecommendation: {
            name: toSafeText(modelData?.courseRecommendation?.name, fallbackLoadout.courseRecommendation.name),
            instructor: toSafeText(modelData?.courseRecommendation?.instructor, fallbackLoadout.courseRecommendation.instructor)
        },
        source: 'gemini'
    };
}

function normalizeNeeds(value) {
    if (!Array.isArray(value)) return [];
    return value.filter((item) => typeof item === 'string' && item.trim().length > 0);
}

function normalizePrefs(value) {
    if (!value || typeof value !== 'object') return {};
    return value;
}

export async function POST(request) {
    let userNeeds = [];
    let experienceLevel = 'advanced';
    let prefs = {};

    try {
        const body = await request.json();
        userNeeds = normalizeNeeds(body?.userNeeds);
        experienceLevel = typeof body?.experienceLevel === 'string' ? body.experienceLevel : 'advanced';
        prefs = normalizePrefs(body?.prefs);
    } catch (error) {
        console.error('Invalid request body in /api/recommend:', error);
    }

    const fallbackLoadout = buildFallbackLoadout({ userNeeds, experienceLevel, prefs });
    const apiKey = process.env.GEMINI_API_KEY || '';

    if (!apiKey) {
        return NextResponse.json({
            ...fallbackLoadout,
            fallbackReason: 'missing_gemini_api_key'
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        const queryText = `Recommend Sony E-mount cameras and lenses for: ${userNeeds.join(', ') || 'general photography'}.
        Experience Level: ${experienceLevel}.
        Sensor preference: ${prefs?.sensorPref || 'any'}.
        Lens preference: ${prefs?.lensPref || 'any'}.
        Body type preference: ${prefs?.bodyPref || 'any'}.
        Current Gear: ${prefs?.currentGear || 'None'}.`;

        let retrievedContext = '';
        try {
            retrievedContext = await withTimeout(
                callMcpTool('search_trainer_wiki_rag', { query: queryText }),
                MCP_TIMEOUT_MS,
                'MCP retrieval'
            );
        } catch (err) {
            console.warn('MCP RAG Query failed in /api/recommend:', err);
        }

        const sysPrompt = `You are an elite Sales Expert for Sony Alpha Vietnam.
Return ONLY valid JSON that matches the required schema.
Build 3 camera+lens combos: Good, Better, Best, plus one course recommendation.
Prioritize retrieved context for pricing and names. If context is missing, use realistic Sony market estimates in VND.
NEVER use non-Sony lenses.
Always set camPrice, lensPrice, totalPrice as positive numbers.
Tailor output by experience level: newbie, advanced, professional, hi-end, flagship.
Keep upgrade path practical with the user's current gear.

[RETRIEVED KNOWLEDGE BASE CONTEXT]
${retrievedContext}`;

        const geminiModel = genAI.getGenerativeModel(
            {
                model: 'gemini-2.0-flash',
                systemInstruction: sysPrompt,
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: 'application/json',
                    responseSchema: RESPONSE_SCHEMA
                }
            },
            { apiVersion: 'v1beta' }
        );

        const userPrompt = `Generate recommendation for:
Needs: ${userNeeds.join(', ') || 'General Photography'}
Experience: ${experienceLevel}
Preferences: Sensor=${prefs?.sensorPref || 'all'}, Lens=${prefs?.lensPref || 'all'}, Body=${prefs?.bodyPref || 'all'}, Investment=${prefs?.investmentPref || 'balanced'}, CurrentGear=${prefs?.currentGear || 'None'}`;

        const result = await withTimeout(
            geminiModel.generateContent(userPrompt),
            GEMINI_TIMEOUT_MS,
            'Gemini recommendation'
        );
        const responseText = sanitizeResponseText(result?.response?.text());

        const parsed = JSON.parse(responseText);
        return NextResponse.json(mergeLoadout(parsed, fallbackLoadout));
    } catch (error) {
        console.error('Matchmaking LLM Error:', error);
        return NextResponse.json({
            ...fallbackLoadout,
            fallbackReason: 'gemini_unavailable'
        });
    }
}
