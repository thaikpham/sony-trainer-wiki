# Sony Training Wiki – Định hướng phát triển dài hạn

Tài liệu này tổng hợp **tầm nhìn**, **stack**, **khuyến nghị kỹ thuật** và **roadmap** cho dự án Sony Training Wiki. Dùng cùng [README.md](README.md) (map codebase + quy ước hàng ngày cho AI/dev).

---

## 1. Tầm nhìn & mục tiêu

- **Sản phẩm**: Ứng dụng web đào tạo sản phẩm Sony: tra cứu thông số kỹ thuật, ColorLab, khuyến nghị AI, Livestream studio, Academy, analytics.
- **Mục tiêu dài hạn**:
  - Một nguồn dữ liệu (Supabase), một ngôn ngữ chính (TypeScript), một hệ thiết kế (Rayo + Tailwind).
  - AI tích hợp sâu (Gemini) và mở rộng qua trợ lý cá nhân (OpenClaw/MCP).
  - Trải nghiệm nhất quán (design system), dễ bảo trì và onboard.

---

## 2. Stack chiến lược (đã thống nhất)

| Thành phần | Lựa chọn | Ghi chú |
|------------|----------|--------|
| **Framework** | Next.js 16+ (App Router) | Giữ |
| **Ngôn ngữ** | TypeScript (migrate dần từ JS) | Mục tiêu toàn bộ .ts/.tsx |
| **Auth (user)** | Clerk | Giữ cho end-user |
| **Auth (server/background)** | Supabase Auth (bổ sung khi cần) | Cho MCP, cron, service-to-service |
| **Database** | Supabase (primary) | Thống nhất, bỏ Firebase khi xong migration |
| **Vector / RAG** | Pinecone (hiện tại) → cân nhắc pgvector (Supabase) | Chuyển pgvector khi muốn gom một nền tảng |
| **AI chính** | Google Gemini API | Server Actions + MCP |
| **AI phụ (task nhẹ)** | Model rẻ/nhanh (Gemini Flash hoặc local/Ollama) | Bổ sung cho classification, routing, extract |
| **Personal AI** | OpenClaw qua MCP | Không build bot riêng; expose MCP |
| **UI** | Tailwind 4 + design tokens | Một hệ styling |
| **Design reference** | Rayo (`REFERENCES/themeforest-rayo-template/rayo`) | Reference only; port sang Tailwind |

---

## 3. Khuyến nghị đã thống nhất (tổng hợp)

### 3.1 Database & Auth

- **Supabase** làm single source of truth cho dữ liệu.
- **Clerk** giữ cho đăng nhập user (web).
- **Bổ sung**: Dùng **Supabase Auth** (service role / server) cho luồng nội bộ: MCP server, cron, background job – giảm phụ thuộc key bên ngoài.
- **Sau này**: Cân nhắc **Supabase pgvector** thay Pinecone để gom DB + vector một chỗ (một bill, đơn giản hóa).

### 3.2 AI / LLM

- **Gemini** giữ vai trò chính cho chat, RAG, studio.
- **Bổ sung**: Dùng model nhỏ/rẻ (Gemini Flash hoặc local) cho task đơn giản (phân loại, routing, trích xuất) – giảm cost và latency.
- **OpenClaw**: User tự chọn model (Claude/GPT/local); phía dự án chỉ cần MCP ổn định.

### 3.3 Frontend & Design

- **Rayo** chỉ làm reference; **implement bằng Tailwind**.
- **Design tokens**: Định nghĩa **màu, spacing, font** trong **một nơi** (Tailwind theme hoặc `globals.css`), toàn bộ component đọc từ đó – dễ đổi theme, align Rayo.
- **Animation**: Ưu tiên Tailwind + Framer Motion; thêm GSAP chỉ cho vài block đặc biệt (không kéo cả stack Rayo).

### 3.4 MCP & OpenClaw

- **MCP server** (`packages/mcp-server`) là kênh chính để OpenClaw (và client khác) gọi Sony Wiki.
- **Chuẩn hóa**: Error format thống nhất, **logging** có request id để debug.
- **Sau này**: Rate limit / API key nếu expose MCP ra internet; publish **skill ClawHub** “Sony Wiki” khi MCP ổn định.

### 3.5 TypeScript & Codebase

- **Thứ tự migrate**: Ưu tiên **lib, services, API routes** (Supabase client, db, MCP-related) trước; **components** sau – type đúng từ data lên.
- **Shared types**: Thư mục `types/` (hoặc tương đương) dùng chung **app + MCP** (product, user, api payload) – tránh định nghĩa trùng.

### 3.6 DevEx & Chất lượng

- **Scripts**: `package.json` có rõ `dev`, `build`, `lint`, (sau) `test`; thêm script `mcp` (hoặc tương tự) để chạy MCP server một lệnh.
- **Env**: Tạo **`.env.example`** liệt kê biến cần thiết (không ghi giá trị) – onboard và deploy nhanh.
- **README**: Ghi 1–2 lệnh chạy cơ bản; khi có lint/test thì thêm vào “How to Run” hoặc “Development guidelines”.

---

## 4. Cấu trúc tài liệu & tham chiếu

- **[README.md](README.md)**: Map codebase, stack hiện tại, OpenClaw, Design system (Rayo), directory structure, guidelines cho AI, cách chạy.
- **ROADMAP.md** (tài liệu này): Định hướng dài hạn, khuyến nghị, phased roadmap.

Khi cập nhật stack hoặc quy ước hàng ngày → sửa README. Khi cập nhật mục tiêu, phase hoặc chiến lược → sửa ROADMAP.

---

## 5. Roadmap theo giai đoạn

### Phase 1 – Nền tảng (ưu tiên cao)

- [ ] **MCP chuyển sang Supabase**: Thay Firebase trong `packages/mcp-server` bằng Supabase client; tools (specs, color recipes, compare, RAG) đọc/ghi qua Supabase. Có thể giữ Pinecone cho RAG trong phase này.
- [x] **Shared types**: Tạo `src/types/` với types dùng chung app + MCP (product, livestream, database). Cập nhật `supabaseClient` dùng types.
- [ ] **.env.example**: Liệt kê `NEXT_PUBLIC_SUPABASE_*`, `GEMINI_API_KEY`, Pinecone, Clerk, (MCP port nếu cần). README trỏ tới file này.
- [ ] **Script MCP**: Thêm script root (ví dụ `npm run mcp`) chạy build + start MCP server; ghi trong README.

### Phase 2 – TypeScript & data

- [x] **Migrate lib + services sang TS**: `src/lib/data.ts`, `src/services/db.ts`, `tsconfig.json` + script `typecheck`. `supabaseClient.ts` đã dùng types từ `@/types`. Một số component đã chuyển sang `.tsx` (Layout, RoleProvider).
- [ ] **Chuẩn hóa MCP**: Error format, logging (request id); đảm bảo MCP đọc từ Supabase ổn định.

### Phase 3 – Design system & UI

- [ ] **Design tokens**: Một file (Tailwind theme hoặc `globals.css`) định nghĩa màu, spacing, font; component mới dùng tokens.
- [ ] **Port 1–2 component Rayo**: Chọn (ví dụ CTA, card) làm mẫu; implement bằng Tailwind theo Rayo; ghi trong README/component comment làm pattern.
- [ ] **Migrate dần components sang TS**: Ưu tiên component dùng nhiều hoặc có props phức tạp.

### Phase 4 – Mở rộng (tùy nhu cầu)

- [ ] **Supabase Auth cho server**: Dùng cho MCP hoặc cron nếu cần (API key / service role).
- [ ] **Model phụ cho task nhẹ**: Gemini Flash hoặc local cho vài bước trong pipeline.
- [ ] **pgvector (Supabase)**: Đánh giá chuyển RAG từ Pinecone sang pgvector; migration khi quyết định gom một nền tảng.
- [ ] **Skill ClawHub**: Publish skill “Sony Wiki” khi MCP ổn; hướng dẫn trong README.
- [ ] **Lint & test**: Cấu hình lint chạy trước commit; thêm test (e2e hoặc unit) cho critical path; cập nhật README.

---

## 6. Nguyên tắc ra quyết định

- **Đơn giản trước**: Một DB, một ngôn ngữ đích, một hệ UI. Thêm dịch vụ khi có lý do rõ.
- **Migration có thứ tự**: DB/MCP → types/lib → components; tránh đổi nhiều lớp cùng lúc.
- **Design**: Rayo = reference; Tailwind = implementation; tokens = single source cho theme.
- **OpenClaw**: MCP là contract; không build bot riêng; chuẩn hóa error/log để debug và vận hành.

---

*Cập nhật lần cuối: theo thỏa thuận định hướng với team. Khi thay đổi chiến lược, sửa ROADMAP.md và (nếu cần) README.md.*
