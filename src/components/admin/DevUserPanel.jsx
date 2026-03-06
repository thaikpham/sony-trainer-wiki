'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Users, Tag, Plus, X, Loader2, ChevronRight, Shield, Trash2, AlertTriangle, Briefcase, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { ROLES } from '@/lib/roles';
import { useRoleAccess, DEFAULT_PERMISSIONS } from '@/components/RoleProvider';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// -------- Helpers --------
const CORE_ROLES = Object.entries(ROLES).filter(([, v]) => v.category === 'core').map(([k, v]) => ({ key: k, ...v }));
const ACHIEVEMENT_BADGES = Object.entries(ROLES).filter(([, v]) => v.category === 'achievement').map(([k, v]) => ({ key: k, ...v }));

function RoleChip({ roleKey, size = 'sm', onRemove }) {
    const r = ROLES[roleKey];
    if (!r) return null;
    const sz = size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]';
    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-bold bg-gradient-to-r ${r.gradient} ${r.textColor} ${sz}`}>
            <span>{r.emoji}</span>
            <span>{r.short}</span>
            {onRemove && (
                <button type="button" onClick={() => onRemove(roleKey)} className="ml-0.5 opacity-70 hover:opacity-100">
                    <X size={9} />
                </button>
            )}
        </span>
    );
}

function MultiRoleSelect({ value = [], onChange, options, placeholder }) {
    const [query, setQuery] = useState('');
    const filtered = options.filter(o => !value.includes(o.key) && (o.label.toLowerCase().includes(query.toLowerCase()) || o.key.toLowerCase().includes(query.toLowerCase())));
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {value.map(k => (
                    <RoleChip key={k} roleKey={k} size="sm" onRemove={k => onChange(value.filter(v => v !== k))} />
                ))}
            </div>
            <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-[12px] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
            />
            {query && filtered.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {filtered.map(o => (
                        <button
                            key={o.key}
                            type="button"
                            onClick={() => { onChange([...value, o.key]); setQuery(''); }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r ${o.gradient} ${o.textColor} opacity-80 hover:opacity-100 transition-opacity`}
                        >
                            {o.emoji} {o.short}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// -------- User Row --------
function UserRow({ user, onEdit }) {
    const roles = user.overrideRoles ?? user.staticRoles;
    const badges = user.overrideBadges ?? [];
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    return (
        <button
            onClick={() => onEdit(user)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-black/[0.03] transition-colors text-left group"
        >
            <Image
                src={user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`}
                alt={name}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full flex-shrink-0 ring-2 ring-black/5"
                unoptimized
            />
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#1d1d1f] truncate">{name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-1 justify-end max-w-[240px]">
                {roles.filter(k => k !== 'USER').map(k => <RoleChip key={k} roleKey={k} size="xs" />)}
                {badges.slice(0, 2).map(k => <RoleChip key={k} roleKey={k} size="xs" />)}
                {badges.length > 2 && <span className="text-[10px] text-slate-400 self-center">+{badges.length - 2}</span>}
            </div>
            {user.hasOverride && (
                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500" title="Has override" />
            )}
            <ChevronRight size={14} className="text-slate-300 flex-shrink-0 group-hover:text-slate-500 transition-colors" />
        </button>
    );
}

// -------- Edit Modal --------
function EditModal({ user, onSave, onDelete, onClose, saving }) {
    const initRoles = user.overrideRoles ?? user.staticRoles.filter(r => r !== 'USER');
    const initBadges = user.overrideBadges ?? [];
    const [roles, setRoles] = useState(initRoles);
    const [badges, setBadges] = useState(initBadges);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-black/[0.07] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-black/[0.06]">
                    <Image
                        src={user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`}
                        alt={name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full ring-2 ring-black/5"
                        unoptimized
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-[#1d1d1f] truncate">{name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-slate-500">
                        <X size={14} />
                    </button>
                </div>

                {/* Source */}
                <div className="px-6 py-3 bg-slate-50 border-b border-black/[0.04]">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Shield size={11} />
                        <span>Static roles (ROLE_EMAIL_MAP):</span>
                        <div className="flex gap-1">
                            {user.staticRoles.map(k => <RoleChip key={k} roleKey={k} size="xs" />)}
                        </div>
                    </div>
                    {user.hasOverride && (
                        <p className="text-[10px] text-violet-500 mt-0.5">⚡ Override đang active — sẽ ghi đè static roles khi user đăng nhập</p>
                    )}
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Core Roles */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Core Roles (Override)</label>
                        <MultiRoleSelect
                            value={roles}
                            onChange={setRoles}
                            options={CORE_ROLES}
                            placeholder="Tìm role để thêm..."
                        />
                    </div>

                    {/* Achievement Badges */}
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Achievement Badges</label>
                        <MultiRoleSelect
                            value={badges}
                            onChange={setBadges}
                            options={ACHIEVEMENT_BADGES}
                            placeholder="Tìm badge để thêm..."
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-black/[0.06]">
                    {user.hasOverride ? (
                        deleteConfirm ? (
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-rose-600 font-semibold">Xóa override?</span>
                                <button onClick={() => onDelete(user.email)} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-bold">Xóa</button>
                                <button onClick={() => setDeleteConfirm(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold">Hủy</button>
                            </div>
                        ) : (
                            <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-500 hover:text-rose-700 transition-colors">
                                <Trash2 size={13} /> Xóa override
                            </button>
                        )
                    ) : <div />}
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-500 hover:bg-black/5 transition-colors">Hủy</button>
                        <button
                            onClick={() => onSave(user.email, roles, badges)}
                            disabled={saving}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 text-white text-[13px] font-bold hover:bg-violet-700 disabled:opacity-50 transition-all"
                        >
                            {saving && <Loader2 size={13} className="animate-spin" />}
                            Lưu Override
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// -------- Add Override Form --------
function AddOverrideForm({ onSave, saving }) {
    const [rawEmails, setRawEmails] = useState('');
    const [roles, setRoles] = useState([]);
    const [badges, setBadges] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!rawEmails.trim()) return;
        const emailList = rawEmails.split(/[\n,]+/).map(e => e.trim()).filter(e => e.length > 0 && e.includes('@'));
        if (emailList.length === 0) {
            alert("Vui lòng nhập email hợp lệ!");
            return;
        }
        onSave(emailList, roles, badges);
        setRawEmails(''); setRoles([]); setBadges([]);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-black/[0.06]">
            <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email người dùng (Có thể dán nhiều email cách nhau bằng dấu phẩy hoặc enter)</label>
                <textarea
                    required
                    value={rawEmails}
                    onChange={e => setRawEmails(e.target.value)}
                    placeholder="user1@example.com&#10;user2@example.com"
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/40 custom-scrollbar resize-y"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Core Roles</label>
                    <MultiRoleSelect value={roles} onChange={setRoles} options={CORE_ROLES} placeholder="Tìm role..." />
                </div>
                <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Achievement Badges</label>
                    <MultiRoleSelect value={badges} onChange={setBadges} options={ACHIEVEMENT_BADGES} placeholder="Tìm badge..." />
                </div>
            </div>
            <button
                type="submit"
                disabled={saving || !rawEmails}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1d1d1f] text-white text-[13px] font-bold hover:opacity-90 disabled:opacity-40 transition-all"
            >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                Thêm Override
            </button>
        </form>
    );
}

// -------- Roles Catalog --------
function RolesCatalog() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-3">Core Roles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CORE_ROLES.map(r => (
                        <div key={r.key} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-black/[0.05]">
                            <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.gradient} flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>{r.emoji}</span>
                            <div className="min-w-0">
                                <p className="text-[13px] font-bold text-[#1d1d1f]">{r.label} <span className="text-[10px] font-normal text-slate-400">({r.key})</span></p>
                                <p className="text-[11px] text-slate-400 truncate">{r.description}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${r.rarity === 'Legendary' ? 'bg-amber-100 text-amber-700' : r.rarity === 'Epic' ? 'bg-purple-100 text-purple-700' : r.rarity === 'Rare' ? 'bg-blue-100 text-blue-700' : r.rarity === 'Uncommon' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{r.rarity}</span>
                                    {r.adminAccess && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700">Admin</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-500 mb-3">Achievement Badges ({ACHIEVEMENT_BADGES.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {ACHIEVEMENT_BADGES.map(r => (
                        <div key={r.key} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-black/[0.04]">
                            <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${r.gradient} flex items-center justify-center text-base flex-shrink-0`}>{r.emoji}</span>
                            <div className="min-w-0">
                                <p className="text-[12px] font-bold text-[#1d1d1f] truncate">{r.label}</p>
                                <p className="text-[10px] text-slate-400">{r.short} · {r.rarity}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const ROLES_ORDER = ['DEV', 'TRAINER', 'PRODUCT_MARKETING', 'DATA', 'SALESMAN', 'PROMOTER', 'USER'];

function RolePermissionsMatrix({ matrix, matrixLoading }) {
    if (matrixLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-slate-400" /></div>;

    const handleToggle = async (roleKey, permissionKey, currentValue) => {
        try {
            const updatedMatrix = { ...matrix };
            if (!updatedMatrix[roleKey]) {
                updatedMatrix[roleKey] = { ...DEFAULT_PERMISSIONS[roleKey] };
            }
            updatedMatrix[roleKey][permissionKey] = !currentValue;

            await setDoc(doc(db, 'settings', 'rolesConfig'), updatedMatrix);
        } catch (e) {
            console.error("Failed to update matrix", e);
            alert("Lỗi khi cập nhật quyền.");
        }
    };

    return (
        <div className="bg-white rounded-[28px] ring-1 ring-black/5 shadow-sm overflow-hidden animate-fade-in mx-2 max-w-full">
            <div className="p-6 border-b border-black/[0.03] bg-slate-50/50">
                <h3 className="text-[16px] font-black text-[#1d1d1f] flex items-center gap-2 tracking-tight">
                    <ShieldCheck size={20} className="text-indigo-500" />
                    Ma Trận Phân Quyền (Roles Matrix)
                </h3>
                <p className="text-[13px] text-slate-500 font-bold mt-1 max-w-2xl">Bật tắt quyền truy cập cốt lõi của từng Role Group. Thay đổi này tự động đồng bộ ngay lập tức với toàn bộ người dùng mang Role tương ứng.</p>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-black/[0.03]">
                            <th className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Role Group</th>
                            <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-[#1d1d1f] text-center" title="Quyền truy cập Admin/Dev UI">Admin Access</th>
                            <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-[#1d1d1f] text-center" title="Chỉnh sửa dữ liệu máy ảnh">Manage Data</th>
                            <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-red-600 text-center" title="Quyền Xóa hạng mục">Delete Data</th>
                            <th className="px-4 py-4 text-[11px] font-black uppercase tracking-widest text-[#1d1d1f] text-center" title="Xem báo cáo Livestream">Live Report</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/[0.03]">
                        {ROLES_ORDER.map(role => {
                            const perms = matrix?.[role] || DEFAULT_PERMISSIONS[role] || {};
                            const r = ROLES[role];
                            return (
                                <tr key={role} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[14px] font-black text-[#1d1d1f] tracking-tight">{role}</span>
                                            {r && <span className="text-[16px]">{r.emoji}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <input type="checkbox" checked={perms.adminAccess || false} onChange={() => handleToggle(role, 'adminAccess', perms.adminAccess)} className="w-5 h-5 accent-indigo-500 cursor-pointer rounded-md border-black/10 focus:ring-0 transition-all hover:scale-110" />
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <input type="checkbox" checked={perms.canManageData || false} onChange={() => handleToggle(role, 'canManageData', perms.canManageData)} className="w-5 h-5 accent-indigo-500 cursor-pointer rounded-md border-black/10 focus:ring-0 transition-all hover:scale-110" />
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <input type="checkbox" checked={perms.canDeleteData || false} onChange={() => handleToggle(role, 'canDeleteData', perms.canDeleteData)} className="w-5 h-5 accent-red-500 cursor-pointer rounded-md border-black/10 focus:ring-0 transition-all hover:scale-110" />
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <input type="checkbox" checked={perms.canViewLiveReport || false} onChange={() => handleToggle(role, 'canViewLiveReport', perms.canViewLiveReport)} className="w-5 h-5 accent-indigo-500 cursor-pointer rounded-md border-black/10 focus:ring-0 transition-all hover:scale-110" />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// -------- Main Panel --------
export default function DevUserPanel() {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [toast, setToast] = useState(null);

    const { matrix, loading: matrixLoading } = useRoleAccess();

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/dev/users');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setUsers(data.users ?? []);
        } catch (e) {
            showToast('error', 'Không tải được danh sách: ' + e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleSave = async (emails, roles, badges) => {
        setSaving(true);
        try {
            const res = await fetch('/api/dev/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emails: Array.isArray(emails) ? emails : [emails],
                    roles,
                    badges
                }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const count = Array.isArray(emails) ? data.count || emails.length : 1;
            showToast('success', `✅ Đã lưu override cho ${count} người dùng`);
            setEditingUser(null);
            await loadUsers();
        } catch (e) {
            showToast('error', '❌ Lỗi: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (email) => {
        setSaving(true);
        try {
            const res = await fetch('/api/dev/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            showToast('success', `🗑 Đã xóa override cho ${email}`);
            setEditingUser(null);
            await loadUsers();
        } catch (e) {
            showToast('error', '❌ Lỗi: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(u =>
        !searchQuery ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        [u.firstName, u.lastName].filter(Boolean).join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const staffUsers = filteredUsers.filter(u => {
        const roles = u.overrideRoles ?? u.staticRoles;
        return roles.some(r => r !== 'USER');
    });

    const memberUsers = filteredUsers.filter(u => {
        const roles = u.overrideRoles ?? u.staticRoles;
        return roles.every(r => r === 'USER') || roles.length === 0;
    });

    const overrideCount = users.filter(u => u.hasOverride).length;

    const TAB_STYLE = (active) => `px-4 py-2 rounded-xl text-[12px] font-black transition-all ${active
        ? 'bg-white text-[#1d1d1f] shadow-sm ring-1 ring-black/5'
        : 'text-[#86868b] hover:text-[#1d1d1f]'}`;

    return (
        <div className="flex flex-col h-full p-6 gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0 bg-white p-4 rounded-[32px] ring-1 ring-black/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <Shield size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-[18px] font-black text-[#1d1d1f] tracking-tight">Dev User Panel</h1>
                        <p className="text-[12px] text-slate-500 font-medium">
                            {users.length} users · {overrideCount} overrides active ⚡
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center bg-[#F5F5F7] p-1 rounded-2xl ring-1 ring-black/5 ml-auto sm:ml-0">
                    <button onClick={() => setActiveTab('users')} className={TAB_STYLE(activeTab === 'users')}>
                        <Users size={12} className="inline mr-1" />Users
                    </button>
                    <button onClick={() => setActiveTab('permissions')} className={TAB_STYLE(activeTab === 'permissions')}>
                        <ShieldCheck size={12} className="inline mr-1" />Phân Quyền
                    </button>
                    <button onClick={() => setActiveTab('catalog')} className={TAB_STYLE(activeTab === 'catalog')}>
                        <Tag size={12} className="inline mr-1" />Roles & Badges
                    </button>
                    <button onClick={() => setActiveTab('add')} className={TAB_STYLE(activeTab === 'add')}>
                        <Plus size={12} className="inline mr-1" />Add Override
                    </button>
                    <div className="w-px h-4 bg-black/10 mx-1" />
                    <button onClick={loadUsers} disabled={loading} className="p-2 rounded-xl text-slate-500 hover:bg-black/5 transition-colors disabled:opacity-40">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                {activeTab === 'users' && (
                    <div className="flex flex-col gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Tìm theo tên hoặc email..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-black/8 bg-white text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/40 shadow-sm"
                            />
                        </div>

                        {/* Users list: 2 Columns */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 size={28} className="animate-spin text-slate-400" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="bg-white rounded-[28px] ring-1 ring-black/5 shadow-sm overflow-hidden flex flex-col items-center justify-center py-16 gap-2">
                                <Users size={28} className="text-slate-300" />
                                <p className="text-[13px] text-slate-400">Không tìm thấy người dùng</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Column 1: Sony Staffs */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 px-2">
                                        <Briefcase size={16} className="text-violet-500" />
                                        <h2 className="text-[14px] font-black uppercase tracking-widest text-[#1d1d1f]">Sony Staffs</h2>
                                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{staffUsers.length}</span>
                                    </div>
                                    <div className="bg-white rounded-[28px] ring-1 ring-black/5 shadow-sm overflow-hidden divide-y divide-black/[0.03]">
                                        {staffUsers.length > 0 ? staffUsers.map(u => (
                                            <UserRow key={u.id} user={u} onEdit={setEditingUser} />
                                        )) : (
                                            <div className="py-8 text-center text-[12px] text-slate-400 italic">Trống</div>
                                        )}
                                    </div>
                                </div>

                                {/* Column 2: Sony Users */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 px-2">
                                        <Users size={16} className="text-amber-500" />
                                        <h2 className="text-[14px] font-black uppercase tracking-widest text-[#1d1d1f]">Sony Users</h2>
                                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{memberUsers.length}</span>
                                    </div>
                                    <div className="bg-white rounded-[28px] ring-1 ring-black/5 shadow-sm overflow-hidden divide-y divide-black/[0.03]">
                                        {memberUsers.length > 0 ? memberUsers.map(u => (
                                            <UserRow key={u.id} user={u} onEdit={setEditingUser} />
                                        )) : (
                                            <div className="py-8 text-center text-[12px] text-slate-400 italic">Trống</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'permissions' && <RolePermissionsMatrix matrix={matrix} matrixLoading={matrixLoading} />}

                {activeTab === 'catalog' && <RolesCatalog />}

                {activeTab === 'add' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-[12px] text-amber-700">
                                Override sẽ <strong>ghi đè</strong> ROLE_EMAIL_MAP tĩnh. Chỉ dùng khi user chưa có trong roles.js hoặc cần roles đặc biệt.
                            </p>
                        </div>
                        <AddOverrideForm onSave={handleSave} saving={saving} />
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <EditModal
                    user={editingUser}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onClose={() => setEditingUser(null)}
                    saving={saving}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] px-5 py-3 rounded-2xl text-[13px] font-semibold shadow-xl transition-all
                    ${toast.type === 'success'
                        ? 'bg-[#1d1d1f] text-white'
                        : 'bg-rose-600 text-white'}`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
