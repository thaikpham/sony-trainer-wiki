'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, X, Save, RefreshCw } from 'lucide-react';
import { getAcademyPathsAction, getAcademyNodesAction, upsertAcademyPathAction, deleteAcademyPathAction, upsertAcademyNodeAction, deleteAcademyNodeAction } from '@/app/admin/academyActions';

export default function AdminAcademyPanel() {
  const [paths, setPaths] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [pathModal, setPathModal] = useState(null); // null, 'new', or path object
  const [nodeModal, setNodeModal] = useState(null); // null, 'new', or node object

  const loadPaths = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAcademyPathsAction();
      setPaths(data);
      if (data.length > 0 && !selectedPath) {
        setSelectedPath(data[0]);
      }
    } catch (e) {
      alert('Error loading paths: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPath]);

  const loadNodes = useCallback(async (pathId) => {
    setLoading(true);
    try {
      const data = await getAcademyNodesAction(pathId);
      setNodes(data);
    } catch (e) {
      alert('Error loading nodes: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaths();
  }, [loadPaths]);

  useEffect(() => {
    if (selectedPath) {
      loadNodes(selectedPath.id);
    }
  }, [selectedPath, loadNodes]);

  const handleSavePath = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target);
    const pathData = {
      title: formData.get('title'),
      description: formData.get('description'),
      theme_color: formData.get('theme_color'),
      order_index: parseInt(formData.get('order_index') || 0)
    };
    if (pathModal.id) pathData.id = pathModal.id;

    try {
      await upsertAcademyPathAction(pathData);
      setPathModal(null);
      await loadPaths();
    } catch (err) {
      alert('Error saving path: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePath = async (id) => {
    if (!window.confirm('Are you sure you want to delete this path and all its nodes?')) return;
    try {
      await deleteAcademyPathAction(id);
      if (selectedPath?.id === id) setSelectedPath(null);
      await loadPaths();
    } catch (e) {
      alert('Error deleting path: ' + e.message);
    }
  };

  const handleSaveNode = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target);
    
    // Parse quiz questions
    const quiz_questions = [];
    for (let i = 0; i < 5; i++) {
      const q = formData.get(`q_${i}_text`);
      if (q) {
        quiz_questions.push({
          question: q,
          options: [
            formData.get(`q_${i}_opt_0`),
            formData.get(`q_${i}_opt_1`),
            formData.get(`q_${i}_opt_2`),
            formData.get(`q_${i}_opt_3`)
          ],
          correctIndex: parseInt(formData.get(`q_${i}_correct`))
        });
      }
    }

    const nodeData = {
      path_id: selectedPath.id,
      title: formData.get('title'),
      description: formData.get('description'),
      content: formData.get('content'),
      is_milestone: formData.get('is_milestone') === 'on',
      required_badge_id: formData.get('required_badge_id') || null,
      order_index: parseInt(formData.get('order_index') || 0),
      quiz_questions
    };
    if (nodeModal.id) nodeData.id = nodeModal.id;

    try {
      await upsertAcademyNodeAction(nodeData);
      setNodeModal(null);
      await loadNodes(selectedPath.id);
    } catch (err) {
      alert('Error saving node: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm('Are you sure you want to delete this node?')) return;
    try {
      await deleteAcademyNodeAction(id);
      await loadNodes(selectedPath.id);
    } catch (e) {
      alert('Error deleting node: ' + e.message);
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">
      
      {/* Paths Sidebar */}
      <div className="w-1/3 bg-white rounded-[32px] ring-1 ring-black/5 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-800">Learning Paths</h2>
          <button onClick={() => setPathModal('new')} className="p-2 bg-[#FF5500] text-white rounded-xl hover:bg-[#E64D00] transition-colors">
            <Plus size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {paths.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedPath(p)}
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedPath?.id === p.id ? 'border-[#FF5500] bg-orange-50' : 'border-gray-100 hover:border-gray-300'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-bold ${selectedPath?.id === p.id ? 'text-[#FF5500]' : 'text-gray-800'}`}>{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                   <button onClick={(e) => { e.stopPropagation(); setPathModal(p); }} className="p-1.5 text-gray-400 hover:text-blue-500 bg-white rounded-lg shadow-sm border border-gray-100">
                     <Edit2 size={14} />
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); handleDeletePath(p.id); }} className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-100">
                     <Trash2 size={14} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nodes Area */}
      <div className="flex-1 bg-white rounded-[32px] ring-1 ring-black/5 shadow-sm overflow-hidden flex flex-col">
          {selectedPath ? (
             <>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                     <h2 className="font-bold text-gray-800 flex items-center gap-2">
                        {selectedPath.title} <ChevronRight size={16} className="text-gray-400" /> Nodes
                     </h2>
                     <p className="text-xs text-gray-500 mt-0.5">{nodes.length} nodes found</p>
                  </div>
                  <button onClick={() => setNodeModal('new')} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-sm">
                    <Plus size={16} /> Add Node
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100">
                            <th className="pb-3 px-2 font-semibold">Order</th>
                            <th className="pb-3 px-2 font-semibold">Title</th>
                            <th className="pb-3 px-2 font-semibold">Type</th>
                            <th className="pb-3 px-2 font-semibold text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="text-sm">
                         {nodes.map(n => (
                            <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                               <td className="py-4 px-2 text-gray-500 font-medium">{n.order_index}</td>
                               <td className="py-4 px-2 font-bold text-gray-800">{n.title}</td>
                               <td className="py-4 px-2">
                                  {n.is_milestone 
                                    ? <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold">Milestone</span> 
                                    : <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold">Standard</span>}
                               </td>
                               <td className="py-4 px-2 text-right">
                                  <div className="flex justify-end gap-2">
                                     <button onClick={() => setNodeModal(n)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                       <Edit2 size={16} />
                                     </button>
                                     <button onClick={() => handleDeleteNode(n.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                       <Trash2 size={16} />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                         {nodes.length === 0 && (
                            <tr>
                               <td colSpan="4" className="py-12 text-center text-gray-400">No nodes added yet.</td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <ChevronRight size={32} />
                </div>
                <p>Select a learning path from the left<br/>to manage its nodes.</p>
             </div>
          )}
      </div>

      {/* Path Modal */}
      {pathModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">{pathModal === 'new' ? 'New Path' : 'Edit Path'}</h3>
              <button onClick={() => setPathModal(null)} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSavePath} className="p-5 overflow-y-auto space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Title</label>
                  <input name="title" required defaultValue={pathModal.title || ''} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all" />
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea name="description" rows={3} defaultValue={pathModal.description || ''} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm custom-scrollbar focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all" />
               </div>
               <div className="flex gap-4">
                  <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Theme Color</label>
                     <input name="theme_color" type="color" defaultValue={pathModal.theme_color || '#FF5500'} className="w-full h-12 rounded-xl cursor-pointer" />
                  </div>
                  <div className="flex-1">
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Order Index</label>
                     <input name="order_index" type="number" required defaultValue={pathModal.order_index || 0} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all" />
                  </div>
               </div>
               <div className="pt-4 border-t border-gray-100">
                  <button type="submit" disabled={saving} className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-2">
                     {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} Save Path
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Node Modal */}
      {nodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 shrink-0">
              <h3 className="text-xl font-bold text-gray-900">{nodeModal === 'new' ? 'New Node' : 'Edit Node'}</h3>
              <button type="button" onClick={() => setNodeModal(null)} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100"><X size={18} /></button>
            </div>
            
            <form id="nodeForm" onSubmit={handleSaveNode} className="flex-1 overflow-y-auto custom-scrollbar p-6">
               <div className="grid grid-cols-2 gap-8">
                  {/* Left Col: Basics */}
                  <div className="space-y-4">
                     <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2">Basic Info</h4>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Title</label>
                        <input name="title" required defaultValue={nodeModal.title || ''} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description & Hint</label>
                        <textarea name="description" rows={2} required defaultValue={nodeModal.description || ''} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm custom-scrollbar focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Content (Markdown/HTML)</label>
                        <textarea name="content" rows={6} required defaultValue={nodeModal.content || ''} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-xs custom-scrollbar focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all" />
                     </div>
                     <div className="flex gap-4">
                        <div className="flex-1">
                           <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Order Index</label>
                           <input name="order_index" type="number" required defaultValue={nodeModal.order_index || 0} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all" />
                        </div>
                        <div className="flex-1 flex flex-col justify-end pb-3">
                           <label className="flex items-center gap-2 cursor-pointer">
                              <input name="is_milestone" type="checkbox" defaultChecked={nodeModal.is_milestone} className="w-5 h-5 rounded text-[#FF5500] focus:ring-[#FF5500]" />
                              <span className="text-sm font-bold text-gray-700">Is Milestone Node?</span>
                           </label>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Required Badge ID (Optional)</label>
                        <input name="required_badge_id" defaultValue={nodeModal.required_badge_id || ''} placeholder="e.g. badge-1" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all" />
                     </div>
                  </div>

                  {/* Right Col: Quiz */}
                  <div className="space-y-6">
                     <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 flex justify-between items-center">
                        Quiz Config <span className="text-xs bg-orange-100 text-orange-600 px-2 rounded-md py-0.5">5 Questions Required</span>
                     </h4>
                     
                     <div className="space-y-8 pr-2">
                        {[0,1,2,3,4].map(qIdx => {
                           const q = nodeModal.quiz_questions?.[qIdx] || {};
                           return (
                              <div key={qIdx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl relative">
                                 <span className="absolute -top-3 -left-3 w-6 h-6 bg-gray-900 text-white flex items-center justify-center rounded-full text-xs font-bold shadow-md">Q{qIdx+1}</span>
                                 <input name={`q_${qIdx}_text`} placeholder={`Question ${qIdx+1} Text`} defaultValue={q.question || ''} className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 font-semibold focus:outline-none focus:ring-1 focus:ring-[#FF5500]" required />
                                 <div className="grid grid-cols-2 gap-2 text-xs">
                                    {[0,1,2,3].map(optIdx => (
                                       <div key={optIdx} className="flex items-center gap-2 bg-white border border-gray-100 rounded-md p-1 pl-2">
                                          <input type="radio" name={`q_${qIdx}_correct`} value={optIdx} defaultChecked={q.correctIndex === optIdx || (optIdx===0 && q.correctIndex===undefined)} required className="text-green-500 focus:ring-green-500" />
                                          <input name={`q_${qIdx}_opt_${optIdx}`} placeholder={`Option ${optIdx+1}`} defaultValue={q.options?.[optIdx] || ''} className="w-full focus:outline-none bg-transparent" required />
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </form>
            
            <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-end gap-3 rounded-b-3xl">
               <button type="button" onClick={() => setNodeModal(null)} className="px-6 py-3 bg-white text-gray-600 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">Cancel</button>
               <button form="nodeForm" type="submit" disabled={saving} className="px-8 py-3 bg-[#FF5500] text-white font-bold rounded-xl hover:bg-[#E64D00] transition-colors shadow-lg flex items-center justify-center gap-2">
                  {saving && <RefreshCw className="animate-spin" size={18} />} Save Node
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
