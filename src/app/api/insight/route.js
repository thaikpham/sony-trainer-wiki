import { NextResponse } from 'next/server';
import { buildFallbackInsight } from '@/lib/insightFallback';

const INSIGHT_GEMINI_TIMEOUT_MS = Number(process.env.INSIGHT_GEMINI_TIMEOUT_MS || 7000);

function cleanText(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/\*\*/g, '').replace(/#/g, '').trim();
}

export async function POST(request) {
    let activeNeedsText = '';
    let loadout = null;

    try {
        const body = await request.json();
        activeNeedsText = typeof body?.activeNeedsText === 'string' ? body.activeNeedsText : '';
        loadout = body?.loadout || null;
    } catch (error) {
        console.error('Invalid request body in /api/insight:', error);
    }

    const fallbackText = buildFallbackInsight({ activeNeedsText, loadout });
    const apiKey = process.env.GEMINI_API_KEY || '';

    if (!apiKey) {
        return NextResponse.json({
            text: fallbackText,
            fallbackReason: 'missing_gemini_api_key'
        });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), INSIGHT_GEMINI_TIMEOUT_MS);

        const sysPrompt = `Ban la co van Sony Alpha.
Hay tra ve phan tich ngan gon theo dung bo cuc:
1) DEAL TOT NHAT (Khuyen dung)
2) CHIEN BINH BUT PHA (3 gach dau dong ngan)
3) SO SANH NGANG voi goi Good va Best
Khong dung markdown. Moi dong 1-2 cau.`;

        const userPrompt = `Nhu cau: ${activeNeedsText || 'Da dung'}
- Good: ${loadout?.good?.camName || 'N/A'} + ${loadout?.good?.lensName || 'N/A'}
- Better: ${loadout?.better?.camName || 'N/A'} + ${loadout?.better?.lensName || 'N/A'}
- Best: ${loadout?.best?.camName || 'N/A'} + ${loadout?.best?.lensName || 'N/A'}`;

        const payload = {
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: sysPrompt }] }
        };

        let response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
        } finally {
            clearTimeout(timeoutId);
        }

        const data = await response.json();
        if (!response.ok || data?.error) {
            throw new Error(data?.error?.message || `Gemini HTTP ${response.status}`);
        }

        const aiText = cleanText(data?.candidates?.[0]?.content?.parts?.[0]?.text);
        if (!aiText) {
            throw new Error('Empty Gemini insight response');
        }

        return NextResponse.json({ text: aiText, source: 'gemini' });
    } catch (error) {
        console.error('Insight LLM Error:', error);
        return NextResponse.json({
            text: fallbackText,
            fallbackReason: error?.name === 'AbortError' ? 'gemini_timeout' : 'gemini_unavailable'
        });
    }
}
