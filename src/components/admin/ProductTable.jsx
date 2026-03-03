'use client';
import { useState, useMemo } from 'react';
import { Search, Plus, ArrowUpDown, ExternalLink, Pencil } from 'lucide-react';
import { TagPill } from './MultiSelectField';
import SingleSelectField, { CategoryBadge } from './SingleSelectField';

const formatPrice = (price) => {
    const n = Number(price);
    if (!price || isNaN(n) || n <= 0) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
};

/** Renders a sortable <th> — defined at module scope to avoid recreation on every render. */
function SortHeader({ label, sortable = true, colKey, sortKey, sortDir, onSort }) {
    return (
        <th
            onClick={sortable ? () => onSort(colKey) : undefined}
            className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap ${sortable ? 'cursor-pointer hover:text-[#1d1d1f] dark:hover:text-white select-none' : ''}`}
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
    const [filterCategory, setFilterCategory] = useState('Tất cả danh mục');

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
                p.model?.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.tags?.some(t => t.toLowerCase().includes(q))
            );
        }
        if (filterCategory && filterCategory !== 'Tất cả danh mục') list = list.filter(p => p.category === filterCategory);
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
                        placeholder="Tìm sản phẩm, model, tag..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-[13px] text-[#1d1d1f] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
                    />
                </div>

                {/* Category filter */}
                <div className="w-56">
                    <SingleSelectField
                        value={filterCategory}
                        onChange={setFilterCategory}
                        options={[
                            { label: 'Tất cả danh mục', color: 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300' },
                            ...categories.map(c => ({ label: c, color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' }))
                        ]}
                    />
                </div>

                {/* Count */}
                <span className="text-[12px] text-slate-400 tabular-nums">
                    {filtered.length}/{products.length} sản phẩm
                </span>

                {/* Add */}
                <button onClick={onAdd}
                    className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f] text-[13px] font-bold hover:opacity-90 transition-all shadow-sm">
                    <Plus size={14} strokeWidth={2.5} /> Thêm mới
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-white dark:bg-white/[0.02]">
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
                        <thead className="sticky top-0 bg-slate-50 dark:bg-[#1a1a1c] border-b border-black/[0.06] dark:border-white/[0.06] z-10">
                            <tr>
                                <th className="px-4 py-3 text-left w-14" />
                                <SortHeader label="Tên sản phẩm" colKey="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <SortHeader label="Model" colKey="model" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <SortHeader label="Danh mục" colKey="category" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[150px] truncate">Tags</th>
                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[200px] truncate">Thông số & Tính năng</th>
                                <SortHeader label="Giá" colKey="price" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <SortHeader label="Năm" colKey="year" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-[80px] truncate">Trạng thái</th>
                                <th className="px-4 py-3 w-16" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                            {filtered.map(product => (
                                <tr key={product.id}
                                    onClick={() => onEdit(product)}
                                    className="hover:bg-slate-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors group">

                                    {/* Image */}
                                    <td className="px-4 py-2.5 w-14">
                                        {product.imageUrl
                                            ? <img src={product.imageUrl} alt={product.name}
                                                className="w-9 h-9 rounded-lg object-cover border border-black/10 dark:border-white/10"
                                                onError={e => { e.target.style.display = 'none'; }} />
                                            : <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700/30 flex items-center justify-center text-lg">📦</div>
                                        }
                                    </td>

                                    {/* Name */}
                                    <td className="px-4 py-2.5 font-semibold text-[#1d1d1f] dark:text-white max-w-[200px] truncate" title={product.name}>
                                        {product.name || '—'}
                                    </td>

                                    {/* Model */}
                                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate max-w-[150px]" title={product.model}>
                                        {product.model || '—'}
                                    </td>

                                    {/* Category */}
                                    <td className="px-4 py-2.5 truncate max-w-[120px]">
                                        <CategoryBadge category={product.category} />
                                    </td>

                                    {/* Tags */}
                                    <td className="px-4 py-2.5 max-w-[150px] truncate">
                                        <div className="flex flex-wrap gap-1 w-full overflow-hidden">
                                            {(product.tags || []).slice(0, 3).map(t => (
                                                <TagPill key={t} tag={t} />
                                            ))}
                                            {(product.tags || []).length > 3 && (
                                                <span className="text-[11px] text-slate-400">+{product.tags.length - 3}</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Highlights */}
                                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-[12px] max-w-[200px] truncate" title={product.highlights}>
                                        {product.highlights || '—'}
                                    </td>

                                    {/* Price */}
                                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap truncate max-w-[100px]" title={formatPrice(product.price)}>
                                        {formatPrice(product.price)}
                                    </td>

                                    {/* Year */}
                                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 tabular-nums truncate max-w-[60px]">
                                        {product.year || '—'}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-2.5 max-w-[100px] truncate">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${product.isAvailable !== false
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                            : 'bg-slate-100 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400'
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
                                                className="text-slate-400 hover:text-[#1d1d1f] dark:hover:text-white transition-colors p-1">
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
