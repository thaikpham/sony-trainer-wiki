import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const inputPath = 'C:\\Users\\thaik\\Downloads\\Danh mục sản phẩm và bảng giá thiết bị Sony.xlsx';
const outputPath = 'public/importData.json';

// Normalize raw category values → app canonical labels
const CATEGORY_MAP = {
    // Ống kính
    'ống kính': 'Ống Kính',
    'ống kính (lens)': 'Ống Kính',
    'phụ kiện ống kính': 'Phụ Kiện',

    // Máy ảnh / Camera
    'alpha': 'Máy Ảnh',
    'camera': 'Máy Ảnh',
    'cam and dsc': 'Máy Ảnh',

    // Máy quay Cinema
    'cinemaline': 'Máy Quay Film',
    'dòng máy quay chuyên dụng (cinema line)': 'Máy Quay Film',
    'cinema line': 'Máy Quay Film',

    // Tivi
    'bravia': 'Tivi Bravia',
    'tivi': 'Tivi Bravia',

    // Âm thanh / Loa
    'âm thanh': 'Loa & Âm Thanh',
    'âm thanh gia đình (hav)': 'Loa & Âm Thanh',
    'soundbar': 'Loa & Âm Thanh',
    'loa': 'Loa & Âm Thanh',

    // Tai nghe
    'headphone': 'Tai Nghe',
    'tai nghe (mdr)': 'Tai Nghe',
    'tai nghe': 'Tai Nghe',

    // PlayStation
    'playstation (ps)': 'PlayStation',
    'playstation': 'PlayStation',

    // Điện thoại
    'phone': 'Điện Thoại Xperia',
    'xperia': 'Điện Thoại Xperia',
};

function normalizeCategory(raw) {
    const key = String(raw || '').trim().toLowerCase();
    return CATEGORY_MAP[key] || raw.trim() || '';
}

try {
    const workbook = XLSX.readFile(inputPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    const products = raw.map(row => {
        const tagsStr = String(row['Tags'] || '');
        const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

        const price = typeof row['Giá SRP'] === 'number' ? row['Giá SRP']
            : Number(String(row['Giá SRP']).replace(/,/g, '').trim()) || null;

        const year = typeof row['Date'] === 'number' ? row['Date']
            : Number(row['Date']) || null;

        return {
            name: String(row['Model Name'] || '').trim(),
            model: String(row['Product Name'] || '').trim(),
            color: String(row['Màu sắc / Phiên bản'] || '').trim(),
            category: normalizeCategory(row['Ngành Hàng']),
            tags,
            highlights: String(row['Thông số kỹ thuật'] || '').trim(),
            quickSettingGuide: '',
            imageUrl: '',
            specUrl: String(row['Link sản phẩm'] || '').trim(),
            price: price > 0 ? price : null,
            year: year || null,
            isAvailable: true,
        };
    }).filter(p => p.name || p.model);

    fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));

    const categories = [...new Set(products.map(p => p.category))].sort();
    console.log(`✅ Parsed ${products.length} products → ${outputPath}`);
    console.log(`📂 Ngành hàng (normalized): ${categories.join(', ')}`);
    console.log(`\nSample:`);
    console.log(JSON.stringify(products[0], null, 2));

} catch (e) {
    console.error('Error:', e.message);
}
