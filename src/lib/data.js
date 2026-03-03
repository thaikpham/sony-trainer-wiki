import { Camera, Activity, Eye, Video, Mountain, Target, Heart, ZoomIn } from 'lucide-react';

export const NEEDS_DICT = {
    'portrait': { label: 'Chân dung / Studio', icon: Eye, desc: 'Độ phân giải siêu cao, chi tiết tối đa.' },
    'landscape': { label: 'Phong cảnh / Kiến trúc', icon: Mountain, desc: 'Góc nhìn siêu rộng, dải tương phản động lớn.' },
    'sports': { label: 'Thể thao / Tốc độ', icon: Activity, desc: 'Lấy nét siêu tốc, tracking liên tục.' },
    'wildlife': { label: 'Động vật hoang dã', icon: Target, desc: 'Tiêu cự siêu xa, ngụy trang và bắt nét động vật.' },
    'wedding': { label: 'Cưới hỏi / Sự kiện', icon: Heart, desc: 'Đa dụng, lấy nét thiếu sáng tốt, màu da chân thực.' },
    'macro': { label: 'Sản phẩm / Macro', icon: ZoomIn, desc: 'Độ phóng đại 1:1, chi tiết ở mức vi mô.' },
    'video': { label: 'Điện ảnh / Vlogging', icon: Video, desc: 'Quay đêm xuất sắc, chống rung chủ động.' },
    'travel': { label: 'Đa dụng / Du lịch', icon: Camera, desc: 'Cơ động, nhỏ gọn, cân bằng hoàn hảo.' }
};

export const formatVND = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
