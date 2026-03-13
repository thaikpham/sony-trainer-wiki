# SOP — Quy trình Livestream Phòng Live Sony

Tài liệu này mô tả **Quy trình vận hành chuẩn (SOP)** cho Trung tâm Livestream (Live Studio Hub) của Sony — dùng cho **đào tạo**, **hướng dẫn sử dụng** và **vận hành phòng live** theo thứ tự logic, khoa học.

---

## 1. Mục đích tổng thể

- **Chất lượng:** Đảm bảo hình ảnh, âm thanh và nội dung livestream đạt chuẩn (1080p, 30/60fps, ánh sáng 4 điểm, máy ảnh Sony cấu hình đúng).
- **Tài sản:** Kiểm soát thiết bị phòng live — **chống trộm cắp**, **xác định trách nhiệm khi hư hỏng** thông qua kiểm kê trước/sau buổi live và chữ ký kỹ thuật viên.
- **Lặp lại được:** Mọi kỹ thuật viên làm theo cùng một quy trình để giảm sai sót và dễ bàn giao.

---

## 2. Ba giai đoạn của quy trình

```text
PRE-LIVE (Chuẩn bị)     →     LIVE (Lên sóng)     →     POST-LIVE (Kết thúc & Báo cáo)
     Bước 1–6                        Lên sóng                    Bước 7 + Kiểm kê lại
```

- **Pre-live:** Từ kiểm kê thiết bị đến hoàn tất kịch bản/timeline — chỉ lên sóng khi đã xong đủ bước.
- **Live:** Phát trực tiếp theo nền tảng (TikTok Live Studio, OBS, v.v.).
- **Post-live:** Báo cáo sự cố (nếu có), kiểm kê lại thiết bị (đối chiếu với bản in Pre-live), ký xác nhận, lưu trữ.

---

## 3. Chi tiết từng bước (theo tab Livestream)

### Bước 1 — Chuẩn bị Thiết bị (Equipment)

**Mục đích:** Kiểm soát và quản lý tài sản phòng live — **tránh trộm cắp**, **trách nhiệm khi hư hỏng**.

**Hành động:**
- Mở tab **Chuẩn bị** → xem danh sách thiết bị (nhóm, brand, gear, số lượng, serial, nguồn, trạng thái).
- **Tick (Check)** từng thiết bị đã kiểm tra tại phòng; ghi chú serial nếu cần.
- **Kỹ thuật viên** ký tên vào ô tương ứng (trên bản in).
- **In PDF** lưu trữ trước khi live (bản in chỉ gồm danh sách thiết bị + cột Đã KT, nền trắng tiết kiệm mực). Bản này dùng đối chiếu **sau** buổi live.

**Training:** Nhấn mạnh — không bỏ qua bước này; in và ký là bằng chứng trách nhiệm và đối chiếu tài sản.

---

### Bước 2 — Kết nối (Connection)

**Mục đích:** Đảm bảo phần cứng đấu nối đúng — máy ảnh → capture card/PC, âm thanh, nguồn, mạng.

**Hành động:**
- Xem **Sơ đồ Kết nối Studio** (diagram) trong tab.
- Kiểm tra thực tế: HDMI từ máy Sony → Capture Card → PC; mic → interface/PC; nguồn điện; LAN (ưu tiên có dây).
- Trong tab có thể chọn nguồn camera/mic (preview) để xác nhận thiết bị được nhận.

**Training:** So sánh diagram với bố cục phòng thực tế; lần đầu nên đi từng dây một và đặt nhãn nếu cần.

---

### Bước 3 — Máy ảnh (Camera)

**Mục đích:** Cài đặt máy Sony (FX3/ZV-E10/A6700...) và thông số phơi sáng đồng bộ với đèn, đúng chuẩn livestream.

**Hành động:**
- Đọc mục **Định dạng điểm ảnh** (Capture Card): chọn **YUY2** (4:2:2) cho livestream.
- **FPS:** 30fps hoặc 60fps (tránh 50fps); nếu phần mềm kẹt 50fps thì chuyển máy sang **NTSC**.
- Cài máy: NTSC, Clean HDMI (Info Display Off), 1080p, 60p/30p; AF-C, Face/Eye AF; Auto Power OFF Temp = High; nguồn PD hoặc pin giả.
- **Phơi sáng (Manual M):** PP11 (S-Cinetone), WB 5600K cố định, Shutter 1/60 (30fps) hoặc 1/125 (60fps), khẩu f/2.8–f/4, ISO 320 hoặc 400–800. Chỉnh sáng bằng công suất đèn, hạn chế chỉnh lại máy.

**Training:** Thực hành chuyển PAL→NTSC và kiểm tra hình trên OBS/TikTok sau khi set.

---

### Bước 4 — Phần mềm (Software)

**Mục đích:** Cấu hình OBS / TikTok Live Studio (nguồn video, âm thanh, stream key, độ phân giải/fps).

**Hành động:**
- Thêm nguồn **Video Capture** (từ Capture Card hoặc USB camera).
- Thêm nguồn **âm thanh**, chỉnh level.
- Cài **Output**: 1080p, 30 hoặc 60fps, bitrate theo hướng dẫn nền tảng.
- **Preview** kiểm tra hình và âm trước khi live.

**Ghi chú vận hành:** Nên bật đèn (Bước 5) trước hoặc song song với Bước 4 để preview trên phần mềm đúng exposure và màu da; tránh chỉnh xong phần mềm rồi bật đèn làm lệch hình.

---

### Bước 5 — Ánh sáng (Lighting)

**Mục đích:** Setup ánh sáng 4 điểm chuẩn, đồng bộ nhiệt độ màu với WB máy ảnh.

**Hành động:**
- **Tắt hết đèn phòng** — tránh lệch màu và flicker.
- **Key:** Góc 45° trước mặt, cao hơn đầu, chúi xuống ~45°; 5600K; 20–30% công suất (vd. Nanlite FS-300).
- **Fill:** 45° đối diện Key; 5600K; 10–15% (vd. Elgato Key Light).
- **Rim/Hair:** Phía sau, ngoài khung; 4500–5000K; 30–40% (vd. Nanlite Forza 60B).
- **Background:** Thấp phía sau, hắt lên tường; 5600K (hoặc màu concept); 20–40% (vd. Nanlite PavoPanel 120).
- Sau khi set đèn, kiểm tra lại hình trên phần mềm; nếu thiếu/dư sáng thì chỉnh công suất đèn (ưu tiên Key), không chỉnh lại máy.

**Training:** Đánh dấu vị trí chân đèn và % công suất tham chiếu để lần sau set nhanh.

---

### Bước 6 — Kịch bản (Content)

**Mục đích:** Có timeline/script rõ ràng để dẫn chương trình và đúng thời lượng.

**Hành động:**
- Nhập **tiêu đề** và **mô tả** kịch bản; bấm tạo **Timeline** (AI) hoặc soạn tay.
- Dùng **Studio Bot** (chat AI) để gợi ý nội dung, thiết bị, thao tác nếu cần.
- In hoặc mở timeline bên cạnh khi live.

**Training:** Chạy thử 1–2 lần với timeline ngắn để quen nhịp.

---

### Bước 7 — Báo cáo (Report)

**Mục đích:** Ghi nhận sự cố sau buổi live; đối chiếu thiết bị và xác nhận trách nhiệm (không mất mát/hư hỏng).

**Hành động:**
- Điền **báo cáo livestream** (sự cố, ghi chú) — có thể qua trang Báo cáo live trong Wiki hoặc form nội bộ.
- **Kiểm kê lại thiết bị:** So với bản in Pre-live (Bước 1); tick/xác nhận từng mục đã trả đủ, không hư/mất. Nếu có sai lệch → ghi rõ và báo quản lý.
- Kỹ thuật viên (hoặc người phụ trách) ký xác nhận trên bản kiểm kê sau live; lưu trữ cùng bản Pre-live.

**Training:** Coi bước 7 là bắt buộc — không đóng phòng live khi chưa đối chiếu thiết bị và ký.

---

## 4. Thứ tự logic và ghi chú vận hành

| Thứ tự | Bước        | Lý do ngắn gọn |
|--------|-------------|-----------------|
| 1      | Chuẩn bị TB | Kiểm soát tài sản trước; in & ký làm căn cứ. |
| 2      | Kết nối     | Phần cứng đúng trước khi bật máy và phần mềm. |
| 3      | Máy ảnh     | Cài máy và exposure trước khi set đèn chi tiết. |
| 4      | Phần mềm    | Cấu hình stream; có thể làm song song với Bước 5. |
| 5      | Ánh sáng    | Set đèn sau hoặc song song phần mềm; preview cuối cùng phải đúng. |
| 6      | Kịch bản    | Nội dung sẵn sàng trước khi lên sóng. |
| 7      | Báo cáo     | Sau live; đối chiếu thiết bị + báo cáo sự cố. |

**Không bỏ qua:** Bước 1 (kiểm kê + in + ký) và Bước 7 (đối chiếu + ký). Đây là nòng cốt quản lý tài sản và trách nhiệm.

---

## 5. Checklist nhanh cho kỹ thuật viên

**Trước live:**
- [ ] Kiểm kê thiết bị, tick đủ, in PDF, ký kỹ thuật viên.
- [ ] Kết nối dây theo sơ đồ; test camera + mic trên phần mềm.
- [ ] Máy ảnh: NTSC, 1080p, PP11, WB 5600K, shutter/khẩu/ISO đúng.
- [ ] Đèn 4 điểm đã bật, tắt đèn phòng; preview hình ổn.
- [ ] OBS/TikTok Live Studio: nguồn video/âm, output 1080p 30/60fps.
- [ ] Timeline/kịch bản đã có.

**Sau live:**
- [ ] Điền báo cáo (sự cố nếu có).
- [ ] Đối chiếu thiết bị với bản in Pre-live; xác nhận không mất/hư.
- [ ] Ký và lưu trữ bản kiểm kê sau live.

---

## 6. Tài liệu liên quan

- **Trong app:** Từng tab Livestream (Chuẩn bị, Kết nối, Máy ảnh, Phần mềm, Ánh sáng, Kịch bản, Báo cáo) có nội dung hướng dẫn chi tiết và tham chiếu Picture Profile / ánh sáng 4 điểm.
- **README / ROADMAP:** Cấu trúc dự án và định hướng phát triển.

---

*SOP này là tài liệu tham chiếu cho đào tạo và vận hành phòng live Sony. Cập nhật khi quy trình hoặc thiết bị thay đổi.*
