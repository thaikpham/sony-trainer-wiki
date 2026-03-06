'use client';
import { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import MultiSelectField from './MultiSelectField';
import MultiSelectCategoryField from './MultiSelectCategoryField';
import SingleSelectField from './SingleSelectField';

const EMPTY_PRODUCT = {
    name: '',
    kataban: '',
    color: '',
    category: '', // Legacy support
    categories: [], // Multi support
    tags: [],
    highlights: '',
    quickSettingGuide: '',
    imageUrl: '',
    specUrl: '',
    buySony: '',
    buyShopee: '',
    buyTiktok: '',
    price: '',
    year: new Date().getFullYear(),
    isAvailable: true,
};

// Removed static TAG_SUGGESTIONS

const INDUSTRY_TEMPLATES = {
    'Máy Ảnh': '- Cảm biến: \n- Bộ xử lý hình ảnh: \n- Hệ thống lấy nét: \n- Quay video (Tối đa): \n- Dải ISO: \n- Màn hình/Kính ngắm: \n- Lưu trữ (Thẻ / SSD): \n- Trọng lượng & Pin: ',
    'Ống Kính': '- Ngàm: E-mount \n- Tiêu cự: \n- Khẩu độ tối đa - tối thiểu: \n- Motor lấy nét chính: \n- Khoảng cách lấy nét gần nhất: \n- Đường kính Filter: \n- Cấu tạo lá khẩu: \n- Trọng lượng: ',
    'Tivi Bravia': '- Kích thước màn hình: \n- Độ phân giải: \n- Tấm nền & Đèn nền: \n- Bộ xử lý hình ảnh: \n- Tần số quét (Native): \n- Công nghệ âm thanh: \n- Hệ điều hành: \n- Kết nối (HDMI 2.1 / VRR): ',
    'Tai Nghe': '- Kiểu dáng: \n- Màng loa (Driver): \n- Chống ồn chủ động (ANC): \n- Công nghệ âm thanh (LDAC / Hi-Res): \n- Thời lượng Pin: \n- Sạc nhanh: \n- Chống nước / bụi: \n- Trọng lượng: ',
    'Loa & Âm Thanh': '- Hệ thống kênh âm thanh / Cấu hình: \n- Tổng công suất: \n- Công nghệ âm thanh đa chiều: \n- Kết nối không dây: \n- Kết nối có dây: \n- Thời lượng Pin / Chống nước (Với loa di động): ',
    'Điện Thoại Xperia': '- Màn hình (Tấm nền/Độ phân giải): \n- Vi xử lý (Chipset): \n- RAM / ROM: \n- Camera chính: \n- Dung lượng Pin / Sạc: \n- Chuẩn kháng nước/bụi: \n- Âm thanh: ',
    'PlayStation': '- Vi xử lý (CPU/GPU): \n- Bộ nhớ lưu trữ / SSD: \n- Độ phân giải xuất hình (Max): \n- Ổ đĩa quang: \n- Tay cầm đi kèm: \n- Kết nối / Cổng xuất: ',
    'Phụ Kiện': '- Loại thiết bị: \n- Khả năng tương thích: \n- Kích thước / Trọng lượng: \n- Tiện ích / Tính năng nổi bật: ',
    'Máy Quay Film': '- Cảm biến: \n- Ngàm ống kính: \n- Quay video (Tối đa): \n- Dải Dynamic Range: \n- Hệ thống lấy nét: \n- Lưu trữ (Thẻ / SSD): \n- Trọng lượng & Pin: ' // Same as alpha mostly but different terms
};

const InputClass = 'w-full px-3 py-2.5 rounded-xl border border-black/10 bg-background text-[13px] text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors';
const LabelClass = 'block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5';

export default function ProductFormModal({
    product = null,
    onSave,
    onDelete,
    onClose,
    saving = false,
    globalTags = [],
    onUpdateTags,
    readOnly: propReadOnly = false
}) {
    const isEdit = Boolean(product?.id);
    const [isViewToggled, setIsViewToggled] = useState(isEdit && propReadOnly);
    const readOnly = propReadOnly || (isEdit && isViewToggled);

    // Replace any null values with empty string to prevent uncontrolled input errors
    const sanitizeForm = (prod) => {
        if (!prod) return { ...EMPTY_PRODUCT };
        const next = { ...EMPTY_PRODUCT, ...prod };

        // Migrate legacy category (string) to categories (array)
        if (next.category && (!next.categories || next.categories.length === 0)) {
            next.categories = [next.category];
        } else if (next.categories && next.categories.length > 0 && !next.category) {
            next.category = next.categories[0];
        }

        for (const key in next) {
            if (next[key] === null && key !== 'id') {
                next[key] = '';
            }
        }
        return next;
    };

    const [form, setForm] = useState(isEdit ? sanitizeForm(product) : { ...EMPTY_PRODUCT });
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Reset form when switching between different products to edit
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm(product?.id ? sanitizeForm(product) : { ...EMPTY_PRODUCT });
        setDeleteConfirm(false);
        setIsViewToggled(Boolean(product?.id) && propReadOnly);
    }, [product, propReadOnly]);

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: Must have at least one category
        if (!form.categories || form.categories.length === 0) {
            alert('Vui lòng chọn ít nhất một ngành hàng.');
            return;
        }

        const cleaned = {
            ...form,
            price: (form.price === '' || form.price === null || form.price === undefined) ? null : Number(form.price),
            year: (form.year === '' || form.year === null || form.year === undefined) ? null : Number(form.year),
            // Legacy fallback syncing
            category: form.categories[0] || ''
        };
        onSave(cleaned);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/[0.02] backdrop-blur-[20px] backdrop-saturate-[180%] animate-in fade-in duration-200" />

            {/* Modal */}
            <div
                className={`relative z-10 w-full max-w-6xl max-h-full overflow-y-auto custom-scrollbar rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 ${!readOnly
                    ? 'bg-[#fafafa] border-[3px] border-[#1d1d1f]'
                    : 'bg-background border border-black/[0.07]'
                    }`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b ${!readOnly ? 'bg-[#fafafa]/90 border-black/10' : 'bg-background/90 border-black/[0.06]'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className={`text-[16px] font-bold ${!readOnly ? 'text-[#1d1d1f]' : 'text-foreground'}`}>
                                {readOnly ? '📱 Chi tiết sản phẩm' : isEdit ? '✏️ Đang chỉnh sửa sản phẩm...' : '✨ Thêm sản phẩm mới'}
                            </h2>
                            {isEdit && <p className="text-[11px] text-slate-400 mt-0.5">ID: {product.id}</p>}
                        </div>
                        {propReadOnly ? (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-black/5">
                                Chỉ xem
                            </span>
                        ) : isEdit ? (
                            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-black/5">
                                <button
                                    type="button"
                                    onClick={() => setIsViewToggled(true)}
                                    className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${isViewToggled ? 'bg-white shadow-sm text-foreground' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Xem
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsViewToggled(false)}
                                    className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${!isViewToggled ? 'bg-white shadow-sm text-foreground' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Sửa
                                </button>
                            </div>
                        ) : null}
                    </div>
                    <button type="button" onClick={onClose}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${!readOnly ? 'bg-black/10 hover:bg-black/20 text-[#1d1d1f]' : 'bg-black/5 hover:bg-black/10'
                            }`}>
                        <X size={15} strokeWidth={!readOnly ? 2.5 : 2} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                    {/* Row: Name + Model + Color */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                            <label className={LabelClass}>Tên sản phẩm *</label>
                            <input required value={form.name} onChange={e => set('name', e.target.value)}
                                className={InputClass} placeholder="VD: Sony ZV-E10 II" readOnly={readOnly} />
                        </div>
                        <div>
                            <label className={LabelClass}>Kataban</label>
                            <input value={form.kataban || ''} onChange={e => set('kataban', e.target.value)}
                                className={InputClass} placeholder="VD: ILCE-7RM5" readOnly={readOnly} />
                        </div>
                        <div>
                            <label className={LabelClass}>Màu sắc (Color)</label>
                            <input value={form.color} onChange={e => set('color', e.target.value)}
                                className={InputClass} placeholder="VD: Đen, Bạc..." readOnly={readOnly} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Categories */}
                        <div>
                            <label className={LabelClass}>Ngành hàng *</label>
                            <MultiSelectCategoryField
                                value={form.categories || []}
                                onChange={newCats => {
                                    if (readOnly) return;
                                    setForm(f => {
                                        const next = {
                                            ...f,
                                            categories: newCats,
                                            category: newCats[0] || '' // Sync legacy field for compatibility
                                        };
                                        // Auto-apply template if selection changes and content is empty/template
                                        const newlyAdded = newCats.find(c => !f.categories?.includes(c));
                                        if (newlyAdded) {
                                            const templateKey = newlyAdded;
                                            if (templateKey && INDUSTRY_TEMPLATES[templateKey]) {
                                                const tpl = INDUSTRY_TEMPLATES[templateKey];
                                                if (!f.highlights || Object.values(INDUSTRY_TEMPLATES).includes(f.highlights)) {
                                                    next.highlights = tpl;
                                                }
                                            }
                                        }
                                        return next;
                                    });
                                }}
                                readOnly={readOnly}
                            />
                            {!readOnly && (form.categories?.length > 1) && (
                                <p className="mt-1 text-[11px] text-blue-500 font-bold">
                                    ✓ Đã chọn {form.categories.length} ngành
                                </p>
                            )}
                        </div>

                        {/* Tags */}
                        <div>
                            <label className={LabelClass}>Tính năng / Tags</label>
                            <MultiSelectField
                                value={form.tags}
                                onChange={v => set('tags', v)}
                                suggestions={globalTags}
                                onAddSuggestion={onUpdateTags ? (newTag) => onUpdateTags([...new Set([...globalTags, newTag])]) : undefined}
                                onRemoveSuggestion={onUpdateTags ? (tagToRemove) => onUpdateTags(globalTags.filter(t => t !== tagToRemove)) : undefined}
                                placeholder="Thêm tính năng nổi bật..."
                                readOnly={readOnly}
                            />
                            {!readOnly && <p className="mt-1 text-[11px] text-slate-400">Gõ + Enter để thêm. Gợi ý từ: {(globalTags || []).slice(0, 4).join(', ')}...</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Highlights */}
                        <div className="flex flex-col h-full col-span-1 lg:col-span-2 space-y-2">
                            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                                <label className={LabelClass}>Thông số kỹ thuật tiêu chuẩn (Highlights)</label>
                                {!readOnly && (
                                    <div className="flex gap-2 flex-wrap pb-2">
                                        {Object.keys(INDUSTRY_TEMPLATES).map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => {
                                                    if (form.highlights && !Object.values(INDUSTRY_TEMPLATES).includes(form.highlights) && !confirm(`Ghi đè thông số hiện tại bằng mẫu ${type}?`)) {
                                                        return;
                                                    }
                                                    set('highlights', INDUSTRY_TEMPLATES[type]);
                                                }}
                                                className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500 hover:text-white transition-all whitespace-nowrap"
                                            >
                                                Mẫu {type}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <textarea
                                value={form.highlights}
                                onChange={e => set('highlights', e.target.value)}
                                className={`${InputClass} resize-none font-medium leading-relaxed flex-1`}
                                style={{ minHeight: '200px' }}
                                placeholder="- Cảm biến 33MP Full-frame : BIONZ XR&#10;- Lấy nét : Điểm AF nhận diện mắt&#10;- Quay video : 4K 60p 10-bit 4:2:2"
                                readOnly={readOnly}
                            />
                            {!readOnly && <p className="mt-1.5 text-[11px] text-slate-400 font-medium italic">Mẹo: Dùng gạch đầu dòng. Sẽ tự gộp 4 nhóm (Vận hành, Hình ảnh, Lấy nét, Quay phim).</p>}
                        </div>

                        {/* Quick Setting Guide */}
                        <div className="flex flex-col h-full">
                            <label className={LabelClass}>Quick Setting Guide (Auto Grouping)</label>
                            <textarea
                                value={form.quickSettingGuide || ''}
                                onChange={e => set('quickSettingGuide', e.target.value)}
                                className={`${InputClass} resize-none font-medium leading-relaxed flex-1`}
                                style={{ minHeight: '200px' }}
                                placeholder="Nhập: P (Program): Máy tự lo... Hệ thống sẽ tự gộp nhóm."
                                readOnly={readOnly}
                            />
                            <p className="mt-1.5 text-[11px] text-slate-400 font-medium italic opacity-0 pointer-events-none">Spacer</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Image URL */}
                        <div>
                            <label className={LabelClass}>Link ảnh sản phẩm</label>
                            <div className="flex gap-2">
                                <input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
                                    className={`${InputClass} flex-1`} placeholder="https://..." type="url" readOnly={readOnly} />
                                {form.imageUrl && (
                                    <img src={form.imageUrl} alt="preview"
                                        className="w-10 h-10 rounded-lg object-cover border border-black/10 flex-shrink-0"
                                        onError={e => { e.target.style.display = 'none'; }} />
                                )}
                            </div>
                        </div>

                        {/* Spec URL */}
                        <div>
                            <label className={LabelClass}>Link trang sản phẩm / Spec sheet</label>
                            <div className="relative">
                                <input value={form.specUrl} onChange={e => set('specUrl', e.target.value)}
                                    className={`${InputClass} pr-10`} placeholder="https://sony.com/..." type="url" readOnly={readOnly} />
                                {form.specUrl && (
                                    <a href={form.specUrl} target="_blank" rel="noreferrer"
                                        className="absolute right-3 top-[1.2rem] -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Purchase Links Section */}
                    {(!readOnly || form.buySony || form.buyShopee || form.buyTiktok) && (
                        <div className="space-y-4">
                            <label className={LabelClass}>Giỏ hàng & Mua sắm (Sony Store, Shopee, Tiktok)</label>

                            {!readOnly && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <input value={form.buySony || ''} onChange={e => set('buySony', e.target.value)}
                                            className={`${InputClass} pr-10`} placeholder="Sony Store Online URL" type="url" readOnly={readOnly} />
                                        {form.buySony && (
                                            <a href={form.buySony} target="_blank" rel="noreferrer"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input value={form.buyShopee || ''} onChange={e => set('buyShopee', e.target.value)}
                                            className={`${InputClass} pr-10`} placeholder="Shopee URL" type="url" readOnly={readOnly} />
                                        {form.buyShopee && (
                                            <a href={form.buyShopee} target="_blank" rel="noreferrer"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input value={form.buyTiktok || ''} onChange={e => set('buyTiktok', e.target.value)}
                                            className={`${InputClass} pr-10`} placeholder="Tiktok Shop URL" type="url" readOnly={readOnly} />
                                        {form.buyTiktok && (
                                            <a href={form.buyTiktok} target="_blank" rel="noreferrer"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors">
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {readOnly && (form.buySony || form.buyShopee || form.buyTiktok) && (
                                <div className="flex flex-wrap gap-3">
                                    {form.buySony && (
                                        <a href={form.buySony} target="_blank" rel="noreferrer"
                                            className="px-6 py-2.5 bg-black text-white rounded-full text-[13px] font-bold hover:opacity-90 transition-all flex items-center gap-2">
                                            Sony Store
                                        </a>
                                    )}
                                    {form.buyShopee && (
                                        <a href={form.buyShopee} target="_blank" rel="noreferrer"
                                            className="px-6 py-2.5 bg-orange-500 text-white rounded-full text-[13px] font-bold hover:opacity-90 transition-all flex items-center gap-2">
                                            Shopee
                                        </a>
                                    )}
                                    {form.buyTiktok && (
                                        <a href={form.buyTiktok} target="_blank" rel="noreferrer"
                                            className="px-6 py-2.5 bg-rose-600 text-white rounded-full text-[13px] font-bold hover:opacity-90 transition-all flex items-center gap-2">
                                            Tiktokshop
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Row: Price + Year + Available */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={LabelClass}>Giá (VND)</label>
                            <input value={isNaN(form.price) ? '' : form.price} onChange={e => set('price', e.target.value)}
                                className={InputClass} placeholder="18990000" type="number" min={0} readOnly={readOnly} />
                        </div>
                        <div>
                            <label className={LabelClass}>Năm ra mắt</label>
                            <input value={form.year} onChange={e => set('year', e.target.value)}
                                className={InputClass} placeholder="2024" type="number" min={2000} max={2030} readOnly={readOnly} />
                        </div>
                        <div>
                            <label className={LabelClass}>Trạng thái</label>
                            <button
                                type="button"
                                onClick={() => !readOnly && set('isAvailable', !form.isAvailable)}
                                disabled={readOnly}
                                className={`w-full h-10 rounded-xl text-[12px] font-bold border transition-all ${form.isAvailable
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                    } ${readOnly ? 'cursor-default' : ''}`}
                            >
                                {form.isAvailable ? '✅ Đang bán' : '⏸ Ngừng bán'}
                            </button>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.06]">
                        {/* Delete */}
                        {isEdit && !readOnly && (
                            deleteConfirm
                                ? <div className="flex items-center gap-2">
                                    <span className="text-[12px] text-rose-600 font-semibold">Xác nhận xóa?</span>
                                    <button type="button" onClick={() => onDelete(product.id)}
                                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[12px] font-bold hover:bg-rose-700 transition-colors">Xóa</button>
                                    <button type="button" onClick={() => setDeleteConfirm(false)}
                                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[12px] font-bold hover:opacity-80 transition-opacity">Hủy</button>
                                </div>
                                : <button type="button" onClick={() => setDeleteConfirm(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 text-[12px] font-semibold transition-colors">
                                    <Trash2 size={13} /> Xóa sản phẩm
                                </button>
                        )}
                        {(readOnly || !isEdit) && <div />}

                        {/* Save */}
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={onClose}
                                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-black/5 transition-colors">
                                {readOnly ? 'Đóng' : 'Hủy'}
                            </button>
                            {!readOnly && (
                                <button type="submit" disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-foreground text-background text-[13px] font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm">
                                    {saving && <Loader2 size={13} className="animate-spin" />}
                                    {isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
