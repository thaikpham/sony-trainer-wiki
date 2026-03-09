'use client';

import { ShieldAlert } from 'lucide-react';
import LiveReportsTable from '@/components/admin/LiveReportsTable';
import WikiShell from '@/components/wiki/WikiShell';
import { useRoleAccess } from '@/components/RoleProvider';

export default function WikiLiveReportsPage() {
    const { isAdmin } = useRoleAccess();

    return (
        <WikiShell>
            {isAdmin ? (
                <LiveReportsTable />
            ) : (
                <div className="bg-white ring-1 ring-black/[0.04] rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-8 md:p-10">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <ShieldAlert size={22} />
                        </div>
                        <div>
                            <h3 className="text-[18px] font-black text-[#1d1d1f]">Bạn không có quyền truy cập mục này</h3>
                            <p className="text-[13px] text-slate-500 mt-1">
                                Báo cáo livestream chỉ khả dụng cho tài khoản quản trị.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </WikiShell>
    );
}
