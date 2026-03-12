import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `Bạn là trợ lý bán hàng Sony chuyên nghiệp tại Việt Nam. Trả lời câu hỏi về sản phẩm Sony (máy ảnh, máy quay, ống kính...) bằng tiếng Việt. Hãy trả lời cực kỳ ngắn gọn, tối đa 2 câu, thân thiện và chuyên nghiệp. Không dùng markdown.`;

export async function POST(request) {
    try {
        const { messages } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey) {
            return NextResponse.json(
                { error: 'missing_gemini_api_key' },
                { status: 500 }
            );
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_PROMPT
        });

        // Convert messages to SDK format
        const allContent = messages
            .filter(msg => msg && msg.text)
            .map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: String(msg.text) }]
            }));

        if (allContent.length === 0) {
            throw new Error("No valid messages provided");
        }

        // Gemini history MUST start with 'user'. 
        // Our first message is often the AI greeting, so we skip any leading 'model' messages.
        let firstUserIndex = allContent.findIndex(m => m.role === 'user');
        if (firstUserIndex === -1) {
            // Only model messages exist? Just return a fallback or use the last one as prompt.
            const result = await model.generateContent(allContent[allContent.length - 1].parts[0].text);
            return NextResponse.json({ text: result.response.text() });
        }

        const validSessionContent = allContent.slice(firstUserIndex);
        const lastMessage = validSessionContent[validSessionContent.length - 1].parts[0].text;
        const history = validSessionContent.slice(0, -1);

        const chat = model.startChat({
            history: history,
            generationConfig: { maxOutputTokens: 200 }
        });

        const result = await chat.sendMessage(lastMessage);
        const text = result.response.text();

        return NextResponse.json({ text });
    } catch (error) {
        console.error("Chatbot SDK Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
