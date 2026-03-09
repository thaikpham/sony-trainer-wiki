import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Box, AlertTriangle, Loader2 } from 'lucide-react';

export default function TagManagerModal({ globalTags, products, onClose, onUpdateTags }) {
    const [tags, setTags] = useState([...globalTags]);
    const [newTag, setNewTag] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = (e) => {
        e.preventDefault();
        const trimmed = newTag.trim();
        if (trimmed && !tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
            setTags(prev => [...prev, trimmed].sort());
            setNewTag('');
        }
    };

    const handleRemove = (tagToRemove) => {
        if (confirm(`Bạn có chắc muốn xoá hoàn toàn tag "${tagToRemove}" khỏi hệ thống? Tag này sẽ bị gỡ khỏi TẤT CẢ sản phẩm hiện có.`)) {
            setTags(prev => prev.filter(t => t !== tagToRemove));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onUpdateTags(tags);
            onClose();
        } catch (err) {
            alert("Lỗi: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
            <div className="bg-white rounded-[32px] w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-black/5">
                    <div>
                        <h2 className="text-[20px] font-black tracking-tight text-[#1d1d1f] flex items-center gap-2">
                            <Box size={24} className="text-blue-500" /> Quản lý Tags Hệ thống
                        </h2>
                        <p className="text-[13px] text-[#86868b] font-medium mt-1">
                            Thêm mới hoặc xoá hoàn toàn tags khỏi cơ sở dữ liệu.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868b] hover:bg-[#E8E8ED] hover:text-[#1d1d1f] transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar flex flex-col gap-6">
                    <form onSubmit={handleAdd} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={newTag}
                            onChange={e => setNewTag(e.target.value)}
                            placeholder="Nhập tên tag mới..."
                            className="flex-1 bg-[#F5F5F7] border-none rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1d1d1f] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!newTag.trim()}
                            className="bg-blue-500 text-white rounded-xl px-5 py-3 font-bold text-[13px] flex items-center gap-2 disabled:opacity-50 hover:bg-blue-600 transition-all"
                        >
                            <Plus size={16} /> Thêm
                        </button>
                    </form>

                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3 text-amber-800">
                        <AlertTriangle size={20} className="shrink-0 text-amber-500" />
                        <div className="text-[13px] leading-relaxed">
                            <strong>Lưu ý quan trọng:</strong> Khi xoá một tag tại đây, tag đó sẽ tự động bị gỡ bỏ khỏi <strong>tất cả các sản phẩm</strong> đang được gán tag này. Hãy thao tác cẩn thận.
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-[#86868b]">Danh sách Tags ({tags.length})</h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => {
                                const count = products.filter(p => p.tags?.includes(tag)).length;
                                return (
                                    <div key={tag} className="group flex items-center gap-2 bg-white border border-black/10 rounded-lg pl-3 pr-1 py-1 hover:border-blue-500/30 hover:bg-blue-50/50 transition-all">
                                        <span className="text-[13px] font-semibold text-[#1d1d1f]">{tag}</span>
                                        <span className="text-[10px] font-bold text-[#86868b] bg-[#F5F5F7] px-1.5 py-0.5 rounded-md">{count}</span>
                                        <button
                                            onClick={() => handleRemove(tag)}
                                            className="w-6 h-6 rounded-md flex items-center justify-center text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 transition-all ml-1"
                                            title="Xoá tag này"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                )
                            })}
                            {tags.length === 0 && (
                                <p className="text-[13px] text-[#86868b] italic w-full text-center py-4">Chưa có tag nào trong hệ thống.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8 border-t border-black/5 flex justify-end gap-3 bg-[#F5F5F7]/50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl font-bold text-[13px] text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/5 transition-all"
                    >
                        Trở lại
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-2.5 rounded-xl font-black text-[13px] text-white bg-[#1d1d1f] hover:bg-black shadow-lg hover:shadow-black/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
