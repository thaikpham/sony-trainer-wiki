'use client';
import { useState, useEffect } from 'react';
import { X, ExternalLink, Loader2, Trash2, Settings2 } from 'lucide-react';
import Image from 'next/image';
import MultiSelectField from './MultiSelectField';
import MultiSelectCategoryField from './MultiSelectCategoryField';
import SingleSelectField from './SingleSelectField';

const EMPTY_PRODUCT = {
    // Core Specs
    chip: '', sensor: '', battery: '', aiUnit: '',
    focal_min: '', focal_max: '', aperture: '', minFocus: '', filterSize: '',
    panel: '', processor: '', refreshRate: '', os: '',
    driver: '', anc: '', audioTech: '', batteryLife: '',
    channels: '', power: '', wireless: '',
    display: '', chipset: '', camera: '',
    storage: '', connectivity: '',
    isAvailable: true,
};

const CORE_SPECS_CONFIG = {
    'Máy Ảnh': [
        { id: 'sensor', label: 'Loại Sensor', suggestions: ['Full-frame Exmor R', 'APS-C Exmor RS', '1-inch Stacked CMOS'] },
        { id: 'chip', label: 'Chip xử lý', suggestions: ['BIONZ XR', 'BIONZ X', 'BIONZ XR + AI Unit'] },
        { id: 'aiUnit', label: 'AI Processing Unit', suggestions: ['Dedicated AI Processing Unit', 'Integrated AI Coprocessor'] },
        { id: 'battery', label: 'Loại Pin', suggestions: ['NP-FZ100', 'NP-FW50', 'NP-BX1'] }
    ],
    'Máy Quay Film': [
        { id: 'sensor', label: 'Loại Sensor', suggestions: ['Full-frame Exmor R', 'S35 Exmor R'] },
        { id: 'chip', label: 'Chip xử lý', suggestions: ['BIONZ XR'] },
        { id: 'aiUnit', label: 'AI Processing Unit', suggestions: ['Dedicated AI Processing Unit'] },
        { id: 'battery', label: 'Loại Pin', suggestions: ['NP-FZ100', 'NP-F970'] }
    ],
    'Ống Kính': [
        { id: 'focal', label: 'Tiêu cự (Focal Length)', isDualFocal: true },
        { id: 'aperture', label: 'Khẩu độ lớn nhất', suggestions: ['f/1.2', 'f/1.4', 'f/1.8', 'f/2.8', 'f/4', 'f/4.5-5.6'] },
        { id: 'minFocus', label: 'Lấy nét gần nhất', suggestions: ['0.19m', '0.38m', '0.25m'] },
        { id: 'filterSize', label: 'Kích thước Filter', suggestions: ['67mm', '72mm', '77mm', '82mm'] }
    ],
    'Tivi Bravia': [
        { id: 'panel', label: 'Tấm nền & Đèn nền', suggestions: ['Mini LED', 'OLED', 'QD-OLED', 'Full Array LED'] },
        { id: 'processor', label: 'Bộ xử lý hình ảnh', suggestions: ['XR Cognitive', 'X1 Ultimate', '4K HDR X1'] },
        { id: 'refreshRate', label: 'Tần số quét', suggestions: ['120Hz', '100Hz', '60Hz'] },
        { id: 'os', label: 'Hệ điều hành', suggestions: ['Google TV', 'Android TV'] }
    ],
    'Tai Nghe': [
        { id: 'driver', label: 'Màng loa (Driver)', suggestions: ['40mm', '30mm', '12mm Dynamic'] },
        { id: 'anc', label: 'Chống ồn (ANC)', suggestions: ['HD Noise Cancelling QN1', 'V1 Integrated Processor'] },
        { id: 'audioTech', label: 'Công nghệ âm thanh', suggestions: ['Hi-Res Audio', 'LDAC', 'DSEE Extreme', '360 RA'] },
        { id: 'batteryLife', label: 'Thời lượng Pin', suggestions: ['30 Giờ', '50 Giờ', '8 Giờ'] }
    ],
    'Loa & Âm Thanh': [
        { id: 'channels', label: 'Hệ thống kênh', suggestions: ['5.1.2 CH', '7.1.2 CH', '2.1 CH'] },
        { id: 'power', label: 'Tổng công suất', suggestions: ['800W', '1000W', '400W', '100W'] },
        { id: 'wireless', label: 'Kết nối không dây', suggestions: ['Bluetooth 5.2', 'WiFi', 'AirPlay 2', 'Chromecast'] },
        { id: 'battery', label: 'Thời lượng Pin / Chống nước', suggestions: ['25 Giờ', '20 Giờ', 'IP67'] }
    ],
    'Điện Thoại Xperia': [
        { id: 'display', label: 'Màn hình', suggestions: ['4K OLED 120Hz', 'FHD+ OLED 120Hz'] },
        { id: 'chipset', label: 'Vi xử lý', suggestions: ['Snapdragon 8 Gen 3', 'Snapdragon 8 Gen 2', 'Snapdragon 695'] },
        { id: 'camera', label: 'Camera chính', suggestions: ['24mm 52MP', 'Exmor T for mobile'] },
        { id: 'battery', label: 'Pin & Sạc', suggestions: ['5000mAh / 30W', '4500mAh'] }
    ],
    'PlayStation': [
        { id: 'processor', label: 'Vi xử lý', suggestions: ['Custom AMD Ryzen Zen 2'] },
        { id: 'storage', label: 'Bộ nhớ lưu trữ', suggestions: ['825GB SSD', '1TB SSD'] },
        { id: 'output', label: 'Độ phân giải (Max)', suggestions: ['4K 120Hz', '8K'] },
        { id: 'connectivity', label: 'Kết nối', suggestions: ['WiFi 6', 'Bluetooth 5.1'] }
    ],
};

const INDUSTRY_TEMPLATES = {
    'Máy Ảnh': '- Hệ thống lấy nét: \n- Quay video (Tối đa): \n- Dải ISO: \n- Màn hình/Kính ngắm: \n- Lưu trữ (Thẻ / SSD): \n- Trọng lượng: ',
    'Ống Kính': '- Ngàm: E-mount \n- Motor lấy nét chính: \n- Khoảng cách lấy nét gần nhất: \n- Cấu tạo lá khẩu: \n- Trọng lượng: ',
    'Tivi Bravia': '- Kích thước màn hình: \n- Độ phân giải: \n- Công nghệ âm thanh: \n- Kết nối (HDMI 2.1 / VRR): ',
    'Tai Nghe': '- Kiểu dáng: \n- Sạc nhanh: \n- Chống nước / bụi: \n- Trọng lượng: ',
    'Loa & Âm Thanh': '- Hệ thống kênh âm thanh / Cấu hình: \n- Tổng công suất: \n- Công nghệ âm thanh đa chiều: \n- Kết nối có dây: ',
    'Điện Thoại Xperia': '- Màn hình (Tấm nền/Độ phân giải): \n- RAM / ROM: \n- Chuẩn kháng nước/bụi: \n- Âm thanh: ',
    'PlayStation': '- Độ phân giải xuất hình (Max): \n- Ổ đĩa quang: \n- Tay cầm đi kèm: \n- Cổng xuất hình: ',
    'Phụ Kiện': '- Loại thiết bị: \n- Khả năng tương thích: \n- Kích thước / Trọng lượng: \n- Tính năng nổi bật: ',
    'Máy Quay Film': '- Ngàm ống kính: \n- Quay video (Tối đa): \n- Dải Dynamic Range: \n- Hệ thống lấy nét: \n- Lưu trữ (Thẻ / SSD): \n- Trọng lượng: '
};

// For detection purposes to help auto-update when switching categories
const ALL_TEMPLATES = [
    ...Object.values(INDUSTRY_TEMPLATES),
    '- Cảm biến: \n- Bộ xử lý hình ảnh: \n- Hệ thống lấy nét: \n- Quay video (Tối đa): \n- Dải ISO: \n- Màn hình/Kính ngắm: \n- Lưu trữ (Thẻ / SSD): \n- Trọng lượng & Pin: ',
    '- Ngàm: E-mount \n- Tiêu cự: \n- Khẩu độ tối đa - tối thiểu: \n- Motor lấy nét chính: \n- Khoảng cách lấy nét gần nhất: \n- Đường kính Filter: \n- Cấu tạo lá khẩu: \n- Trọng lượng: ',
    '- Kích thước màn hình: \n- Độ phân giải: \n- Tấm nền & Đèn nền: \n- Bộ xử lý hình ảnh: \n- Tần số quét (Native): \n- Công nghệ âm thanh: \n- Hệ điều hành: \n- Kết nối (HDMI 2.1 / VRR): ',
    '- Kiểu dáng: \n- Màng loa (Driver): \n- Chống ồn chủ động (ANC): \n- Công nghệ âm thanh (LDAC / Hi-Res): \n- Thời lượng Pin: \n- Sạc nhanh: \n- Chống nước / bụi: \n- Trọng lượng: ',
    '- Hệ thống kênh âm thanh / Cấu hình: \n- Tổng công suất: \n- Công nghệ âm thanh đa chiều: \n- Kết nối không dây: \n- Kết nối có dây: \n- Thời lượng Pin / Chống nước (Với loa di động): ',
    '- Màn hình (Tấm nền/Độ phân giải): \n- Vi xử lý (Chipset): \n- RAM / ROM: \n- Camera chính: \n- Dung lượng Pin / Sạc: \n- Chuẩn kháng nước/bụi: \n- Âm thanh: ',
    '- Vi xử lý (CPU/GPU): \n- Bộ nhớ lưu trữ / SSD: \n- Độ phân giải xuất hình (Max): \n- Ổ đĩa quang: \n- Tay cầm đi kèm: \n- Kết nối / Cổng xuất: ',
    '- Loại thiết bị: \n- Khả năng tương thích: \n- Kích thước / Trọng lượng: \n- Tiện ích / Tính năng nổi bật: ',
    '- Cảm biến: \n- Ngàm ống kính: \n- Quay video (Tối đa): \n- Dải Dynamic Range: \n- Hệ thống lấy nét: \n- Lưu trữ (Thẻ / SSD): \n- Trọng lượng & Pin: '
];

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

    const sanitizeForm = (prod) => {
        const next = { ...EMPTY_PRODUCT, ...(prod || {}) };

        // Ensure array fields are actually arrays
        const multiFields = [
            'categories', 'tags', 'sensor', 'chip', 'battery', 'aiUnit',
            'focal_min', 'focal_max', 'aperture', 'minFocus', 'filterSize',
            'panel', 'processor', 'refreshRate', 'os',
            'driver', 'anc', 'audioTech', 'batteryLife',
            'channels', 'power', 'wireless',
            'display', 'chipset', 'camera', 'storage', 'connectivity'
        ];
        multiFields.forEach(key => {
            if (!Array.isArray(next[key])) {
                next[key] = next[key] ? [next[key]] : [];
            }
        });

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

    const [form, setForm] = useState(() => sanitizeForm(product));
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [showQuickSettingsSubModal, setShowQuickSettingsSubModal] = useState(false);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Sync form from product when product or readOnly changes (edit modal)
    /* eslint-disable react-hooks/set-state-in-effect -- init form from prop */
    useEffect(() => {
        setForm(sanitizeForm(product));
        setDeleteConfirm(false);
        setIsViewToggled(Boolean(product?.id) && propReadOnly);
    }, [product, propReadOnly]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.categories || form.categories.length === 0) {
            alert('Vui lòng chọn ít nhất một ngành hàng.');
            return;
        }
        const cleaned = {
            ...form,
            price: (form.price === '' || form.price === null || form.price === undefined) ? null : (isNaN(Number(form.price)) ? null : Number(form.price)),
            year: (form.year === '' || form.year === null || form.year === undefined) ? null : (isNaN(Number(form.year)) ? null : Number(form.year)),
            category: form.categories?.[0] || ''
        };
        onSave(cleaned);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-black/[0.02] backdrop-blur-[20px] backdrop-saturate-[180%] animate-in fade-in duration-200" />

            <div
                className={`relative z-10 w-full max-w-[98vw] max-h-full overflow-y-auto custom-scrollbar rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 ${!readOnly
                    ? 'bg-[#fafafa] border-[3px] border-[#1d1d1f]'
                    : 'bg-background border border-black/[0.07]'
                    }`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b ${!readOnly ? 'bg-[#fafafa]/90 border-black/10' : 'bg-background/90 border-black/[0.06]'}`}>
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
                                <button type="button" onClick={() => setIsViewToggled(true)}
                                    className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${isViewToggled ? 'bg-white shadow-sm text-foreground' : 'text-slate-400 hover:text-slate-600'}`}>Xem</button>
                                <button type="button" onClick={() => setIsViewToggled(false)}
                                    className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md transition-all ${!isViewToggled ? 'bg-white shadow-sm text-foreground' : 'text-slate-400 hover:text-slate-600'}`}>Sửa</button>
                            </div>
                        ) : null}
                    </div>
                    <button type="button" onClick={onClose}
                        className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${!readOnly ? 'bg-black/10 hover:bg-black/20 text-[#1d1d1f]' : 'bg-black/5 hover:bg-black/10'}`}>
                        <X size={15} strokeWidth={!readOnly ? 2.5 : 2} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
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
                        <div>
                            <label className={LabelClass}>Ngành hàng *</label>
                            <MultiSelectCategoryField
                                value={form.categories || []}
                                onChange={newCats => {
                                    if (readOnly) return;
                                    setForm(f => {
                                        const next = { ...f, categories: newCats, category: newCats[0] || '' };
                                        const primaryCat = newCats[0];
                                        const norm = (t) => (t || '').replace(/\s+/g, ' ').trim();

                                        if (primaryCat && INDUSTRY_TEMPLATES[primaryCat]) {
                                            const currentH = norm(f.highlights);
                                            const isTemplate = currentH === '' || ALL_TEMPLATES.some(t => norm(t) === currentH);

                                            if (isTemplate) {
                                                const targetTemplate = INDUSTRY_TEMPLATES[primaryCat];
                                                if (norm(targetTemplate) !== currentH) {
                                                    next.highlights = targetTemplate;
                                                }
                                            }
                                        }
                                        return next;
                                    });
                                }}
                                readOnly={readOnly}
                            />
                        </div>
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
                        </div>
                    </div>

                    {/* Main Tech Specs Grid: Left Column (Core Specs) | Right Column (Highlights) */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-6 items-start">
                        {/* Left Column: Dynamic Core Specs */}
                        <div className="space-y-4 p-5 bg-black/[0.03] rounded-3xl border border-black/[0.05] h-full">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Specifications</h3>

                            {(CORE_SPECS_CONFIG[form.categories?.[0]] || CORE_SPECS_CONFIG['Máy Ảnh']).map(spec => (
                                <div key={spec.id}>
                                    <label className={LabelClass}>{spec.label}</label>
                                    {spec.isDualFocal ? (
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1">
                                                <MultiSelectField
                                                    value={form.focal_min}
                                                    onChange={v => set('focal_min', v)}
                                                    suggestions={['16mm', '24mm', '70mm', '100mm', '200mm']}
                                                    placeholder="Rộng nhất..."
                                                    readOnly={readOnly}
                                                />
                                            </div>
                                            <span className="text-slate-300 font-bold">—</span>
                                            <div className="flex-1">
                                                <MultiSelectField
                                                    value={form.focal_max}
                                                    onChange={v => set('focal_max', v)}
                                                    suggestions={['35mm', '70mm', '105mm', '200mm', '400mm', '600mm']}
                                                    placeholder="Xa nhất..."
                                                    readOnly={readOnly}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <MultiSelectField
                                            value={form[spec.id]}
                                            onChange={v => set(spec.id, v)}
                                            suggestions={spec.suggestions || []}
                                            placeholder={`Chọn hoặc nhập ${spec.label}...`}
                                            readOnly={readOnly}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Right Column: Highlights Area */}
                        <div className="flex flex-col h-full space-y-2">
                            <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                                <label className={LabelClass}>Thông số kỹ thuật tiêu chuẩn (Highlights)</label>
                            </div>
                            <textarea
                                value={form.highlights}
                                onChange={e => set('highlights', e.target.value)}
                                className={`${InputClass} resize-none font-medium leading-relaxed flex-1`}
                                style={{ minHeight: '280px' }}
                                placeholder="- Thông số 1...&#10;- Thông số 2...&#10;- Thông số 3..."
                                readOnly={readOnly}
                            />
                        </div>
                    </div>

                    {/* Quick Setting Guide as a Button/Popup Trigger */}
                    <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-sm border border-amber-100">
                                <Settings2 size={18} />
                            </div>
                            <div>
                                <p className="text-[12px] font-black text-amber-900 uppercase">Quick Setting Guide</p>
                                <p className="text-[11px] text-amber-700/60 line-clamp-1">{form.quickSettingGuide || 'Dữ liệu chưa được nhập...'}</p>
                            </div>
                        </div>
                        <button type="button" onClick={() => setShowQuickSettingsSubModal(true)} className="px-5 py-2 bg-amber-600 text-white rounded-xl text-[12px] font-black hover:bg-amber-700 shadow-sm whitespace-nowrap">
                            {readOnly ? 'Xem hướng dẫn' : 'Chỉnh sửa'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className={LabelClass}>Link ảnh sản phẩm</label>
                            <div className="flex gap-2">
                                <input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
                                    className={`${InputClass} flex-1`} placeholder="https://..." type="url" readOnly={readOnly} />
                                {form.imageUrl && (
                                    <div className="relative w-10 h-10 flex-shrink-0">
                                        <Image src={form.imageUrl} alt="preview" fill sizes="40px" className="rounded-lg object-cover border border-black/10" unoptimized onError={e => { e.target.style.display = 'none'; }} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className={LabelClass}>Link Spec sheet</label>
                            <div className="relative">
                                <input value={form.specUrl} onChange={e => set('specUrl', e.target.value)}
                                    className={`${InputClass} pr-10`} placeholder="https://..." type="url" readOnly={readOnly} />
                                {form.specUrl && <a href={form.specUrl} target="_blank" rel="noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"><ExternalLink size={14} /></a>}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className={LabelClass}>Giá (VND)</label>
                            <input value={isNaN(form.price) ? "" : form.price} onChange={e => set('price', e.target.value)}
                                className={InputClass} placeholder="18990000" type="number" readOnly={readOnly} />
                        </div>
                        <div>
                            <label className={LabelClass}>Năm ra mắt</label>
                            <input value={form.year} onChange={e => set('year', e.target.value)}
                                className={InputClass} placeholder="2024" type="number" readOnly={readOnly} />
                        </div>
                        <div>
                            <label className={LabelClass}>Trạng thái</label>
                            <button type="button" onClick={() => !readOnly && set('isAvailable', !form.isAvailable)} disabled={readOnly}
                                className={`w-full h-10 rounded-xl text-[12px] font-bold border ${form.isAvailable ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {form.isAvailable ? '✅ Đang bán' : '⏸ Ngừng bán'}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.06]">
                        {isEdit && !readOnly && (
                            deleteConfirm
                                ? <div className="flex items-center gap-2">
                                    <span className="text-[12px] text-rose-600 font-semibold">Xác nhận xóa?</span>
                                    <button type="button" onClick={() => onDelete(product.id)} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[12px] font-bold">Xóa</button>
                                    <button type="button" onClick={() => setDeleteConfirm(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[12px] font-bold">Hủy</button>
                                </div>
                                : <button type="button" onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-50 text-[12px] font-semibold"><Trash2 size={13} /> Xóa sản phẩm</button>
                        )}
                        <div />
                        <div className="flex items-center gap-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-black/5">{readOnly ? 'Đóng' : 'Hủy'}</button>
                            {!readOnly && (
                                <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-foreground text-background text-[13px] font-bold disabled:opacity-50">
                                    {saving && <Loader2 size={13} className="animate-spin" />}
                                    {isEdit ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {showQuickSettingsSubModal && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={() => setShowQuickSettingsSubModal(false)}>
                    <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden border-[3px] border-[#1d1d1f]" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex items-center justify-between bg-amber-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white text-amber-600 flex items-center justify-center border border-amber-100"><Settings2 size={20} /></div>
                                <h3 className="text-lg font-black text-amber-900 uppercase">Quick Settings</h3>
                            </div>
                            <button onClick={() => setShowQuickSettingsSubModal(false)} className="p-2 hover:bg-amber-100 rounded-full text-amber-800"><X size={20} /></button>
                        </div>
                        <div className="p-8">
                            <label className={LabelClass}>Nội dung hướng dẫn</label>
                            <textarea value={form.quickSettingGuide || ''} onChange={e => set('quickSettingGuide', e.target.value)} className={`${InputClass} resize-none min-h-[300px] bg-slate-50`} readOnly={readOnly} />
                        </div>
                        <div className="p-6 bg-slate-50 border-t flex justify-end">
                            <button onClick={() => setShowQuickSettingsSubModal(false)} className="bg-[#1d1d1f] text-white px-8 py-3 rounded-2xl font-black text-sm">Xong</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
