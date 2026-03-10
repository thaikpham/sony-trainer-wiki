import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Filter, Plus, ShoppingCart, Info, Activity, Box, Aperture, Layers, Fingerprint, ExternalLink, Loader2, AlertCircle, Camera, Settings2, Trash2, X, Edit3, Check, ArrowUp } from 'lucide-react';
import { getProducts, deleteProduct, addProduct, updateProduct, getGlobalTags, updateGlobalTags } from '../services/db';
import Image from 'next/image';
import { trackFeatureUsage } from '@/services/analytics';
import { trackClientAction } from '@/lib/trackActionClient';
import FeatureStar from './FeatureStar';
import { CategoryBadge } from './admin/SingleSelectField';
import ProductFormModal from './admin/ProductFormModal';
import TagManagerModal from './admin/TagManagerModal';
import { useRoleAccess } from '@/components/RoleProvider';
import { useUser } from '@clerk/nextjs';
import { PRODUCT_CATEGORY_LIST } from '@/lib/wikiCategories';

export default function ProductDatabase({
    onOpenSpecs,
    compareList = [],
    onToggleCompare,
    editProduct = null,
    onClearEdit = () => { },
    fixedCategory = null,
    onNavigateCategory = null
}) {
    const { isDataMaster, isDev } = useRoleAccess();
    const { user } = useUser();

    // Helper: get all categories for a product (supports legacy string + new array)
    const getProductCategories = (item) => {
        if (!item) return [];
        if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) return item.categories;
        if (item.category) return [item.category];
        return [];
    };

    // Helper function to render Sony Badges
    const renderBadges = (name) => {
        const badges = [];
        if (!name) return badges;
        if (name.includes('GM') || name.includes('G Master')) {
            badges.push(<span key="gm" className="bg-[#ff4500] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide leading-none" title="G Master">GM</span>);
        } else if (/\bG\b/.test(name)) {
            badges.push(<span key="g" className="bg-[#1d1d1f] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wide leading-none" title="G Lens">G</span>);
        }
        return badges;
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategories, setActiveCategories] = useState(() => (fixedCategory ? [fixedCategory] : []));
    const [activeTags, setActiveTags] = useState([]);
    const searchTimerRef = useState(null);
    const isCategoryRouteMode = typeof onNavigateCategory === 'function';

    useEffect(() => {
        setActiveCategories(fixedCategory ? [fixedCategory] : []);
        setActiveTags([]);
    }, [fixedCategory]);

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        if (searchTimerRef[0]) clearTimeout(searchTimerRef[0]);
        searchTimerRef[0] = setTimeout(() => {
            if (val.trim().length >= 2) {
                trackClientAction('search_queries');
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
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

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
    // Tri-State Matrix Context
    // { [name]: { type: 'cat' | 'tag', action: 'ADD' | 'REMOVE' } }
    const [bulkMutations, setBulkMutations] = useState({});
    const [bulkSearchQuery, setBulkSearchQuery] = useState('');
    const [bulkSaving, setBulkSaving] = useState(false);
    const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);

    // Auto-collapse console if no products are selected
    useEffect(() => {
        if (selectedIds.length === 0) {
            setIsConsoleExpanded(false);
            setBulkSearchQuery('');
        }
    }, [selectedIds.length]);

    const selectionSummary = useMemo(() => {
        if (selectedIds.length === 0) return null;
        const selectedProducts = data.filter(p => selectedIds.includes(p.id));
        const catMap = {};
        const tagMap = {};
        selectedProducts.forEach(p => {
            getProductCategories(p).forEach(c => { catMap[c] = (catMap[c] || 0) + 1; });
            (Array.isArray(p.tags) ? p.tags : []).forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1; });
        });
        return {
            categories: catMap,
            tags: tagMap,
            count: selectedProducts.length,
            // Helper to get consensus type
            getStatus: (type, key) => {
                const count = type === 'cat' ? catMap[key] : tagMap[key];
                if (!count) return 'none';
                if (count === selectedProducts.length) return 'all';
                return 'some';
            }
        };
    }, [selectedIds, data]);

    const handleToggleMutation = (key, type) => {
        setBulkMutations(prev => {
            const currentAction = prev[key]?.action;
            const newMutations = { ...prev };

            if (!currentAction) {
                newMutations[key] = { type, action: 'ADD' };
            } else if (currentAction === 'ADD') {
                newMutations[key] = { type, action: 'REMOVE' };
            } else {
                delete newMutations[key];
            }
            return newMutations;
        });
    };

    const handleForceRemove = (key, type) => {
        setBulkMutations(prev => {
            const newMutations = { ...prev };
            if (newMutations[key]?.action === 'REMOVE') {
                delete newMutations[key];
            } else {
                newMutations[key] = { type, action: 'REMOVE' };
            }
            return newMutations;
        });
    };

    const handleClearMutations = () => setBulkMutations({});

    const handleBulkEdit = async () => {
        const mutationKeys = Object.keys(bulkMutations);
        if (mutationKeys.length === 0) return;

        setBulkSaving(true);

        const catsToAdd = mutationKeys.filter(k => bulkMutations[k].type === 'cat' && bulkMutations[k].action === 'ADD');
        const catsToRemove = mutationKeys.filter(k => bulkMutations[k].type === 'cat' && bulkMutations[k].action === 'REMOVE');
        const tagsToAdd = mutationKeys.filter(k => bulkMutations[k].type === 'tag' && bulkMutations[k].action === 'ADD');
        const tagsToRemove = mutationKeys.filter(k => bulkMutations[k].type === 'tag' && bulkMutations[k].action === 'REMOVE');

        const lastEditedBy = {
            name: user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Unknown',
            avatar: user?.imageUrl || '',
            email: user?.primaryEmailAddress?.emailAddress || ''
        };

        try {
            await Promise.all(selectedIds.map(id => {
                const product = data.find(p => p.id === id);
                if (!product) return Promise.resolve();

                const currentCats = Array.isArray(product.categories) && product.categories.length > 0
                    ? product.categories
                    : (product.category ? [product.category] : []);

                const newCats = [
                    ...currentCats.filter(c => !catsToRemove.includes(c)),
                    ...catsToAdd.filter(c => !currentCats.includes(c))
                ];

                const currentTags = Array.isArray(product.tags) ? product.tags : [];
                const newTags = [
                    ...currentTags.filter(t => !tagsToRemove.includes(t)),
                    ...tagsToAdd.filter(t => !currentTags.includes(t))
                ];

                return updateProduct(id, { categories: newCats, tags: newTags, lastEditedBy });
            }));

            // Reflect changes in local state immediately
            setData(prev => prev.map(p => {
                if (!selectedIds.includes(p.id)) return p;

                const currentCats = Array.isArray(p.categories) && p.categories.length > 0
                    ? p.categories : (p.category ? [p.category] : []);
                const newCats = [
                    ...currentCats.filter(c => !catsToRemove.includes(c)),
                    ...catsToAdd.filter(c => !currentCats.includes(c))
                ];

                const currentTags = Array.isArray(p.tags) ? p.tags : [];
                const newTags = [
                    ...currentTags.filter(t => !tagsToRemove.includes(t)),
                    ...tagsToAdd.filter(t => !currentTags.includes(t))
                ];

                return { ...p, categories: newCats, tags: newTags, lastEditedBy };
            }));

            showToast(`✅ Đã cập nhật ${selectedIds.length} sản phẩm`);
            setBulkMutations({});
            setSelectedIds([]);
        } catch (err) {
            console.error('Bulk edit error:', err);
            alert('Lỗi khi cập nhật hàng loạt: ' + err.message);
        } finally {
            setBulkSaving(false);
        }
    };

    const ALL_TYPES = PRODUCT_CATEGORY_LIST;

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
            const productData = {
                ...formData,
                lastEditedBy: {
                    name: user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Unknown',
                    avatar: user?.imageUrl || '',
                    email: user?.primaryEmailAddress?.emailAddress || ''
                }
            };

            if (formData.id) {
                const { id, createdAt, updatedAt, ...rest } = formData;
                await updateProduct(id, { ...rest, lastEditedBy: productData.lastEditedBy });
                showToast(`✅ Đã cập nhật "${formData.name}"`);
                setData(prev => prev.map(p => p.id === id ? { ...p, ...rest, lastEditedBy: productData.lastEditedBy, updatedAt: new Date() } : p));
            } else {
                const newId = await addProduct(productData);
                showToast(`✅ Đã thêm "${formData.name}"`);
                setData(prev => [{ ...productData, id: newId, createdAt: new Date() }, ...prev]);
            }
            setModalProduct(null);
        } catch (e) {
            alert('Lỗi: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateTagsAndProducts = async (newTags) => {
        setSaving(true);
        try {
            // Identify tags that have been removed completely from the system
            const removedTags = globalTags.filter(t => !newTags.includes(t));

            // Scrub these tags from all products
            if (removedTags.length > 0) {
                const productsToUpdate = data.filter(p => p.tags && p.tags.some(t => removedTags.includes(t)));

                await Promise.all(productsToUpdate.map(p => {
                    const updatedTags = p.tags.filter(t => !removedTags.includes(t));
                    return updateProduct(p.id, { tags: updatedTags });
                }));

                // Update local state immediately without full refresh
                setData(prev => prev.map(p => {
                    if (productsToUpdate.some(up => up.id === p.id)) {
                        return { ...p, tags: p.tags.filter(t => !removedTags.includes(t)) };
                    }
                    return p;
                }));
            }

            // Finally update Global Tags Document
            await updateGlobalTags(newTags);
            setGlobalTags(newTags);
            showToast(`✅ Đã cập nhật cài đặt Tags hệ thống`);
        } catch (e) {
            console.error("Error updating tags:", e);
            alert("Lỗi khi cập nhật tags: " + e.message);
        } finally {
            setSaving(false);
            setIsTagManagerOpen(false);
        }
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
            const cats = getProductCategories(item);
            const safeIncludes = (val, search) => {
                if (typeof val === 'string') return val.toLowerCase().includes(search);
                if (Array.isArray(val)) return val.some(v => typeof v === 'string' && v.toLowerCase().includes(search));
                return false;
            };

            const matchesSearch =
                safeIncludes(item.name, searchLower) ||
                safeIncludes(item.kataban, searchLower) ||
                safeIncludes(item.highlights, searchLower) ||
                safeIncludes(item.tags, searchLower) ||
                safeIncludes(cats, searchLower);

            // Multi-category AND logic: match if product belongs to ALL selected categories
            const matchesMainCat = activeCategories.length === 0 || activeCategories.every(c => cats.includes(c));
            const matchesType = activeTags.length === 0 ? true : activeTags.every(tag => item.tags && item.tags.includes(tag));
            return matchesSearch && matchesMainCat && matchesType;
        });
    }, [searchTerm, activeTags, activeCategories, data]);

    const toggleMainCategory = (cat) => {
        if (isCategoryRouteMode) {
            onNavigateCategory(cat);
            if (cat) {
                trackClientAction('filter_uses');
            }
            return;
        }

        if (!cat) {
            setActiveCategories([]);
            setActiveTags([]);
            return;
        }
        setActiveTags([]); // reset sub-tags when changing category filter
        setActiveCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
        // Track filter usage
        trackClientAction('filter_uses');
    };

    const toggleTag = (tag) => {
        setActiveTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
        // Track filter usage
        trackClientAction('filter_uses');
    };

    return (
        <div className="w-full flex flex-col gap-6 relative z-10">

            {/* Header & Controls - STICKY */}
            <div className="sticky top-6 z-[100] flex flex-col gap-6 bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] ring-1 ring-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.08)]">

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
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsTagManagerOpen(true)}
                                className="flex items-center gap-2 px-6 py-3.5 bg-white border border-black/[0.08] text-[#1d1d1f] rounded-2xl text-[13px] font-bold hover:bg-[#F5F5F7] transition-all"
                            >
                                <Settings2 size={18} />
                                Quản lý Tags
                            </button>
                            <button
                                onClick={() => setModalProduct({})}
                                className="flex items-center gap-2 px-6 py-3.5 bg-[#1d1d1f] text-white rounded-2xl text-[13px] font-bold hover:bg-black transition-all shadow-lg hover:shadow-black/20"
                            >
                                <Plus size={18} />
                                Thêm sản phẩm
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Category Row - multi-select */}
                <div className="flex gap-2 items-center w-full overflow-x-auto pb-1 [scrollbar-width:'none']">
                    <button
                        onClick={() => toggleMainCategory(null)}
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
                    {!isCategoryRouteMode && activeCategories.length > 1 && (
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
                                                trackFeatureUsage(`prod_${(item.name || '').replace(/\s+/g, '_')}`, item.name || 'Unknown');
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
                                                <div className="flex flex-col gap-1 overflow-hidden">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="truncate font-black text-[15px]" title={item.name}>{item.name}</span>
                                                        {renderBadges(item.name)}
                                                        {item.quickSettingGuide && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setQuickSettingGuide({ name: item.name || 'Sản phẩm', guide: item.quickSettingGuide });
                                                                    trackFeatureUsage(`guide_${(item.name || '').replace(/\s+/g, '_')}`, item.name || 'Unknown');
                                                                }}
                                                                title="Quick Setting Guide"
                                                                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white transition-all text-[9px] font-bold uppercase tracking-wide border border-orange-200 flex-shrink-0"
                                                            >
                                                                <Settings2 size={10} /> Guide
                                                            </button>
                                                        )}
                                                        <FeatureStar featureId={`prod_${(item.name || '').replace(/\s+/g, '_')}`} />
                                                    </div>

                                                    {/* Visual Categories & Tags */}
                                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                                        {getProductCategories(item).map(cat => (
                                                            <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold border border-blue-100 uppercase tracking-tighter">
                                                                {cat}
                                                            </span>
                                                        ))}
                                                        {item.tags?.slice(0, 3).map(tag => (
                                                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-600 font-bold border border-teal-100 uppercase tracking-tighter">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {item.tags?.length > 3 && (
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 font-bold border border-slate-100">
                                                                +{item.tags.length - 3}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* User Last Edited */}
                                                    {item.lastEditedBy && (
                                                        <div className="flex items-center gap-1.5 mt-1.5 opacity-60 hover:opacity-100 transition-opacity">
                                                            {item.lastEditedBy.avatar ? (
                                                                <Image src={item.lastEditedBy.avatar} alt={item.lastEditedBy.name} width={16} height={16} className="w-4 h-4 rounded-full shadow-sm ring-1 ring-black/5" unoptimized />
                                                            ) : (
                                                                <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 ring-1 ring-black/5">
                                                                    {item.lastEditedBy.name?.charAt(0) || '?'}
                                                                </div>
                                                            )}
                                                            <span className="text-[10px] font-medium text-[#86868b] truncate max-w-[150px]" title={`Cập nhật lần cuối bởi ${item.lastEditedBy.name}`}>
                                                                {item.lastEditedBy.name}
                                                            </span>
                                                        </div>
                                                    )}
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
                                                            if (onToggleCompare) onToggleCompare(item.name || 'Unknown', type);
                                                            trackFeatureUsage(`prod_${(item.name || '').replace(/\s+/g, '_')}`, item.name || 'Unknown');
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

                {/* Back to Top Feature */}
                {filteredData.length > 5 && (
                    <div className="p-4 border-t border-black/[0.02] bg-slate-50/50 flex justify-center">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white ring-1 ring-black/5 text-[#86868b] text-[11px] font-black uppercase tracking-widest hover:bg-[#1d1d1f] hover:text-white transition-all shadow-sm group"
                        >
                            Quay lại đầu trang <ArrowUp size={12} className="group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                )}
            </div>


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
                    onUpdateTags={handleUpdateTagsAndProducts}
                    onSave={handleSaveProduct}
                    onDelete={handleDelete}
                    onClose={() => setModalProduct(null)}
                    saving={saving}
                />
            )}

            {/* In-page Toast */}
            {toast && (
                <div className="fixed bottom-10 right-10 z-[300] bg-[#1d1d1f] text-white px-6 py-3 rounded-2xl shadow-2xl animate-slide-up flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[13px] font-bold">{toast}</span>
                </div>
            )}

            {/* PERSISTENT FLOATING BULK CONSOLE - PORTALLED TO BODY */}
            {selectedIds.length > 0 && isDataMaster && typeof document !== 'undefined' && createPortal(
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] w-[calc(100%-48px)] max-w-6xl pointer-events-none">
                    {!isConsoleExpanded ? (
                        /* PHASE 1: COMPACT SELECTION BAR */
                        <div className="bg-[#1d1d1f]/95 backdrop-blur-3xl text-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/10 px-8 py-4 flex items-center justify-between gap-8 border border-white/10 animate-slide-up opacity-100 pointer-events-auto mx-auto w-fit min-w-[400px]">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Box size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-black">{selectedIds.length} sản phẩm đã chọn</span>
                                    <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold text-blue-400">Sẵn sàng chỉnh sửa</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="px-5 py-2 rounded-xl text-[12px] font-bold uppercase tracking-wider hover:bg-white/10 transition-all text-white/60"
                                >
                                    Huỷ
                                </button>
                                <button
                                    onClick={() => setIsConsoleExpanded(true)}
                                    className="px-8 py-2.5 bg-blue-500 text-white rounded-xl text-[13px] font-black uppercase tracking-widest ring-4 ring-blue-500/20 hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center gap-2"
                                >
                                    Tiến hành sửa <Edit3 size={16} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* PHASE 2: TRISTATE MATRIX MASTER UI */
                        <div className="pointer-events-auto flex-1 flex flex-col bg-[#1d1d1f]/95 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 relative rounded-[32px] mx-2 mb-2 border border-white/10 shadow-2xl">
                            {/* Header: Selected Products Context */}
                            <div className="flex items-center justify-between p-4 px-6 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                    <button
                                        onClick={() => setIsConsoleExpanded(false)}
                                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 hover:text-white shrink-0"
                                        title="Thu gọn"
                                    >
                                        <ArrowUp className="-rotate-180" size={16} />
                                    </button>
                                    <div className="flex flex-col shrink-0 pr-4 border-r border-white/10">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-blue-400">Master Data Mode</span>
                                        <span className="text-[14px] font-black text-white">{selectedIds.length} sản phẩm đang chọn</span>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1 flex-1 items-center">
                                        {data.filter(p => selectedIds.includes(p.id)).map(p => (
                                            <div key={p.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg shrink-0 group">
                                                <span className="text-[11px] font-bold text-white/80 max-w-[120px] truncate">{p.name}</span>
                                                <button onClick={() => setSelectedIds(prev => prev.filter(id => id !== p.id))} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 pl-4">
                                    <button onClick={() => { setBulkMutations({}); setSelectedIds([]); }} className="px-4 py-2 rounded-xl bg-white/5 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/60 hover:text-white">
                                        Huỷ bỏ
                                    </button>
                                    <button
                                        onClick={handleBulkEdit}
                                        disabled={bulkSaving || Object.keys(bulkMutations).length === 0}
                                        className="px-6 py-2.5 bg-blue-500 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 flex items-center gap-2 shadow-[0_10px_20px_rgba(59,130,246,0.3)]"
                                    >
                                        {bulkSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                                        Lưu {Object.keys(bulkMutations).length > 0 && `(${Object.keys(bulkMutations).length})`}
                                    </button>
                                </div>
                            </div>

                            {/* Control Bar: Search & Filter */}
                            <div className="px-6 py-3 border-b border-white/5 flex items-center gap-4 bg-black/20">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                    <input
                                        type="text"
                                        value={bulkSearchQuery}
                                        onChange={e => setBulkSearchQuery(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && bulkSearchQuery.trim()) {
                                                const query = bulkSearchQuery.trim();
                                                if (ALL_TYPES.includes(query)) handleToggleMutation(query, 'cat');
                                                else handleToggleMutation(query, 'tag');
                                                setBulkSearchQuery('');
                                            }
                                        }}
                                        placeholder="Tìm hoặc tạo tag/ngành mới..."
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2 pl-9 pr-3 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    />
                                    {bulkSearchQuery && (
                                        <button onClick={() => setBulkSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"><X size={14} /></button>
                                    )}
                                </div>
                                <div className="h-6 w-px bg-white/10" />
                                <div className="flex gap-2 text-[11px] font-bold uppercase tracking-widest text-[#86868b] items-center">
                                    <Activity size={14} className="opacity-50" />
                                    <span>Ghi chú:</span>
                                    <div className="flex gap-4 ml-2">
                                        <span className="flex items-center gap-1 text-white/40"><div className="w-3 h-3 rounded-[3px] border border-white/20 bg-white/5"></div> Trống</span>
                                        <span className="flex items-center gap-1 text-amber-300"><div className="w-3 h-3 rounded-[3px] border border-amber-500/30 bg-amber-500/10 flex items-center justify-center"><div className="w-1.5 h-[1.5px] bg-amber-400"></div></div> Bán phần</span>
                                        <span className="flex items-center gap-1 text-teal-300"><div className="w-3 h-3 rounded-[3px] border border-teal-500/30 bg-teal-500/10 flex items-center justify-center"><Check size={8} className="text-teal-400" strokeWidth={4} /></div> Có đủ</span>
                                    </div>
                                </div>
                            </div>

                            {/* The Matrix (Dense Properties Grid) */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#161618]">
                                <div className="flex flex-col gap-10">
                                    {/* Categories Matrix */}
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-[12px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            <Layers size={16} /> Ngành hàng
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {ALL_TYPES.filter(c => !bulkSearchQuery || c.toLowerCase().includes(bulkSearchQuery.toLowerCase())).map(cat => {
                                                const consensus = selectionSummary?.getStatus('cat', cat) || 'none';
                                                const mutation = bulkMutations[cat]?.action;

                                                let visualState = consensus;
                                                if (mutation === 'ADD') visualState = 'all';
                                                if (mutation === 'REMOVE') visualState = 'none';

                                                const isAddPending = mutation === 'ADD';
                                                const isRemovePending = mutation === 'REMOVE';

                                                return (
                                                    <button
                                                        key={cat}
                                                        onClick={() => handleToggleMutation(cat, 'cat')}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all user-select-none group ${isAddPending ? 'bg-green-500/15 border-green-500/50 ring-1 ring-green-500/20' :
                                                            isRemovePending ? 'bg-red-500/10 border-red-500/30 opacity-60' :
                                                                visualState === 'all' ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20' :
                                                                    visualState === 'some' ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' :
                                                                        'bg-white/5 border-white/10 hover:bg-white/10 text-white/50'
                                                            }`}
                                                    >
                                                        <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-colors ${isAddPending ? 'bg-green-500 border-green-400' :
                                                            isRemovePending ? 'bg-transparent border-red-500/50' :
                                                                visualState === 'all' ? 'bg-blue-500 border-blue-400' :
                                                                    visualState === 'some' ? 'bg-amber-500/20 border-amber-500/50' :
                                                                        'bg-transparent border-white/20'
                                                            }`}>
                                                            {isAddPending ? <Plus size={10} className="text-white" strokeWidth={4} /> :
                                                                isRemovePending ? <X size={10} className="text-red-400" strokeWidth={4} /> :
                                                                    visualState === 'all' ? <Check size={10} className="text-white" strokeWidth={4} /> :
                                                                        visualState === 'some' ? <div className="w-1.5 h-0.5 bg-amber-400 rounded-full" /> :
                                                                            null}
                                                        </div>
                                                        <span className={`text-[12px] font-bold ${isAddPending ? 'text-green-300' :
                                                            isRemovePending ? 'text-red-400 line-through' :
                                                                visualState === 'all' ? 'text-blue-300' :
                                                                    visualState === 'some' ? 'text-amber-300' :
                                                                        'text-white/60 group-hover:text-white'
                                                            }`}>
                                                            {cat}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Tags Matrix */}
                                    <div className="flex flex-col gap-4">
                                        <h3 className="text-[12px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                            <Box size={16} /> Tags Phổ Biến & Tuỳ Chọn
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from(new Set([...globalTags, ...Object.keys(bulkMutations).filter(k => bulkMutations[k].type === 'tag')]))
                                                .filter(t => !bulkSearchQuery || t.toLowerCase().includes(bulkSearchQuery.toLowerCase()))
                                                .map(tag => {
                                                    const consensus = selectionSummary?.getStatus('tag', tag) || 'none';
                                                    const mutation = bulkMutations[tag]?.action;

                                                    let visualState = consensus;
                                                    if (mutation === 'ADD') visualState = 'all';
                                                    if (mutation === 'REMOVE') visualState = 'none';

                                                    const isAddPending = mutation === 'ADD';
                                                    const isRemovePending = mutation === 'REMOVE';

                                                    return (
                                                        <button
                                                            key={tag}
                                                            onClick={() => handleToggleMutation(tag, 'tag')}
                                                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all user-select-none group ${isAddPending ? 'bg-green-500/15 border-green-500/50 ring-1 ring-green-500/20' :
                                                                isRemovePending ? 'bg-red-500/10 border-red-500/30 opacity-60' :
                                                                    visualState === 'all' ? 'bg-teal-500/10 border-teal-500/30 hover:bg-teal-500/20' :
                                                                        visualState === 'some' ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' :
                                                                            'bg-white/5 border-white/10 hover:bg-white/10 text-white/50'
                                                                }`}
                                                        >
                                                            <div className={`w-3 h-3 rounded-[3px] border flex items-center justify-center transition-colors ${isAddPending ? 'bg-green-500 border-green-400' :
                                                                isRemovePending ? 'bg-transparent border-red-500/50' :
                                                                    visualState === 'all' ? 'bg-teal-500 border-teal-400' :
                                                                        visualState === 'some' ? 'bg-amber-500/20 border-amber-500/50' :
                                                                            'bg-transparent border-white/20'
                                                                }`}>
                                                                {isAddPending ? <Plus size={8} className="text-white" strokeWidth={4} /> :
                                                                    isRemovePending ? <X size={8} className="text-red-400" strokeWidth={4} /> :
                                                                        visualState === 'all' ? <Check size={8} className="text-white" strokeWidth={4} /> :
                                                                            visualState === 'some' ? <div className="w-1 h-[1.5px] bg-amber-400 rounded-full" /> :
                                                                                null}
                                                            </div>
                                                            <span className={`text-[11px] font-bold ${isAddPending ? 'text-green-300' :
                                                                isRemovePending ? 'text-red-400 line-through' :
                                                                    visualState === 'all' ? 'text-teal-300' :
                                                                        visualState === 'some' ? 'text-amber-300' :
                                                                            'text-white/60 group-hover:text-white'
                                                                }`}>
                                                                {tag}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            {bulkSearchQuery && !globalTags.some(t => t.toLowerCase() === bulkSearchQuery.toLowerCase()) && !ALL_TYPES.some(c => c.toLowerCase() === bulkSearchQuery.toLowerCase()) && (
                                                <button
                                                    onClick={() => { handleToggleMutation(bulkSearchQuery, 'tag'); setBulkSearchQuery(''); }}
                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all text-blue-300"
                                                >
                                                    <Plus size={12} />
                                                    <span className="text-[11px] font-bold italic">Tạo mới: &quot;{bulkSearchQuery}&quot;</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>,
                document.body
            )}
            {isTagManagerOpen && (
                <TagManagerModal
                    globalTags={globalTags}
                    products={data}
                    onClose={() => setIsTagManagerOpen(false)}
                    onUpdateTags={handleUpdateTagsAndProducts}
                />
            )}

        </div>
    );
}
