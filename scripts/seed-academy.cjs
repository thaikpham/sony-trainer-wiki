/**
 * Seed Academy Paths and Nodes from Lộ Trình Tự Học Nhiếp Ảnh & Làm Phim.docx
 *
 * Run: node scripts/seed-academy.cjs
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const academyData = [
  {
    title: '🌍 Thế Giới 1: Chinh Phục Ánh Sáng',
    description:
      'Nhiếp Ảnh Vỡ Lòng – Thoát khỏi chế độ tự động, làm chủ các thông số cơ bản và xây dựng tư duy thị giác đầu tiên.',
    order_index: 0,
    nodes: [
      {
        title: 'Trạm 1: Làm quen với "Tổ Lái"',
        description:
          'Sờ thử và nhận diện các vòng xoay, nút bấm trên máy. Hiểu tiêu cự (Focal Length) là độ zoom của ống kính: số nhỏ thì chụp toàn cảnh rộng, số to thì soi được tận nốt ruồi. Phân biệt RAW và JPEG.',
        order_index: 0,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: 'Trạm 2: Trò Chơi "Bơm Nước" – Tam Giác Phơi Sáng',
        description:
          'Tưởng tượng chụp ảnh như hứng một xô nước ánh sáng với 3 vòi: Khẩu độ (Aperture) kiểm soát lượng ánh sáng & bokeh, Tốc độ màn trập (Shutter Speed) đóng băng hay làm nhòe chuyển động, ISO tăng độ nhạy sáng nhưng gây nhiễu hạt.',
        order_index: 1,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: 'Trạm 3: Xếp Hình – Ngữ Pháp Bố Cục',
        description:
          'Áp dụng Quy tắc 1/3 kinh điển: chia khung hình thành 9 ô vuông, đặt chủ thể vào các giao điểm thay vì chính giữa. Luyện tập nhịp điệu, cân bằng và tạo chiều sâu bằng cách xếp lớp tiền cảnh, trung cảnh, hậu cảnh.',
        order_index: 2,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: '⚔️ Đánh Boss: Thử Thách Cuộn Phim 36 Kiểu',
        description:
          'Vác máy ra đường, tự hứa chỉ được bấm chụp đúng 36 tấm và tuyệt đối không được xem lại ảnh cho đến khi hết "cuộn phim" ảo. Thêm giới hạn nhân tạo: cả ngày chỉ dùng 1 ống kính hoặc chỉ chụp những thứ nằm trên đỉnh đầu bạn.',
        order_index: 3,
        is_milestone: true,
        badge_name: 'Mắt Kính Nhập Môn',
      },
    ],
  },
  {
    title: '🌍 Thế Giới 2: Phép Thuật Buồng Tối',
    description:
      'Phù Thủy Hậu Kỳ – Biến một bức ảnh trông bình thường thành tác phẩm vạn người mê. Thành thạo Lightroom & Photoshop theo triết lý Non-destructive.',
    order_index: 1,
    nodes: [
      {
        title: 'Trạm 1: Tắm Rửa Sạch Sẽ – Lightroom Workflow',
        description:
          'Tập thói quen đổ ảnh vào máy, gắn cờ (flag) chọn tấm đẹp nhất. Kéo thanh phơi sáng cứu lại khoảng trời bị trắng xóa hay vùng bóng râm đen thui. Tạo ra một "bản nháp hoàn hảo" trước khi chỉnh màu sắc.',
        order_index: 0,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: 'Trạm 2: Đeo Mặt Nạ – Photoshop & Non-Destructive',
        description:
          'Bỏ ngay thói quen dùng cục tẩy (Eraser). Học cách dùng Layer Masks và cọ đen/trắng để che hoặc hiện hiệu ứng. Thao tác sai chỉ cần lật mặt nạ là cứu được ảnh gốc. Luyện tập đồ thị Curves để điều chỉnh sắc độ và tương phản.',
        order_index: 1,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: 'Trạm 3: Viện Thẩm Mỹ – Retouching Da Chuyên Nghiệp',
        description:
          'Không dùng filter làm mịn da trơn tuột như búp bê nhựa (lạm dụng Frequency Separation). Dùng Healing Brush ở độ cứng tối đa để chấm từng nốt mụn. Dùng Dodge & Burn để làm đều màu da mà vẫn giữ nguyên kết cấu lỗ chân lông tự nhiên.',
        order_index: 2,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: '⚔️ Đánh Boss: Chân Dung Mộc Tự Nhiên',
        description:
          'Lấy ảnh chân dung một người bạn, chỉnh sửa sao cho da dẻ sáng rạng rỡ, hết mụn nhưng người ngoài nhìn vào cứ tưởng mộc tự nhiên không hề đụng app!',
        order_index: 3,
        is_milestone: true,
        badge_name: 'Bảng Màu Ma Thuật',
      },
    ],
  },
  {
    title: '🌍 Thế Giới 3: Khung Hình Biết Nói',
    description:
      'Tập Làm Đạo Diễn – Bắt đầu cho mọi thứ chuyển động. Quay phim không chỉ là bấm máy, mà là kể chuyện bằng ngôn ngữ điện ảnh.',
    order_index: 2,
    nodes: [
      {
        title: 'Trạm 1: Đừng Bước Qua Vạch Kẻ – Quy Tắc 180 Độ',
        description:
          'Khi 2 người đang nói chuyện, tưởng tượng có một sợi dây tàng hình nối thẳng giữa họ. Chỉ được phép đặt máy quay ở một bên của sợi dây đó. Nếu bước qua, khán giả xem phim sẽ bị lú lẫn, không hiểu ai đang nhìn ai.',
        order_index: 0,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: 'Trạm 2: Gần Hay Xa? – Giải Phẫu Các Cỡ Cảnh',
        description:
          'Đứng xa quay toàn thân (Full Shot) để khoe áo quần, bối cảnh. Lại gần xíu quay từ đầu gối lên (Cowboy Shot) để lấy hành động của tay. Dí sát mặt (Close-up) để bắt trọn giọt nước mắt. Cận cực đại (ECU) để phóng đại căng thẳng.',
        order_index: 1,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: 'Trạm 3: Vũ Điệu Máy Quay – Camera Movement',
        description:
          'Pan: lắc máy qua trái phải. Tilt: gật máy lên xuống. Tracking/Dolly: máy di chuyển bám theo nhân vật. Crane Shot: đưa máy từ dưới thấp vút lên cao tạo sự choáng ngợp. Dolly Zoom (Vertigo): kết hợp tiến máy và thu tiêu cự tạo cảm giác kinh hoàng.',
        order_index: 2,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: '⚔️ Đánh Boss: Video 1 Phút "Hồi Hộp Chờ Đợi"',
        description:
          'Dùng điện thoại quay một đoạn video 1 phút, không có lời thoại nào, chỉ dùng góc máy và sự di chuyển của máy quay để diễn tả cảm giác "Hồi hộp chờ đợi".',
        order_index: 3,
        is_milestone: true,
        badge_name: 'Đạo Diễn Nhí',
      },
    ],
  },
  {
    title: '🌍 Thế Giới 4: Nhịp Đập Của Phim',
    description:
      'Cắt Ghép & Lồng Tiếng – Phim chỉ thực sự hình thành khi bạn ngồi trong phòng dựng. Làm chủ nhịp điệu và thiết kế âm thanh 3 lớp.',
    order_index: 3,
    nodes: [
      {
        title: 'Trạm 1: Nhịp Điệu Cắt Xén – Assembly & Pacing',
        description:
          'Cắt bụp bụp liên tục (jump cuts) sẽ tạo ra sự dồn dập, căng thẳng. Để cảnh quay kéo dài thườn thượt (long take) tạo ra sự tĩnh lặng, suy ngẫm. Bạn là người nắm giữ nhịp tim của khán giả. Thử thách: cross-cutting 2 dòng sự kiện song song.',
        order_index: 0,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: 'Trạm 2: Thổi Hồn Bằng Âm Thanh – 3 Lớp Bánh',
        description:
          'Phim mà không có âm thanh thì chán ngắt. Lót đủ 3 lớp: Nhạc nền (Score) để tạo cảm xúc, Âm thanh môi trường (Ambient/Room Tone) để không gian có chiều sâu và tự nhiên, Tiếng động thật (Foley) như tiếng lạo xạo áo khoác, tiếng bước chân.',
        order_index: 1,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: 'Trạm 3: Nấu Chè Giọng Nói – Mixing & Audio EQ',
        description:
          'Để giọng nhân vật nghe trầm ấm, trong trẻo như phát thanh viên, dùng Audio EQ: cắt bỏ bớt âm trầm rè rè (low-shelf hum) từ tiếng điều hòa, nhích nhẹ dải âm trung (mid-shelf) để giọng nói nghe sắc nét, bật hẳn lên.',
        order_index: 2,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: '⚔️ Đánh Boss: Video 30 Giây Nấu Ăn Chỉ Bằng Foley',
        description:
          'Dựng một đoạn phim 30 giây nấu ăn. Bỏ hết nhạc nền đi, chỉ dùng tiếng "xèo xèo" của thịt, tiếng "cộp cộp" của dao thớt và làm cho người xem phải rớt nước miếng.',
        order_index: 3,
        is_milestone: true,
        badge_name: 'Đôi Tai Ma Thuật',
      },
    ],
  },
  {
    title: '🌍 Thế Giới 5: Phù Thủy Màu Sắc',
    description:
      'Color Grading – Dùng màu sắc để "thao túng tâm lý" người xem. Đây là bộ môn khoa học có tính toán khắt khe, không phải chỉ phủ bộ lọc tùy tiện.',
    order_index: 4,
    nodes: [
      {
        title: 'Trạm 1: Dọn Dẹp Nhà Cửa – Color Management',
        description:
          'Học cách đưa video quay từ máy (thường có màu xám xịt nhạt toẹt, định dạng Log/S-Log) về đúng chuẩn không gian màu thực tế như Rec.709. Bước này chuẩn hóa dữ liệu hình ảnh trước khi bất kỳ thao tác sáng tạo nào.',
        order_index: 0,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: 'Trạm 2: Trả Lại Sự Cân Bằng – The Correction Pass',
        description:
          'Cân chỉnh lại độ sáng tối với Lift/Gamma/Gain (vùng tối, trung tính, sáng). Kéo lại cân bằng trắng cho da người trông đúng màu da người. Đảm bảo cảnh 1 và cảnh 2 đứng cạnh nhau không bị lệch tông – đây là điều kiện tiên quyết trước khi sáng tạo.',
        order_index: 1,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: 'Trạm 3: Áo Mới Cho Phim – Look Development',
        description:
          'Giờ mới là lúc sáng tạo! Phủ màu xanh dương lạnh lẽo để tạo cảm giác cô đơn, hay màu vàng cam (teal and orange) để trông ngầu như phim bom tấn. Rắc thêm chút nhiễu hạt (grain) và halation để phim trông có vẻ hoài cổ, nhám nhám tự nhiên.',
        order_index: 2,
        is_milestone: false,
        badge_name: null,
      },
      {
        title: '🏆 Đánh Boss Trùm Cuối: Video Ngắn Hoàn Chỉnh 100%',
        description:
          'Hoàn thiện 1 video ngắn từ khâu quay, dựng, lồng tiếng đến chỉnh màu mang đậm phong cách cá nhân. Không cần dài, chỉ cần mọi thứ ăn khớp hoàn hảo với nhau!',
        order_index: 3,
        is_milestone: true,
        badge_name: 'Phù Thủy Không Gian',
      },
    ],
  },
];

async function seedAcademy() {
  console.log('🌱 Bắt đầu seed Academy data...\n');

  // Step 1: Xoá dữ liệu cũ (nodes trước, rồi paths)
  console.log('🗑️  Xoá dữ liệu Academy cũ...');
  const { error: delNodesErr } = await supabase.from('academy_nodes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delNodesErr) {
    console.error('Lỗi khi xoá nodes:', delNodesErr.message);
    process.exit(1);
  }
  const { error: delPathsErr } = await supabase.from('academy_paths').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delPathsErr) {
    console.error('Lỗi khi xoá paths:', delPathsErr.message);
    process.exit(1);
  }
  console.log('✅ Đã xoá dữ liệu cũ.\n');

  // Step 2: Insert paths và nodes
  for (const world of academyData) {
    const { nodes, ...pathData } = world;

    // Insert path
    const { data: newPath, error: pathErr } = await supabase
      .from('academy_paths')
      .insert(pathData)
      .select()
      .single();

    if (pathErr) {
      console.error(`❌ Lỗi khi tạo path "${pathData.title}":`, pathErr.message);
      continue;
    }
    console.log(`📚 Đã tạo path: ${newPath.title}`);

    // Insert nodes for this path
    const nodesWithPathId = nodes.map((n) => ({ ...n, path_id: newPath.id }));
    const { error: nodesErr } = await supabase.from('academy_nodes').insert(nodesWithPathId);

    if (nodesErr) {
      console.error(`❌ Lỗi khi tạo nodes cho "${newPath.title}":`, nodesErr.message);
    } else {
      console.log(`   ✅ Đã tạo ${nodes.length} nodes (${nodes.filter(n => !n.is_milestone).length} Trạm + ${nodes.filter(n => n.is_milestone).length} Boss)\n`);
    }
  }

  console.log('🎉 Seed Academy thành công! Tổng cộng 5 Thế Giới đã được tải lên Supabase.');
}

seedAcademy().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
