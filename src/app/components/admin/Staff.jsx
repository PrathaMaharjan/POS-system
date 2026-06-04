"use client";

import { useState, useRef, useEffect } from 'react';
import Header from '../../components/header/page';

const ROLES = ['ADMIN', 'CASHIER'];

const ROLE_CFG = {
  ADMIN:   { color: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/20' },
  CASHIER: { color: 'text-[#e5b83b]',   bg: 'bg-[#e5b83b]/10',  border: 'border-[#e5b83b]/20'  },
};

const AVATAR_COLORS = [
  'bg-purple-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-pink-500', 'bg-cyan-500',
];

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function RoleBadge({ role }) {
  const cfg = ROLE_CFG[role] || ROLE_CFG['CASHIER'];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      {role}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function StaffModal({ staff, onClose, onSave }) {
  const isEdit = !!staff?.id;
  const [form, setForm] = useState({
    name:     staff?.name || '',
    pin:      staff?.pin  || '',
    role:     staff?.role || 'CASHIER',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.name.trim() || !form.pin.trim()) return;
    if (!isEdit && !form.password.trim()) { setError('Password is required'); return; }

    setLoading(true);
    setError('');

    try {
      const url    = isEdit ? `/api/admin/staff/${staff.id}` : '/api/admin/staff';
      const method = isEdit ? 'PATCH' : 'POST';

      const body = { name: form.name, pin: form.pin, role: form.role };
      if (form.password) body.password = form.password;

      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await res.json();

      if (result.success) {
        onSave(result.data);
        onClose();
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111113] border border-neutral-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">{isEdit ? 'Edit Staff' : 'Add New Staff'}</h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">{isEdit ? `Editing ${staff.name}` : 'Add a staff member to your outlet'}</p>
          </div>
          <button onClick={onClose} className="text-neutral-600 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Name */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. John Doe"
              className="w-full bg-[#0a0a0b] border border-neutral-800 focus:border-[#e5b83b]/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-all"
            />
          </div>

          {/* Employee ID */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5">Employee ID</label>
            <input
              type="text"
              value={form.pin}
              onChange={e => setForm(p => ({ ...p, pin: e.target.value }))}
              placeholder="e.g. CASH02"
              className="w-full bg-[#0a0a0b] border border-neutral-800 focus:border-[#e5b83b]/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-all"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, role: r }))}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    form.role === r
                      ? ROLE_CFG[r]
                        ? `${ROLE_CFG[r].bg} ${ROLE_CFG[r].border} ${ROLE_CFG[r].color}`
                        : 'bg-[#e5b83b]/10 text-[#e5b83b] border-[#e5b83b]/30'
                      : 'bg-[#0a0a0b] text-neutral-500 border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5">
              Password {isEdit && <span className="text-neutral-700 normal-case">(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder={isEdit ? 'Leave blank to keep current' : 'Set a password'}
              className="w-full bg-[#0a0a0b] border border-neutral-800 focus:border-[#e5b83b]/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-transparent border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !form.name.trim() || !form.pin.trim()}
            className="flex-1 bg-[#e5b83b] hover:bg-[#f5c847] disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0a0b] font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Saving...</>
            ) : isEdit ? 'Save Changes' : 'Add Staff'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({ staff, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await onConfirm(staff.id);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111113] border border-neutral-800 rounded-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold text-white">Remove Staff Member?</h2>
        <p className="text-sm text-neutral-400">
          This will permanently remove <span className="text-white font-semibold">{staff.name}</span> from your outlet. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-transparent border border-neutral-800 hover:border-neutral-600 text-neutral-400 font-semibold py-2.5 rounded-xl text-sm transition-all">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold py-2.5 rounded-xl text-sm transition-all"
          >
            {loading ? 'Removing...' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminStaffPage() {
  const [staff, setStaff]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [modal, setModal]           = useState(null);   // null | 'add' | staff object
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetch('/api/admin/staff')
      .then(r => r.json())
      .then(d => { if (d.success) setStaff(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = staff.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.pin.toLowerCase().includes(q);
    const matchRole   = roleFilter === 'ALL' || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleSave = (saved) => {
    setStaff(prev => {
      const exists = prev.find(s => s.id === saved.id);
      return exists ? prev.map(s => s.id === saved.id ? saved : s) : [...prev, saved];
    });
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) setStaff(prev => prev.filter(s => s.id !== id));
  };

  const counts = {
    total:   staff.length,
    admins:  staff.filter(s => s.role === 'ADMIN').length,
    cashiers: staff.filter(s => s.role === 'CASHIER').length,
  };

  return (
    <div className="min-h-screen  text-[#e4e4e7] font-sans antialiased flex flex-col">
     

      <main className="flex-1 overflow-y-auto px-8 py-6 max-w-7xl mx-auto w-full space-y-6">

        {/* Title + Add */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Staff Management</h1>
            <p className="text-xs text-neutral-500 mt-1">Manage staff members for your outlet</p>
          </div>
          <button
            onClick={() => setModal('add')}
            className="flex items-center gap-2 bg-[#e5b83b] hover:bg-[#f5c847] active:scale-[0.98] text-[#0a0a0b] font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(229,184,59,0.15)]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 4.5v15m7.5-7.5h-15"/>
            </svg>
            Add Staff
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Staff', value: counts.total,    accent: '#e5b83b' },
            { label: 'Admins',      value: counts.admins,   accent: '#a855f7' },
            { label: 'Cashiers',    value: counts.cashiers, accent: '#22c55e' },
          ].map(s => (
            <div key={s.label} className="bg-[#111113] border border-neutral-800/60 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ backgroundColor: s.accent }} />
              <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{s.label}</p>
              <p className="text-2xl font-bold mt-1" style={{ color: s.accent }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Role filter */}
        <div className="flex items-center gap-3 flex-wrap">
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

          <div className="flex gap-2">
            {['ALL', 'ADMIN', 'CASHIER'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                  roleFilter === r
                    ? 'bg-[#e5b83b] text-[#0a0a0b] border-[#e5b83b]'
                    : 'bg-[#111113] text-neutral-500 border-neutral-800 hover:text-white hover:border-neutral-600'
                }`}
              >
                {r === 'ALL' ? 'All Roles' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#111113] border border-neutral-800/60 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 border-[#e5b83b] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800/60 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                    <th className="py-3.5 px-5">Staff Member</th>
                    <th className="py-3.5 px-5">Employee ID</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Joined</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/30 text-sm">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-xs text-neutral-700">
                        {staff.length === 0 ? 'No staff yet. Add your first staff member.' : 'No staff match your search.'}
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
                        <td className="py-4 px-5 font-mono text-neutral-400 text-xs">{member.pin}</td>
                        <td className="py-4 px-5"><RoleBadge role={member.role} /></td>
                        <td className="py-4 px-5 text-xs text-neutral-600">
                          {new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setModal(member)}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-bold border bg-[#e5b83b]/10 text-[#e5b83b] border-[#e5b83b]/20 hover:bg-[#e5b83b]/20 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(member)}
                              className="p-1.5 rounded-lg border border-neutral-800 text-neutral-600 hover:text-red-400 hover:border-red-500/30 transition-all"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-neutral-800/40 text-[11px] text-neutral-600">
              Showing {filtered.length} of {staff.length} staff member{staff.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </main>

      {modal && (
        <StaffModal
          staff={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          staff={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}