'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { BookOpen, Palette, Loader2, BarChart3 } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductDatabase from '@/components/ProductDatabase';
import SpecCard from '@/components/SpecCard';
import ProductFormModal from '@/components/admin/ProductFormModal';
import CompareBar from '@/components/CompareBar';
import { trackFeatureUsage } from '@/services/analytics';
import { useUser } from '@clerk/nextjs';
import { useRoleAccess } from '@/components/RoleProvider';
import LiveReportsTable from '@/components/admin/LiveReportsTable';
import { updateProduct } from '@/services/db';

// Lazy-load heavy components only when needed
const ColorLab = dynamic(() => import('@/components/ColorLab'), {
    ssr: false,
    loading: () => <PageLoader />,
});
const CompareModal = dynamic(() => import('@/components/CompareModal'), {
    ssr: false,
    loading: () => null,
});

function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
    );
}

export default function WikiPage() {
    const [activeSubTab, setActiveSubTab] = useState('products');
    const [selectedProductForSpecs, setSelectedProductForSpecs] = useState(null);
    const [compareList, setCompareList] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
    const [pageToast, setPageToast] = useState(null);
    const { user } = useUser();
    const email = user?.primaryEmailAddress?.emailAddress;
    const { isAdmin } = useRoleAccess();

    const showPageToast = (type, msg) => {
        setPageToast({ type, msg });
        setTimeout(() => setPageToast(null), 3000);
    };

    const toggleCompareItem = (productName, productType) => {
        setCompareList(prev => {
            const exists = prev.find(item => item.productName === productName);
            if (exists) return prev.filter(item => item.productName !== productName);
            if (prev.length >= 4) {
                showPageToast('error', 'Chỉ có thể so sánh tối đa 4 sản phẩm.');
                return prev;
            }
            return [...prev, { productName, productType }];
        });
    };

    const addCustomCompareItem = (productName, productType) => {
        if (!productName.trim()) return;
        setCompareList(prev => {
            if (prev.find(item => item.productName === productName)) {
                showPageToast('error', 'Sản phẩm này đã có trong danh sách so sánh.');
                return prev;
            }
            if (prev.length >= 4) {
                showPageToast('error', 'Chỉ có thể so sánh tối đa 4 sản phẩm.');
                return prev;
            }
            return [...prev, { productName, productType }];
        });
    };

    return (
        <Layout>
            {/* Sub-Tab Switcher */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex bg-black/[0.04] p-1 rounded-2xl border border-black/[0.02]">
                    <button
                        onClick={() => { setActiveSubTab('products'); trackFeatureUsage('wiki_products', 'Wiki: Kho Sản Phẩm'); }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 ${activeSubTab === 'products'
                            ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-[#1d1d1f]'
                            : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <BookOpen size={15} strokeWidth={activeSubTab === 'products' ? 2.5 : 2} />
                        Kho Sản Phẩm
                    </button>
                    <button
                        onClick={() => { setActiveSubTab('colorlab'); trackFeatureUsage('wiki_colorlab', 'Wiki: ColorLab'); }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 ${activeSubTab === 'colorlab'
                            ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-[#1d1d1f]'
                            : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Palette size={15} strokeWidth={activeSubTab === 'colorlab' ? 2.5 : 2} />
                        ColorLab
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => { setActiveSubTab('reports'); trackFeatureUsage('wiki_reports', 'Wiki: Báo cáo Live'); }}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 ${activeSubTab === 'reports'
                                ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-teal-600'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <BarChart3 size={15} strokeWidth={activeSubTab === 'reports' ? 2.5 : 2} />
                            Báo cáo Live
                        </button>
                    )}
                </div>
                {activeSubTab === 'colorlab' && (
                    <span className="text-[11px] font-bold text-violet-500 bg-violet-50 px-2.5 py-1 rounded-full ring-1 ring-violet-200">
                        Creative Studio
                    </span>
                )}
            </div>

            {/* Content */}
            {activeSubTab === 'products' ? (
                <>
                    <ProductDatabase
                        onOpenSpecs={(product) => setSelectedProductForSpecs(product)}
                        compareList={compareList}
                        onToggleCompare={toggleCompareItem}
                        editProduct={productToEdit}
                        onClearEdit={() => setProductToEdit(null)}
                    />
                    {selectedProductForSpecs && (
                        <ProductFormModal
                            product={selectedProductForSpecs}
                            readOnly={!isAdmin}
                            onClose={() => {
                                setSelectedProductForSpecs(null);
                                if (typeof window !== 'undefined') {
                                    const url = new URL(window.location);
                                    url.searchParams.delete('product');
                                    window.history.replaceState({}, '', url);
                                }
                            }}
                            onSave={async (formData) => {
                                try {
                                    const { id, createdAt, updatedAt, ...rest } = formData;
                                    await updateProduct(id, rest);
                                    showPageToast('success', `Đã cập nhật "${formData.name}"`);
                                    // Trigger a reload in ProductDatabase if needed, or rely on cache invalidation
                                    // For now, we set it to null and let the user refresh or rely on local state if we had it
                                    setSelectedProductForSpecs(null);
                                    // We might want a way to tell ProductDatabase to refresh
                                    setProductToEdit({ ...formData, _refresh: Date.now() });
                                } catch (e) {
                                    showPageToast('error', 'Lỗi: ' + e.message);
                                }
                            }}
                        />
                    )}
                    <CompareBar
                        compareList={compareList}
                        onRemoveItem={(productName) => toggleCompareItem(productName, '')}
                        onAddCustomItem={addCustomCompareItem}
                        onCompare={() => setIsCompareModalOpen(true)}
                    />
                    <CompareModal
                        isOpen={isCompareModalOpen}
                        onClose={() => setIsCompareModalOpen(false)}
                        compareList={compareList}
                    />
                </>
            ) : activeSubTab === 'colorlab' ? (
                <ColorLab />
            ) : (
                <LiveReportsTable />
            )}

            {/* Toast notification */}
            {pageToast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl text-[13px] font-semibold shadow-xl transition-all
          ${pageToast.type === 'success'
                        ? 'bg-[#1d1d1f] text-white'
                        : 'bg-rose-600 text-white'}`}>
                    {pageToast.msg}
                </div>
            )}
        </Layout>
    );
}
