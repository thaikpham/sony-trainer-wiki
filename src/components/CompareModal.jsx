import { X, Loader2, AlertCircle, Scale, DollarSign } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { trackClientAction } from '@/lib/trackActionClient';
import { useEscapeToClose } from '@/hooks/useEscapeToClose';

export default function CompareModal({ isOpen, onClose, compareList }) {
    const [loading, setLoading] = useState(false);
    const [compareData, setCompareData] = useState([]);
    const [error, setError] = useState('');

    useEscapeToClose(isOpen, onClose);

    useEffect(() => {
        if (isOpen && compareList?.length > 0) {
            const fetchSpecs = async () => {
                setLoading(true);
                setError('');
                try {
                    // Fetch specs dynamically for all selected items in parallel
                    const promises = compareList.map(item =>
                        fetch('/api/specs', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(item),
                        }).then(res => res.json())
                            .then(data => ({
                                originalRequest: item,
                                data: data.error ? null : data,
                                error: data.error
                            }))
                    );

                    const results = await Promise.all(promises);
                    setCompareData(results);

                    // Track milestone action
                    trackClientAction('compare_tool_uses');

                } catch (err) {
                    setError('Không thể tải dữ liệu so sánh.');
                } finally {
                    setLoading(false);
                }
            };

            fetchSpecs();
        }
    }, [isOpen, compareList]);

    // React Hooks Must Be Called Unconditionally Before Any Returns

    // Render a cell value gracefully
    const renderValue = (val) => {
        if (val === undefined || val === null) return <span className="text-slate-300">-</span>;
        if (typeof val === 'boolean') return val ? 'Có' : 'Không';
        if (Array.isArray(val)) return val.join(', ');
        return val;
    };

    // Extract a master list of all distinct spec keys across all products
    let allKeys = new Set();
    compareData.forEach(result => {
        if (result.data && typeof result.data === 'object') {
            Object.keys(result.data).forEach(key => {
                if (key !== 'productName' && key !== 'productType' && key !== 'estimatedPrice') {
                    allKeys.add(key);
                }
            });
        }
    });
    const specKeys = Array.from(allKeys);

    // Smart Warning Logic (Lệch Ngàm)
    const hasWarning = useMemo(() => {
        if (compareData.length === 0) return false;

        let hasFFCamera = false;
        let hasAPSCLens = false;

        compareData.forEach(result => {
            if (result.data && !result.error) {
                const { productName, productType } = result.originalRequest;
                const sensor = String(result.data.sensor || '').toLowerCase();
                const mount = String(result.data.mount || '').toLowerCase();
                const name = String(productName).toLowerCase();

                if (productType === 'camera' && sensor.includes('full-frame')) {
                    hasFFCamera = true;
                }

                if (productType === 'lens') {
                    // Check if it's an APS-C lens by Mount spec or ' E ' in name (not ' FE ')
                    if (mount.includes('aps-c') || name.match(/\s+e\s+/)) {
                        hasAPSCLens = true;
                    }
                }
            }
        });

        return hasFFCamera && hasAPSCLens;
    }, [compareData]);

    // Rig Builder Calculations
    const rigSummary = useMemo(() => {
        let totalWeightGram = 0;
        let totalPriceVND = 0;
        let validWeightItems = 0;
        let validPriceItems = 0;

        compareData.forEach(result => {
            if (result.data && !result.error) {
                // Calculate weight
                const weightStr = String(result.data.weight || '');
                if (weightStr) {
                    // Extract numbers (handles '723g', '1.2kg', '723 g')
                    const weightMatch = weightStr.match(/([\d.]+)\s*(g|kg)?/i);
                    if (weightMatch) {
                        let val = parseFloat(weightMatch[1]);
                        let unit = weightMatch[2]?.toLowerCase();
                        if (unit === 'kg') val *= 1000;
                        totalWeightGram += val;
                        validWeightItems++;
                    }
                }

                // Calculate price
                const price = Number(result.data.estimatedPrice) || 0;
                if (price > 0) {
                    totalPriceVND += price;
                    validPriceItems++;
                }
            }
        });

        return {
            totalWeight: totalWeightGram,
            totalPrice: totalPriceVND,
            hasPartialWeight: validWeightItems > 0 && validWeightItems < compareData.length,
            hasPartialPrice: validPriceItems > 0 && validPriceItems < compareData.length
        };
    }, [compareData]);

    // Format helpers
    const formatCurrency = (amount) => {
        if (amount === 0) return 'Đang cập nhật';
        return new Intl.NumberFormat('en-US').format(amount) + ' ₫';
    };

    const formatWeight = (grams) => {
        if (grams === 0) return '--';
        if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
        return `${Math.round(grams)} g`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/[0.02] backdrop-blur-[20px] backdrop-saturate-[180%] transition-opacity animate-in fade-in duration-200">
            <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50 backdrop-blur-xl sticky top-0 z-10 w-full">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">SO SÁNH CẤU HÌNH</span>
                            {compareList.length > 0 && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md ring-1 ring-emerald-500/20">{compareList.length} thiết bị</span>}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Sắp xếp thiết bị để tối ưu hóa Dream Rig của bạn.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors bg-white border border-slate-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-auto bg-slate-50 p-6 pb-24 overscroll-contain relative">
                    {hasWarning && !loading && !error && (
                        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 animate-slide-up">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-sm mb-1">Cảnh báo đồng bộ ngàm (One Mount)</h4>
                                <p className="text-xs leading-relaxed opacity-90">
                                    Bạn đang kết hợp ống kính APS-C (E-Mount) với thân máy Full-Frame (FE-Mount).
                                    Hệ thống sẽ tự động chuyển sang chế độ cắt xén Super 35mm, làm giảm độ phân giải của cảm biến thay vì tận dụng tối đa Full-Frame.
                                </p>
                            </div>
                        </div>
                    )}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 size={40} className="animate-spin text-teal-500 mb-6" />
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest animate-pulse">Đang phân tích kỹ thuật điện tử...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-500 font-medium">Lỗi: {error}</div>
                    ) : (
                        <div className="w-full rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden ring-1 ring-black/5">
                            {/* Horizontal Scrolling Wrapper for smaller screens */}
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-sm text-left align-top min-w-[600px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="p-4 font-bold text-slate-400 uppercase tracking-widest text-[10px] w-48 sticky left-0 bg-slate-50 z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                                THÔNG SỐ
                                            </th>
                                            {compareData.map((result, idx) => (
                                                <th key={idx} className="p-4 border-r border-slate-100 last:border-r-0 min-w-[200px] w-[250px] align-top bg-white relative">
                                                    <div className="text-[10px] font-bold text-teal-600 mb-1 tracking-wider uppercase">{result.originalRequest.productType}</div>
                                                    <div className="text-base font-extrabold text-slate-800 leading-tight">
                                                        {result.originalRequest.productName}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {specKeys.map(key => (
                                            <tr key={key} className="hover:bg-teal-50/30 transition-colors group">
                                                <td className="p-4 font-semibold text-slate-600 capitalize w-48 sticky left-0 group-hover:bg-teal-50/50 bg-white z-10 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-top transition-colors">
                                                    {/* Format Camel Case keys to Title Case roughly */}
                                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                </td>

                                                {compareData.map((result, idx) => (
                                                    <td key={`${key}-${idx}`} className="p-4 border-r border-slate-100 last:border-r-0 align-top max-w-[250px] break-words group-hover:bg-transparent transition-colors">
                                                        {result.error ? (
                                                            <span className="text-xs text-red-400 italic">Lỗi kết nối</span>
                                                        ) : (
                                                            <div className="text-slate-700 leading-relaxed font-medium">
                                                                {renderValue(result.data?.[key])}
                                                            </div>
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        {specKeys.length === 0 && (
                                            <tr>
                                                <td colSpan={compareList.length + 1} className="p-8 text-center text-slate-500">
                                                    Không tìm thấy dữ liệu kĩ thuật của các sản phẩm.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rig Builder Footer */}
                {!loading && !error && compareData.length > 0 && (
                    <div className="border-t border-slate-100 bg-white p-4 sm:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] relative z-20">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto w-full">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-teal-50 text-teal-600">
                                    <Scale size={24} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tổng Trọng Lượng Setup</div>
                                    <div className="text-2xl font-black text-slate-800 flex items-baseline gap-2">
                                        {formatWeight(rigSummary.totalWeight)}
                                        {rigSummary.hasPartialWeight && <span className="text-xs font-medium text-amber-500">(Có SP chưa rõ)</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="hidden sm:block w-px h-12 bg-slate-200"></div>

                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                                    <DollarSign size={24} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dự Toán Đầu Tư (Tham Khảo)</div>
                                    <div className="text-2xl font-black text-slate-800 flex items-baseline gap-2">
                                        {formatCurrency(rigSummary.totalPrice)}
                                        {rigSummary.hasPartialPrice && <span className="text-xs font-medium text-amber-500">(Có SP chưa rõ)</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
