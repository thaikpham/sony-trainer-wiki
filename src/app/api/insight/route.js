import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { activeNeedsText, loadout } = await request.json();
        const apiKey = process.env.GEMINI_API_KEY || "";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const sys = `Bạn là một nhiếp ảnh gia truyền cảm hứng và Cố vấn cấp cao của Sony Alpha. Hãy viết một bài phân tích CHI TIẾT nhưng CỰC KỲ NGẮN GỌN về sự kết hợp thiết bị này, tập trung 100% vào TRẢI NGHIỆM THỰC TẾ. TUYỆT ĐỐI KHÔNG dùng từ ngữ hàn lâm khô khan (như XA, XD motor).

QUY TẮC HIỂN THỊ UI (RẤT QUAN TRỌNG):
1. TUYỆT ĐỐI KHÔNG viết các đoạn văn dài dòng (người dùng sẽ lười đọc).
2. Hãy dùng các gạch đầu dòng ngắn (Bullet points), mỗi dòng CHỈ 1-2 câu súc tích.
3. KHÔNG DÙNG Markdown (* hay #). VIẾT HOA các từ khóa chính để dễ quét bằng mắt.

Yêu cầu trình bày theo cấu trúc sau (dùng các icon emoji để trang trí cho sinh động):
1. **DEAL TỐT NHẤT (Khuyên dùng)**: Nhấn mạnh tại sao cấu hình "Đề Xuất" lại là điểm nghẽn hoàn hảo nhất (sweet spot) cho nhu cầu của khách.
2. **CHIẾN BINH BỨT PHÁ**: 3 gạch đầu dòng siêu ngắn (1 câu/gạch) phân tích sức mạnh thực chiến của cấu hình Đề Xuất.
3. **SO SÁNH NGANG**:
   - Khác gì Tùy chọn Tiết Kiệm: Phân tích vì sao cấu hình Đề Xuất lại đáng tiền hơn hẳn cấu hình Tiết kiệm (Good) và người dùng "không nên tiếc tiền".
   - Khác gì Tùy chọn Nâng Cấp: Chỉ ra tại sao cấu hình Nâng cấp (Best) lại thực sự cần thiết nếu muốn tiến vào "level nhiếp ảnh gia chuyên nghiệp" (kích thích FOMO).`;

        const usr = `Nhu cầu: ${activeNeedsText}.
- Tiết kiệm: Body ${loadout.good.camName} + Lens ${loadout.good.lensName}
- Đề Xuất (Recommended): Body ${loadout.better.camName} + Lens ${loadout.better.lensName}
- Nâng cấp: Body ${loadout.best.camName} + Lens ${loadout.best.lensName}

Hãy thuyết phục tôi tại sao Đề Xuất là chân lý, và lướt qua sự khác biệt với Tiết kiệm & Nâng cấp.`;

        const payload = {
            contents: [{ parts: [{ text: usr }] }],
            systemInstruction: { parts: [{ text: sys }] }
        };

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
