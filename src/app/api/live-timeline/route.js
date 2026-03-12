import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
    try {
        const { title, description } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY || '';
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Bạn là chuyên gia Livestream bán hàng Sony tại Việt Nam. Dựa trên thông tin phiên live sau:
- Tiêu đề: "${title}"
- Mô tả: "${description || 'Không có mô tả'}"

Hãy tạo TÀI LIỆU KỊ CẢN GỒM 2 PHẦN sau (viết bằng tiếng Việt, súc tích):

━━━ PHẦN 1: TIMELINE PHIÊN LIVE ━━━
Tạo timeline với các mốc thời gian theo cấu trúc:
[THỜI GIAN] - [HOẠT ĐỘNG] - [Chi tiết ngắn]
Tổng thời lượng khoảng 60 phút.

━━━ PHẦN 2: SPECS SẢN PHẨM & ỨNG DỤNG THỰC CHIẾN ━━━
Dựa trên tiêu đề phiên live, liệt kê các thông số kỹ thuật (specs) nổi bật của sản phẩm Sony liên quan. Với mỗi spec, trình bày theo cấu trúc:
• [Tên Spec]: [Giá trị] → Ứng dụng thực chiến: [Giải thích ngắn gọn tình huống sử dụng cụ thể trong thực tế]

Chỉ trả về nội dung theo đúng 2 phần trên, không thêm lời mở đầu hay kết thúc.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return NextResponse.json({ timeline: text });
    } catch (error) {
        console.error("Timeline SDK Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
