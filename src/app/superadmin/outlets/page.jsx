"use client";

import React, { useState, useEffect } from 'react';
import SuperAdminNav from '../../components/superadmin/SuperAdminNav';

const STATUS_CFG = {
  active:      { label: 'Active',      dot: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-400/10 border-emerald-400/20' },
  maintenance: { label: 'Maintenance', dot: 'bg-amber-400',   text: 'text-amber-400',   badge: 'bg-amber-400/10 border-amber-400/20'   },
  inactive:    { label: 'Inactive',    dot: 'bg-red-400',     text: 'text-red-400',     badge: 'bg-red-400/10 border-red-400/20'       },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.badge} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

function OutletModal({ outlet, onClose, onSave }) {
  const isEdit = !!outlet?.id;
  const [form, setForm] = useState({
    name:     outlet?.name     || '',
    location: outlet?.location || '',
    status:   outlet?.status   || 'active',
    seats:    outlet?.seats    || '',
    phone:    outlet?.phone    || '',
    manager:  outlet?.manager  || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(isEdit ? `/api/superadmin/outlets/${outlet.id}` : '/api/superadmin/outlets', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { onSave(); onClose(); }
    } catch (err) {
      console.error('Failed to save outlet:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111113] border border-neutral-800 rounded-2xl w-full max-w-md p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">{isEdit ? 'Edit Outlet' : 'Add New Outlet'}</h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">{isEdit ? `Editing ${outlet.name}` : 'Create a new outlet location'}</p>
          </div>
          <button onClick={onClose} className="text-neutral-600 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Outlet Name',  key: 'name',     span: true,  placeholder: 'e.g. Central Plaza' },
            { label: 'Location',     key: 'location', span: true,  placeholder: 'e.g. Thamel, Kathmandu' },
            { label: 'Manager',      key: 'manager',  span: false, placeholder: 'Manager name' },
            { label: 'Phone',        key: 'phone',    span: false, placeholder: '+977 ...' },
            { label: 'Total Seats',  key: 'seats',    span: false, placeholder: '0', type: 'number' },
          ].map(field => (
            <div key={field.key} className={field.span ? 'col-span-2' : ''}>
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5">{field.label}</label>
              <input
                type={field.type || 'text'}
                value={form[field.key]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-[#0a0a0b] border border-neutral-800 focus:border-[#e5b83b]/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-all"
              />
            </div>
          ))}

          <div className="col-span-2">
            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1.5">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, status: key }))}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    form.status === key
                      ? `${cfg.badge} ${cfg.text} border-current`
                      : 'bg-[#0a0a0b] text-neutral-500 border-neutral-800 hover:border-neutral-600'
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 bg-transparent border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white font-semibold py-2.5 rounded-xl text-sm transition-all">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name.trim()}
            className="flex-1 bg-[#e5b83b] hover:bg-[#f5c847] disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0a0b] font-bold py-2.5 rounded-xl text-sm transition-all"
          >
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Outlet'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OutletsPage() {
  const [outlets, setOutlets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('ALL');
  const [modal, setModal]           = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function fetchOutlets() {
    try {
      setLoading(true);
      const res  = await fetch('/api/superadmin/outlets');
      const data = await res.json();
      if (data.success) setOutlets(data.data || []);
    } catch (err) {
      console.error('Failed to fetch outlets:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOutlets(); }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this outlet? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/superadmin/outlets/${id}`, { method: 'DELETE' });
      fetchOutlets();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleStatus(outlet) {
    const next = outlet.status === 'active' ? 'inactive' : 'active';
    await fetch(`/api/superadmin/outlets/${outlet.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    fetchOutlets();
  }

  const filtered = outlets.filter(o => {
    const matchSearch = o.name.toLowerCase().includes(search.toLowerCase()) ||
      (o.location || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const counts = {
    ALL:         outlets.length,
    active:      outlets.filter(o => o.status === 'active').length,
    maintenance: outlets.filter(o => o.status === 'maintenance').length,
    inactive:    outlets.filter(o => o.status === 'inactive').length,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7] font-sans antialiased flex">

      <SuperAdminNav />

      <div className="flex-1 flex flex-col overflow-hidden">

        <header className="h-14 border-b border-neutral-900 flex items-center justify-between px-6 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-white">Outlets</h1>
            <span className="text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">Manage all cafe locations</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Outlet Management</h1>
              <p className="text-xs text-neutral-500 mt-1">Manage all cafe locations and their operational status</p>
            </div>
            <button
              onClick={() => setModal('add')}
              className="flex items-center gap-2 bg-[#e5b83b] hover:bg-[#f5c847] active:scale-[0.98] text-[#0a0a0b] font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(229,184,59,0.15)]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 4.5v15m7.5-7.5h-15"/></svg>
              Add Outlet
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Outlets', value: counts.ALL,         accent: '#e5b83b' },
              { label: 'Active',        value: counts.active,      accent: '#22c55e' },
              { label: 'Maintenance',   value: counts.maintenance, accent: '#f59e0b' },
              { label: 'Inactive',      value: counts.inactive,    accent: '#ef4444' },
            ].map(s => (
              <div key={s.label} className="bg-[#111113] border border-neutral-800/60 rounded-xl p-4">
                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.accent }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <svg className="w-4 h-4 text-neutral-600 absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search outlet name or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#111113] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-neutral-700 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              {['ALL', 'active', 'maintenance', 'inactive'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                    statusFilter === s
                      ? 'bg-[#e5b83b] text-[#0a0a0b] border-[#e5b83b]'
                      : 'bg-[#111113] text-neutral-500 border-neutral-800 hover:text-white hover:border-neutral-600'
                  }`}
                >
                  {s === 'ALL' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#111113] border border-neutral-800/60 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800/60 text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
                    <th className="py-3.5 px-5">Outlet</th>
                    <th className="py-3.5 px-5">Location</th>
                    <th className="py-3.5 px-5">Manager</th>
                    <th className="py-3.5 px-5">Seats</th>
                    <th className="py-3.5 px-5">Phone</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Created</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/30 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <div className="flex items-center justify-center gap-3 text-neutral-600">
                          <div className="w-5 h-5 border-2 border-[#e5b83b] border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs">Loading outlets...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-xs text-neutral-700">
                        {search || statusFilter !== 'ALL' ? 'No outlets match your filters.' : 'No outlets added yet.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((outlet) => (
                      <tr key={outlet.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#e5b83b]/10 border border-[#e5b83b]/20 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-[#e5b83b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                              </svg>
                            </div>
                            <span className="font-semibold text-white">{outlet.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-neutral-400 text-xs">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-neutral-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                            </svg>
                            {outlet.location || <span className="text-neutral-700">—</span>}
                          </div>
                        </td>
                        <td className="py-4 px-5 text-neutral-400 text-xs">{outlet.manager || <span className="text-neutral-700">—</span>}</td>
                        <td className="py-4 px-5 text-neutral-400 text-xs">{outlet.seats ? `${outlet.seats} seats` : <span className="text-neutral-700">—</span>}</td>
                        <td className="py-4 px-5 text-neutral-400 text-xs font-mono">{outlet.phone || <span className="text-neutral-700">—</span>}</td>
                        <td className="py-4 px-5"><StatusBadge status={outlet.status} /></td>
                        <td className="py-4 px-5 text-neutral-600 text-xs">
                          {outlet.createdAt
                            ? new Date(outlet.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleToggleStatus(outlet)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                                outlet.status === 'active'
                                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                              }`}
                            >
                              {outlet.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => setModal(outlet)}
                              className="px-3 py-1.5 rounded-lg text-[11px] font-bold border bg-[#e5b83b]/10 text-[#e5b83b] border-[#e5b83b]/20 hover:bg-[#e5b83b]/20 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(outlet.id)}
                              disabled={deletingId === outlet.id}
                              className="p-1.5 rounded-lg border border-neutral-800 text-neutral-600 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-40"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
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

            {!loading && filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-neutral-800/40 text-[11px] text-neutral-600">
                Showing {filtered.length} of {outlets.length} outlet{outlets.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </main>
      </div>

      {modal && (
        <OutletModal
          outlet={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={fetchOutlets}
        />
      )}
    </div>
  );
}