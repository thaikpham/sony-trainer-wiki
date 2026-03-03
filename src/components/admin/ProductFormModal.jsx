'use client';
import { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import MultiSelectField from './MultiSelectField';
import SingleSelectField from './SingleSelectField';

const EMPTY_PRODUCT = {
    name: '',
    model: '',
    category: '',
    tags: [],
    highlights: '',
    quickSettingGuide: '',
    imageUrl: '',
    specUrl: '',
    price: '',
    year: new Date().getFullYear(),
    isAvailable: true,
};

const TAG_SUGGESTIONS = [
    'Full-frame', 'APS-C', '4K 120p', '8K', 'Mirrorless', 'Cinema Line',
    'G Master', 'G Lens', 'E-mount', 'FE-mount', 'Vlog', 'Compact',
    'Noise Cancelling', 'LDAC', 'Hi-Res Audio', '360 RA',
    'Bravia XR', 'OLED', 'Mini LED', '4K HDR',
    'DualSense', 'SSD Speed', 'Ray Tracing',
    '5G Ready', 'IP68', 'ZEISS Optics',
];

const INDUSTRY_TEMPLATES = {
    'Body': '- Cảm biến: \n- Bộ xử lý: \n- Hệ thống lấy nét: \n- Video: \n- ISO: \n- Trọng lượng: ',
    'Lens': '- Tiêu cự: \n- Khẩu độ: \n- Ngàm: \n- Khoảng cách lấy nét gần nhất: \n- Đường kính filter: \n- Trọng lượng: ',
    'TV': '- Độ phân giải: \n- Tấm nền: \n- Bộ xử lý hình ảnh: \n- Tần số quét: \n- Công nghệ âm thanh: \n- Tính năng Game: ',
    'Soundbar': '- Số kênh: \n- Công suất: \n- Công nghệ âm thanh: \n- Kết nối: \n- Loa subwoofer: ',
    'Tai nghe': '- Loại: \n- Driver: \n- Chống ồn: \n- Thời lượng pin: \n- Kết nối: \n- Trọng lượng: ',
    'Loa': '- Công suất: \n- Thời lượng pin: \n- Chống nước/bụi: \n- Kết nối: \n- Tính năng: ',
    'Điện Thoại': '- Màn hình: \n- Chipset: \n- RAM/ROM: \n- Camera sau: \n- Pin/Sạc: \n- Chống nước: '
};

const InputClass = 'w-full px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-background text-[13px] text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors';
const LabelClass = 'block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';

export default function ProductFormModal({ product = null, onSave, onDelete, onClose, saving = false }) {
    const isEdit = Boolean(product?.id);
    const [form, setForm] = useState(isEdit ? { ...EMPTY_PRODUCT, ...product } : { ...EMPTY_PRODUCT });
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // Reset form when switching between different products to edit
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm(product?.id ? { ...EMPTY_PRODUCT, ...product } : { ...EMPTY_PRODUCT });
        setDeleteConfirm(false);
    }, [product]);

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleaned = {
            ...form,
            price: form.price === '' ? null : Number(form.price),
            year: form.year === '' ? null : Number(form.year),
        };
        onSave(cleaned);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-background border border-black/[0.07] dark:border-white/[0.08] shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.06]">
                    <div>
                        <h2 className="text-[16px] font-bold text-foreground">
                            {isEdit ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
                        </h2>
                        {isEdit && <p className="text-[11px] text-slate-400 mt-0.5">ID: {product.id}</p>}
                    </div>
                    <button type="button" onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <X size={15} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                    {/* Row: Name + Model */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={LabelClass}>Tên sản phẩm *</label>
                            <input required value={form.name} onChange={e => set('name', e.target.value)}
                                className={InputClass} placeholder="VD: Sony ZV-E10 II" />
                        </div>
                        <div>
                            <label className={LabelClass}>Model số</label>
                            <input value={form.model} onChange={e => set('model', e.target.value)}
                                className={InputClass} placeholder="VD: ILCE-7RM5" />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className={LabelClass}>Danh mục *</label>
                        <SingleSelectField value={form.category} onChange={v => set('category', v)} />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className={LabelClass}>Tính năng / Tags</label>
                        <MultiSelectField
                            value={form.tags}
                            onChange={v => set('tags', v)}
                            suggestions={TAG_SUGGESTIONS}
                            placeholder="Thêm tính năng nổi bật..."
                        />
                        <p className="mt-1 text-[11px] text-slate-400">Gõ + Enter để thêm. Gợi ý từ: {TAG_SUGGESTIONS.slice(0, 4).join(', ')}...</p>
                    </div>

                    {/* Highlights */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={LabelClass}>Thông số & Tính năng nổi bật (Dùng gạch đầu dòng)</label>
                            <div className="flex gap-2">
                                {Object.keys(INDUSTRY_TEMPLATES).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                            if (confirm(`Áp dụng mẫu ${type}? Nội dung hiện tại sẽ bị ghi đè.`)) {
                                                set('highlights', INDUSTRY_TEMPLATES[type]);
                                            }
                                        }}
                                        className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-colors"
                                    >
                                        Mẫu {type === 'Body' ? 'Máy ảnh' : type === 'Tai nghe' ? 'Audio' : type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            value={form.highlights}
                            onChange={e => set('highlights', e.target.value)}
                            rows={8}
                            className={`${InputClass} resize-none font-medium leading-relaxed`}
                            placeholder="- Cảm biến 33MP Full-frame&#10;- Lấy nét AI thời thực&#10;- Quay 4K 60p 10-bit 4:2:2"
                        />
                        <p className="mt-1.5 text-[11px] text-slate-400 italic">Mẹo: Nhập theo dạng danh sách để hiển thị đẹp nhất trên Wiki.</p>
                    </div>

                    {/* Quick Setting Guide */}
                    <div>
                        <label className={LabelClass}>Quick Setting Guide (Khuyến nghị cài đặt)</label>
                        <textarea
                            value={form.quickSettingGuide || ''}
                            onChange={e => set('quickSettingGuide', e.target.value)}
                            rows={6}
                            className={`${InputClass} resize-none font-medium leading-relaxed`}
                            placeholder="Nhập hướng dẫn cài đặt nhanh dành cho Trainers..."
                        />
                    </div>

                    {/* Image URL */}
                    <div>
                        <label className={LabelClass}>Link ảnh sản phẩm</label>
                        <div className="flex gap-2">
                            <input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
                                className={`${InputClass} flex-1`} placeholder="https://..." type="url" />
                            {form.imageUrl && (
                                <img src={form.imageUrl} alt="preview"
                                    className="w-10 h-10 rounded-lg object-cover border border-black/10 dark:border-white/10 flex-shrink-0"
                                    onError={e => { e.target.style.display = 'none'; }} />
                            )}
                        </div>
                    </div>

                    {/* Spec URL */}
                    <div>
                        <label className={LabelClass}>Link trang sản phẩm / Spec sheet</label>
                        <div className="relative">
                            <input value={form.specUrl} onChange={e => set('specUrl', e.target.value)}
                                className={`${InputClass} pr-10`} placeholder="https://sony.com/..." type="url" />
                            {form.specUrl && (
                                <a href={form.specUrl} target="_blank" rel="noreferrer"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Row: Price + Year + Available */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={LabelClass}>Giá (VND)</label>
                            <input value={isNaN(form.price) ? '' : form.price} onChange={e => set('price', e.target.value)}
                                className={InputClass} placeholder="18990000" type="number" min={0} />
                        </div>
                        <div>
                            <label className={LabelClass}>Năm ra mắt</label>
                            <input value={form.year} onChange={e => set('year', e.target.value)}
                                className={InputClass} placeholder="2024" type="number" min={2000} max={2030} />
                        </div>
                        <div>
                            <label className={LabelClass}>Trạng thái</label>
                            <button
                                type="button"
                                onClick={() => set('isAvailable', !form.isAvailable)}
                                className={`w-full h-10 rounded-xl text-[12px] font-bold border transition-all ${form.isAvailable
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                                    : 'bg-slate-100 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
                                    }`}
                            >
                                {form.isAvailable ? '✅ Đang bán' : '⏸ Ngừng bán'}
                            </button>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                        {/* Delete */}
                        {isEdit && (
                            deleteConfirm
                                ? <div className="flex items-center gap-2">
                                    <span className="text-[12px] text-rose-600 font-semibold">Xác nhận xóa?</span>
                                    <button type="button" onClick={() => onDelete(product.id)}
                                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[12px] font-bold hover:bg-rose-700 transition-colors">Xóa</button>
                                    <button type="button" onClick={() => setDeleteConfirm(false)}
                                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-[12px] font-bold hover:opacity-80 transition-opacity">Hủy</button>
                                </div>
                                : <button type="button" onClick={() => setDeleteConfirm(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-[12px] font-semibold transition-colors">
                                    <Trash2 size={13} /> Xóa sản phẩm
                                </button>
                        )}
                        {!isEdit && <div />}

                        {/* Save */}
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                Hủy
                            </button>
                            <button type="submit" disabled={saving}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-foreground text-background text-[13px] font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm">
                                {saving && <Loader2 size={13} className="animate-spin" />}
                                {isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
