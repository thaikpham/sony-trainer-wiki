'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Edit2, Trash2, ChevronRight, Save, RefreshCw,
  BookOpen, Trophy, GripVertical, Check, X, AlertCircle
} from 'lucide-react';
import {
  getAcademyPathsAction, getAcademyNodesAction,
  upsertAcademyPathAction, deleteAcademyPathAction,
  upsertAcademyNodeAction, deleteAcademyNodeAction
} from '@/app/admin/academyActions';

/* ─── Shared input style ─────────────────────────────────────────────────── */
const fieldCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all';
const labelCls = 'block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1';

/* ─── Toast ──────────────────────────────────────────────────────────────── */
function Toast({ msg, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white text-sm font-semibold animate-fade-in-up ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
      {type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
      {msg}
    </div>
  );
}

/* ─── Inline Path Editor ─────────────────────────────────────────────────── */
function PathEditor({ path, onSave, onCancel, saving }) {
  const isNew = !path?.id;
  return (
    <form onSubmit={onSave} className="space-y-3 h-full">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        {isNew ? '✦ New World' : '✦ Edit World'}
      </p>
      <div>
        <label className={labelCls}>Title</label>
        <input name="title" required defaultValue={path?.title || ''} className={fieldCls} placeholder="e.g. 🌍 Thế Giới 1: Chinh Phục Ánh Sáng" />
      </div>
      <div>
        <label className={labelCls}>Description</label>
        <textarea name="description" rows={4} defaultValue={path?.description || ''} className={fieldCls} />
      </div>
      <div>
        <label className={labelCls}>Order Index</label>
        <input name="order_index" type="number" required defaultValue={path?.order_index ?? 0} className={fieldCls} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-colors">
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />} Save
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">
          <X size={15} />
        </button>
      </div>
    </form>
  );
}

/* ─── Inline Node Editor ─────────────────────────────────────────────────── */
function NodeEditor({ node, onSave, onCancel, saving }) {
  const isNew = !node?.id;
  return (
    <form onSubmit={onSave} className="space-y-3 h-full">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        {isNew ? '✦ New Node' : '✦ Edit Node'}
      </p>
      <div>
        <label className={labelCls}>Title</label>
        <input name="title" required defaultValue={node?.title || ''} className={fieldCls} placeholder="Trạm 1: ..." />
      </div>
      <div>
        <label className={labelCls}>Description / Hint</label>
        <textarea name="description" rows={3} required defaultValue={node?.description || ''} className={fieldCls} />
      </div>
      <div>
        <label className={labelCls}>Content (Markdown / HTML)</label>
        <textarea name="content" rows={5} defaultValue={node?.content || ''} className={`${fieldCls} font-mono text-xs`} placeholder="Nội dung chi tiết, hỗ trợ markdown..." />
      </div>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className={labelCls}>Order Index</label>
          <input name="order_index" type="number" required defaultValue={node?.order_index ?? 0} className={fieldCls} />
        </div>
        <div className="flex-1">
          <label className={labelCls}>Badge Name (nếu là Boss)</label>
          <input name="badge_name" defaultValue={node?.badge_name || ''} placeholder="e.g. Mắt Kính Nhập Môn" className={fieldCls} />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input name="is_milestone" type="checkbox" defaultChecked={!!node?.is_milestone}
          className="w-4 h-4 rounded text-[#FF5500] focus:ring-[#FF5500] accent-[#FF5500]" />
        <span className="text-sm text-gray-700 font-semibold">⚔️ Milestone / Boss Node</span>
      </label>

      {/* Quiz Section */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Quiz (tùy chọn, tối đa 5 câu)</p>
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map(qIdx => {
            const q = node?.quiz_questions?.[qIdx] || {};
            return (
              <div key={qIdx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl relative">
                <span className="absolute -top-2.5 -left-2.5 w-5 h-5 bg-gray-800 text-white flex items-center justify-center rounded-full text-[10px] font-bold shadow">Q{qIdx + 1}</span>
                <input name={`q_${qIdx}_text`} placeholder={`Câu hỏi ${qIdx + 1} (bỏ trống để bỏ qua)`}
                  defaultValue={q.question || ''}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs mb-2 focus:outline-none focus:ring-1 focus:ring-[#FF5500]" />
                <div className="grid grid-cols-2 gap-1.5">
                  {[0, 1, 2, 3].map(optIdx => (
                    <div key={optIdx} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-md px-2 py-1">
                      <input type="radio" name={`q_${qIdx}_correct`} value={optIdx}
                        defaultChecked={q.correctIndex === optIdx || (optIdx === 0 && q.correctIndex === undefined)}
                        className="accent-emerald-500 shrink-0" />
                      <input name={`q_${qIdx}_opt_${optIdx}`} placeholder={`Đáp án ${optIdx + 1}`}
                        defaultValue={q.options?.[optIdx] || ''}
                        className="w-full text-xs focus:outline-none bg-transparent" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-2 sticky bottom-0 bg-white pb-1">
        <button type="submit" disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#FF5500] text-white text-sm font-bold rounded-xl hover:bg-[#E64D00] transition-colors shadow-md">
          {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />} Lưu Node
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors">
          <X size={15} />
        </button>
      </div>
    </form>
  );
}

/* ─── Main Panel ─────────────────────────────────────────────────────────── */
export default function AdminAcademyPanel() {
  const [paths, setPaths] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // editingPath: null | 'new' | path-object
  const [editingPath, setEditingPath] = useState(null);
  // editingNode: null | 'new' | node-object
  const [editingNode, setEditingNode] = useState(null);

  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => setToast({ msg, type });

  /* ── Data loaders ─────────────────────────────────────────── */
  const loadPaths = useCallback(async (selectId = null) => {
    setLoading(true);
    try {
      const data = await getAcademyPathsAction();
      setPaths(data);
      if (selectId) {
        setSelectedPath(data.find(p => p.id === selectId) || data[0] || null);
      } else if (data.length > 0 && !selectedPath) {
        setSelectedPath(data[0]);
      }
    } catch (e) { showToast('Lỗi tải paths: ' + e.message, 'error'); }
    finally { setLoading(false); }
  }, [selectedPath]);

  const loadNodes = useCallback(async (pathId) => {
    setLoading(true);
    try {
      const data = await getAcademyNodesAction(pathId);
      setNodes(data);
    } catch (e) { showToast('Lỗi tải nodes: ' + e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPaths(); }, []); // eslint-disable-line react-hooks/exhaustive-deps -- load once on mount
  useEffect(() => { if (selectedPath) loadNodes(selectedPath.id); }, [selectedPath]); // eslint-disable-line react-hooks/exhaustive-deps -- loadNodes stable

  /* ── Save path ────────────────────────────────────────────── */
  const handleSavePath = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.target);
    const payload = {
      title: fd.get('title'),
      description: fd.get('description'),
      order_index: parseInt(fd.get('order_index') || 0),
    };
    if (editingPath?.id) payload.id = editingPath.id;
    try {
      const saved = await upsertAcademyPathAction(payload);
      setEditingPath(null);
      await loadPaths(saved.id);
      showToast('Đã lưu World!');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDeletePath = async (p) => {
    if (!window.confirm(`Xoá "${p.title}" và toàn bộ Nodes của nó?`)) return;
    try {
      await deleteAcademyPathAction(p.id);
      if (selectedPath?.id === p.id) setSelectedPath(null);
      await loadPaths();
      showToast('Đã xoá World.');
    } catch (e) { showToast(e.message, 'error'); }
  };

  /* ── Save node ────────────────────────────────────────────── */
  const handleSaveNode = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.target);
    const quiz_questions = [];
    for (let i = 0; i < 5; i++) {
      const q = fd.get(`q_${i}_text`);
      if (q) {
        quiz_questions.push({
          question: q,
          options: [0, 1, 2, 3].map(j => fd.get(`q_${i}_opt_${j}`)),
          correctIndex: parseInt(fd.get(`q_${i}_correct`)),
        });
      }
    }
    const payload = {
      path_id: selectedPath.id,
      title: fd.get('title'),
      description: fd.get('description'),
      content: fd.get('content'),
      is_milestone: fd.get('is_milestone') === 'on',
      badge_name: fd.get('badge_name') || null,
      order_index: parseInt(fd.get('order_index') || 0),
      quiz_questions,
    };
    if (editingNode?.id) payload.id = editingNode.id;
    try {
      await upsertAcademyNodeAction(payload);
      setEditingNode(null);
      await loadNodes(selectedPath.id);
      showToast('Đã lưu Node!');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDeleteNode = async (n) => {
    if (!window.confirm(`Xoá "${n.title}"?`)) return;
    try {
      await deleteAcademyNodeAction(n.id);
      await loadNodes(selectedPath.id);
      showToast('Đã xoá Node.');
    } catch (e) { showToast(e.message, 'error'); }
  };

  /* ── Derived state ────────────────────────────────────────── */
  const showPathEditor = !!editingPath;
  const showNodeEditor = !!editingNode;
  const editorVisible = showPathEditor || showNodeEditor;

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <>
      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex gap-4 h-[calc(100vh-140px)]">

        {/* ── Col 1: Paths ──────────────────────────────────── */}
        <div className="w-[260px] shrink-0 bg-white rounded-[28px] ring-1 ring-black/5 shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Learning Paths</span>
            <button onClick={() => { setEditingNode(null); setEditingPath('new'); }}
              className="p-1.5 bg-[#FF5500] text-white rounded-lg hover:bg-[#E64D00] transition-colors">
              <Plus size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {paths.map(p => {
              const active = selectedPath?.id === p.id;
              const editing = editingPath?.id === p.id;
              return (
                <div key={p.id}
                  onClick={() => { setSelectedPath(p); setEditingPath(null); setEditingNode(null); }}
                  className={`group p-3 rounded-2xl cursor-pointer transition-all border ${active ? 'border-[#FF5500] bg-orange-50' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'} ${editing ? 'ring-2 ring-[#FF5500]/40' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-bold leading-snug truncate ${active ? 'text-[#FF5500]' : 'text-gray-800'}`}>{p.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-snug">{p.description}</p>
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={ev => { ev.stopPropagation(); setEditingNode(null); setEditingPath(p); setSelectedPath(p); }}
                        className="p-1 text-gray-400 hover:text-blue-500 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={ev => { ev.stopPropagation(); handleDeletePath(p); }}
                        className="p-1 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-100 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {paths.length === 0 && !loading && (
              <div className="py-10 flex flex-col items-center gap-2 text-gray-300">
                <BookOpen size={28} />
                <p className="text-xs text-center">Chưa có path nào.<br />Nhấn + để tạo mới.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Col 2: Nodes ──────────────────────────────────── */}
        <div className={`bg-white rounded-[28px] ring-1 ring-black/5 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${editorVisible ? 'flex-1' : 'flex-1'}`}>
          {selectedPath ? (
            <>
              <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/60 shrink-0">
                <div>
                  <p className="text-xs text-gray-400 font-semibold flex items-center gap-1">
                    <span className="max-w-[160px] truncate">{selectedPath.title}</span>
                    <ChevronRight size={12} />
                    <span>Nodes</span>
                  </p>
                  <p className="text-[11px] text-gray-300 mt-0.5">{nodes.length} nodes</p>
                </div>
                <button onClick={() => { setEditingPath(null); setEditingNode('new'); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition-colors">
                  <Plus size={13} /> Add Node
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {nodes.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300">
                    <Trophy size={32} />
                    <p className="text-xs text-center">Chưa có node nào.<br />Nhấn &quot;Add Node&quot; để bắt đầu.</p>
                  </div>
                )}

                <div className="divide-y divide-gray-50">
                  {nodes.map(n => {
                    const isEditing = editingNode?.id === n.id;
                    return (
                      <div key={n.id}
                        className={`group flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition-colors cursor-pointer ${isEditing ? 'bg-orange-50/50' : ''}`}
                        onClick={() => { setEditingPath(null); setEditingNode(n); }}>

                        {/* Order badge */}
                        <span className="w-6 h-6 shrink-0 bg-gray-100 text-gray-500 text-xs font-bold rounded-full flex items-center justify-center">
                          {n.order_index}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate leading-snug ${isEditing ? 'text-[#FF5500]' : 'text-gray-800'}`}>{n.title}</p>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{n.description}</p>
                        </div>

                        {/* Type chip */}
                        <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold ${n.is_milestone ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                          {n.is_milestone ? '⚔️ Boss' : 'Trạm'}
                        </span>

                        {/* Actions */}
                        <div className="flex gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={ev => { ev.stopPropagation(); setEditingPath(null); setEditingNode(n); }}
                            className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={ev => { ev.stopPropagation(); handleDeleteNode(n); }}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-300 p-8 text-center">
              <ChevronRight size={36} />
              <p className="text-sm">Chọn một World từ cột trái<br />để quản lý Nodes.</p>
            </div>
          )}
        </div>

        {/* ── Col 3: Inline Editor ──────────────────────────── */}
        <div className={`bg-white rounded-[28px] ring-1 ring-black/5 shadow-sm flex-col overflow-hidden transition-all duration-300 ${editorVisible ? 'flex w-[380px] shrink-0' : 'hidden w-0'}`}>
          <div className="flex-1 overflow-y-auto p-5">
            {showPathEditor && (
              <PathEditor
                path={editingPath === 'new' ? null : editingPath}
                onSave={handleSavePath}
                onCancel={() => setEditingPath(null)}
                saving={saving}
              />
            )}
            {showNodeEditor && (
              <NodeEditor
                node={editingNode === 'new' ? null : editingNode}
                onSave={handleSaveNode}
                onCancel={() => setEditingNode(null)}
                saving={saving}
              />
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        .animate-fade-in-up { animation: fade-in-up 0.25s ease; }
      `}</style>
    </>
  );
}
