"use client";

import { useState, useRef, useEffect } from 'react';
import SuperAdminNav from '../../components/superadmin/SuperAdminNav';

const ROLE_CFG = {
  'SUPER_ADMIN':   { color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20' },
  'ADMIN':         { color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20'   },
  'CASHIER':       { color: 'text-[#e5b83b]',   bg: 'bg-[#e5b83b]/10',  border: 'border-[#e5b83b]/20'  },
};

const AVATAR_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
];

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
          value !== 'ALL'
            ? 'bg-[#e5b83b]/10 text-[#e5b83b] border-[#e5b83b]/30'
            : 'bg-[#111113] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600'
        }`}
      >
        {value === 'ALL' ? label : value}
        <svg className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-30 bg-[#111113] border border-neutral-800 rounded-xl shadow-2xl shadow-black/60 min-w-[160px] overflow-hidden">
          {['ALL', ...options].map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                value === opt ? 'text-[#e5b83b] bg-[#e5b83b]/10' : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {opt === 'ALL' ? `All ${label}s` : opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }) {
  const cfg = ROLE_CFG[role] || ROLE_CFG['CASHIER'];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const isActive = status === 'active' || status === true;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
      isActive ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-red-400/10 border-red-400/20 text-red-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function StaffPage() {
  const [staff, setStaff]               = useState([]);
  const [outlets, setOutlets]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [outletFilter, setOutletFilter] = useState('ALL');
  const [roleFilter, setRoleFilter]     = useState('ALL');

  async function fetchStaff() {
    try {
      setLoading(true);
      const res  = await fetch('/api/superadmin/staff');
      const data = await res.json();
      if (data.success) setStaff(data.data || []);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOutlets() {
    try {
      const res  = await fetch('/api/superadmin/outlets');
      const data = await res.json();
      if (data.success) setOutlets(data.data || []);
    } catch (err) {
      console.error('Failed to fetch outlets:', err);
    }
  }

  useEffect(() => {
    fetchStaff();
    fetchOutlets();
  }, []);

  const outletNames = outlets.map(o => o.name);
  const roles       = [...new Set(staff.map(s => s.role))];

  const filtered = staff.filter(s => {
    const q           = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || (s.pin || '').toLowerCase().includes(q);
    const matchOutlet = outletFilter === 'ALL' || s.outlet?.name === outletFilter;
    const matchRole   = roleFilter   === 'ALL' || s.role === roleFilter;
    return matchSearch && matchOutlet && matchRole;
  });

  const counts = {
    total:   staff.length,
    outlets: outlets.length,
    ...Object.fromEntries(
      [...new Set(staff.map(s => s.role))].map(r => [r, staff.filter(s => s.role === r).length])
    ),
  };

  const activeFilters = [outletFilter, roleFilter].filter(f => f !== 'ALL').length;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7] font-sans antialiased flex">
      <SuperAdminNav />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-neutral-900 flex items-center justify-between px-6 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-white">Staff</h1>
            <span className="text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">All staff across outlets</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Staff Management</h1>
              <p className="text-xs text-neutral-500 mt-1">All staff members across every outlet</p>
            </div>
            <button
              onClick={fetchStaff}
              className="flex items-center gap-2 bg-[#e5b83b]/10 hover:bg-[#e5b83b]/20 text-[#e5b83b] border border-[#e5b83b]/20 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              Refresh
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Staff',  value: counts.total,                        accent: '#e5b83b' },
              { label: 'Cashiers',     value: counts['CASHIER']     || 0,           accent: '#22c55e' },
              { label: 'Admins',       value: counts['ADMIN']       || 0,           accent: '#3b82f6' },
              { label: 'Super Admins', value: counts['SUPER_ADMIN'] || 0,           accent: '#a855f7' },
            ].map(s => (
              <div key={s.label} className="bg-[#111113] border border-neutral-800/60 rounded-xl p-4">
                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.accent }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <svg className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search name or employee ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#111113] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-all"
              />
            </div>
            <Dropdown label="Outlet" value={outletFilter} options={outletNames} onChange={setOutletFilter} />
            <Dropdown label="Role"   value={roleFilter}   options={roles}       onChange={setRoleFilter}   />
            {activeFilters > 0 && (
              <button
                onClick={() => { setOutletFilter('ALL'); setRoleFilter('ALL'); }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-500 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 bg-[#111113] transition-all"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Clear ({activeFilters})
              </button>
            )}
          </div>

          {/* Table */}
          <div className="bg-[#111113] border border-neutral-800/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800/60 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                    <th className="py-3.5 px-5">Staff Member</th>
                    <th className="py-3.5 px-5">Employee ID</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Outlet</th>
                    <th className="py-3.5 px-5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/30 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="flex items-center justify-center gap-3 text-neutral-600">
                          <div className="w-5 h-5 border-2 border-[#e5b83b] border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">Loading staff...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-xs text-neutral-700">
                        No staff match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((member, i) => (
                      <tr key={member.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                              {getInitials(member.name)}
                            </div>
                            <p className="font-semibold text-white text-sm">{member.name}</p>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-mono text-xs text-neutral-400">{member.pin}</td>
                        <td className="py-4 px-5"><RoleBadge role={member.role} /></td>
                        <td className="py-4 px-5">
                          {member.outlet ? (
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                              <svg className="w-3 h-3 text-neutral-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                              </svg>
                              {member.outlet.name}
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-700">No outlet</span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-xs text-neutral-600">
                          {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!loading && filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-neutral-800/40 text-[11px] text-neutral-600">
                Showing {filtered.length} of {staff.length} staff member{staff.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}