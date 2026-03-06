const fs = require('fs');
const file = 'c:/Users/thaik/Wiki-checkpiont-0203/src/components/ProductDatabase.jsx';
let content = fs.readFileSync(file, 'utf8');

const startStr = '                        /* PHASE 2: FULL EDITOR CONSOLE (EXTENDED) */';
const endStrIndex = content.indexOf('document.body');

if (endStrIndex === -1) {
    console.error("Could not find end index");
    process.exit(1);
}

// Find the start of the block
const startIndex = content.indexOf(startStr);
if (startIndex === -1) {
    console.error("Could not find start index");
    process.exit(1);
}

const endIndex = content.lastIndexOf('</div>,', endStrIndex);

if (endIndex === -1) {
    console.error("Could not find exact end string");
    process.exit(1);
}

const newUI = `                        /* PHASE 2: TRISTATE MATRIX MASTER UI */
                        <div className="flex-1 flex flex-col bg-[#1d1d1f]/95 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 relative rounded-[32px] mx-2 mb-2 border border-white/10 shadow-2xl">
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
                                        Lưu {Object.keys(bulkMutations).length > 0 && \`(\${Object.keys(bulkMutations).length})\`}
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
                                    <Activity size={14} className="opacity-50"/>
                                    <span>Ghi chú:</span>
                                    <div className="flex gap-4 ml-2">
                                        <span className="flex items-center gap-1 text-white/40"><div className="w-3 h-3 rounded-[3px] border border-white/20 bg-white/5"></div> Trống</span>
                                        <span className="flex items-center gap-1 text-amber-300"><div className="w-3 h-3 rounded-[3px] border border-amber-500/30 bg-amber-500/10 flex items-center justify-center"><div className="w-1.5 h-[1.5px] bg-amber-400"></div></div> Bán phần</span>
                                        <span className="flex items-center gap-1 text-teal-300"><div className="w-3 h-3 rounded-[3px] border border-teal-500/30 bg-teal-500/10 flex items-center justify-center"><Check size={8} className="text-teal-400" strokeWidth={4}/></div> Có đủ</span>
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
                                                        className={\`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all user-select-none group \${
                                                            isAddPending ? 'bg-green-500/15 border-green-500/50 ring-1 ring-green-500/20' :
                                                            isRemovePending ? 'bg-red-500/10 border-red-500/30 opacity-60' :
                                                            visualState === 'all' ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20' :
                                                            visualState === 'some' ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' :
                                                            'bg-white/5 border-white/10 hover:bg-white/10 text-white/50'
                                                        }\`}
                                                    >
                                                        <div className={\`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-colors \${
                                                            isAddPending ? 'bg-green-500 border-green-400' :
                                                            isRemovePending ? 'bg-transparent border-red-500/50' :
                                                            visualState === 'all' ? 'bg-blue-500 border-blue-400' :
                                                            visualState === 'some' ? 'bg-amber-500/20 border-amber-500/50' :
                                                            'bg-transparent border-white/20'
                                                        }\`}>
                                                            {isAddPending ? <Plus size={10} className="text-white" strokeWidth={4} /> :
                                                             isRemovePending ? <X size={10} className="text-red-400" strokeWidth={4} /> :
                                                             visualState === 'all' ? <Check size={10} className="text-white" strokeWidth={4} /> :
                                                             visualState === 'some' ? <div className="w-1.5 h-0.5 bg-amber-400 rounded-full" /> : 
                                                             null}
                                                        </div>
                                                        <span className={\`text-[12px] font-bold \${
                                                            isAddPending ? 'text-green-300' :
                                                            isRemovePending ? 'text-red-400 line-through' :
                                                            visualState === 'all' ? 'text-blue-300' :
                                                            visualState === 'some' ? 'text-amber-300' :
                                                            'text-white/60 group-hover:text-white'
                                                        }\`}>
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
                                                        className={\`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all user-select-none group \${
                                                            isAddPending ? 'bg-green-500/15 border-green-500/50 ring-1 ring-green-500/20' :
                                                            isRemovePending ? 'bg-red-500/10 border-red-500/30 opacity-60' :
                                                            visualState === 'all' ? 'bg-teal-500/10 border-teal-500/30 hover:bg-teal-500/20' :
                                                            visualState === 'some' ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' :
                                                            'bg-white/5 border-white/10 hover:bg-white/10 text-white/50'
                                                        }\`}
                                                    >
                                                        <div className={\`w-3 h-3 rounded-[3px] border flex items-center justify-center transition-colors \${
                                                            isAddPending ? 'bg-green-500 border-green-400' :
                                                            isRemovePending ? 'bg-transparent border-red-500/50' :
                                                            visualState === 'all' ? 'bg-teal-500 border-teal-400' :
                                                            visualState === 'some' ? 'bg-amber-500/20 border-amber-500/50' :
                                                            'bg-transparent border-white/20'
                                                        }\`}>
                                                            {isAddPending ? <Plus size={8} className="text-white" strokeWidth={4} /> :
                                                             isRemovePending ? <X size={8} className="text-red-400" strokeWidth={4} /> :
                                                             visualState === 'all' ? <Check size={8} className="text-white" strokeWidth={4} /> :
                                                             visualState === 'some' ? <div className="w-1 h-[1.5px] bg-amber-400 rounded-full" /> : 
                                                             null}
                                                        </div>
                                                        <span className={\`text-[11px] font-bold \${
                                                            isAddPending ? 'text-green-300' :
                                                            isRemovePending ? 'text-red-400 line-through' :
                                                            visualState === 'all' ? 'text-teal-300' :
                                                            visualState === 'some' ? 'text-amber-300' :
                                                            'text-white/60 group-hover:text-white'
                                                        }\`}>
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
                                                    <span className="text-[11px] font-bold italic">Tạo mới: "{bulkSearchQuery}"</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
`;

content = content.substring(0, startIndex) + newUI + '\n                </div>,' + content.substring(endIndex + 7);
fs.writeFileSync(file, content);
console.log("Success");
