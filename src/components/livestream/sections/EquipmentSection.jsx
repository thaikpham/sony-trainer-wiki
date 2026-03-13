'use client';

import React from 'react';
import { ClipboardList, Settings, Printer, Plus, Trash2, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLiveStream } from '../LiveStreamContext';
import { updateLiveStreamEquipment } from '@/lib/supabaseClient';

export default function EquipmentSection() {
    const { 
        isEmployee, 
        equipmentList, 
        setEquipmentList, 
        isEditingEquipment, 
        setIsEditingEquipment,
        liveConfig
    } = useLiveStream();

    return (
        <div className="flex flex-col w-full animate-fade-in gap-6 print:m-0 print:p-0 print:gap-0 print:max-w-none print:bg-white">
            {/* Branded Print Header - chỉ hiện khi in */}
            <div className="hidden print:flex flex-col mb-4 items-start border-b-2 border-black pb-4 w-full print:bg-white">
                <div className="flex justify-between items-end w-full mb-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 bg-black rounded flex items-center justify-center text-white font-black text-[10px]">S</div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-black">Sony Wiki Studio</h2>
                        </div>
                        <h3 className="text-xl font-black text-black tracking-tight">Danh Sách Thiết Bị Cài Đặt Pre-Live</h3>
                        <p className="text-[8px] text-black mt-1 font-medium opacity-90">Kiểm soát tài sản · Chống trộm cắp · Trách nhiệm hư hỏng</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-black mb-0.5">Biểu mẫu kiểm kê</p>
                        <p className="text-sm font-bold text-black">{new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full mt-3 p-3 border border-black print:bg-white">
                    <div>
                        <span className="text-[8px] font-bold uppercase tracking-wide text-black block mb-0.5">Trạng thái hệ thống</span>
                        <span className="text-xs font-bold text-black">Sẵn sàng lên sóng</span>
                    </div>
                    <div>
                        <span className="text-[8px] font-bold uppercase tracking-wide text-black block mb-0.5">Chất lượng luồng</span>
                        <span className="text-xs font-bold text-black">1080p @ 30fps hoặc 60fps</span>
                    </div>
                    <div>
                        <span className="text-[8px] font-bold uppercase tracking-wide text-black block mb-0.5">Kỹ thuật viên</span>
                        <span className="text-xs font-bold text-black border-b border-black min-w-[120px] inline-block">.....................................</span>
                    </div>
                </div>
                <p className="text-[9px] text-black mt-2 w-full">
                    Đã kiểm tra: <strong>{equipmentList.filter(i => i.checked).length}</strong> / {equipmentList.length} thiết bị
                </p>
            </div>
            
            <div className="glass-panel p-6 sm:p-10 rounded-[40px] bg-white print:p-0 print:shadow-none print:border-none print:rounded-none print:bg-white">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-black/5 gap-4 print:hidden">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <ClipboardList size={28} className="text-teal-600" />
                            <div>
                                <h4 className="text-[22px] font-black text-[#1d1d1f] flex items-center gap-2">
                                    Chuẩn bị Thiết bị (Pre-Live)
                                </h4>
                                <p className="text-[13px] text-[#86868b] font-medium mt-1">Danh sách kiểm kê thiết bị phòng live.</p>
                            </div>
                        </div>
                        <p className="text-[12px] text-slate-500 font-medium max-w-2xl">
                            <strong className="text-[#1d1d1f]">Mục đích:</strong> Kiểm soát và quản lý tài sản phòng live — tránh trộm cắp, xác định trách nhiệm khi hư hỏng. Tick từng thiết bị đã kiểm, ký tên kỹ thuật viên, in lưu trữ hoặc đối chiếu sau buổi live.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 print:hidden">
                        {isEmployee && (
                            <button
                                onClick={() => setIsEditingEquipment(!isEditingEquipment)}
                                className={`px-4 py-2 rounded-xl font-bold text-[13px] transition-all flex items-center gap-2 ${isEditingEquipment ? 'bg-teal-500 text-white shadow-md' : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-slate-200'}`}
                            >
                                <Settings size={16} />
                                {isEditingEquipment ? 'Đang chỉnh sửa' : 'Chỉnh sửa'}
                            </button>
                        )}
                        <div className="flex flex-col items-end gap-1">
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 rounded-xl bg-[#1d1d1f] text-white font-bold text-[13px] hover:bg-black/80 transition-all flex items-center gap-2 shadow-md"
                            >
                                <Printer size={16} /> In PDF
                            </button>
                            <p className="text-[11px] text-slate-500 font-medium">In 2 bản: 1 trước live (ký) · 1 sau live (đối chiếu + ký)</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto w-full custom-scrollbar pb-4 print:overflow-visible print:pb-0">
                    <table className="w-full text-left border-collapse min-w-[900px] print:min-w-0 print:w-full print:text-[11px] print:leading-tight print:table-fixed">
                        <thead className="print:table-header-group">
                            <tr className="bg-[#F5F5F7] text-[#86868b] text-[12px] uppercase tracking-wider font-bold print:bg-white print:text-black print:border-b-2 print:border-black print:text-[9px]">
                                <th className="p-3 border-b border-r border-slate-200 rounded-tl-xl w-[50px] text-center print:border print:border-black print:bg-white print:rounded-none print:w-[8%] print:px-1 print:py-1.5">No.</th>
                                <th className="p-3 border-b border-r border-slate-200 w-[180px] print:border print:border-black print:bg-white print:w-[14%] print:px-1 print:py-1.5">Group</th>
                                <th className="p-3 border-b border-r border-slate-200 w-[120px] print:border print:border-black print:bg-white print:w-[10%] print:px-1 print:py-1.5">Brand</th>
                                <th className="p-3 border-b border-r border-slate-200 min-w-[200px] print:border print:border-black print:bg-white print:w-[18%] print:px-1 print:py-1.5">Gear list</th>
                                <th className="p-3 border-b border-r border-slate-200 w-[80px] text-center print:border print:border-black print:bg-white print:w-[6%] print:px-1 print:py-1.5">Qty</th>
                                <th className="p-3 border-b border-r border-slate-200 w-[120px] print:border print:border-black print:bg-white print:w-[12%] print:px-1 print:py-1.5">Serial</th>
                                <th className="p-3 border-b border-r border-slate-200 w-[100px] text-center print:border print:border-black print:bg-white print:w-[8%] print:px-1 print:py-1.5">Source</th>
                                <th className="p-3 border-b border-r border-slate-200 w-[100px] text-center print:border print:border-black print:bg-white print:w-[8%] print:px-1 print:py-1.5">Status</th>
                                {!isEditingEquipment && <th className="p-3 border-b border-l border-slate-200 w-[80px] text-center rounded-tr-xl print:table-cell print:border print:border-black print:bg-white print:rounded-none print:w-[8%] print:px-1 print:py-1.5">Đã KT</th>}
                                {isEditingEquipment && <th className="p-3 border-b border-l border-slate-200 w-[60px] text-center rounded-tr-xl print:hidden">Xóa</th>}
                            </tr>
                        </thead>
                        <tbody className="text-[13px] text-[#1d1d1f] align-middle print:text-[9px]">
                            {/* Web View Rows */}
                            {equipmentList.map((item, index) => (
                                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors print:hidden">
                                    <td className="p-3 border-r border-slate-100 text-center font-bold text-[#86868b]">{index + 1}</td>
                                    
                                    {/* Group */}
                                    <td className="p-3 border-r border-slate-100">
                                        {isEditingEquipment ? 
                                            <input type="text" value={item.group || ''} onChange={(e) => {
                                                const newList = [...equipmentList];
                                                newList[index].group = e.target.value;
                                                setEquipmentList(newList);
                                            }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500" />
                                        : <span className="font-semibold text-indigo-600">{item.group}</span>}
                                    </td>

                                    {/* Brand */}
                                    <td className="p-3 border-r border-slate-100">
                                        {isEditingEquipment ? 
                                            <input type="text" value={item.brand || ''} onChange={(e) => {
                                                const newList = [...equipmentList];
                                                newList[index].brand = e.target.value;
                                                setEquipmentList(newList);
                                            }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500" />
                                        : item.brand}
                                    </td>

                                    {/* Gear list */}
                                    <td className="p-3 border-r border-slate-100 font-bold">
                                        {isEditingEquipment ? 
                                            <input type="text" value={item.gearList || ''} onChange={(e) => {
                                                const newList = [...equipmentList];
                                                newList[index].gearList = e.target.value;
                                                setEquipmentList(newList);
                                            }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500" />
                                        : item.gearList}
                                    </td>

                                    {/* Quantity */}
                                    <td className="p-3 border-r border-slate-100 text-center">
                                        {isEditingEquipment ? 
                                            <input type="number" value={item.quantity || ''} onChange={(e) => {
                                                const newList = [...equipmentList];
                                                newList[index].quantity = e.target.value;
                                                setEquipmentList(newList);
                                            }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500 text-center" />
                                        : <span className="inline-block bg-slate-100 px-2.5 py-0.5 rounded-lg font-black text-slate-700">{item.quantity}</span>}
                                    </td>

                                    {/* Serial number */}
                                    <td className="p-3 border-r border-slate-100">
                                        {isEditingEquipment ? 
                                            <input type="text" value={item.serialNumber || ''} onChange={(e) => {
                                                const newList = [...equipmentList];
                                                newList[index].serialNumber = e.target.value;
                                                setEquipmentList(newList);
                                            }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500 text-xs font-mono" />
                                        : <span className="text-xs font-mono text-slate-500">{item.serialNumber}</span>}
                                    </td>

                                    {/* Source */}
                                    <td className="p-3 border-r border-slate-100 text-center">
                                        {isEditingEquipment ? 
                                            <input type="text" value={item.source || ''} onChange={(e) => {
                                                const newList = [...equipmentList];
                                                newList[index].source = e.target.value;
                                                setEquipmentList(newList);
                                            }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500 text-center" />
                                        : item.source}
                                    </td>

                                    {/* Status */}
                                    <td className="p-3 border-r border-slate-100 text-center">
                                        {isEditingEquipment ? 
                                            <input type="text" value={item.status || ''} onChange={(e) => {
                                                const newList = [...equipmentList];
                                                newList[index].status = e.target.value;
                                                setEquipmentList(newList);
                                            }} className="w-full bg-white border border-slate-200 rounded px-2 py-1 outline-none focus:border-teal-500 text-center" />
                                        : <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-bold ${item.status?.toLowerCase() === 'good' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {item.status || '-'}
                                            </span>
                                        }
                                    </td>

                                    {!isEditingEquipment && (
                                        <td className="p-3 border-slate-100 text-center">
                                            <div className="flex items-center justify-center">
                                                <div 
                                                    className={`w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center cursor-pointer transition-colors ${item.checked ? 'bg-teal-600 border-teal-600' : 'hover:border-teal-400'}`}
                                                    onClick={() => {
                                                        const newList = [...equipmentList];
                                                        newList[index].checked = !newList[index].checked;
                                                        setEquipmentList(newList);
                                                    }}
                                                >
                                                    {item.checked && <Check size={14} className="text-white" />}
                                                </div>
                                            </div>
                                        </td>
                                    )}

                                    {isEditingEquipment && (
                                        <td className="p-3 border-l border-slate-100 text-center">
                                            <button 
                                                onClick={() => {
                                                    const newList = equipmentList.filter((_, i) => i !== index);
                                                    setEquipmentList(newList);
                                                }}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {/* Print: toàn bộ thiết bị, cột "Đã KT" = ✓ nếu đã check */}
                            {equipmentList.map((item, pIndex) => (
                                <tr key={`print-${item.id}`} className="hidden print:table-row border-b border-gray-300 print:break-inside-avoid">
                                    <td className="p-1.5 border border-black print:bg-white text-center font-bold text-black">{pIndex + 1}</td>
                                    <td className="p-1.5 border border-black print:bg-white font-semibold text-black">{item.group}</td>
                                    <td className="p-1.5 border border-black print:bg-white text-black">{item.brand}</td>
                                    <td className="p-1.5 border border-black print:bg-white font-bold text-black">{item.gearList}</td>
                                    <td className="p-1.5 border border-black print:bg-white text-center text-black">{item.quantity ?? '-'}</td>
                                    <td className="p-1.5 border border-black print:bg-white font-mono text-[8px] text-black">{item.serialNumber || '-'}</td>
                                    <td className="p-1.5 border border-black print:bg-white text-center text-black">{item.source || '-'}</td>
                                    <td className="p-1.5 border border-black print:bg-white text-center text-black">{item.status || '-'}</td>
                                    <td className="p-1.5 border border-black text-center print:bg-white">
                                        {item.checked ? <span className="font-bold text-black">✓</span> : <span className="text-black">—</span>}
                                    </td>
                                </tr>
                            ))}
                            {equipmentList.length === 0 && (
                                <tr className="hidden print:table-row">
                                    <td colSpan="9" className="p-4 text-center text-black italic border border-black print:bg-white">
                                        Chưa có thiết bị trong danh sách.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {isEditingEquipment && (
                    <div className="mt-4 flex gap-3 print:hidden border-t border-slate-100 pt-4">
                        <button
                            onClick={() => {
                                setEquipmentList([...equipmentList, {
                                    id: Date.now(), group: '', brand: '', gearList: '', quantity: 1, serialNumber: '', source: '', status: 'Good', checked: false
                                }]);
                            }}
                            className="px-4 py-2 rounded-xl bg-teal-50 text-teal-600 font-bold text-[13px] hover:bg-teal-100 transition-colors flex items-center gap-2"
                        >
                            <Plus size={16} /> Thêm Dòng
                        </button>
                        <button
                            onClick={async () => {
                                try {
                                    await updateLiveStreamEquipment(equipmentList);
                                    alert('Lưu danh sách thiết bị thành công!');
                                    setIsEditingEquipment(false);
                                } catch (err) {
                                    alert('Lỗi khi lưu: ' + err.message);
                                }
                            }}
                            className="px-6 py-2 rounded-xl bg-teal-600 text-white font-bold text-[13px] hover:bg-teal-700 transition-colors ml-auto shadow-md"
                        >
                            Lưu Thay Đổi
                        </button>
                    </div>
                )}
                {/* Không in thông số máy ảnh và Picture Profile — chỉ in danh sách thiết bị */}
            </div>
            
            <div className="flex justify-end mt-8 print:hidden">
                <Link
                    href="/livestream/connection"
                    className="px-6 py-3 rounded-xl bg-[#1d1d1f] text-white font-bold text-[14px] flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                    Tiếp tục <ChevronRight size={16} />
                </Link>
            </div>
        </div>
    );
}
