import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Info, ExternalLink, Download, Aperture, Camera, Activity, Fingerprint, Settings2, Edit3 } from 'lucide-react';
import { CategoryBadge } from './admin/SingleSelectField';
import { toPng } from 'html-to-image';
import { useRoleAccess } from '@/components/RoleProvider';

export default function SpecModal({ isOpen, onClose, product, productName: propName, productType: propType, onEdit }) {
    const [specs, setSpecs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const modalRef = useRef(null);

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const { isDataMaster } = useRoleAccess();

    const productName = product?.name || propName;
    const productType = (product?.type?.toLowerCase()?.includes('body') || product?.type?.toLowerCase()?.includes('camera')) ? 'camera' : (product?.type?.toLowerCase() === 'lens' ? 'lens' : (propType || 'camera'));

    const handleExport = async () => {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        // Wait for styles
        await new Promise(resolve => setTimeout(resolve, 150));

        try {
            const dataUrl = await toPng(modalElement, {
                backgroundColor: '#ffffff',
                cacheBust: true,
                pixelRatio: 2,
                filter: (node) => {
                    return node.tagName !== 'BUTTON';
                },
                style: {
                    borderRadius: '0'
                }
            });

            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `Spec-${productName || 'Alpha'}-${new Date().getTime()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Có lỗi xảy ra khi xuất thông số.');
        }
    };

    useEffect(() => {
        const fetchAISpecs = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/specs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productName, productType }),
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                setSpecs(data.specs);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            if (productName && !product) {
                fetchAISpecs();
            } else if (product) {
                setSpecs(null); // Use product data directly
            }

            fetch('/api/track_action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'wiki_reads' })
            }).then(r => r.json()).then(data => {
                const b1 = data.unlockedBadges || [];

                // Track specific product type view
                fetch('/api/track_action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: productType === 'lens' ? 'lens_views' : 'camera_views' })
                }).then(r2 => r2.json()).then(data2 => {
                    const b2 = data2.unlockedBadges || [];
                    const allBadges = [...b1, ...b2];
                    if (allBadges.length > 0) {
                        window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: { unlockedBadges: allBadges } }));
                    }
                }).catch(e => console.error("Failed to track specific product view action", e));

            }).catch(e => console.error("Failed to track wiki read action", e));
        }
    }, [isOpen, productName, productType, product]);

    if (!isOpen) return null;

    const isFromFirebase = Boolean(product);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/[0.02] backdrop-blur-[20px] backdrop-saturate-[180%] animate-in fade-in duration-200" onClick={onClose} />

            <div
                ref={modalRef}
                className="relative w-full max-w-2xl max-h-full flex flex-col bg-background rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-black/[0.05] flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-black text-foreground tracking-tight">
                                {product?.name || productName}
                            </h2>
                            {isFromFirebase && (
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Hệ thống
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-slate-500 font-medium">{product?.model || productType}</p>
                            {product?.category && <CategoryBadge category={product.category} />}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isDataMaster && isFromFirebase && (
                            <button
                                onClick={() => {
                                    if (onEdit) onEdit(product);
                                    onClose();
                                }}
                                className="p-2 hover:bg-blue-50 rounded-full transition-colors text-blue-500"
                                title="Sửa thông tin"
                            >
                                <Edit3 size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-400">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-8 py-8 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            <p className="font-medium">Đang truy xuất thông số kĩ thuật...</p>
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
                            <p className="font-bold mb-1">Không thể tải thông số</p>
                            <p className="text-sm opacity-80">{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                {product?.price && (
                                    <div className="bg-black/5 rounded-2xl p-5 border border-black/[0.03]">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Giá tham khảo
                                        </p>
                                        <p className="text-xl font-black text-blue-600 tracking-tight">
                                            {new Intl.NumberFormat('en-US').format(product.price)} ₫
                                        </p>
                                    </div>
                                )}
                                {product?.year && (
                                    <div className="bg-black/5 rounded-2xl p-5 border border-black/[0.03]">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Năm ra mắt</p>
                                        <p className="text-xl font-black text-foreground tracking-tight">{product.year}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <div className="h-px bg-black/10 flex-1" />
                                    THÔNG SỐ KỸ THUẬT
                                    <div className="h-px bg-black/10 flex-1" />
                                </h3>

                                <div className="space-y-6">
                                    {(() => {
                                        const GROUPS = {
                                            "Vận hành máy ảnh": { title: "Vận hành máy ảnh", items: [] },
                                            "Chất lượng hình ảnh": { title: "Chất lượng hình ảnh", items: [] },
                                            "Lấy Nét": { title: "Lấy Nét", items: [] },
                                            "Quay Phim & Âm thanh": { title: "Quay Phim & Âm thanh", items: [] }
                                        };

                                        const getCategory = (text) => {
                                            const tLow = text.toLowerCase();
                                            if (tLow.includes('cảm biến') || tLow.includes('megapixel') || tLow.includes('bionz') || tLow.includes('iso') || tLow.includes('raw') || tLow.includes('chụp')) return "Chất lượng hình ảnh";
                                            if (tLow.includes('lấy nét') || tLow.includes('af') || tLow.includes('nhận diện') || tLow.includes('tracking') || tLow.includes('điểm af')) return "Lấy Nét";
                                            if (tLow.includes('quay') || tLow.includes('video') || tLow.includes('4k') || tLow.includes('10-bit') || tLow.includes('s-log') || tLow.includes('âm thanh') || tLow.includes('mic')) return "Quay Phim & Âm thanh";
                                            return "Vận hành máy ảnh";
                                        };

                                        const rawData = product?.highlights || specs || "Dữ liệu đang được cập nhật...";
                                        const rawLines = rawData.split('\n').map(l => l.trim()).filter(Boolean);

                                        rawLines.forEach(line => {
                                            const isBullet = line.startsWith('-');
                                            const content = isBullet ? line.substring(1).trim() : line;
                                            const matchedGroup = getCategory(content);

                                            if (content.includes(':')) {
                                                const [label, value] = content.split(':').map(s => s.trim());
                                                GROUPS[matchedGroup].items.push({ label, value });
                                            } else {
                                                GROUPS[matchedGroup].items.push({ label: content, value: null });
                                            }
                                        });

                                        const activeGroups = Object.values(GROUPS).filter(g => g.items.length > 0);
                                        if (activeGroups.length === 0) return <p className="text-slate-500 italic text-center">Chưa có thông số chi tiết.</p>;

                                        return activeGroups.map((group, gIdx) => {
                                            let GroupIcon = Aperture;
                                            if (group.title === "Chất lượng hình ảnh") GroupIcon = Camera;
                                            else if (group.title === "Vận hành máy ảnh") GroupIcon = Activity;
                                            else if (group.title === "Lấy Nét") GroupIcon = Fingerprint;
                                            else if (group.title === "Quay Phim & Âm thanh") GroupIcon = Settings2;

                                            return (
                                                <div key={gIdx} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                                                    <div className="flex items-center gap-3 mb-5 border-b border-black/[0.05] pb-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                                                            <GroupIcon size={20} strokeWidth={2.5} />
                                                        </div>
                                                        <h4 className="text-[14px] font-black text-slate-800 uppercase tracking-widest">
                                                            {group.title}
                                                        </h4>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {group.items.map((item, idx) => (
                                                            <div key={idx} className={`flex flex-col sm:flex-row sm:items-baseline ${item.value ? 'justify-between py-2 border-b border-black/[0.03] last:border-0' : 'py-1.5'}`}>
                                                                {item.value ? (
                                                                    <>
                                                                        <span className="text-[13px] font-bold text-slate-500 w-full sm:w-1/2 pr-4 mb-1 sm:mb-0">{item.label}</span>
                                                                        <span className="text-[14px] font-bold text-slate-900 sm:text-right w-full sm:w-1/2">{item.value}</span>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex items-start gap-3 group/item">
                                                                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 group-hover/item:bg-blue-500 transition-colors" />
                                                                        <p className="text-[14px] font-medium text-slate-700 leading-relaxed">{item.label}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}

                                    {product?.quickSettingGuide && (
                                        <div className="mt-8">
                                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                <div className="h-px bg-black/10 flex-1" />
                                                HƯỚNG DẪN CÀI ĐẶT NHANH
                                                <div className="h-px bg-black/10 flex-1" />
                                            </h3>
                                            <div className="bg-amber-50 rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-sm">
                                                <div className="flex items-center gap-3 mb-5 border-b border-amber-200/50 pb-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-white text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                                                        <Settings2 size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <h4 className="text-[14px] font-black text-amber-900 uppercase tracking-widest">
                                                        Quick Settings
                                                    </h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {product.quickSettingGuide.split('\n').filter(Boolean).map((line, idx) => (
                                                        <div key={idx} className="flex gap-3">
                                                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                                            <p className="text-[14px] font-medium text-amber-900 leading-relaxed">
                                                                {line.startsWith('-') ? line.substring(1).trim() : line}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-8 py-6 border-t border-black/[0.05] bg-black/[0.02] flex items-center justify-between gap-4">
                    <p className="text-[12px] text-slate-400 font-medium italic hidden sm:block">© Sony Training Wiki 2026</p>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleExport}
                            className="flex-1 sm:flex-none bg-teal-500 text-white px-6 py-2.5 rounded-full text-[13px] font-black hover:bg-teal-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Download size={14} /> Xuất ảnh
                        </button>
                        {product?.specUrl ? (
                            <a
                                href={product.specUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 sm:flex-none bg-foreground text-background px-6 py-2.5 rounded-full text-[13px] font-black hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2 group"
                            >
                                Website <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </a>
                        ) : (
                            <button onClick={onClose} className="flex-1 sm:flex-none bg-foreground text-background px-6 py-2.5 rounded-full text-[13px] font-black hover:opacity-90 transition-all">
                                Đóng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
