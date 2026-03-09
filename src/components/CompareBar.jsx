import { X, Scale, Camera, Aperture, Plus } from 'lucide-react';
import { useState } from 'react';

function CustomAddInput({ onAdd }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [type, setType] = useState('camera');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onAdd(inputValue.trim(), type);
            setInputValue('');
            setIsExpanded(false);
        }
    };

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="flex-shrink-0 w-48 h-[54px] border border-dashed border-teal-300 bg-teal-50/50 hover:bg-teal-50 rounded-lg flex items-center justify-center gap-2 text-teal-600 transition-colors group"
            >
                <Plus size={14} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Thêm thiết bị khác</span>
            </button>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex-shrink-0 w-64 h-[54px] border border-teal-200 bg-white shadow-sm rounded-lg flex items-center px-2 animate-in zoom-in-95 duration-200"
        >
            <button
                type="button"
                onClick={() => setType(type === 'camera' ? 'lens' : 'camera')}
                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors mr-1"
                title={type === 'camera' ? "Đang chọn: Máy Ảnh (Click để đổi)" : "Đang chọn: Ống Kính (Click để đổi)"}
            >
                {type === 'camera' ? <Camera size={16} /> : <Aperture size={16} />}
            </button>
            <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={type === 'camera' ? "VD: Sony A6400..." : "VD: Sony 35mm..."}
                className="flex-grow min-w-0 text-xs font-semibold text-slate-700 bg-transparent border-none focus:outline-none placeholder:font-normal placeholder:text-slate-300"
            />
            <button
                type="submit"
                disabled={!inputValue.trim()}
                className="ml-1 p-1.5 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Plus size={14} />
            </button>
        </form>
    );
}

export default function CompareBar({ compareList, onRemoveItem, onAddCustomItem, onCompare }) {
    if (!compareList || compareList.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 animate-slide-up">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 overflow-x-auto flex-grow mr-4 pb-1 custom-scrollbar">
                    {compareList.map((item, idx) => (
                        <div key={idx} className="flex-shrink-0 flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-48 relative group">
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-[10px] uppercase font-bold text-cyan-600 mb-0.5">{item.productType}</span>
                                <span className="text-xs font-semibold text-slate-700 truncate" title={item.productName}>
                                    {item.productName}
                                </span>
                            </div>
                            <button
                                onClick={() => onRemoveItem(item.productName, item.productType)}
                                className="ml-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded bg-white border border-slate-100 transition-colors"
                                title="Xóa khỏi so sánh"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}

                    {/* Empty Slots & Custom Input */}
                    {Array.from({ length: 4 - compareList.length }).map((_, idx) => {
                        if (idx === 0) {
                            // First empty slot is the quick add input
                            return <CustomAddInput key="custom-input" onAdd={onAddCustomItem} />;
                        }
                        return (
                            <div key={`empty-${idx}`} className="flex-shrink-0 w-48 h-[54px] border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center opacity-50">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">Thêm sản phẩm</span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex-shrink-0 flex items-center gap-4">
                    <div className="hidden sm:block text-xs font-bold text-slate-500">
                        {compareList.length} / 4
                    </div>
                    <button
                        onClick={onCompare}
                        disabled={compareList.length < 2}
                        className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md whitespace-nowrap"
                    >
                        <Scale size={18} />
                        <span>SO SÁNH NGAY</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
