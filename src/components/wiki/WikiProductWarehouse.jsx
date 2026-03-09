'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import ProductDatabase from '@/components/ProductDatabase';
import ProductFormModal from '@/components/admin/ProductFormModal';
import CompareBar from '@/components/CompareBar';
import { useRoleAccess } from '@/components/RoleProvider';
import { updateProduct } from '@/services/db';
import { PRODUCT_CATEGORY_TO_SLUG } from '@/lib/wikiCategories';

const CompareModal = dynamic(() => import('@/components/CompareModal'), {
    ssr: false,
    loading: () => null,
});

export default function WikiProductWarehouse({ category = null }) {
    const router = useRouter();
    const { isAdmin } = useRoleAccess();
    const [selectedProductForSpecs, setSelectedProductForSpecs] = useState(null);
    const [compareList, setCompareList] = useState([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState(null);
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

    const handleCategoryNavigation = (nextCategory) => {
        if (!nextCategory) {
            router.push('/wiki/kho-san-pham');
            return;
        }

        const categorySlug = PRODUCT_CATEGORY_TO_SLUG[nextCategory];
        if (!categorySlug) {
            router.push('/wiki/kho-san-pham');
            return;
        }

        router.push(`/wiki/kho-san-pham/${categorySlug}`);
    };

    return (
        <>
            <ProductDatabase
                onOpenSpecs={(product) => setSelectedProductForSpecs(product)}
                compareList={compareList}
                onToggleCompare={toggleCompareItem}
                editProduct={productToEdit}
                onClearEdit={() => setProductToEdit(null)}
                fixedCategory={category}
                onNavigateCategory={handleCategoryNavigation}
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
                            setSelectedProductForSpecs(null);
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

            {pageToast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl text-[13px] font-semibold shadow-xl transition-all
          ${pageToast.type === 'success'
                        ? 'bg-[#1d1d1f] text-white'
                        : 'bg-rose-600 text-white'}`}>
                    {pageToast.msg}
                </div>
            )}
        </>
    );
}
