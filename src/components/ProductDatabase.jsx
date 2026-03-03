import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, ShoppingCart, Info, Activity, Box, Aperture, Layers, Fingerprint, ExternalLink, Loader2, AlertCircle, Camera } from 'lucide-react';
import { getProducts } from '../services/db';
import { trackFeatureUsage } from '@/services/analytics';
import FeatureStar from './FeatureStar';
import { CategoryBadge } from './admin/SingleSelectField';

export default function ProductDatabase({ onOpenSpecs, compareList = [], onToggleCompare }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [mainCategory, setMainCategory] = useState('Body');
    const [activeTags, setActiveTags] = useState([]);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                                    <td colSpan="9" className="px-6 py-32 text-center text-slate-500">
                                        <Loader2 className="mx-auto mb-4 text-cyan-500 animate-spin" size={32} />
                                        <p className="font-medium animate-pulse">Đang tải dữ liệu thiết bị...</p>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-20 text-center">
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
                                            className="group cursor-pointer transition-colors duration-300 hover:bg-[#F5F5F7]/80 dark:hover:bg-white/5"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
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
                                                <div className="flex gap-2 justify-center">
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
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="9" className="px-6 py-20 text-center text-slate-500 font-medium">
                                        <Filter className="mx-auto mb-3 text-slate-300" size={32} />
                                        Không tìm thấy dữ liệu khớp yêu cầu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
