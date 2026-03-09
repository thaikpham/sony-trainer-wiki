'use client';
import { useState, useMemo } from 'react';
import { Search, Plus, ArrowUpDown, ExternalLink, Pencil } from 'lucide-react';
import Image from 'next/image';
import { TagPill } from './MultiSelectField';
import SingleSelectField, { CategoryBadge as BaseCategoryBadge } from './SingleSelectField';

const formatPrice = (price) => {
    const n = Number(price);
    if (!price || isNaN(n) || n <= 0) return '—';
    return new Intl.NumberFormat('en-US').format(n) + ' ₫';
};

const CategoryBadge = ({ category }) => {
    const colors = {
        'Máy Ảnh': 'bg-blue-50 text-blue-600 border-blue-100',
        'Ống Kính': 'bg-amber-50 text-amber-600 border-amber-100',
        'Tivi Bravia': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'Tai Nghe': 'bg-purple-50 text-purple-600 border-purple-100',
        'Loa & Âm Thanh': 'bg-rose-50 text-rose-600 border-rose-100',
        'Điện Thoại Xperia': 'bg-slate-50 text-slate-600 border-slate-200',
        'Máy Quay Film': 'bg-indigo-50 text-indigo-600 border-indigo-100',
        'PlayStation': 'bg-blue-50 text-blue-600 border-blue-100',
        'Phụ Kiện': 'bg-slate-50 text-slate-500 border-slate-100',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors[category] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
            {category || 'Chưa phân loại'}
        </span>
    );
};

const CORE_SPECS_DISPLAY_CONFIG = {
    'Máy Ảnh': [
        { key: 'sensor', prefix: 'S' },
        { key: 'chip', prefix: 'C' },
        { key: 'aiUnit', prefix: 'AI' },
        { key: 'battery', prefix: 'B' }
    ],
    'Máy Quay Film': [
        { key: 'sensor', prefix: 'S' },
        { key: 'chip', prefix: 'C' },
        { key: 'aiUnit', prefix: 'AI' },
        { key: 'battery', prefix: 'B' }
    ],
    'Ống Kính': [
        { key: 'focal', prefix: 'F', isFocal: true },
        { key: 'aperture', prefix: 'A' },
        { key: 'minFocus', prefix: 'M' },
        { key: 'filterSize', prefix: 'Filter' }
    ],
    'Tivi Bravia': [
        { key: 'panel', prefix: 'P' },
        { key: 'processor', prefix: 'Proc' },
        { key: 'refreshRate', prefix: 'Hz' },
        { key: 'os', prefix: 'OS' }
    ],
    'Tai Nghe': [
        { key: 'driver', prefix: 'D' },
        { key: 'anc', prefix: 'ANC' },
        { key: 'audioTech', prefix: 'Tech' },
        { key: 'batteryLife', prefix: 'Pin' }
    ],
    'Loa & Âm Thanh': [
        { key: 'channels', prefix: 'Ch' },
        { key: 'power', prefix: 'W' },
        { key: 'wireless', prefix: 'Wireless' },
        { key: 'battery', prefix: 'Pin' }
    ],
    'Điện Thoại Xperia': [
        { key: 'display', prefix: 'Disp' },
        { key: 'chipset', prefix: 'CPU' },
        { key: 'camera', prefix: 'Cam' },
        { key: 'battery', prefix: 'Pin' }
    ],
    'PlayStation': [
        { key: 'processor', prefix: 'Proc' },
        { key: 'storage', prefix: 'SSD' },
        { key: 'output', prefix: 'Out' },
        { key: 'connectivity', prefix: 'W' }
    ],
};

/** Renders a sortable <th> — defined at module scope to avoid recreation on every render. */
function SortHeader({ label, sortable = true, colKey, sortKey, sortDir, onSort }) {
    return (
        <th
            onClick={sortable ? () => onSort(colKey) : undefined}
            className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap ${sortable ? 'cursor-pointer hover:text-[#1d1d1f] select-none' : ''}`}
        >
            <span className="flex items-center gap-1">
                {label}
                {sortable && <ArrowUpDown size={10} className={sortKey === colKey ? 'opacity-100 text-blue-500' : 'opacity-30'} />}
            </span>
        </th>
    );
}


export default function ProductTable({ products = [], onAdd, onEdit, loading }) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [filterCategory, setFilterCategory] = useState('Tất cả ngành hàng');

    const categories = useMemo(() => {
        const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
        return cats.sort();
    }, [products]);

    const filtered = useMemo(() => {
        let list = [...products];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p =>
                p.name?.toLowerCase().includes(q) ||
                p.kataban?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.tags?.some(t => t.toLowerCase().includes(q))
            );
        }
        if (filterCategory && filterCategory !== 'Tất cả ngành hàng') list = list.filter(p => p.category === filterCategory);
        list.sort((a, b) => {
            let va = a[sortKey] ?? '';
            let vb = b[sortKey] ?? '';
            if (typeof va === 'string') va = va.toLowerCase();
            if (typeof vb === 'string') vb = vb.toLowerCase();
            if (va < vb) return sortDir === 'asc' ? -1 : 1;
            if (va > vb) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
        return list;
    }, [products, search, sortKey, sortDir, filterCategory]);

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-shrink-0">
                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm sản phẩm, kataban, tag..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 bg-white text-[13px] text-[#1d1d1f] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                    />
                </div>

                {/* Category filter */}
                <div className="w-56">
                    <SingleSelectField
                        value={filterCategory}
                        onChange={setFilterCategory}
                        options={[
                            { label: 'Tất cả ngành hàng', color: 'bg-slate-100 text-slate-700' },
                            ...categories.map(c => ({ label: c, color: 'bg-blue-100 text-blue-700' }))
                        ]}
                    />
                </div>

                {/* Count */}
                <span className="text-[12px] text-slate-400 tabular-nums">
                    {filtered.length}/{products.length} sản phẩm
                </span>

                {/* Add */}
                <button onClick={onAdd}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1d1d1f] text-white text-[13px] font-bold hover:opacity-90 transition-all shadow-sm">
                    <Plus size={14} strokeWidth={2.5} /> Thêm mới
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto rounded-2xl border border-black/[0.07] bg-white">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-slate-400 text-[14px]">
                        Đang tải...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-2 text-slate-400">
                        <span className="text-3xl">📦</span>
                        <p className="text-[14px]">{products.length === 0 ? 'Chưa có sản phẩm nào. Hãy thêm mới!' : 'Không tìm thấy sản phẩm phù hợp.'}</p>
                    </div>
                ) : (
                    <table className="w-full text-[13px] table-fixed">
                        <thead className="sticky top-0 bg-slate-50 border-b border-black/[0.06] z-10">
                            <tr>
                                <th className="px-4 py-3 text-left w-14" />
                                <SortHeader label="Tên sản phẩm" colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <SortHeader label="Kataban" colKey="kataban" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <SortHeader label="Màu sắc" colKey="color" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <SortHeader label="Ngành hàng" colKey="category" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[150px] truncate">Tags</th>
                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[180px] truncate">Core Specs</th>
                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[200px] truncate">Thông số & Tính năng</th>
                                <SortHeader label="Giá" colKey="price" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <SortHeader label="Năm" colKey="year" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 w-[80px] truncate">Trạng thái</th>
                                <th className="px-4 py-3 w-16" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.04]">
                            {filtered.map(product => (
                                <tr key={product.id}
                                    onClick={() => onEdit(product)}
                                    className="hover:bg-slate-50 cursor-pointer transition-colors group">

                                    {/* Image */}
                                    <td className="px-4 py-2.5 w-14">
                                        {product.imageUrl
                                            ? <div className="relative w-9 h-9 flex-shrink-0"><Image src={product.imageUrl} alt={product.name} fill sizes="36px"
                                                className="rounded-lg object-cover border border-black/10"
                                                unoptimized
                                                onError={e => { e.target.style.display = 'none'; }} /></div>
                                            : <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-lg">📦</div>
                                        }
                                    </td>

                                    {/* Name */}
                                    <td className="px-4 py-2.5 font-semibold text-[#1d1d1f] max-w-[200px] truncate" title={product.name}>
                                        {product.name || '—'}
                                    </td>

                                    {/* Kataban */}
                                    <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px] truncate max-w-[150px]" title={product.kataban}>
                                        {product.kataban || '—'}
                                    </td>

                                    {/* Color */}
                                    <td className="px-4 py-2.5 text-slate-500 font-medium text-[12px] truncate max-w-[100px]" title={product.color}>
                                        {product.color || '—'}
                                    </td>

                                    {/* Category */}
                                    <td className="px-4 py-2.5 truncate max-w-[120px]">
                                        <CategoryBadge category={product.category} />
                                    </td>

                                    {/* Core Specs Summary (Dynamic) */}
                                    <td className="px-4 py-2.5 max-w-[180px] truncate">
                                        <div className="flex flex-col gap-0.5">
                                            {(CORE_SPECS_DISPLAY_CONFIG[product.category] || CORE_SPECS_DISPLAY_CONFIG['Máy Ảnh']).map(config => {
                                                let val = '';
                                                if (config.isFocal) {
                                                    const min = Array.isArray(product.focal_min) ? product.focal_min[0] : product.focal_min;
                                                    const max = Array.isArray(product.focal_max) ? product.focal_max[0] : product.focal_max;
                                                    if (min || max) val = `${min || '?'}-${max || '?'}`;
                                                } else {
                                                    const raw = product[config.key];
                                                    val = Array.isArray(raw) ? raw.join(', ') : (raw || '');
                                                }

                                                if (!val) return null;
                                                return (
                                                    <span key={config.key} className="text-[10px] text-slate-500 truncate">
                                                        <span className="font-bold text-slate-400 mr-1">{config.prefix}:</span>
                                                        {val}
                                                    </span>
                                                );
                                            })}
                                            {/* Fallback if no specs are filled */}
                                            {!(CORE_SPECS_DISPLAY_CONFIG[product.category] || CORE_SPECS_DISPLAY_CONFIG['Máy Ảnh']).some(c => {
                                                if (c.isFocal) return (product.focal_min || product.focal_max);
                                                return product[c.key]?.length > 0;
                                            }) && (
                                                    <span className="text-slate-300 italic">Trống</span>
                                                )}
                                        </div>
                                    </td>

                                    {/* Highlights */}
                                    <td className="px-4 py-2.5 text-slate-500 text-[12px] max-w-[200px] truncate" title={product.highlights}>
                                        {product.highlights || '—'}
                                    </td>

                                    {/* Price */}
                                    <td className="px-4 py-2.5 text-slate-600 tabular-nums whitespace-nowrap truncate max-w-[100px]" title={formatPrice(product.price)}>
                                        {formatPrice(product.price)}
                                    </td>

                                    {/* Year */}
                                    <td className="px-4 py-2.5 text-slate-500 tabular-nums truncate max-w-[60px]">
                                        {product.year || '—'}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-2.5 max-w-[100px] truncate">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${product.isAvailable !== false
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {product.isAvailable !== false ? '● Đang bán' : '○ Ngừng bán'}
                                        </span>
                                    </td>

                                    {/* Spec link */}
                                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {product.specUrl && (
                                                <a href={product.specUrl} target="_blank" rel="noreferrer"
                                                    className="text-slate-400 hover:text-blue-500 transition-colors p-1">
                                                    <ExternalLink size={13} />
                                                </a>
                                            )}
                                            <button onClick={() => onEdit(product)}
                                                className="text-slate-400 hover:text-[#1d1d1f] transition-colors p-1">
                                                <Pencil size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
