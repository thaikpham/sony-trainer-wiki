import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Info, ExternalLink, Download } from 'lucide-react';
import { CategoryBadge } from './admin/SingleSelectField';
import { toPng } from 'html-to-image';

export default function SpecModal({ isOpen, onClose, product, productName: propName, productType: propType }) {
    const [specs, setSpecs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const modalRef = useRef(null);

    const productName = product?.name || propName;
    const productType = (product?.type?.toLowerCase()?.includes('body') || product?.type?.toLowerCase()?.includes('camera')) ? 'camera' : (product?.type?.toLowerCase() === 'lens' ? 'lens' : (propType || 'camera'));

    const handleExport = async () => {
        const modalElement = modalRef.current;
        if (!modalElement) return;
        const isDark = document.documentElement.classList.contains('dark');

        // Force light mode
        if (isDark) document.documentElement.classList.remove('dark');

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
        } finally {
            if (isDark) document.documentElement.classList.add('dark');
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
        }
    }, [isOpen, productName, productType, product]);

    if (!isOpen) return null;

    const isFromFirebase = Boolean(product);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div
                ref={modalRef}
                className="relative w-full max-w-2xl bg-background rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300"
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-black text-foreground tracking-tight">
                                {product?.name || productName}
                            </h2>
                            {isFromFirebase && (
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    Hệ thống
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-slate-500 dark:text-slate-400 font-medium">{product?.model || productType}</p>
                            {product?.category && <CategoryBadge category={product.category} />}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 py-8 max-h-[70vh] overflow-y-auto scrollbar-thin">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            <p className="font-medium">Đang truy xuất thông số kĩ thuật...</p>
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/20 text-center">
                            <p className="font-bold mb-1">Không thể tải thông số</p>
                            <p className="text-sm opacity-80">{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Key Identity Card */}
                            <div className="grid grid-cols-2 gap-4">
                                {product?.price && (
                                    <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 border border-black/[0.03] dark:border-white/[0.05]">
                                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Giá tham khảo
                                        </p>
                                        <p className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(product.price)}
                                        </p>
                                    </div>
                                )}
                                {product?.year && (
                                    <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 border border-black/[0.03] dark:border-white/[0.05]">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Năm ra mắt</p>
                                        <p className="text-xl font-black text-foreground tracking-tight">{product.year}</p>
                                    </div>
                                )}
                            </div>

                            {/* Technical Specs Section */}
                            <div>
                                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
                                    THÔNG SỐ KỸ THUẬT
                                    <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
                                </h3>

                                <div className="space-y-4">
                                    {(product?.highlights || specs || "Dữ liệu đang được cập nhật...")
                                        .split('\n')
                                        .filter(line => line.trim())
                                        .map((line, idx) => {
                                            const isBullet = line.trim().startsWith('-');
                                            const content = isBullet ? line.trim().substring(1).trim() : line.trim();
                                            const [label, value] = content.split(':').map(s => s.trim());

                                            return (
                                                <div key={idx} className={`flex ${value ? 'justify-between py-3 border-b border-black/[0.03] dark:border-white/[0.04]' : 'py-1'}`}>
                                                    {value ? (
                                                        <>
                                                            <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400">{label}</span>
                                                            <span className="text-[13px] font-bold text-foreground text-right ml-4">{value}</span>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-start gap-3 group">
                                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-foreground/20 shrink-0 group-hover:bg-blue-500 transition-colors" />
                                                            <p className="text-[14px] font-medium text-foreground leading-relaxed">{content}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-black/[0.05] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between gap-4">
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
