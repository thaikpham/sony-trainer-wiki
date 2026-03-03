import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCpIRmEaisOYWyWRdIIU55cXhbP-f6CllA",
    authDomain: "wiki-portal-47be7.firebaseapp.com",
    projectId: "wiki-portal-47be7",
    storageBucket: "wiki-portal-47be7.firebasestorage.app",
    messagingSenderId: "321148320222",
    appId: "1:321148320222:web:c779316705053af392054f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================================
// SAMPLE PRODUCTS - 6 NEW CATEGORIES
// (User will update data after seeding)
// ============================================================
const sampleProducts = [
    // --- TAI NGHE ---
    {
        id: 'sample-wh-1000xm5',
        name: 'Sony WH-1000XM5',
        type: 'Tai nghe',
        category: 'Over-ear Wireless',
        highlights: 'Chống ồn hàng đầu thế giới, 30 giờ pin, Multipoint Connect',
        tags: ['Tai nghe Over-ear', 'Noise Cancelling', 'Wireless', 'Flagship'],
        url: 'https://www.sony.com.vn/vi/headphones/products/wh-1000xm5',
        price: '8.990.000đ',
        weight: '250g'
    },
    {
        id: 'sample-wf-1000xm5',
        name: 'Sony WF-1000XM5',
        type: 'Tai nghe',
        category: 'In-ear True Wireless',
        highlights: 'ANC thế hệ mới, LDAC, tự động phát hiện môi trường',
        tags: ['Tai nghe In-ear', 'True Wireless', 'Noise Cancelling', 'LDAC'],
        url: 'https://www.sony.com.vn/',
        price: '6.990.000đ',
        weight: '5.9g'
    },
    {
        id: 'sample-wh-ch720n',
        name: 'Sony WH-CH720N',
        type: 'Tai nghe',
        category: 'Over-ear Wireless',
        highlights: 'Chống ồn, nhẹ nhất trong dòng WH, pin 35 giờ',
        tags: ['Tai nghe Over-ear', 'Noise Cancelling', 'Wireless', 'Phổ thông'],
        url: 'https://www.sony.com.vn/',
        price: '3.490.000đ',
        weight: '192g'
    },

    // --- LOA ---
    {
        id: 'sample-srs-xb100',
        name: 'Sony SRS-XB100',
        type: 'Loa',
        category: 'Loa di động mini',
        highlights: 'Siêu nhỏ gọn, chống nước IP67, pin 16 giờ',
        tags: ['Loa di động', 'Chống nước', 'Mini', 'Phổ thông'],
        url: 'https://www.sony.com.vn/',
        price: '1.290.000đ',
        weight: '230g'
    },
    {
        id: 'sample-srs-xv900',
        name: 'Sony SRS-XV900',
        type: 'Loa',
        category: 'Loa party cỡ lớn',
        highlights: 'X-Balanced Speaker, đèn LED, kết nối guitar & mic',
        tags: ['Loa party', 'X-Balanced', 'LED Light', 'Flagship'],
        url: 'https://www.sony.com.vn/',
        price: '18.990.000đ',
        weight: '19.4kg'
    },
    {
        id: 'sample-srs-ra5000',
        name: 'Sony SRS-RA5000',
        type: 'Loa',
        category: 'Loa 360 Reality Audio',
        highlights: '360 Reality Audio, 7 driver, WiFi & Bluetooth đồng thời',
        tags: ['Loa gia đình', '360 Audio', 'Wi-Fi', 'Flagship'],
        url: 'https://www.sony.com.vn/',
        price: '16.990.000đ',
        weight: '3.5kg'
    },

    // --- TV ---
    {
        id: 'sample-bravia-a95l',
        name: 'Sony BRAVIA XR A95L (65")',
        type: 'TV',
        category: 'QD-OLED 4K',
        highlights: 'QD-OLED, XR Cognitive Processor, Bravia Cam, Google TV',
        tags: ['OLED', '4K', 'Google TV', 'Flagship'],
        url: 'https://www.sony.com.vn/',
        price: '99.990.000đ',
        weight: '28.6kg'
    },
    {
        id: 'sample-bravia-x90l',
        name: 'Sony BRAVIA XR X90L (55")',
        type: 'TV',
        category: 'Full Array LED 4K',
        highlights: 'Full Array LED, XR Triluminos Pro, HDMI 2.1, 120Hz',
        tags: ['LED', '4K', 'Google TV', 'Gaming', 'HDMI 2.1'],
        url: 'https://www.sony.com.vn/',
        price: '35.990.000đ',
        weight: '17.5kg'
    },
    {
        id: 'sample-bravia-w830k',
        name: 'Sony BRAVIA W830K (43")',
        type: 'TV',
        category: 'LED 4K',
        highlights: '4K HDR, Google TV, Dolby Atmos, X1 4K Processor',
        tags: ['LED', '4K', 'Google TV', 'Phổ thông'],
        url: 'https://www.sony.com.vn/',
        price: '12.990.000đ',
        weight: '6.8kg'
    },

    // --- SOUNDBAR ---
    {
        id: 'sample-ht-a9',
        name: 'Sony HT-A9',
        type: 'Soundbar',
        category: '4.0.4ch Wireless',
        highlights: '360 Spatial Sound Mapping, 4 loa không dây, Dolby Atmos',
        tags: ['Soundbar', 'Dolby Atmos', 'DTS:X', 'Wireless', 'Flagship'],
        url: 'https://www.sony.com.vn/',
        price: '49.990.000đ',
        weight: '3.7kg'
    },
    {
        id: 'sample-ht-a7000',
        name: 'Sony HT-A7000',
        type: 'Soundbar',
        category: '7.1.2ch',
        highlights: '7.1.2ch, 500W, Dolby Atmos, built-in dual subwoofer',
        tags: ['Soundbar', 'Dolby Atmos', '7.1.2ch', 'Flagship'],
        url: 'https://www.sony.com.vn/',
        price: '24.990.000đ',
        weight: '6.2kg'
    },
    {
        id: 'sample-ht-s400',
        name: 'Sony HT-S400',
        type: 'Soundbar',
        category: '2.1ch',
        highlights: '330W, subwoofer không dây, Dolby Digital, DTS',
        tags: ['Soundbar', '2.1ch', 'Phổ thông', 'Subwoofer không dây'],
        url: 'https://www.sony.com.vn/',
        price: '5.990.000đ',
        weight: '2.7kg'
    },

    // --- ĐIỆN THOẠI ---
    {
        id: 'sample-xperia1vi',
        name: 'Sony Xperia 1 VI',
        type: 'Điện Thoại',
        category: 'Flagship Smartphone',
        highlights: 'Snapdragon 8 Gen 3, camera Zeiss, màn hình 4K OLED, pin 5000mAh',
        tags: ['Flagship', 'Zeiss Camera', 'OLED', 'Snapdragon 8'],
        url: 'https://www.sony.com.vn/',
        price: '39.990.000đ',
        weight: '192g'
    },
    {
        id: 'sample-xperia5vi',
        name: 'Sony Xperia 5 VI',
        type: 'Điện Thoại',
        category: 'Compact Flagship',
        highlights: 'Compact, camera Zeiss, Snapdragon 8 Gen 3, 6.1" OLED',
        tags: ['Compact', 'Zeiss Camera', 'OLED', 'Snapdragon 8'],
        url: 'https://www.sony.com.vn/',
        price: '29.990.000đ',
        weight: '182g'
    },
    {
        id: 'sample-xperia10vi',
        name: 'Sony Xperia 10 VI',
        type: 'Điện Thoại',
        category: 'Mid-range Smartphone',
        highlights: 'Pin 5000mAh, Snapdragon 6 Gen 1, jack 3.5mm, nhẹ nhất Android',
        tags: ['Mid-range', '3.5mm Jack', 'Pin lớn', 'Gọn nhẹ'],
        url: 'https://www.sony.com.vn/',
        price: '12.990.000đ',
        weight: '164g'
    },

    // --- PHỤ KIỆN ---
    {
        id: 'sample-gp-vpt2bt',
        name: 'Sony GP-VPT2BT Shooting Grip',
        type: 'Phụ kiện',
        category: 'Shooting Grip & Tripod',
        highlights: 'Kết hợp grip và tripod, remote Bluetooth, tương thích đa máy',
        tags: ['Grip', 'Tripod', 'Bluetooth Remote', 'Vlog'],
        url: 'https://www.sony.com.vn/',
        price: '3.490.000đ',
        weight: '244g'
    },
    {
        id: 'sample-ecm-b10',
        name: 'Sony ECM-B10 Microphone',
        type: 'Phụ kiện',
        category: 'Microphone',
        highlights: 'Multi-directional shotgun mic, Digital interface, kết nối trực tiếp',
        tags: ['Microphone', 'Vlog', 'Shotgun', 'Digital Interface'],
        url: 'https://www.sony.com.vn/',
        price: '4.290.000đ',
        weight: '44g'
    },
    {
        id: 'sample-np-fz100',
        name: 'Sony NP-FZ100 Battery',
        type: 'Phụ kiện',
        category: 'Pin máy ảnh',
        highlights: 'Pin Z series, 2280mAh, cho Alpha 7/9 series, sạc qua USB-C',
        tags: ['Pin', 'Z-series', 'USB-C', 'Alpha 7'],
        url: 'https://www.sony.com.vn/',
        price: '1.990.000đ',
        weight: '83g'
    },
];

async function seedProducts() {
    console.log(`Seeding ${sampleProducts.length} sample products...`);

    const productsCol = collection(db, 'products');
    const batch = writeBatch(db);

    for (const product of sampleProducts) {
        const { id, ...data } = product;
        const docRef = doc(productsCol, id);
        batch.set(docRef, data);
    }

    await batch.commit();
    console.log('✅ Seeded successfully!');
}

seedProducts()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('❌ Error:', err);
        process.exit(1);
    });
