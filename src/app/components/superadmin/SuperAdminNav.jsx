"use client";

import { useRouter, usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    key: 'overview',
    label: 'Dashboard',
    path: '/superadmin',
    icon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    key: 'outlets',
    label: 'Outlets',
    path: '/superadmin/outlets',
    icon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    key: 'permissions',
    label: 'Permissions',
    path: '/superadmin/permissions',
    icon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  },
  {
    key: 'staff',
    label: 'Staff',
    path: '/superadmin/staff',
    icon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    key: 'audit',
    label: 'Audit',
    path: '/superadmin/audit',
    icon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
];

export default function SuperAdminNav({ staffName = 'Super Admin', staffId = 'SUPER01' }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-900 flex flex-col py-6 px-3 gap-1 sticky top-0 h-screen bg-[#0a0a0b]">
      <div className="px-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#e5b83b] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#0a0a0b]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">DELIGHTS</p>
            <p className="text-[9px] text-[#e5b83b] font-semibold tracking-widest mt-0.5">SUPER ADMIN</p>
          </div>
        </div>
      </div>

      <p className="text-[9px] font-bold tracking-widest text-neutral-700 uppercase px-3 mb-1">Navigation</p>

      {NAV_ITEMS.map(item => {
        const Icon = item.icon;  // ← capital I so React treats it as a component
        const isActive = pathname === item.path || (item.path !== '/superadmin' && pathname.startsWith(item.path));
        return (
          <button
            key={item.key}
            onClick={() => router.push(item.path)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 text-left w-full ${
              isActive
                ? 'bg-[#e5b83b]/10 text-[#e5b83b] border border-[#e5b83b]/15'
                : 'text-neutral-500 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span className="w-4 h-4 shrink-0"><Icon /></span>
            {item.label}
          </button>
        );
      })}

      <div className="mt-auto px-3 pt-4 border-t border-neutral-900">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#e5b83b] flex items-center justify-center text-[10px] font-bold text-[#0a0a0b]">SA</div>
          <div>
            <p className="text-[11px] font-semibold text-white leading-none">{staffName}</p>
            <p className="text-[9px] text-neutral-600 mt-0.5">{staffId}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-neutral-600 hover:text-red-400 text-xs font-medium transition-colors py-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}