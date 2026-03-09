export const PRODUCT_CATEGORY_LIST = [
    'Máy Ảnh',
    'Ống Kính',
    'Tai Nghe',
    'Loa & Âm Thanh',
    'Tivi Bravia',
    'PlayStation',
    'Điện Thoại Xperia',
    'Máy Quay Film',
    'Phụ Kiện',
];

export const PRODUCT_CATEGORY_TO_SLUG = {
    'Máy Ảnh': 'may-anh',
    'Ống Kính': 'ong-kinh',
    'Tai Nghe': 'tai-nghe',
    'Loa & Âm Thanh': 'loa-am-thanh',
    'Tivi Bravia': 'tivi-bravia',
    PlayStation: 'playstation',
    'Điện Thoại Xperia': 'dien-thoai-xperia',
    'Máy Quay Film': 'may-quay-film',
    'Phụ Kiện': 'phu-kien',
};

export const PRODUCT_CATEGORY_BY_SLUG = Object.fromEntries(
    Object.entries(PRODUCT_CATEGORY_TO_SLUG).map(([name, slug]) => [slug, name])
);
