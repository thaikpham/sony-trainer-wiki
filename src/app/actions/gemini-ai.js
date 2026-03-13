'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateTimelineAction(scriptTitle, scriptDesc) {
    if (!apiKey) return { success: false, error: 'Thiếu GEMINI_API_KEY' };
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = `Bạn là một chuyên gia kịch bản Livestream cho Sony Alpha Vietnam. 
        Hãy tạo một Timeline chi tiết cho phiên live: "${scriptTitle}".
        Mô tả: "${scriptDesc}".
        
        Yêu cầu:
        1. Chia nhỏ theo thời gian (VD: 00:00 - 05:00: Mở đầu).
        2. Mỗi phần có các gạch đầu dòng chi tiết nội dung cần nói và thao tác kỹ thuật.
        3. Văn phong chuyên nghiệp, thu hút, tập trung vào trải nghiệm khách hàng.
        4. KHÔNG sử dụng Markdown đậm (**), chỉ dùng văn bản thuần túy và các ký tự phân cách đơn giản.
        5. Độ dài khoảng 300-500 từ.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        return { success: true, content: text };
    } catch (error) {
        console.error('generateTimelineAction Error:', error);
        return { success: false, error: error.message };
    }
}

export async function chatWithStudioBotAction(chatHistory) {
    if (!apiKey) return { success: false, error: 'Thiếu GEMINI_API_KEY' };

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const history = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: history.slice(0, -1),
            systemInstruction: "Bạn là Trợ lý Studio của Sony Alpha Vietnam. Bạn giúp người dùng thiết lập livestream, chọn thiết bị, và tối ưu kịch bản. Hãy trả lời ngắn gọn, chuyên nghiệp, và đầy cảm hứng. Không dùng format Markdown đậm (**)."
        });

        const lastMessage = chatHistory[chatHistory.length - 1].text;
        const result = await chat.sendMessage(lastMessage);
        const text = result.response.text();

        return { success: true, content: text };
    } catch (error) {
        console.error('chatWithStudioBotAction Error:', error);
        return { success: false, error: error.message };
    }
}
