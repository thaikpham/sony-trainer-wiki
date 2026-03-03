import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Read .env.local manually
const envFile = readFileSync('./.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        let key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"') || val.startsWith("'") && val.endsWith("'")) {
            val = val.substring(1, val.length - 1);
        }
        env[key] = val;
    }
});

const firebaseConfig = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const A6400_GUIDE = `📸 PHẦN 1: CHẾ ĐỘ CHỤP (SHOOTING MODES)
Tư vấn khách chọn mode dựa trên mục đích:
P (Program): Máy tự động tính toán, bạn chỉ việc bấm (Dành cho người mới).
A (Aperture): Chuyên trị xóa phông chân dung hoặc chụp phong cảnh nét sâu.
S (Shutter): Dùng để bắt dính chuyển động nhanh hoặc tạo hiệu ứng nhòe dòng nước.
M (Manual): Làm chủ hoàn toàn mọi thông số (Dành cho người có kinh nghiệm).

🖼️ PHẦN 2: CHẤT LƯỢNG HÌNH ẢNH (IMAGE QUALITY)
Cài đặt để ảnh đẹp nhất mà không tốn quá nhiều bộ nhớ:
File Format: JPEG (Dùng ngay) hoặc RAW (Để hậu kỳ chuyên sâu).
JPEG Quality: Extra Fine (Độ chi tiết cao nhất).
Image Size: L 24M (Tận dụng tối đa độ phân giải của máy).
Aspect Ratio: 3:2 (Tỉ lệ chuẩn) hoặc 1:1 (Cho mạng xã hội).
Color Space: sRGB (Chuẩn màu quốc tế, hiển thị đẹp trên mọi thiết bị).

🎯 PHẦN 3: LẤY NÉT & TỐC ĐỘ (AF & DRIVE MODE)
Tận dụng sức mạnh lấy nét cực nhanh của A6400:
Drive Mode: Continuous Hi (Bắt trọn mọi khoảnh khắc chuyển động).
Focus Mode: AF-C (Lấy nét liên tục – Máy sẽ bám đuổi chủ thể không rời).
Focus Area: Tracking Expand Spot (Chạm vào đâu, máy "dính" lấy chủ thể đó).
Face/Eye AF: On (Human) (Tự động tìm và khóa nét vào mắt người).
Soft Skin Effect: On (Làm mịn da tự nhiên, cực kỳ nịnh mắt).

💡 PHẦN 4: ÁNH SÁNG & ĐO SÁNG (EXPOSURE)
Giúp ảnh luôn rõ nét và chủ thể đủ sáng:
ISO Auto Min. SS: 1/125 – Đảm bảo tốc độ đủ nhanh để chụp người không bị nhòe.
ISO Range Limit: 100 - 6400 – Giữ ảnh luôn trong trẻo, hạn chế nhiễu hạt (noise).
Metering Mode: Multi – Đo sáng toàn khung hình, cân bằng ánh sáng hài hòa.
Face Priority in Multi Mode: ON
💡 Key selling point: Khi phát hiện khuôn mặt, máy sẽ ưu tiên đo sáng vào đó. Giúp khuôn mặt luôn sáng rõ, rạng rỡ ngay cả khi chụp ngược sáng.

🎥 PHẦN 5: CHẾ ĐỘ QUAY VIDEO
Cấu hình sẵn để quay phim 4K chuyên nghiệp:
File Format: XAVC S 4K (Độ nét cực cao).
Record Setting: 25p 100M (Chất lượng hình ảnh mượt mà, giàu chi tiết).
Audio Recording: On (Ghi âm trực tiếp).
Wind Noise Reduction: On (Lọc tạp âm gió, giúp âm thanh trong hơn khi quay ngoài trời).`;

const ZVE1_GUIDE = `📸 PHẦN 1: CHẾ ĐỘ CHỤP & QUAY (SHOOTING MODES)
Tư vấn khách chọn mode dựa trên mục đích (Tập trung mạnh vào Video/Vlog):
Intelligent Auto (iA): Máy tự động nhận diện bối cảnh và điều chỉnh (Dành cho người mới bắt đầu Vlog).
Vlog/Cinematic Vlog: Bật tỷ phệ khung hình 2.35:1 và tốc độ khung hình 24p cho cảm giác điện ảnh ngay lập tức.
S&Q (Slow and Quick): Chế độ quay chậm/nhanh dễ dàng truy cập bằng một nút bấm.

🖼️ PHẦN 2: CHẤT LƯỢNG HÌNH ẢNH & MÀU SẮC (IMAGE & COLOR)
Tận dụng cảm biến Full-frame và sức mạnh AI:
Picture Profile: S-Cinetone (Màu sắc điện ảnh, skin-tone lên đẹp ngay lập tức không cần hậu kỳ nhiều) hoặc S-Log3 (Dành cho người thích chỉnh màu chuyên sâu).
File Format (Video): XAVC S-I 4K (Chất lượng cao nhất, file lớn) hoặc XAVC HS 4K (Nén tốt, nhẹ lưu trữ).
Record Setting: 4K 60p (Đậm đà chi tiết, có thể slow motion mượt) hoặc nâng cấp 4K 120p (Slow cực mượt).

🎯 PHẦN 3: LẤY NÉT & KHUNG HÌNH (AF & TRACKING)
Sức mạnh Chip AI vượt trội của ZV-E1:
Focus Mode: Continuous AF (AF-C).
Focus Area: Wide hoặc Zone (Máy tự động tìm và theo dõi chuẩn xác do chip AI mạnh).
Subject Recognition: Human / Animal / Bird (Chạm vào đâu, khóa nét chuẩn đó).
Auto Framing: ON (AI tự động crop và bám khung hình theo người di chuyển – Cực kỳ hữu dụng khi vlog 1 mình đặt chân máy).
Multiple Face Recognition: Tự động khép khẩu (tăng độ sâu trường ảnh, nét cả 2) khi có người thứ 2 bước vào khung hình (Tuyệt vời cho phỏng vấn).

💡 PHẦN 4: ÁNH SÁNG & ĐO SÁNG (EXPOSURE)
Ổn định ánh sáng cho Vlog:
ISO Auto Range: 100 - 25600 (Cảm biến ZV-E1 cực kì ít nhiễu kể cả ở ISO cao).
Metering Mode: Multi.
Face Priority in Multi Mode: ON (Bắt buộc bật để da mặt luôn đủ sáng khi vừa đi vừa quay).
Dynamic Active Mode: Cân bằng hình ảnh chống rung vượt trội kết hợp AI (Cắt khung hình nhiều hơn một chút nhưng siêu mượt).

🎥 PHẦN 5: ÂM THANH (AUDIO) & CÁC TÍNH NĂNG ĐẶC BIỆT
Âm thanh thu trực tiếp đột phá:
Microphone Directivity: Auto / Front / All Directions / Rear (Tự động chuyển hướng thu âm theo chiều người lấy nét, hoặc người nói).
Product Showcase Set: ON (Khi cần review sản phẩm, đưa vật thể lên trước mặt thì máy nét lập tức, bỏ xuống thì nét mặt).
Background Defocus: Nút bấm trực tiếp chuyển đổi "Clear" và "Defocus" (Xóa phông lập tức mà ko cần hiểu khẩu độ).`;

async function addDemoGuides() {
    try {
        console.log("Fetching products...");
        const productsCol = collection(db, 'products');
        const snapshot = await getDocs(productsCol);

        console.log(`Found ${snapshot.size} products. Searching for A6400 and ZV-E1...`);

        let a6400Id = null;
        let zve1Id = null;

        snapshot.forEach((doc) => {
            const data = doc.data();
            const lowerName = data.name ? data.name.toLowerCase() : '';
            if (lowerName.includes('a6400') || lowerName.includes('alpha 6400') || data.model === 'ILCE-6400') {
                a6400Id = doc.id;
            }
            if (lowerName.includes('zv-e1') && !lowerName.includes('zv-e10')) {
                zve1Id = doc.id;
            }
        });

        if (a6400Id) {
            console.log(`Updating A6400 (ID: ${a6400Id})...`);
            await updateDoc(doc(db, 'products', a6400Id), {
                quickSettingGuide: A6400_GUIDE
            });
            console.log("A6400 updated successfully!");
        } else {
            console.log("A6400 not found in the database. Please create it first to add the demo data.");
        }

        if (zve1Id) {
            console.log(`Updating ZV-E1 (ID: ${zve1Id})...`);
            await updateDoc(doc(db, 'products', zve1Id), {
                quickSettingGuide: ZVE1_GUIDE
            });
            console.log("ZV-E1 updated successfully!");
        } else {
            console.log("ZV-E1 not found in the database. Please create it first to add the demo data.");
        }

    } catch (err) {
        console.error("Error updating demo guides:", err);
    }
}

addDemoGuides();
