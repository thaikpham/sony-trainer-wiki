# Cập nhật Environment Variables trên Vercel

Sau khi push code, cập nhật env trên Vercel để build/deploy đúng.

## Cách 1: Vercel Dashboard (khuyến nghị)

1. Mở [Vercel Dashboard](https://vercel.com/dashboard) → chọn project **Sony Training Wiki** (hoặc tên project của bạn).
2. Vào **Settings** → **Environment Variables**.
3. Thêm hoặc sửa từng biến theo danh sách dưới (lấy giá trị từ `.env.local` của máy bạn).

### Biến bắt buộc

| Name | Ghi chú |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `GEMINI_API_KEY` | Google Gemini API key |

### Biến tùy chọn

| Name | Ghi chú |
|------|--------|
| `MCP_SERVER_URL` | URL MCP server (cho luồng recommend) |
| `ADMIN_SECRET_KEY` | Bảo vệ API sync-clerk, sync-knowledge |

4. Chọn **Production**, **Preview**, **Development** tùy môi trường cần dùng.
5. **Save** → redeploy (Deployments → ... → Redeploy) để áp dụng env mới.

## Cách 2: Vercel CLI

```bash
# Cài và đăng nhập (nếu chưa)
npx vercel login

# Trong thư mục dự án, link project (nếu chưa)
npx vercel link

# Kéo env từ Vercel về .env.local (để so sánh)
npx vercel env pull .env.vercel

# Thêm từng biến (CLI sẽ hỏi value)
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add GEMINI_API_KEY
# ... lặp cho từng biến
```

## Lưu ý

- **Đã bỏ** trên Vercel (không cần nữa): `NEXT_PUBLIC_GEMINI_API_KEY`, toàn bộ `NEXT_PUBLIC_FIREBASE_*`, `EXPERIMENTATION_CONFIG_ITEM_KEY`, `NEXT_PUBLIC_HYPERTUNE_TOKEN`.
- Nếu bạn vẫn có các biến cũ trên Vercel, có thể xóa chúng trong **Settings → Environment Variables** để tránh rối.
