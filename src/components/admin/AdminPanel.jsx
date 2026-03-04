'use client';
import { useState, useEffect, useCallback } from 'react';
import { Database, RefreshCw, BarChart3, Package, UploadCloud } from 'lucide-react';
import ProductTable from './ProductTable';
import ProductFormModal from './ProductFormModal';
import LiveReportsTable from './LiveReportsTable';
import { getAllProductsAdmin, addProduct, updateProduct, deleteProduct, getGlobalTags, updateGlobalTags } from '@/services/db';
import { useUser } from '@clerk/nextjs';
import { getRoleKeys } from '@/lib/roles';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'reports'
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [importing, setImporting] = useState(false);
    const [modalProduct, setModalProduct] = useState(null); // null = closed; {} = new; {...product} = edit
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
    const [globalTags, setGlobalTags] = useState([]);

    const { user } = useUser();
    const userRoleKeys = getRoleKeys(user?.primaryEmailAddress?.emailAddress);
    const isDev = userRoleKeys.includes('DEV');

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [data, tags] = await Promise.all([
                getAllProductsAdmin(),
                getGlobalTags()
            ]);
            setProducts(data);
            setGlobalTags(tags);
        } catch (e) {
            showToast('error', 'Không tải được dữ liệu: ' + e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'products') loadData();
    }, [loadData, activeTab]);

    const handleUpdateTags = async (newTags) => {
        try {
            await updateGlobalTags(newTags);
            setGlobalTags(newTags);
            showToast('success', 'Đã lưu danh sách tags');
        } catch (e) {
            showToast('error', 'Lỗi lưu tags: ' + e.message);
        }
    };

    const handleSave = async (formData) => {
        setSaving(true);
        try {
            if (formData.id) {
                const { id, createdAt, updatedAt, ...rest } = formData;
                await updateProduct(id, rest);
                showToast('success', `✅ Đã cập nhật "${formData.name}"`);
            } else {
                await addProduct(formData);
                showToast('success', `✅ Đã thêm "${formData.name}"`);
            }
            setModalProduct(null);
            await loadData();
        } catch (e) {
            showToast('error', '❌ Lỗi: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setSaving(true);
        try {
            await deleteProduct(id);
            showToast('success', '🗑 Đã xóa sản phẩm');
            setModalProduct(null);
            await loadData();
        } catch (e) {
            showToast('error', '❌ Lỗi xóa: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleBulkImport = async () => {
        if (!window.confirm('Bạn có chắc chắn muốn import dữ liệu sản phẩm? Sản phẩm trùng lập có thể xuất hiện nếu chạy lại nhiều lần.')) return;
        setImporting(true);
        try {
            const res = await fetch('/importData.json');
            if (!res.ok) throw new Error('Không tải được importData.json');
            const data = await res.json();
            let count = 0;
            for (const product of data) {
                await addProduct(product);
                count++;
                if (count % 10 === 0) showToast('success', `ℹ️ Đang import... ${count}/${data.length}`);
            }
            showToast('success', `✅ Import hoàn tất! Đã thêm ${count} sản phẩm.`);
            await loadData();
        } catch (e) {
            showToast('error', '❌ Lỗi import: ' + e.message);
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full p-6 gap-6">

            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0 bg-white dark:bg-[#1d1d1f] p-4 rounded-[32px] ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-all ${activeTab === 'products' ? 'from-violet-500 to-indigo-600' : 'from-teal-500 to-emerald-600'}`}>
                        {activeTab === 'products' ? <Package size={22} className="text-white" /> : <BarChart3 size={22} className="text-white" />}
                    </div>
                    <div>
                        <h1 className="text-[18px] font-black text-[#1d1d1f] dark:text-white tracking-tight">
                            {activeTab === 'products' ? 'Quản lý Sản Phẩm' : 'Báo cáo Livestream'}
                        </h1>
                        <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                            Sony Training Wiki • Admin Panel
                        </p>
                    </div>
                </div>

                <div className="flex items-center bg-[#F5F5F7] dark:bg-white/5 p-1 rounded-2xl ring-1 ring-black/5 dark:ring-white/5 ml-auto sm:ml-0">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`px-4 py-2 rounded-xl text-[12px] font-black transition-all ${activeTab === 'products' ? 'bg-white dark:bg-white/10 text-[#1d1d1f] dark:text-white shadow-sm ring-1 ring-black/5' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}
                    >
                        Sản phẩm
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-4 py-2 rounded-xl text-[12px] font-black transition-all ${activeTab === 'reports' ? 'bg-white dark:bg-white/10 text-[#1d1d1f] dark:text-white shadow-sm ring-1 ring-black/5' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}
                    >
                        Báo cáo Live
                    </button>
                    <div className="w-px h-4 bg-black/10 dark:bg-white/10 mx-1"></div>
                    <button onClick={loadData} disabled={loading}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40">
                        <RefreshCw size={14} className={loading && activeTab === 'products' ? 'animate-spin' : ''} />
                    </button>
                    {isDev && activeTab === 'products' && (
                        <button
                            onClick={handleBulkImport}
                            disabled={importing}
                            title="Import từ file dữ liệu chuẩn"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors disabled:opacity-40">
                            <UploadCloud size={13} className={importing ? 'animate-bounce' : ''} />
                            {importing ? 'Importing...' : 'Import'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {activeTab === 'products' ? (
                    <div className="flex flex-col gap-4">
                        <ProductTable
                            products={products}
                            loading={loading}
                            onAdd={() => setModalProduct({})}
                            onEdit={(p) => setModalProduct(p)}
                        />
                    </div>
                ) : (
                    <LiveReportsTable />
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalProduct !== null && (
                <ProductFormModal
                    product={Object.keys(modalProduct).length === 0 ? null : modalProduct}
                    globalTags={globalTags}
                    onUpdateTags={handleUpdateTags}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onClose={() => setModalProduct(null)}
                    saving={saving}
                />
            )}

            {/* Toast notification */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl text-[13px] font-semibold shadow-xl transition-all
                    ${toast.type === 'success'
                        ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f]'
                        : 'bg-rose-600 text-white'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
