"use client";

import { useState, useRef, useEffect } from 'react';
import SuperAdminNav from '../../components/superadmin/SuperAdminNav';

// ── Constants ────────────────────────────────────────────────────────────────
const OUTLETS = ['Downtown Flagship', 'Riverside Kiosk', 'Suburban Central'];

const CATEGORIES = ['Auth', 'Order', 'Payment', 'Staff', 'Config'];

const SEVERITY_CFG = {
  Info:     { color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20',    dot: 'bg-blue-400'    },
  Warning:  { color: 'text-amber-400',   bg: 'bg-amber-400/10',   border: 'border-amber-400/20',   dot: 'bg-amber-400'   },
  Critical: { color: 'text-red-400',     bg: 'bg-red-400/10',     border: 'border-red-400/20',     dot: 'bg-red-400'     },
};

const CATEGORY_CFG = {
  Auth:    { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  Order:   { color: 'text-[#e5b83b]', bg: 'bg-[#e5b83b]/10',  border: 'border-[#e5b83b]/20'  },
  Payment: { color: 'text-emerald-400',bg: 'bg-emerald-400/10',border: 'border-emerald-400/20'},
  Staff:   { color: 'text-blue-400',  bg: 'bg-blue-400/10',   border: 'border-blue-400/20'   },
  Config:  { color: 'text-orange-400',bg: 'bg-orange-400/10', border: 'border-orange-400/20'  },
};

const CATEGORY_ICONS = {
  Auth:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Order:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Payment: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Staff:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  Config:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>,
};

// ── Mock log data ────────────────────────────────────────────────────────────
const LOGS = [
  { id: 1,  ts: '2025-06-04T13:45:22', staff: 'Aarav Sharma',   role: 'Admin',         outlet: 'Downtown Flagship', category: 'Config',  severity: 'Info',     action: 'Inventory module disabled for outlet' },
  { id: 2,  ts: '2025-06-04T13:30:11', staff: 'Priya Thapa',    role: 'Manager',       outlet: 'Downtown Flagship', category: 'Payment', severity: 'Critical', action: 'Payment void of NPR 2,400 on Order #087' },
  { id: 3,  ts: '2025-06-04T13:15:05', staff: 'Rohan Karki',    role: 'Cashier',       outlet: 'Downtown Flagship', category: 'Order',   severity: 'Warning',  action: 'Order #086 cancelled after preparation' },
  { id: 4,  ts: '2025-06-04T13:10:44', staff: 'Nisha Tamang',   role: 'Manager',       outlet: 'Riverside Kiosk',   category: 'Auth',    severity: 'Info',     action: 'Staff login successful' },
  { id: 5,  ts: '2025-06-04T12:58:33', staff: 'Unknown',        role: '—',             outlet: 'Riverside Kiosk',   category: 'Auth',    severity: 'Warning',  action: 'Failed login attempt — incorrect PIN (3x)' },
  { id: 6,  ts: '2025-06-04T12:45:00', staff: 'Sunil Magar',    role: 'Admin',         outlet: 'Suburban Central',  category: 'Staff',   severity: 'Info',     action: 'New staff Puja Maharjan added as Waiter' },
  { id: 7,  ts: '2025-06-04T12:30:19', staff: 'Deepak Limbu',   role: 'Cashier',       outlet: 'Riverside Kiosk',   category: 'Payment', severity: 'Info',     action: 'Discount of 15% applied on Order #043' },
  { id: 8,  ts: '2025-06-04T12:15:08', staff: 'Sunil Magar',    role: 'Admin',         outlet: 'Suburban Central',  category: 'Config',  severity: 'Warning',  action: 'Kitchen Display module re-enabled' },
  { id: 9,  ts: '2025-06-04T12:00:55', staff: 'Aarav Sharma',   role: 'Admin',         outlet: 'Downtown Flagship', category: 'Staff',   severity: 'Warning',  action: 'Staff Sita Rai deactivated' },
  { id: 10, ts: '2025-06-04T11:50:30', staff: 'Priya Thapa',    role: 'Manager',       outlet: 'Downtown Flagship', category: 'Order',   severity: 'Info',     action: 'Order #085 created — NPR 1,850' },
  { id: 11, ts: '2025-06-04T11:40:12', staff: 'Rajan Bhandari', role: 'Kitchen Staff', outlet: 'Suburban Central',  category: 'Order',   severity: 'Info',     action: 'Order #071 marked as ready' },
  { id: 12, ts: '2025-06-04T11:25:44', staff: 'Kamala Pandey',  role: 'Cashier',       outlet: 'Suburban Central',  category: 'Auth',    severity: 'Info',     action: 'Staff logout' },
  { id: 13, ts: '2025-06-04T11:10:05', staff: 'Nisha Tamang',   role: 'Manager',       outlet: 'Riverside Kiosk',   category: 'Payment', severity: 'Critical', action: 'Refund of NPR 3,200 issued on Order #041' },
  { id: 14, ts: '2025-06-04T10:58:22', staff: 'Aarav Sharma',   role: 'Admin',         outlet: 'Downtown Flagship', category: 'Config',  severity: 'Info',     action: 'New outlet "Suburban Central" created' },
  { id: 15, ts: '2025-06-04T10:45:00', staff: 'Rohan Karki',    role: 'Cashier',       outlet: 'Downtown Flagship', category: 'Payment', severity: 'Info',     action: 'Payment of NPR 920 processed via card' },
  { id: 16, ts: '2025-06-04T10:30:18', staff: 'Anita Shrestha', role: 'Waiter',        outlet: 'Riverside Kiosk',   category: 'Order',   severity: 'Warning',  action: 'Order #042 modified after payment' },
  { id: 17, ts: '2025-06-04T10:15:33', staff: 'Sunil Magar',    role: 'Admin',         outlet: 'Suburban Central',  category: 'Config',  severity: 'Critical', action: 'Permissions reset to default for all modules' },
  { id: 18, ts: '2025-06-04T10:00:00', staff: 'Bikash Gurung',  role: 'Kitchen Staff', outlet: 'Downtown Flagship', category: 'Auth',    severity: 'Info',     action: 'Staff login successful' },
  { id: 19, ts: '2025-06-04T09:45:10', staff: 'Priya Thapa',    role: 'Manager',       outlet: 'Downtown Flagship', category: 'Staff',   severity: 'Info',     action: 'Staff Rohan Karki role changed to Manager' },
  { id: 20, ts: '2025-06-04T09:30:44', staff: 'Deepak Limbu',   role: 'Cashier',       outlet: 'Riverside Kiosk',   category: 'Order',   severity: 'Critical', action: 'Order #040 deleted — unauthorized action flagged' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function exportCSV(logs) {
  const header = ['Timestamp', 'Staff', 'Role', 'Outlet', 'Category', 'Severity', 'Action'];
  const rows = logs.map(l => [l.ts, l.staff, l.role, l.outlet, l.category, l.severity, `"${l.action}"`]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'audit-log.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
          value !== 'ALL'
            ? 'bg-[#e5b83b]/10 text-[#e5b83b] border-[#e5b83b]/30'
            : 'bg-[#111113] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600'
        }`}
      >
        {value === 'ALL' ? label : value}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-30 bg-[#111113] border border-neutral-800 rounded-xl shadow-2xl shadow-black/60 min-w-[150px] overflow-hidden">
          {['ALL', ...options].map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
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

// ── Badges ───────────────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const cfg = SEVERITY_CFG[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${severity === 'Critical' ? 'animate-pulse' : ''}`} />
      {severity}
    </span>
  );
}

function CategoryBadge({ category }) {
  const cfg = CATEGORY_CFG[category];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      {category}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AuditPage() {
  const [outletFilter,   setOutletFilter]   = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [search,         setSearch]         = useState('');
  const [expandedId,     setExpandedId]     = useState(null);

  const filtered = LOGS.filter(l => {
    const q = search.toLowerCase();
    const matchSearch   = l.action.toLowerCase().includes(q) || l.staff.toLowerCase().includes(q);
    const matchOutlet   = outletFilter   === 'ALL' || l.outlet   === outletFilter;
    const matchCategory = categoryFilter === 'ALL' || l.category === categoryFilter;
    const matchSeverity = severityFilter === 'ALL' || l.severity === severityFilter;
    return matchSearch && matchOutlet && matchCategory && matchSeverity;
  });

  const activeFilters = [outletFilter, categoryFilter, severityFilter].filter(f => f !== 'ALL').length;

  const counts = {
    total:    LOGS.length,
    critical: LOGS.filter(l => l.severity === 'Critical').length,
    warning:  LOGS.filter(l => l.severity === 'Warning').length,
    info:     LOGS.filter(l => l.severity === 'Info').length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7] font-sans antialiased flex">
      <SuperAdminNav />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-neutral-900 flex items-center justify-between px-6 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-white">Audit</h1>
            <span className="text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">System-wide activity log</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Title + Export */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Audit Log</h1>
              <p className="text-xs text-neutral-500 mt-1">Read-only record of all system events across outlets</p>
            </div>
            <button
              onClick={() => exportCSV(filtered)}
              className="flex items-center gap-2 bg-[#111113] hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-neutral-300 font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export CSV
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Events', value: counts.total,    accent: '#e5b83b' },
              { label: 'Critical',     value: counts.critical, accent: '#ef4444' },
              { label: 'Warnings',     value: counts.warning,  accent: '#f59e0b' },
              { label: 'Info',         value: counts.info,     accent: '#60a5fa' },
            ].map(s => (
              <div key={s.label} className="bg-[#111113] border border-neutral-800/60 rounded-xl p-4">
                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.accent }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <svg className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search action or staff name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#111113] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-all"
              />
            </div>
            <Dropdown label="Outlet"   value={outletFilter}   options={OUTLETS}                       onChange={setOutletFilter}   />
            <Dropdown label="Category" value={categoryFilter} options={CATEGORIES}                    onChange={setCategoryFilter} />
            <Dropdown label="Severity" value={severityFilter} options={['Info', 'Warning', 'Critical']} onChange={setSeverityFilter} />
            {activeFilters > 0 && (
              <button
                onClick={() => { setOutletFilter('ALL'); setCategoryFilter('ALL'); setSeverityFilter('ALL'); }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-500 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 bg-[#111113] transition-all"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Clear ({activeFilters})
              </button>
            )}
          </div>

          {/* Log table */}
          <div className="bg-[#111113] border border-neutral-800/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800/60 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                    <th className="py-3.5 px-5">Timestamp</th>
                    <th className="py-3.5 px-5">Staff</th>
                    <th className="py-3.5 px-5">Outlet</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Action</th>
                    <th className="py-3.5 px-5">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/30 text-sm">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-xs text-neutral-700">
                        No log entries match your filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(log => {
                      const CatIcon = CATEGORY_ICONS[log.category];
                      const catCfg  = CATEGORY_CFG[log.category];
                      const isExpanded = expandedId === log.id;
                      return (
                        <tr
                          key={log.id}
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className={`transition-colors cursor-pointer ${
                            log.severity === 'Critical'
                              ? 'hover:bg-red-500/[0.04]'
                              : 'hover:bg-white/[0.02]'
                          } ${isExpanded ? 'bg-white/[0.02]' : ''}`}
                        >
                          {/* Timestamp */}
                          <td className="py-4 px-5">
                            <p className="text-xs font-mono text-white">{formatTime(log.ts)}</p>
                            <p className="text-[10px] text-neutral-600 mt-0.5">{formatDate(log.ts)}</p>
                          </td>
                          {/* Staff */}
                          <td className="py-4 px-5">
                            <p className="text-xs font-semibold text-white">{log.staff}</p>
                            <p className="text-[10px] text-neutral-600 mt-0.5">{log.role}</p>
                          </td>
                          {/* Outlet */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                              <svg className="w-3 h-3 text-neutral-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                              </svg>
                              <span className="truncate max-w-[120px]">{log.outlet}</span>
                            </div>
                          </td>
                          {/* Category */}
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${catCfg.bg} ${catCfg.border} ${catCfg.color}`}>
                              <span className="w-3 h-3"><CatIcon /></span>
                              {log.category}
                            </span>
                          </td>
                          {/* Action */}
                          <td className="py-4 px-5 max-w-xs">
                            <p className={`text-xs ${log.severity === 'Critical' ? 'text-red-300' : 'text-neutral-300'} leading-relaxed`}>
                              {log.action}
                            </p>
                          </td>
                          {/* Severity */}
                          <td className="py-4 px-5">
                            <SeverityBadge severity={log.severity} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-neutral-800/40 flex items-center justify-between">
                <span className="text-[11px] text-neutral-600">
                  Showing {filtered.length} of {LOGS.length} event{LOGS.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] text-neutral-700 uppercase tracking-widest font-bold">Read-only</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}