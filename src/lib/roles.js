/**
 * roles.js — Central role system for Sony Training Wiki.
 *
 * HOW TO ASSIGN ROLES:
 * Add an entry to ROLE_EMAIL_MAP: 'email@domain.com': 'ROLE_KEY'
 * Valid keys: 'DEV', 'TRAINER', 'PRODUCT_MARKETING', 'DATA', 'PROMOTER', 'USER'
 */

export const ROLES = {
    DEV: {
        label: 'Developer',
        short: 'DEV',
        emoji: '⚡',
        description: 'Quyền năng tối thượng của người kiến tạo hệ thống.',
        rarity: 'Legendary',
        category: 'core',
        gradient: 'from-amber-400 to-orange-500',
        glow: 'rgba(251,146,60,0.4)',
        textColor: 'text-white',
        adminAccess: true,
        priority: 0,
    },
    TRAINER: {
        label: 'Sony Trainer',
        short: 'Trainer',
        emoji: '🎓',
        description: 'Bậc thầy truyền cảm hứng và kiến thức về hệ sinh thái Alpha.',
        rarity: 'Epic',
        category: 'core',
        gradient: 'from-blue-500 to-cyan-500',
        glow: 'rgba(59,130,246,0.35)',
        textColor: 'text-white',
        adminAccess: true,
        priority: 1,
    },
    PRODUCT_MARKETING: {
        label: 'Product Marketing',
        short: 'PM',
        emoji: '📣',
        description: 'Chuyên gia hoạch định chiến lược và lan tỏa giá trị sản phẩm.',
        rarity: 'Rare',
        category: 'core',
        gradient: 'from-violet-500 to-purple-500',
        glow: 'rgba(139,92,246,0.35)',
        textColor: 'text-white',
        adminAccess: true,
        priority: 2,
    },
    DATA: {
        label: 'Data Master',
        short: 'Data',
        emoji: '📊',
        description: 'Người nắm giữ chìa khóa thông tin từ những con số biết nói.',
        rarity: 'Rare',
        category: 'core',
        gradient: 'from-emerald-500 to-teal-500',
        glow: 'rgba(16,185,129,0.35)',
        textColor: 'text-white',
        adminAccess: true,
        priority: 3,
    },
    PROMOTER: {
        label: 'Elite Promoter',
        short: 'Promoter',
        emoji: '🎯',
        description: 'Gương mặt đại diện xuất sắc, cầu nối giữa Sony và cộng đồng.',
        rarity: 'Uncommon',
        category: 'core',
        gradient: 'from-rose-500 to-pink-500',
        glow: 'rgba(244,63,94,0.3)',
        textColor: 'text-white',
        adminAccess: false,
        priority: 4,
    },
    USER: {
        label: 'Alpha Member',
        short: 'User',
        emoji: '👤',
        description: 'Thành viên chính thức của cộng đồng Alpha Wiki.',
        rarity: 'Common',
        category: 'core',
        gradient: 'from-slate-500 to-slate-600',
        glow: 'rgba(100,116,139,0.25)',
        textColor: 'text-white',
        adminAccess: false,
        priority: 5,
    },
    SALESMAN: {
        label: 'Sales Expert',
        short: 'Sales',
        emoji: '💼',
        description: 'Chuyên gia kinh doanh — am hiểu sản phẩm, thành thạo kỹ năng tư vấn và chốt đơn.',
        rarity: 'Uncommon',
        category: 'core',
        gradient: 'from-emerald-400 to-green-600',
        glow: 'rgba(52,211,153,0.35)',
        textColor: 'text-white',
        adminAccess: false,
        priority: 6,
    },
    // Achievement Badges
    AI_ENTHUSIAST: {
        label: 'Chiến thần AI',
        short: 'AI Guru',
        emoji: '🧠',
        description: 'Người khai thác triệt để sức mạnh của trí tuệ nhân tạo.',
        rarity: 'Epic',
        category: 'achievement',
        gradient: 'from-indigo-500 to-purple-600',
        glow: 'rgba(99,102,241,0.4)',
        textColor: 'text-white',
        priority: 10,
    },
    TOP_READER: {
        label: 'Mọt sách Sony',
        short: 'Expert',
        emoji: '📖',
        description: 'Đã đọc và nghiên cứu hầu hết các tài liệu chuyên môn.',
        rarity: 'Rare',
        category: 'achievement',
        gradient: 'from-emerald-400 to-teal-600',
        glow: 'rgba(52,211,153,0.35)',
        textColor: 'text-white',
        priority: 11,
    },
    SUPER_FAN: {
        label: 'Cư dân Alpha',
        short: 'Super Fan',
        emoji: '🏠',
        description: 'Thành viên hoạt động cực kỳ năng nổ và ghé thăm wiki mỗi ngày.',
        rarity: 'Rare',
        category: 'achievement',
        gradient: 'from-orange-400 to-red-500',
        glow: 'rgba(251,146,60,0.4)',
        textColor: 'text-white',
        priority: 12,
    },
    INTERACTIVE_GURU: {
        label: 'Đại sứ kết nối',
        short: 'Guru',
        emoji: '🤝',
        description: 'Có sự tương tác và đóng góp tích cực cho cộng đồng.',
        rarity: 'Uncommon',
        category: 'achievement',
        gradient: 'from-blue-400 to-indigo-500',
        glow: 'rgba(96,165,250,0.35)',
        textColor: 'text-white',
        priority: 13,
    },
    SALES_MASTER: {
        label: 'Bàn tay Midas',
        short: 'Seller',
        emoji: '💰',
        description: 'Kỉ lục gia chốt đơn trong các phiên livestream bán hàng.',
        rarity: 'Epic',
        category: 'achievement',
        gradient: 'from-yellow-400 to-orange-500',
        glow: 'rgba(250,204,21,0.4)',
        textColor: 'text-white',
        priority: 14,
    },
    STREAM_KING: {
        label: 'Ngôi sao màn ảnh',
        short: 'King',
        emoji: '👑',
        description: 'Host livestream có lượng tương tác và người xem khủng nhất.',
        rarity: 'Epic',
        category: 'achievement',
        gradient: 'from-pink-500 to-rose-600',
        glow: 'rgba(236,72,153,0.4)',
        textColor: 'text-white',
        priority: 15,
    },
    EARLY_BIRD: {
        label: 'Người dậy sớm',
        short: 'Early',
        emoji: '🌅',
        description: 'Thường xuyên cập nhật thông tin vào sáng sớm tinh mơ.',
        rarity: 'Common',
        category: 'achievement',
        gradient: 'from-amber-300 to-yellow-500',
        glow: 'rgba(252,211,77,0.3)',
        textColor: 'text-slate-900',
        priority: 16,
    },
    NIGHT_OWL: {
        label: 'Cú đêm Alpha',
        short: 'Owl',
        emoji: '🦉',
        description: 'Chuyên gia nghiên cứu kĩ thuật vào khung giờ khuya khoắt.',
        rarity: 'Common',
        category: 'achievement',
        gradient: 'from-slate-700 to-slate-900',
        glow: 'rgba(30,41,59,0.4)',
        textColor: 'text-white',
        priority: 17,
    },
    BUG_HUNTER: {
        label: 'Thợ săn lỗi',
        short: 'Hunter',
        emoji: '🐛',
        description: 'Người có đôi mắt tinh tường, phát hiện và báo cáo các điểm chưa hoàn thiện.',
        rarity: 'Rare',
        category: 'achievement',
        gradient: 'from-lime-400 to-green-600',
        glow: 'rgba(163,230,53,0.35)',
        textColor: 'text-white',
        priority: 18,
    },
    GEAR_MASTER: {
        label: 'Tín đồ phần cứng',
        short: 'Expert',
        emoji: '📷',
        description: 'Bậc thầy về thông số kĩ thuật của mọi dòng máy ảnh và ống kính Sony.',
        rarity: 'Rare',
        category: 'achievement',
        gradient: 'from-cyan-400 to-blue-600',
        glow: 'rgba(34,211,238,0.35)',
        textColor: 'text-white',
        priority: 19,
    },
    LENS_CONNOISSEUR: {
        label: 'Chân lý G Master',
        short: 'GM',
        emoji: '💎',
        description: 'Chuyên gia thẩm định chất lượng quang học của dòng ống kính cao cấp nhất.',
        rarity: 'Legendary',
        category: 'achievement',
        gradient: 'from-orange-600 to-red-700',
        glow: 'rgba(234,88,12,0.4)',
        textColor: 'text-white',
        priority: 20,
    },
    COLOR_MAGICIAN: {
        label: 'Phù thủy màu sắc',
        short: 'Magic',
        emoji: '🧙‍♂️',
        description: 'Sáng tạo và tinh chỉnh những hệ màu (Picture Profile) độc bản.',
        rarity: 'Epic',
        category: 'achievement',
        gradient: 'from-pink-400 via-purple-500 to-indigo-600',
        glow: 'rgba(219,39,119,0.35)',
        textColor: 'text-white',
        priority: 21,
    },
    VIDEO_VANGUARD: {
        label: 'Tiên phong Cinematic',
        short: 'Cinema',
        emoji: '🎬',
        description: 'Dẫn đầu xu hướng quay phim với những góc nhìn đậm chất điện ảnh.',
        rarity: 'Rare',
        category: 'achievement',
        gradient: 'from-slate-800 to-black',
        glow: 'rgba(0,0,0,0.4)',
        textColor: 'text-white',
        priority: 22,
    },
    WIKI_CONTRIBUTOR: {
        label: 'Người xây tổ',
        short: 'Builder',
        emoji: '🐝',
        description: 'Đóng góp những thông tin quý giá để làm giàu kho kiến thức Alpha.',
        rarity: 'Uncommon',
        category: 'achievement',
        gradient: 'from-yellow-500 to-amber-600',
        glow: 'rgba(245,158,11,0.35)',
        textColor: 'text-white',
        priority: 23,
    },
    QUICK_RESOLVER: {
        label: 'Tốc độ ánh sáng',
        short: 'Flash',
        emoji: '🔍',
        description: 'Phản ứng nhanh nhạy với các giải pháp mà AI đề xuất.',
        rarity: 'Common',
        category: 'achievement',
        gradient: 'from-sky-300 to-blue-500',
        glow: 'rgba(14,165,233,0.3)',
        textColor: 'text-slate-900',
        priority: 24,
    },
    LOYAL_ALPHIST: {
        label: 'Cận vệ Alpha',
        short: 'Loyal',
        emoji: '🛡️',
        description: 'Người bạn đồng hành trung thành cùng hệ sinh thái Sony qua nhiều năm tháng.',
        rarity: 'Epic',
        category: 'achievement',
        gradient: 'from-emerald-600 to-green-800',
        glow: 'rgba(5,150,105,0.4)',
        textColor: 'text-white',
        priority: 25,
    },
    COMPARISON_EXPERT: {
        label: 'Chuyên gia cân não',
        short: 'Judge',
        emoji: '⚖️',
        description: 'Sử dụng công cụ so sánh để đưa ra những lựa chọn thiết bị tối ưu nhất.',
        rarity: 'Rare',
        category: 'achievement',
        gradient: 'from-violet-400 to-fuchsia-600',
        glow: 'rgba(167,139,250,0.35)',
        textColor: 'text-white',
        priority: 26,
    },
    LIVE_LEGEND: {
        label: 'Huyền thoại Live',
        short: 'Legend',
        emoji: '🔥',
        description: 'Đã thực hiện hơn 100 phiên livestream rực lửa trên hệ thống.',
        rarity: 'Legendary',
        category: 'achievement',
        gradient: 'from-red-600 via-orange-500 to-yellow-400',
        glow: 'rgba(220,38,38,0.5)',
        textColor: 'text-white',
        priority: 27,
    },
    TECH_SUPPORT_HERO: {
        label: 'Hiệp sĩ hỗ trợ',
        short: 'Hero',
        emoji: '🩺',
        description: 'Luôn sẵn lòng giải đáp và hỗ trợ kĩ thuật cho các thành viên khác.',
        rarity: 'Rare',
        category: 'achievement',
        gradient: 'from-teal-400 to-cyan-600',
        glow: 'rgba(45,212,191,0.35)',
        textColor: 'text-white',
        priority: 28,
    },
    WANDERLUST_PRO: {
        label: 'Freelancer vạn dặm',
        short: 'Traveler',
        emoji: '🌍',
        description: 'Sử dụng wiki để tra cứu thông tin mọi lúc mọi nơi trên mọi nẻo đường.',
        rarity: 'Uncommon',
        category: 'achievement',
        gradient: 'from-blue-600 to-sky-400',
        glow: 'rgba(37,99,235,0.35)',
        textColor: 'text-white',
        priority: 29,
    },
};

/**
 * Map email addresses to roles.
 * Add new users here.
 */
export const ROLE_EMAIL_MAP = {
    'thaikpham.art@gmail.com': ['DEV', 'TRAINER', 'PRODUCT_MARKETING', 'DATA'],
    'trungnguyen.fwr@gmail.com': ['TRAINER', 'DATA'],
    'nhanlt.luunhan@gmail.com': ['TRAINER', 'DATA'],
    'buingockieuanhwork@gmail.com': ['DATA', 'SALESMAN'],
    'minhtranduy.sony@gmail.com': ['DATA', 'SALESMAN'],
    // Examples — update with real emails:
    // 'trainer@sony.com': ['TRAINER'],
    // 'marketing@sony.com': ['PRODUCT_MARKETING'],
    // 'data@sony.com': ['DATA'],
    // 'promoter@sony.com': ['PROMOTER'],
};

/**
 * Get role keys array for an email. Defaults to ['USER'].
 */
export function getRoleKeys(email) {
    if (!email) return ['USER'];
    // Special case for Dev access
    if (email === 'th.pham@sony.com') return ['DEV', 'TRAINER', 'PRODUCT_MARKETING', 'DATA'];
    const entry = ROLE_EMAIL_MAP[email];
    if (!entry) return ['USER'];
    return Array.isArray(entry) ? entry : [entry];
}

/**
 * Get role config objects array for an email.
 */
export function getRole(email) {
    return getRoleKeys(email).map(k => ROLES[k]).filter(Boolean);
}

/**
 * Returns true if the email has admin panel access (any role grants it).
 */
export function hasAdminAccess(email) {
    return getRoleKeys(email).some(k => ROLES[k]?.adminAccess);
}
/**
 * Returns true if the email is authorized for professional livestream reporting.
 * (Sony staff roles: DEV, TRAINER, PM, DATA, PROMOTER)
 */
export function isAuthorizedForLiveReport(email) {
    if (!email) return false;
    const keys = getRoleKeys(email);
    return keys.some(k => k !== 'USER');
}

/**
 * Returns true if the user has Data Master permissions (Edit/Add products).
 * Includes: DEV, TRAINER, PM, DATA
 */
export function canManageData(email) {
    if (!email) return false;
    const keys = getRoleKeys(email);
    return keys.some(k => ['DEV', 'TRAINER', 'PRODUCT_MARKETING', 'DATA'].includes(k));
}

/**
 * Returns true if the user has Developer permissions (Delete products).
 * Includes: DEV
 */
export function canDeleteData(email) {
    if (!email) return false;
    return getRoleKeys(email).includes('DEV');
}
