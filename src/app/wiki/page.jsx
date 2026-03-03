'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { BookOpen, Palette, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import ProductDatabase from '@/components/ProductDatabase';
import SpecCard from '@/components/SpecCard';
import SpecModal from '@/components/SpecModal';
import CompareBar from '@/components/CompareBar';
import { trackFeatureUsage } from '@/services/analytics';

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
    const [pageToast, setPageToast] = useState(null);

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
                <div className="flex bg-black/[0.04] dark:bg-white/[0.04] p-1 rounded-2xl border border-black/[0.02] dark:border-white/[0.05]">
                    <button
                        onClick={() => { setActiveSubTab('products'); trackFeatureUsage('wiki_products', 'Wiki: Kho Sản Phẩm'); }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 ${activeSubTab === 'products'
                            ? 'bg-white dark:bg-[#2d2d2f] shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-[#1d1d1f] dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        <BookOpen size={15} strokeWidth={activeSubTab === 'products' ? 2.5 : 2} />
                        Kho Sản Phẩm
                    </button>
                    <button
                        onClick={() => { setActiveSubTab('colorlab'); trackFeatureUsage('wiki_colorlab', 'Wiki: ColorLab'); }}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-300 ${activeSubTab === 'colorlab'
                            ? 'bg-white dark:bg-[#2d2d2f] shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-[#1d1d1f] dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        <Palette size={15} strokeWidth={activeSubTab === 'colorlab' ? 2.5 : 2} />
                        ColorLab
                    </button>
                </div>
                {activeSubTab === 'colorlab' && (
                    <span className="text-[11px] font-bold text-violet-500 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2.5 py-1 rounded-full ring-1 ring-violet-200 dark:ring-violet-800">
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
                    />
                    <SpecModal
                        isOpen={!!selectedProductForSpecs}
                        onClose={() => setSelectedProductForSpecs(null)}
                        product={selectedProductForSpecs}
                    />
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
            ) : (
                <ColorLab />
            )}

            {/* Toast notification */}
            {pageToast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl text-[13px] font-semibold shadow-xl transition-all
          ${pageToast.type === 'success'
                        ? 'bg-[#1d1d1f] dark:bg-white text-white dark:text-[#1d1d1f]'
                        : 'bg-rose-600 text-white'}`}>
                    {pageToast.msg}
                </div>
            )}
        </Layout>
    );
}
