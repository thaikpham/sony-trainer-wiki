'use client';
import { useState, useEffect, useCallback } from 'react';
import { Database, RefreshCw, BarChart3, Package } from 'lucide-react';
import ProductTable from './ProductTable';
import ProductFormModal from './ProductFormModal';
import LiveReportsTable from './LiveReportsTable';
import { getAllProductsAdmin, addProduct, updateProduct, deleteProduct } from '@/services/db';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'reports'
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [modalProduct, setModalProduct] = useState(null); // null = closed; {} = new; {...product} = edit
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3000);
    };

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllProductsAdmin();
            setProducts(data);
        } catch (e) {
            showToast('error', 'Không tải được dữ liệu: ' + e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'products') loadProducts();
    }, [loadProducts, activeTab]);

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
            await loadProducts();
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
            await loadProducts();
        } catch (e) {
            showToast('error', '❌ Lỗi xóa: ' + e.message);
        } finally {
            setSaving(false);
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
                    <button onClick={loadProducts} disabled={loading}
                        className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40">
                        <RefreshCw size={14} className={loading && activeTab === 'products' ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {activeTab === 'products' ? (
                    <ProductTable
                        products={products}
                        loading={loading}
                        onAdd={() => setModalProduct({})}
                        onEdit={(p) => setModalProduct(p)}
                    />
                ) : (
                    <LiveReportsTable />
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalProduct !== null && (
                <ProductFormModal
                    product={Object.keys(modalProduct).length === 0 ? null : modalProduct}
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
