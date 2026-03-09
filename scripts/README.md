## Utility & Migration Scripts

Các file trong thư mục `scripts` (và một số script nằm trong `src`) **không được dùng trong runtime của website**. Chúng là công cụ hỗ trợ nhập liệu, migrate Firestore, hoặc kiểm tra dữ liệu:

- `parseCSV.js`, `parseXLSX.js`: chuyển dữ liệu sản phẩm từ file CSV/XLSX thành JSON chuẩn hoá (tags, category, giá, năm…).
- `scripts/migrate.js`, `scripts/migrateAirtableToFirebase.js`, `scripts/seedNewCategories.js`: migrate dữ liệu từ Airtable → Firestore và seed thêm danh mục mẫu.
- `src/scripts/dumpPlatforms.js`: gọi `getLivestreamTutorials()` để kiểm tra dữ liệu livestream.
- `src/test-db.js`, `src/proxy.js`: script thử nghiệm kết nối Firestore và bổ sung demo `quickSettingGuide`.

**Cách chạy khuyến nghị** (từ thư mục gốc dự án):

- Đảm bảo `.env.local` đã được cấu hình (Firebase, Airtable…).
- Chạy với Node kèm biến môi trường, ví dụ:

```bash
node parseXLSX.js
node scripts/migrateAirtableToFirebase.js
```

Trong tương lai khi chuyển sang **Supabase**, các script này nên được:

- Hoặc viết lại để nhập/xuất dữ liệu trực tiếp với Supabase.
- Hoặc gom vào một thư mục `tools/` riêng biệt cho Firestore legacy để dễ phân biệt với thế hệ script mới.

