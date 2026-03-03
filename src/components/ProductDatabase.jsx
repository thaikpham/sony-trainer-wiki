import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, ShoppingCart, Info, Activity, Box, Aperture, Layers, Fingerprint, ExternalLink, Loader2, AlertCircle, Camera, Settings2, Trash2, X } from 'lucide-react';
import { getProducts, deleteProduct } from '../services/db';
import { trackFeatureUsage } from '@/services/analytics';
import FeatureStar from './FeatureStar';
import { CategoryBadge } from './admin/SingleSelectField';
import { useUser } from '@clerk/nextjs';
import { getRoleKeys } from '@/lib/roles';

export default function ProductDatabase({ onOpenSpecs, compareList = [], onToggleCompare }) {
    const { user } = useUser();
    const userRoleKeys = getRoleKeys(user?.primaryEmailAddress?.emailAddress);
    const isDev = userRoleKeys.includes('DEV');

    const [searchTerm, setSearchTerm] = useState('');
    const [mainCategory, setMainCategory] = useState('Tất cả');
    const [activeTags, setActiveTags] = useState([]);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // DEV Selection features
    const [selectedIds, setSelectedIds] = useState([]);

    // Quick Settings Modal
    const [quickSettingGuide, setQuickSettingGuide] = useState(null);

    const handleDelete = async (e, id, name) => {
        e.stopPropagation();
        if (!confirm(`Bạn có chắc chắn muốn xóa "${name}" không? Hành động này không thể hoàn tác.`)) return;

        try {
            await deleteProduct(id);
            setData(prev => prev.filter(p => p.id !== id));
            setSelectedIds(prev => prev.filter(currId => currId !== id));
        } catch (err) {
            console.error("Error deleting product:", err);
            alert('Có lỗi xảy ra khi xóa sản phẩm: ' + err.message);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn không?`)) return;

        try {
            for (const id of selectedIds) {
                await deleteProduct(id);
            }
            setData(prev => prev.filter(p => !selectedIds.includes(p.id)));
            setSelectedIds([]);
        } catch (err) {
            console.error("Error bulk deleting products:", err);
            alert('Có lỗi xảy ra khi xóa hàng loạt: ' + err.message);
        }
    };

    const ALL_TYPES = ['Body', 'Lens', 'Tai nghe', 'Loa', 'TV', 'Soundbar', 'Điện Thoại', 'Phụ kiện'];

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const result = await getProducts();
                if (isMounted) {
                    setData(result || []);
                }
            } catch (err) {
                console.error("Firebase fetch error:", err);
                if (isMounted) {
                    setError('Không thể tải dữ liệu sản phẩm từ hệ thống. Xin vui lòng thử lại sau.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, []);

    const availableTags = useMemo(() => {
        const tagSet = new Set();
        data.forEach(item => {
            if (mainCategory !== 'Tất cả' && item.type !== mainCategory) return;
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    }, [data, mainCategory]);

    const filteredData = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        return data.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchLower) ||
                (item.model && item.model.toLowerCase().includes(searchLower)) ||
                (item.highlights && item.highlights.toLowerCase().includes(searchLower)) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)));

            const matchesMainCat = mainCategory === 'Tất cả' ? true : item.type === mainCategory;
            const matchesType = activeTags.length === 0 ? true : activeTags.every(tag => item.tags && item.tags.includes(tag));
            return matchesSearch && matchesMainCat && matchesType;
        });
    }, [searchTerm, activeTags, mainCategory, data]);

    const handleMainCategoryChange = (cat) => {
        setMainCategory(cat);
        setActiveTags([]); // Reset sub-tags when changing top category
    };

    const toggleTag = (tag) => {
        setActiveTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // Helper function to render Sony Badges
    const renderBadges = (name) => {
        const badges = [];
        if (name.includes('GM') || name.includes('G Master')) {
            badges.push(<span key="gm" className="bg-[#ff4500] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide leading-none" title="G Master">GM</span>);
        } else if (/\bG\b/.test(name)) {
            badges.push(<span key="g" className="bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide leading-none" title="G Lens">G</span>);
        }
        // Zeiss badges removed per Sony Vietnam's current product line
        return badges;
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-slide-up relative z-10">

            {/* Header & Controls */}
            <div className="flex flex-col gap-6 bg-white/60 dark:bg-white/5 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] ring-1 ring-black/[0.04] dark:ring-white/[0.05] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">

                {/* Search Row & View Toggle */}
                <div className="flex gap-4 w-full">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] dark:text-slate-400" />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-white/5 border border-black/[0.08] dark:border-white/10 rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-[#86868b] dark:placeholder:text-slate-500 font-medium"
                            placeholder="Tìm kiếm sản phẩm, model hoặc tính năng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Main Category Row */}
                <div className="flex gap-2 items-center w-full overflow-x-auto pb-1 [scrollbar-width:'none']">
                    {['Tất cả', ...ALL_TYPES].map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleMainCategoryChange(cat)}
                            className={`px-5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${mainCategory === cat
                                ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.1)]'
                                : 'bg-white dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/[0.05] text-[#86868b] dark:text-slate-400 hover:bg-[#F5F5F7] dark:hover:bg-white/10 hover:text-[#1d1d1f] dark:hover:text-white'
                                }`}
                        >
                            {cat === 'Body' ? 'Máy ảnh' : cat === 'Lens' ? 'Ống kính' : cat === 'Tất cả' ? 'Tất cả' : cat}
                        </button>
                    ))}
                </div>

                {/* Dynamic Sub-Tags Row */}
                <div className="flex flex-wrap gap-2 items-center w-full min-h-[36px]">
                    <span className="text-[11px] font-bold text-[#86868b] dark:text-slate-500 uppercase tracking-wider mr-2">Bộ lọc phụ:</span>
                    {availableTags.length === 0 && <span className="text-[13px] text-[#86868b] dark:text-slate-500 italic">Không có tags cho phân khúc này</span>}
                    {availableTags.map(tag => {
                        const isActive = activeTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-4 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${isActive
                                    ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-[#1d1d1f] dark:ring-white'
                                    : 'bg-white dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/[0.05] text-[#86868b] dark:text-slate-400 hover:bg-[#F5F5F7] dark:hover:bg-white/10 hover:text-[#1d1d1f] dark:hover:text-white'
                                    }`}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Database View: Unified Modern Table */}
            <div className="bg-white dark:bg-[#1d1d1f] ring-1 ring-black/[0.04] dark:ring-white/[0.05] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar min-h-[500px]">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-[#F5F5F7]/80 dark:bg-white/5 border-b border-black/[0.04] dark:border-white/[0.05] text-[11px] font-bold text-[#86868b] dark:text-slate-400 uppercase tracking-wider">
                                {isDev && (
                                    <th className="px-6 py-5 w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedIds(filteredData.map(r => r.id));
                                                else setSelectedIds([]);
                                            }}
                                            className="w-4 h-4 rounded border-black/10 dark:border-white/10 text-teal-600 focus:ring-teal-500 bg-background transition-all"
                                        />
                                    </th>
                                )}
                                <th className="px-6 py-5 font-bold w-1/4">
                                    <div className="flex items-center gap-2"><Fingerprint size={14} className="text-[#86868b] dark:text-slate-500" /> SẢN PHẨM</div>
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#86868b] dark:text-slate-400 uppercase tracking-widest">Model</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#86868b] dark:text-slate-400 uppercase tracking-widest">Danh mục</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#86868b] dark:text-slate-400 uppercase tracking-widest">Tags</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#86868b] dark:text-slate-400 uppercase tracking-widest">Thông số & Tính năng</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#86868b] dark:text-slate-400 uppercase tracking-widest">Giá tham khảo</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#86868b] dark:text-slate-400 uppercase tracking-widest">Năm</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-[#86868b] dark:text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-6 py-5 font-bold text-center">HÀNH ĐỘNG</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.02] dark:divide-white/[0.05] text-[14px]">
                            {loading ? (
                                <tr>
                                    <td colSpan={isDev ? "10" : "9"} className="px-6 py-32 text-center text-slate-500">
                                        <Loader2 className="mx-auto mb-4 text-cyan-500 animate-spin" size={32} />
                                        <p className="font-medium animate-pulse">Đang tải dữ liệu thiết bị...</p>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={isDev ? "10" : "9"} className="px-6 py-20 text-center">
                                        <div className="bg-red-50 text-red-600 inline-flex flex-col items-center p-8 rounded-3xl border border-red-100 max-w-lg mx-auto">
                                            <AlertCircle size={40} className="mb-4 text-red-400" />
                                            <h3 className="text-lg font-bold mb-2">Lỗi Kết Nối Dữ Liệu</h3>
                                            <p className="text-sm font-medium mb-4">{error}</p>
                                            <p className="text-xs text-red-500/80">Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ quản trị viên.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((item, idx) => {
                                    const isSelected = compareList.some(c => c.productName === item.name);
                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={() => {
                                                onOpenSpecs(item);
                                                trackFeatureUsage(`prod_${item.name.replace(/\s+/g, '_')}`, item.name);
                                            }}
                                            className={`group cursor-pointer transition-colors duration-300 hover:bg-[#F5F5F7]/80 dark:hover:bg-white/5 ${selectedIds.includes(item.id) ? 'bg-orange-500/5' : ''}`}
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            {isDev && (
                                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedIds([...selectedIds, item.id]);
                                                            else setSelectedIds(selectedIds.filter(id => id !== item.id));
                                                        }}
                                                        className="w-4 h-4 rounded border-black/10 dark:border-white/10 text-orange-600 focus:ring-orange-500 bg-background transition-all"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-6 py-4 font-semibold text-[#1d1d1f] dark:text-white flex items-center gap-3">
                                                <div className="bg-[#F5F5F7] dark:bg-white/10 p-2 rounded-xl text-[#86868b] dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-white/20 group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:group-hover:shadow-[0_2px_8px_rgba(255,255,255,0.08)] group-hover:text-[#1d1d1f] dark:group-hover:text-white transition-all w-8 h-8 flex items-center justify-center flex-shrink-0">
                                                    <Aperture size={16} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="truncate max-w-[200px]" title={item.name}>{item.name}</span>
                                                    {renderBadges(item.name)}
                                                    <FeatureStar featureId={`prod_${item.name.replace(/\s+/g, '_')}`} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#424245] dark:text-slate-300 font-mono text-[12px] max-w-[150px] truncate" title={item.model}>
                                                {item.model || '—'}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <CategoryBadge category={item.category || item.type} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                    {(item.tags || []).slice(0, 2).map(tag => (
                                                        <span key={tag} className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-full text-[10px] text-slate-500 font-bold whitespace-nowrap uppercase tracking-tighter">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {(item.tags || []).length > 2 && (
                                                        <span className="text-[10px] text-slate-400">+{item.tags.length - 2}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-[12px] max-w-[200px] truncate group-hover:text-[#1d1d1f] dark:group-hover:text-white transition-colors" title={item.highlights}>
                                                {item.highlights || '—'}
                                            </td>
                                            <td className="px-6 py-4 font-black text-blue-600 dark:text-blue-400 tabular-nums">
                                                {item.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(item.price) : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 tabular-nums font-medium">
                                                {item.year || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${item.status !== 'Ngừng bán'
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-slate-100 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    {item.status !== 'Ngừng bán' ? '● Đang bán' : '○ Ngừng bán'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center gap-2 justify-end">
                                                    {item.quickSettingGuide && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setQuickSettingGuide({ name: item.name, guide: item.quickSettingGuide });
                                                                trackFeatureUsage(`guide_${item.name.replace(/\s+/g, '_')}`, item.name);
                                                            }}
                                                            title="Quick Setting Guide"
                                                            className="flex items-center justify-center p-1.5 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white dark:bg-orange-900/40 dark:text-orange-400 dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-sm group/guide"
                                                        >
                                                            <Settings2 size={16} className="group-hover/guide:rotate-90 transition-transform duration-300" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const type = item.type.toLowerCase().includes('body') || item.type.toLowerCase().includes('camera') ? 'camera' : 'lens';
                                                            if (onToggleCompare) onToggleCompare(item.name, type);
                                                            trackFeatureUsage(`prod_${item.name.replace(/\s+/g, '_')}`, item.name);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${isSelected ? 'bg-green-500 text-white hover:bg-red-500' : 'bg-[#F5F5F7] dark:bg-white/10 text-[#1d1d1f] dark:text-white hover:bg-[#1d1d1f] dark:hover:bg-white hover:text-white dark:hover:text-[#1d1d1f]'}`}
                                                    >
                                                        {isSelected ? 'Bỏ chọn' : 'So sánh'}
                                                    </button>
                                                    {item.url && (
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center justify-center p-1.5 rounded-full text-[#86868b] dark:text-slate-500 hover:text-[#1d1d1f] dark:hover:text-white hover:bg-[#F5F5F7] dark:hover:bg-white/10 transition-all group/link"
                                                            title="Xem trên Sony.com.vn"
                                                        >
                                                            <ExternalLink size={16} className="group-hover/link:scale-110 transition-transform" />
                                                        </a>
                                                    )}
                                                    {isDev && (
                                                        <button
                                                            onClick={(e) => handleDelete(e, item.id, item.name)}
                                                            className="p-1.5 ml-1 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all duration-300 group/btn shadow-sm"
                                                            title="Xóa sản phẩm"
                                                        >
                                                            <Trash2 size={16} className="transition-transform group-hover/btn:scale-110" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={isDev ? "10" : "9"} className="px-6 py-20 text-center text-slate-500 font-medium">
                                        <Filter className="mx-auto mb-3 text-slate-300" size={32} />
                                        Không tìm thấy dữ liệu khớp yêu cầu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DEV Bulk Action Bar */}
            {selectedIds.length > 0 && isDev && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] animate-slide-up">
                    <div className="bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8 ring-1 ring-white/10 dark:ring-black/10 backdrop-blur-xl">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Xóa sản phẩm</span>
                            <span className="text-[15px] font-black">{selectedIds.length} đã chọn</span>
                        </div>
                        <div className="h-8 w-px bg-white/10 dark:bg-black/10" />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-4 py-2 text-[12px] font-black uppercase tracking-widest hover:opacity-60 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="px-6 py-2.5 bg-red-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Trash2 size={14} /> Xóa {selectedIds.length} mục
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Setting Guide Modal */}
            {quickSettingGuide && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQuickSettingGuide(null)} />
                    <div className="relative w-full max-w-2xl bg-background rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="px-8 py-6 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between bg-orange-500/5 dark:bg-orange-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                    <Settings2 size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-foreground tracking-tight">Quick Setting Guide</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{quickSettingGuide.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setQuickSettingGuide(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="px-8 py-8 max-h-[70vh] overflow-y-auto scrollbar-thin">
                            <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed">
                                {quickSettingGuide.guide.split('\n').map((line, i) => (
                                    <p key={i} className="mb-2">{line}</p>
                                ))}
                            </div>
                        </div>
                        <div className="px-8 py-6 border-t border-black/[0.05] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-end">
                            <button onClick={() => setQuickSettingGuide(null)} className="bg-foreground text-background px-6 py-2.5 rounded-full text-[13px] font-black hover:opacity-90 transition-all">
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
