import { Smartphone, Facebook, Youtube, ShoppingBag, ShoppingCart } from 'lucide-react';

export const platformsData = [
    {
        id: "tiktok",
        name: "TikTok Live",
        description: "Sử dụng TikTok Live Studio trên máy tính để phát sóng chất lượng cao nhất, dễ dàng chèn overlay và quản lý phiên live tương tác mạnh mẽ.",
        icon: Smartphone,
        activeColor: "bg-black text-white hover:bg-slate-800",
        order: 1,
        streamSpecs: {
            resolution: "1080x1920",
            framerate: "60 FPS",
            bitrate: "6000 Kbps",
        },
        software: {
            name: "TikTok Live Studio",
            type: "custom",
            streamKeyRequired: false,
            url: "https://www.tiktok.com/studio/download"
        },
        steps: [
            { title: "Tải phần mềm", content: "Cài đặt TikTok Live Studio chính chủ dành cho Windows hoặc macOS." },
            { title: "Thêm nguồn hình ảnh", content: "Ấn nút 'Add Source' (Thêm nguồn), chọn 'Camera' và trỏ về Capture Card hoặc Sony Webcam của bạn." },
            { title: "Cấu hình âm thanh", content: "Vào phần Audio, vô hiệu hoá Micro nền của PC, chỉ để lại nguồn Mic chính là Capture Card hoặc Sony ECM." },
            { title: "Lên sóng", content: "Điền tiêu đề, gắn giỏ hàng sản phẩm tương ứng, kiểm tra lại luồng và bấm 'Go Live'." }
        ]
    },
    {
        id: "facebook",
        name: "Facebook Live",
        description: "Nền tảng phổ biến nhất để chốt đơn hàng loạt nhờ công cụ mạnh mẽ như GoStream, Pancake hoặc chốt đơn thủ công trực tiếp trên Fanpage.",
        icon: Facebook,
        activeColor: "bg-blue-600 text-white hover:bg-blue-700",
        order: 2,
        streamSpecs: {
            resolution: "1080x1920 (Vertical) / 1920x1080 (Horizontal)",
            framerate: "30-60 FPS",
            bitrate: "4000 - 6000 Kbps",
        },
        software: {
            name: "OBS Studio",
            type: "obs",
            streamKeyRequired: true,
            url: "https://obsproject.com/download"
        },
        steps: [
            { title: "Tạo phiên Live", content: "Truy cập Fanpage Meta Business Suite, khởi tạo luồng phát trực tiếp mới và sao chép mã Stream Key." },
            { title: "Cấu hình OBS", content: "Mở OBS Studio > Settings > Stream. Chọn service Facebook Live và dán Stream Key vừa copy vào." },
            { title: "Bố cục & Nguồn phát", content: "Setup khung hình dọc hoặc ngang tuỳ ý định. Add tính năng 'Video Capture Device' để lấy hình từ camera." },
            { title: "Bắt đầu luồng", content: "Ấn 'Start Streaming' trên OBS. Sau đó quay lại trình duyệt Facebook ấn 'Phát trực tiếp' khi luồng đã nhận ảnh." }
        ]
    },
    {
        id: "shopee",
        name: "Shopee Live",
        description: "Phát sóng ngập tràn mã giảm giá và flash xu. Dành cho tập khách hàng chốt đơn mua sắm mãnh liệt thông qua ứng dụng Shopee.",
        icon: ShoppingBag,
        activeColor: "bg-orange-500 text-white hover:bg-orange-600",
        order: 3,
        streamSpecs: {
            resolution: "720x1280",
            framerate: "30 FPS",
            bitrate: "2500 Kbps",
        },
        software: {
            name: "OBS Studio (Via Shopee PC)",
            type: "obs",
            streamKeyRequired: true,
        },
        steps: [
            { title: "Lấy khoá luồng Shopee", content: "Truy cập Kênh Người Bán -> Shopee Live trên PC để lấy RTMP URL và Stream Key." },
            { title: "Settings OBS", content: "Vào Settings > Stream > Custom. Dán URL và Key vào 2 dòng trống." },
            { title: "Cài đặt đầu ra", content: "Do Shopee giới hạn băng thông, hãy vào Settings > Output > đặt Bitrate Video ở mức 2500 Kbps. Rescale hình ảnh xuống 720p dọc." },
            { title: "Quản lý sản phẩm", content: "Bấm Start Streaming trên OBS, sau đó quản lý ghim sản phẩm và tung xu ngay trên giao diện web Shopee Live." }
        ]
    },
    {
        id: "lazada",
        name: "LazLive",
        description: "Giải pháp Livestream đặc quyền của Lazada Seller Center, kết nối trực tiếp kho hàng và voucher flash sale cho sự kiện Mega.",
        icon: ShoppingCart,
        activeColor: "bg-indigo-600 text-white hover:bg-indigo-700",
        order: 4,
        streamSpecs: {
            resolution: "720x1280",
            framerate: "30 FPS",
            bitrate: "2500 Kbps",
        },
        software: {
            name: "OBS Studio",
            type: "obs",
            streamKeyRequired: true,
        },
        steps: [
            { title: "Tạo phiên LazLive", content: "Vào Lazada Seller Center PC, mục Lazada Live. Thiết lập ảnh bìa, tên luồng và lấy Stream Key." },
            { title: "Cấu hình OBS", content: "Nhập luồng RTMP và Stream Key tương tự Shopee. Set độ phân giải 720x1280 và Bitrate 2500." },
            { title: "Test đường truyền", content: "LazLive yêu cầu mạng rất ổn định, đảm bảo PC Live được gắn dây cáp LAN trực tiếp." },
            { title: "Quản lý cửa hàng", content: "Lên sóng OBS trước, dùng một máy phụ/điện thoại để ghim và quản lý Flash sale sản phẩm." }
        ]
    },
    {
        id: "youtube",
        name: "YouTube Live",
        description: "Nền tảng Livestream dành cho Video Podcast, Talkshow công nghệ chuyên sâu với chất lượng đường truyền lên tới 4K siêu nét.",
        icon: Youtube,
        activeColor: "bg-red-600 text-white hover:bg-red-700",
        order: 5,
        streamSpecs: {
            resolution: "1920x1080 hoặc 4K",
            framerate: "60 FPS",
            bitrate: "9000 - 18000 Kbps",
        },
        software: {
            name: "OBS Studio",
            type: "obs",
            streamKeyRequired: true,
        },
        steps: [
            { title: "Bật tính năng Live", content: "Truy cập YouTube Studio, đảm bảo kênh đã xác minh SĐT và mở tính năng Live (chờ 24h nếu lần đầu)." },
            { title: "Copy Stream Key", content: "Tạo luồng phát trực tiếp trong YouTube Studio, sao chép Stream Key bí mật (Không chia sẻ cho ai)." },
            { title: "Đẩy giới hạn băng thông", content: "Với YouTube, hãy tận dụng sức mạnh máy ảnh. Trong OBS, nới lỏng Bitrate lên tối đa (10000+ Kbps) cho chất lượng trong vắt." },
            { title: "Tương tác luồng", content: "Có thể kích hoạt luồng tự động khi OBS Start Streaming. Sử dụng màn hình phụ để đọc SuperChat." }
        ]
    }
];
