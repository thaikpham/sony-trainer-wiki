import fs from 'fs';
import { parse } from 'csv-parse/sync';

const inputPath = 'C:\\Users\\thaik\\Downloads\\Danh mục sản phẩm và bảng giá thiết bị Sony - Table 1 (1).csv';
const outputPath = 'src/data/importData.json';

try {
    const csvData = fs.readFileSync(inputPath, 'utf8');
    const records = parse(csvData, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    const products = records.map(record => {
        // "Model Name","Product Name","Ngành Hàng","Tags","Date","Giá SRP","Màu sắc / Phiên bản","Thông số kỹ thuật","Link sản phẩm"

        let priceStr = record['Giá SRP'] || '';
        priceStr = priceStr.replace(/,/g, '').trim();
        const price = priceStr ? Number(priceStr) : null;

        const dateStr = record['Date'] || '';
        const year = dateStr ? Number(dateStr) : new Date().getFullYear();

        const tagsStr = record['Tags'] || '';
        const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

        return {
            name: record['Product Name'] || '',
            model: record['Model Name'] || '',
            color: record['Màu sắc / Phiên bản'] || '',
            category: record['Ngành Hàng'] || '',
            tags: tags,
            highlights: record['Thông số kỹ thuật'] || '',
            quickSettingGuide: '',
            imageUrl: '',
            specUrl: record['Link sản phẩm'] || '',
            price: price,
            year: year,
            isAvailable: true
        };
    });

    // filter out entirely empty rows
    const validProducts = products.filter(p => p.name || p.model);

    if (!fs.existsSync('src/data')) {
        fs.mkdirSync('src/data', { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(validProducts, null, 2));
    console.log(`Successfully parsed ${validProducts.length} products to ${outputPath}`);

} catch (e) {
    console.error("Error parsing CSV:", e);
}
