import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, ShoppingCart, Info, Activity, Box, Aperture, Layers, Fingerprint, ExternalLink, Loader2, AlertCircle, Camera, Settings2, Trash2, X, Edit3 } from 'lucide-react';
import { getProducts, deleteProduct, addProduct, updateProduct, getGlobalTags, updateGlobalTags } from '../services/db';
import { trackFeatureUsage } from '@/services/analytics';
import FeatureStar from './FeatureStar';
import { CategoryBadge } from './admin/SingleSelectField';
import ProductFormModal from './admin/ProductFormModal';
import { useRoleAccess } from '@/components/RoleProvider';

export default function ProductDatabase({ onOpenSpecs, compareList = [], onToggleCompare, editProduct = null, onClearEdit = () => { } }) {
    const { isDataMaster, isDev } = useRoleAccess();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategories, setActiveCategories] = useState([]); // multi-select, empty = Tất cả
    const [activeTags, setActiveTags] = useState([]);
    const searchTimerRef = useState(null);

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        if (searchTimerRef[0]) clearTimeout(searchTimerRef[0]);
        searchTimerRef[0] = setTimeout(() => {
            if (val.trim().length >= 2) {
                fetch('/api/track_action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'search_queries' })
                }).then(r => r.json()).then(data => {
                    if (data.unlockedBadges && data.unlockedBadges.length > 0) {
                        window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: { unlockedBadges: data.unlockedBadges } }));
                    }
                }).catch(() => { });
            }
        }, 1500);
    };

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // DEV Selection features
    const [selectedIds, setSelectedIds] = useState([]);

    // Quick Settings Modal
    const [quickSettingGuide, setQuickSettingGuide] = useState(null);

    // Admin management state
    const [modalProduct, setModalProduct] = useState(null);

    // Sync external edit request
    useEffect(() => {
        if (editProduct) {
            setModalProduct(editProduct);
            onClearEdit();
        }
    }, [editProduct, onClearEdit]);

    const [saving, setSaving] = useState(false);
    const [globalTags, setGlobalTags] = useState([]);
    const [toast, setToast] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

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

    // ── Bulk Edit State ──────────────────────────────────────────
    const [bulkEditOpen, setBulkEditOpen] = useState(false);
    // Categories now support add + remove (multi)
    const [bulkCatsToAdd, setBulkCatsToAdd] = useState([]);
    const [bulkCatsToRemove, setBulkCatsToRemove] = useState([]);
    const [bulkTagsToAdd, setBulkTagsToAdd] = useState([]);
    const [bulkTagsToRemove, setBulkTagsToRemove] = useState([]);
    const [bulkTagInput, setBulkTagInput] = useState('');
    const [bulkSaving, setBulkSaving] = useState(false);

    const toggleBulkCatAdd = (cat) => {
        setBulkCatsToRemove(prev => prev.filter(c => c !== cat));
        setBulkCatsToAdd(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    };
    const toggleBulkCatRemove = (cat) => {
        setBulkCatsToAdd(prev => prev.filter(c => c !== cat));
        setBulkCatsToRemove(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
    };

    const toggleBulkTagAdd = (tag) => {
        setBulkTagsToRemove(prev => prev.filter(t => t !== tag));
        setBulkTagsToAdd(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    const toggleBulkTagRemove = (tag) => {
        setBulkTagsToAdd(prev => prev.filter(t => t !== tag));
        setBulkTagsToRemove(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    const addCustomBulkTag = () => {
        const tag = bulkTagInput.trim();
        if (tag && !bulkTagsToAdd.includes(tag)) {
            setBulkTagsToAdd(prev => [...prev, tag]);
        }
        setBulkTagInput('');
    };

    const handleBulkEdit = async () => {
        const hasChanges = bulkCatsToAdd.length > 0 || bulkCatsToRemove.length > 0 || bulkTagsToAdd.length > 0 || bulkTagsToRemove.length > 0;
        if (!hasChanges) return;
        setBulkSaving(true);
        try {
            await Promise.all(selectedIds.map(id => {
                const product = data.find(p => p.id === id);
                if (!product) return Promise.resolve();
                // Build new categories array (supports both legacy `category` string + new `categories` array)
                const currentCats = Array.isArray(product.categories) && product.categories.length > 0
                    ? product.categories
                    : (product.category ? [product.category] : []);
                const newCats = [
                    ...currentCats.filter(c => !bulkCatsToRemove.includes(c)),
                    ...bulkCatsToAdd.filter(c => !currentCats.includes(c))
                ];
                const currentTags = Array.isArray(product.tags) ? product.tags : [];
                const newTags = [
                    ...currentTags.filter(t => !bulkTagsToRemove.includes(t)),
                    ...bulkTagsToAdd.filter(t => !currentTags.includes(t))
                ];
                return updateProduct(id, { categories: newCats, tags: newTags });
            }));
            // Reflect changes in local state immediately
            setData(prev => prev.map(p => {
                if (!selectedIds.includes(p.id)) return p;
                const currentCats = Array.isArray(p.categories) && p.categories.length > 0
                    ? p.categories : (p.category ? [p.category] : []);
                const newCats = [
                    ...currentCats.filter(c => !bulkCatsToRemove.includes(c)),
                    ...bulkCatsToAdd.filter(c => !currentCats.includes(c))
                ];
                const currentTags = Array.isArray(p.tags) ? p.tags : [];
                const newTags = [
                    ...currentTags.filter(t => !bulkTagsToRemove.includes(t)),
                    ...bulkTagsToAdd.filter(t => !currentTags.includes(t))
                ];
                return { ...p, categories: newCats, tags: newTags };
            }));
            showToast(`✅ Đã cập nhật ${selectedIds.length} sản phẩm`);
            setBulkEditOpen(false);
            setBulkCatsToAdd([]); setBulkCatsToRemove([]);
            setBulkTagsToAdd([]); setBulkTagsToRemove([]);
            setSelectedIds([]);
        } catch (err) {
            console.error('Bulk edit error:', err);
            alert('Lỗi khi cập nhật hàng loạt: ' + err.message);
        } finally {
            setBulkSaving(false);
        }
    };

    const ALL_TYPES = ['Máy Ảnh', 'Ống Kính', 'Tai Nghe', 'Loa & Âm Thanh', 'Tivi Bravia', 'PlayStation', 'Điện Thoại Xperia', 'Máy Quay Film', 'Phụ Kiện'];

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [result, tags] = await Promise.all([
                    getProducts(),
                    getGlobalTags()
                ]);
                if (isMounted) {
                    setData(result || []);
                    setGlobalTags(tags || []);
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

    // Handle deep linking via ?product=ID from URL
    useEffect(() => {
        if (!loading && data.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const productId = params.get('product');
            if (productId) {
                const targetProduct = data.find(p => p.id === productId);
                if (targetProduct) {
                    onOpenSpecs(targetProduct);
                }
            }
        }
    }, [loading, data, onOpenSpecs]);

    const handleOpenSpecs = (product) => {
        // Update URL transparently to make link shareable
        if (typeof window !== 'undefined') {
            const url = new URL(window.location);
            url.searchParams.set('product', product.id);
            window.history.pushState({}, '', url);
        }
        onOpenSpecs(product);
    };

    const handleSaveProduct = async (formData) => {
        setSaving(true);
        try {
            if (formData.id) {
                const { id, createdAt, updatedAt, ...rest } = formData;
                await updateProduct(id, rest);
                showToast(`✅ Đã cập nhật "${formData.name}"`);
                setData(prev => prev.map(p => p.id === id ? { ...p, ...rest, updatedAt: new Date() } : p));
            } else {
                const newId = await addProduct(formData);
                showToast(`✅ Đã thêm "${formData.name}"`);
                setData(prev => [{ ...formData, id: newId, createdAt: new Date() }, ...prev]);
            }
            setModalProduct(null);
        } catch (e) {
            alert('Lỗi: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateTags = async (newTags) => {
        try {
            await updateGlobalTags(newTags);
            setGlobalTags(newTags);
        } catch (e) {
            console.error("Error updating tags:", e);
        }
    };

    // Helper: get all categories for a product (supports legacy string + new array)
    const getProductCategories = (item) => {
        if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) return item.categories;
        if (item.category) return [item.category];
        return [];
    };

    const availableTags = useMemo(() => {
        const tagSet = new Set();
        data.forEach(item => {
            const cats = getProductCategories(item);
            if (activeCategories.length > 0 && !activeCategories.some(c => cats.includes(c))) return;
            if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    }, [data, activeCategories]);

    const filteredData = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        return data.filter(item => {
            const matchesSearch =
                item.name.toLowerCase().includes(searchLower) ||
                (item.kataban && item.kataban.toLowerCase().includes(searchLower)) ||
                (item.highlights && item.highlights.toLowerCase().includes(searchLower)) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)));

            // Multi-category OR logic: match if product belongs to ANY selected category
            const cats = getProductCategories(item);
            const matchesMainCat = activeCategories.length === 0 || activeCategories.some(c => cats.includes(c));
            const matchesType = activeTags.length === 0 ? true : activeTags.every(tag => item.tags && item.tags.includes(tag));
            return matchesSearch && matchesMainCat && matchesType;
        });
    }, [searchTerm, activeTags, activeCategories, data]);

    const toggleMainCategory = (cat) => {
        if (cat === 'Tất cả') {
            setActiveCategories([]);
            setActiveTags([]);
            return;
        }
        setActiveTags([]); // reset sub-tags when changing category filter
        setActiveCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const toggleTag = (tag) => {
        setActiveTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
        // Track filter usage
        fetch('/api/track_action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'filter_uses' })
        }).then(r => r.json()).then(data => {
            if (data.unlockedBadges && data.unlockedBadges.length > 0) {
                window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: { unlockedBadges: data.unlockedBadges } }));
            }
        }).catch(() => { });
    };

    // Helper function to render Sony Badges
    const renderBadges = (name) => {
        const badges = [];
        if (name.includes('GM') || name.includes('G Master')) {
            badges.push(<span key="gm" className="bg-[#ff4500] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide leading-none" title="G Master">GM</span>);
        } else if (/\bG\b/.test(name)) {
            badges.push(<span key="g" className="bg-[#1d1d1f] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide leading-none" title="G Lens">G</span>);
        }
        // Zeiss badges removed per Sony Vietnam's current product line
        return badges;
    };

    return (
        <div className="w-full flex flex-col gap-6 animate-slide-up relative z-10">

            {/* Header & Controls */}
            <div className="flex flex-col gap-6 bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] ring-1 ring-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">

                {/* Search Row & View Toggle */}
                <div className="flex flex-col sm:flex-row gap-4 w-full items-center justify-between">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" />
                        <input
                            type="text"
                            className="w-full pl-12 pr-4 py-3.5 bg-white border border-black/[0.08] rounded-2xl text-[15px] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all placeholder:text-[#86868b] font-medium"
                            placeholder="Tìm kiếm sản phẩm, kataban hoặc tính năng..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </div>

                    {isDataMaster && (
                        <button
                            onClick={() => setModalProduct({})}
                            className="flex items-center gap-2 px-6 py-3.5 bg-[#1d1d1f] text-white rounded-2xl text-[13px] font-bold hover:bg-black transition-all shadow-lg hover:shadow-black/20"
                        >
                            <Plus size={18} />
                            Thêm sản phẩm
                        </button>
                    )}
                </div>

                {/* Main Category Row - multi-select */}
                <div className="flex gap-2 items-center w-full overflow-x-auto pb-1 [scrollbar-width:'none']">
                    <button
                        onClick={() => toggleMainCategory('Tất cả')}
                        className={`px-5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeCategories.length === 0
                            ? 'bg-[#1d1d1f] text-white shadow-[0_4px_14px_rgba(0,0,0,0.1)]'
                            : 'bg-white ring-1 ring-black/5 text-[#86868b] hover:bg-[#F5F5F7] hover:text-[#1d1d1f]'
                            }`}
                    >
                        Tất cả
                    </button>
                    {ALL_TYPES.map(cat => {
                        const isActive = activeCategories.includes(cat);
                        return (
                            <button
                                key={cat}
                                onClick={() => toggleMainCategory(cat)}
                                className={`px-5 py-2.5 rounded-2xl text-[13px] font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 relative ${isActive
                                    ? 'bg-[#1d1d1f] text-white shadow-[0_4px_14px_rgba(0,0,0,0.1)]'
                                    : 'bg-white ring-1 ring-black/5 text-[#86868b] hover:bg-[#F5F5F7] hover:text-[#1d1d1f]'
                                    }`}
                            >
                                {cat}
                                {isActive && (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white" />
                                )}
                            </button>
                        );
                    })}
                    {activeCategories.length > 1 && (
                        <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full flex-shrink-0 ring-1 ring-blue-200">
                            {activeCategories.length} ngành
                        </span>
                    )}
                </div>

                {/* Dynamic Sub-Tags Row */}
                <div className="flex flex-wrap gap-2 items-center w-full min-h-[36px]">
                    <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mr-2">Bộ lọc phụ:</span>
                    {availableTags.length === 0 && <span className="text-[13px] text-[#86868b] italic">Không có tags cho phân khúc này</span>}
                    {availableTags.map(tag => {
                        const isActive = activeTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => toggleTag(tag)}
                                className={`px-4 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-300 ${isActive
                                    ? 'bg-[#1d1d1f] text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-[#1d1d1f]'
                                    : 'bg-white ring-1 ring-black/5 text-[#86868b] hover:bg-[#F5F5F7] hover:text-[#1d1d1f]'
                                    }`}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white ring-1 ring-black/[0.04] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] overflow-hidden w-full max-w-full">
                <div className="overflow-x-auto custom-scrollbar min-h-[500px] w-full max-w-full">
                    <table className="w-full text-left border-collapse whitespace-nowrap table-fixed">
                        <thead>
                            <tr className="bg-[#F5F5F7]/80 border-b border-black/[0.04] text-[11px] font-bold text-[#86868b] uppercase tracking-wider">
                                {isDev && (
                                    <th className="px-3 py-5 w-[40px]">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedIds(filteredData.map(r => r.id));
                                                else setSelectedIds([]);
                                            }}
                                            className="w-4 h-4 rounded border-black/10 text-teal-600 focus:ring-teal-500 bg-background transition-all"
                                        />
                                    </th>
                                )}
                                <th className="px-4 py-5 font-bold w-[250px]">
                                    <div className="flex items-center gap-2"><Fingerprint size={14} className="text-[#86868b]" /> SẢN PHẨM</div>
                                </th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold text-[#86868b] uppercase tracking-widest w-[120px]">Kataban</th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold text-[#86868b] uppercase tracking-widest w-[200px]">Thông số & Tính năng</th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold text-[#86868b] uppercase tracking-widest w-[100px]">Giá tham khảo</th>
                                <th className="px-4 py-4 text-left text-[11px] font-bold text-[#86868b] uppercase tracking-widest w-[80px]">Năm</th>
                                <th className="px-4 py-5 font-bold text-center w-[150px]">HÀNH ĐỘNG</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.02] text-[14px]">
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
                                                handleOpenSpecs(item);
                                                trackFeatureUsage(`prod_${item.name.replace(/\s+/g, '_')}`, item.name);
                                            }}
                                            className={`group cursor-pointer transition-colors duration-300 hover:bg-[#F5F5F7]/80 ${selectedIds.includes(item.id) ? 'bg-orange-500/5' : ''}`}
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            {isDev && (
                                                <td className="px-3 py-4 truncate" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(item.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedIds([...selectedIds, item.id]);
                                                            else setSelectedIds(selectedIds.filter(id => id !== item.id));
                                                        }}
                                                        className="w-4 h-4 rounded border-black/10 text-orange-600 focus:ring-orange-500 bg-background transition-all"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-4 py-4 font-semibold text-[#1d1d1f] flex items-center gap-2 truncate">
                                                <div className="bg-[#F5F5F7] p-1.5 rounded-xl text-[#86868b] group-hover:bg-white group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] group-hover:text-[#1d1d1f] transition-all w-8 h-8 flex items-center justify-center flex-shrink-0">
                                                    <Aperture size={14} />
                                                </div>
                                                <div className="flex items-center gap-1.5 overflow-hidden">
                                                    <span className="truncate" title={item.name}>{item.name}</span>
                                                    {renderBadges(item.name)}
                                                    {item.quickSettingGuide && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setQuickSettingGuide({ name: item.name, guide: item.quickSettingGuide });
                                                                trackFeatureUsage(`guide_${item.name.replace(/\s+/g, '_')}`, item.name);
                                                            }}
                                                            title="Quick Setting Guide"
                                                            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white transition-all text-[9px] font-bold uppercase tracking-wide border border-orange-200 flex-shrink-0"
                                                        >
                                                            <Settings2 size={10} /> Guide
                                                        </button>
                                                    )}
                                                    <FeatureStar featureId={`prod_${item.name.replace(/\s+/g, '_')}`} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-[#424245] font-mono text-[12px] truncate" title={item.kataban}>
                                                {item.kataban || '—'}
                                            </td>
                                            <td className="px-4 py-4 text-slate-500 text-[12px] truncate group-hover:text-[#1d1d1f] transition-colors" title={item.highlights}>
                                                {item.highlights || '—'}
                                            </td>
                                            <td className="px-4 py-4 font-black text-blue-600 tabular-nums truncate" title={item.price ? new Intl.NumberFormat('en-US').format(item.price) + ' ₫' : '—'}>
                                                {item.price ? new Intl.NumberFormat('en-US').format(item.price) + ' ₫' : '—'}
                                            </td>
                                            <td className="px-4 py-4 text-slate-500 tabular-nums font-medium truncate">
                                                {item.year || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const type = item.type?.toLowerCase().includes('body') || item.type?.toLowerCase().includes('camera') ? 'camera' : 'lens';
                                                            if (onToggleCompare) onToggleCompare(item.name, type);
                                                            trackFeatureUsage(`prod_${item.name.replace(/\s+/g, '_')}`, item.name);
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${isSelected ? 'bg-green-500 text-white hover:bg-red-500' : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#1d1d1f] hover:text-white'}`}
                                                    >
                                                        {isSelected ? 'Bỏ chọn' : 'So sánh'}
                                                    </button>
                                                    {item.url && (
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center justify-center p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#F5F5F7] transition-all group/link"
                                                            title="Xem trên Sony.com.vn"
                                                        >
                                                            <ExternalLink size={16} className="group-hover/link:scale-110 transition-transform" />
                                                        </a>
                                                    )}
                                                    {isDataMaster && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setModalProduct(item);
                                                            }}
                                                            className="p-1.5 bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-full transition-all duration-300 shadow-sm"
                                                            title="Sửa sản phẩm"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
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
            {selectedIds.length > 0 && isDataMaster && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] animate-slide-up">
                    <div className="bg-[#1d1d1f] text-white px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-6 ring-1 ring-white/10 backdrop-blur-xl">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Đã chọn</span>
                            <span className="text-[15px] font-black">{selectedIds.length} sản phẩm</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="px-4 py-2 text-[12px] font-black uppercase tracking-widest hover:opacity-60 transition-all"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => { setBulkEditOpen(true); setBulkCatsToAdd([]); setBulkCatsToRemove([]); setBulkTagsToAdd([]); setBulkTagsToRemove([]); }}
                                className="px-6 py-2.5 bg-blue-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Edit3 size={14} /> Sửa Tags &amp; Ngành hàng
                            </button>
                            {isDev && (
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-6 py-2.5 bg-red-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> Xóa {selectedIds.length} mục
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Edit Modal */}
            {bulkEditOpen && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:p-6" onClick={() => setBulkEditOpen(false)}>
                    <div className="absolute inset-0 bg-black/[0.02] backdrop-blur-[20px] backdrop-saturate-[180%]" />
                    <div
                        className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/5 animate-in slide-in-from-bottom-4 duration-300 p-8 flex flex-col gap-7"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-blue-500 mb-1">Chỉnh sửa hàng loạt</p>
                                <h3 className="text-[22px] font-black text-[#1d1d1f] tracking-tight">Cập nhật {selectedIds.length} sản phẩm</h3>
                            </div>
                            <button onClick={() => setBulkEditOpen(false)} className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Categories — multi add/remove */}
                        <div>
                            <label className="block text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">
                                Ngành hàng — chọn để thêm <span className="text-green-500">✚</span> hoặc xoá <span className="text-red-400">✕</span> khỏi sản phẩm
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ALL_TYPES.map(cat => {
                                    const isAdding = bulkCatsToAdd.includes(cat);
                                    const isRemoving = bulkCatsToRemove.includes(cat);
                                    return (
                                        <div key={cat} className="flex items-center rounded-2xl overflow-hidden ring-1 ring-black/5">
                                            <button
                                                onClick={() => toggleBulkCatAdd(cat)}
                                                className={`px-3 py-1.5 text-[11px] font-bold transition-all ${isAdding ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-600'
                                                    }`}
                                                title="Thêm ngành hàng này cho tất cả sản phẩm đã chọn"
                                            >
                                                ✚ {cat}
                                            </button>
                                            <button
                                                onClick={() => toggleBulkCatRemove(cat)}
                                                className={`px-2 py-1.5 text-[11px] font-bold border-l border-white/30 transition-all ${isRemoving ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'
                                                    }`}
                                                title="Xoá ngành hàng này khỏi tất cả sản phẩm đã chọn"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            {(bulkCatsToAdd.length > 0 || bulkCatsToRemove.length > 0) && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-2xl text-[12px] font-medium text-slate-600 flex flex-col gap-1">
                                    {bulkCatsToAdd.length > 0 && <p><span className="text-green-600 font-black">+ Thêm ngành:</span> {bulkCatsToAdd.join(', ')}</p>}
                                    {bulkCatsToRemove.length > 0 && <p><span className="text-red-500 font-black">− Xoá ngành:</span> {bulkCatsToRemove.join(', ')}</p>}
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-[12px] font-black uppercase tracking-widest text-slate-400 mb-3">Tags — chọn để thêm <span className="text-green-500">✚</span> hoặc xoá <span className="text-red-400">✕</span></label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {globalTags.map(tag => {
                                    const isAdding = bulkTagsToAdd.includes(tag);
                                    const isRemoving = bulkTagsToRemove.includes(tag);
                                    return (
                                        <div key={tag} className="flex items-center rounded-2xl overflow-hidden ring-1 ring-black/5">
                                            <button
                                                onClick={() => toggleBulkTagAdd(tag)}
                                                className={`px-3 py-1.5 text-[11px] font-bold transition-all ${isAdding ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-600'
                                                    }`}
                                                title="Thêm tag này cho tất cả sản phẩm đã chọn"
                                            >
                                                ✚ {tag}
                                            </button>
                                            <button
                                                onClick={() => toggleBulkTagRemove(tag)}
                                                className={`px-2 py-1.5 text-[11px] font-bold border-l border-white/30 transition-all ${isRemoving ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500'
                                                    }`}
                                                title="Xoá tag này khỏi tất cả sản phẩm đã chọn"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Custom tag input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={bulkTagInput}
                                    onChange={e => setBulkTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomBulkTag(); } }}
                                    placeholder="Thêm tag mới..."
                                    className="flex-1 text-[13px] px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 font-medium"
                                />
                                <button
                                    onClick={addCustomBulkTag}
                                    className="px-5 py-2.5 bg-slate-800 text-white rounded-2xl text-[12px] font-black hover:bg-black transition-all"
                                >
                                    Thêm
                                </button>
                            </div>
                            {/* Preview of what will be added/removed */}
                            {(bulkTagsToAdd.length > 0 || bulkTagsToRemove.length > 0) && (
                                <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-[12px] font-medium text-slate-600 flex flex-col gap-1.5">
                                    {bulkTagsToAdd.length > 0 && (
                                        <p><span className="text-green-600 font-black">+ Thêm:</span> {bulkTagsToAdd.join(', ')}</p>
                                    )}
                                    {bulkTagsToRemove.length > 0 && (
                                        <p><span className="text-red-500 font-black">− Xoá:</span> {bulkTagsToRemove.join(', ')}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                            <button onClick={() => setBulkEditOpen(false)} className="px-6 py-3 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-all">
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleBulkEdit}
                                disabled={bulkSaving || (bulkCatsToAdd.length === 0 && bulkCatsToRemove.length === 0 && bulkTagsToAdd.length === 0 && bulkTagsToRemove.length === 0)}
                                className="px-8 py-3 bg-[#1d1d1f] text-white rounded-2xl text-[13px] font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                            >
                                {bulkSaving ? <Loader2 size={15} className="animate-spin" /> : null}
                                {bulkSaving ? 'Đang lưu...' : `Lưu thay đổi cho ${selectedIds.length} sản phẩm`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Setting Guide Modal */}
            {quickSettingGuide && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/[0.02] backdrop-blur-[20px] backdrop-saturate-[180%] animate-in fade-in duration-200" onClick={() => setQuickSettingGuide(null)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col ring-1 ring-black/5 m-4 sm:m-6 max-h-[90vh]">
                        {/* Header */}
                        <div className="relative px-8 pt-10 pb-6 shrink-0 bg-white">
                            <button onClick={() => setQuickSettingGuide(null)} className="absolute top-8 right-8 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 transition-all active:scale-95">
                                <X size={20} />
                            </button>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center">
                                    <span className="px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-[0.15em] rounded-full flex items-center gap-1.5 ring-1 ring-teal-500/20">
                                        <Settings2 size={12} strokeWidth={2.5} />
                                        Quick Setting Guide
                                    </span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black text-[#1d1d1f] tracking-tight leading-tight">
                                    {quickSettingGuide.name}
                                </h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 pb-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                            <div className="flex flex-col gap-10">
                                {(() => {
                                    const rawLines = quickSettingGuide.guide.split('\n').map(l => l.trim()).filter(Boolean);

                                    const GROUPS = {
                                        "Vận hành máy ảnh": { title: "Vận hành máy ảnh", items: [] },
                                        "Chất lượng hình ảnh": { title: "Chất lượng hình ảnh", items: [] },
                                        "Lấy Nét": { title: "Lấy Nét", items: [] },
                                        "Quay Phim & Âm thanh": { title: "Quay Phim & Âm thanh", items: [] }
                                    };

                                    const getCategory = (title) => {
                                        const tLow = title.toLowerCase();
                                        if (tLow.includes('chất lượng') || tLow.includes('hình ảnh') || tLow.includes('image') || tLow.includes('màu sắc') || tLow.includes('color')) return "Chất lượng hình ảnh";
                                        if (tLow.includes('lấy nét') || tLow.includes('focus') || tLow.includes('af') || tLow.includes('tracking')) return "Lấy Nét";
                                        if (tLow.includes('quay') || tLow.includes('video') || tLow.includes('âm thanh') || tLow.includes('audio') || tLow.includes('movie')) return "Quay Phim & Âm thanh";
                                        return "Vận hành máy ảnh";
                                    };

                                    let currentGroupName = "Vận hành máy ảnh";

                                    rawLines.forEach(line => {
                                        const isUppercaseHeader = /^[A-ZẮẰẲẴẶĂẤẦẨẪẬÂÁÀÃẢẠĐẾỀỂỄỆÊÉÈẺẼẸÍÌỈĨỊỐỒỔỖỘÔỚỜỞỠỢƠÓÒÕỎỌỨỪỬỮỰƯÚÙỦŨỤÝỲỶỸỴ\s&()\-]+$/.test(line);
                                        const hasPhan = /^([📸🖼️🎯💡🎥]\s*)?PHẦN\s+\d+/.test(line);
                                        const isHeader = hasPhan || (isUppercaseHeader && line.length < 50 && !line.includes(':'));

                                        if (isHeader) {
                                            let cleanTitle = line.replace(/^[📸🖼️🎯💡🎥]\s*/, '').replace(/^PHẦN\s+\d+:\s*/i, '').replace(/^PHẦN\s+\d+\s*/i, '');
                                            currentGroupName = getCategory(cleanTitle);
                                        } else {
                                            const currentSection = GROUPS[currentGroupName];

                                            if (line.includes(':')) {
                                                const firstColonIndex = line.indexOf(':');
                                                const key = line.substring(0, firstColonIndex).trim();
                                                const value = line.substring(firstColonIndex + 1).trim();

                                                if (key.length > 50) {
                                                    // Note
                                                    currentSection.items.push({ key: '', value: line, isNote: true });
                                                } else {
                                                    // Valid Key-Value
                                                    currentSection.items.push({ key: key, value: value });
                                                }
                                            } else {
                                                // Note
                                                currentSection.items.push({ key: '', value: line, isNote: true });
                                            }
                                        }
                                    });

                                    const activeSections = Object.values(GROUPS).filter(g => g.items.length > 0);

                                    return activeSections.map((section, idx) => {
                                        let SectionIcon = Aperture;
                                        if (section.title === "Chất lượng hình ảnh") SectionIcon = Camera;
                                        else if (section.title === "Vận hành máy ảnh") SectionIcon = Activity;
                                        else if (section.title === "Lấy Nét") SectionIcon = Fingerprint;
                                        else if (section.title === "Quay Phim & Âm thanh") SectionIcon = Settings2;

                                        return (
                                            <div key={idx} className="flex flex-col gap-4">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                                        <SectionIcon size={16} />
                                                    </div>
                                                    <h3 className="text-[13.5px] font-black text-[#1d1d1f] uppercase tracking-widest">
                                                        {section.title}
                                                    </h3>
                                                </div>



                                                {section.items.length > 0 && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                                        {section.items.map((item, itemIdx) => (
                                                            <div key={itemIdx} className={`bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-center transition-shadow hover:shadow-md ${item.isNote ? 'md:col-span-2 items-center justify-center text-center bg-slate-50' : ''}`}>
                                                                {item.isNote ? (
                                                                    <span className="text-[14px] font-medium text-slate-600 italic w-full">
                                                                        {item.value}
                                                                    </span>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{item.key}</span>
                                                                        <span className="text-[14px] sm:text-[14.5px] font-bold text-[#1d1d1f] leading-relaxed text-balance">{item.value}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin/Data Master Product Modal */}
            {modalProduct !== null && (
                <ProductFormModal
                    product={Object.keys(modalProduct).length === 0 ? null : modalProduct}
                    globalTags={globalTags}
                    onUpdateTags={handleUpdateTags}
                    onSave={handleSaveProduct}
                    onDelete={handleDelete}
                    onClose={() => setModalProduct(null)}
                    saving={saving}
                />
            )}

            {/* In-page Toast */}
            {toast && (
                <div className="fixed bottom-10 right-10 z-[200] bg-[#1d1d1f] text-white px-6 py-3 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[13px] font-bold">{toast}</span>
                </div>
            )}
        </div>
    );
}
