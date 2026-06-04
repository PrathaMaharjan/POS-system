"use client";

import { useState, useEffect } from 'react';
import SuperAdminNav from '../../components/superadmin/SuperAdminNav';

const MODULES = [
  { key: 'dashboard',    label: 'Dashboard',        desc: 'View sales overview and stats' },
  { key: 'tables',       label: 'Tables',            desc: 'View and manage table layout' },
  { key: 'orders',       label: 'Place Orders',      desc: 'Create and manage orders' },
  { key: 'payments',     label: 'Payments',          desc: 'Process and view payments' },
  { key: 'history',      label: 'Order History',     desc: 'View past orders and receipts' },
  { key: 'menu',         label: 'Menu',              desc: 'View and edit menu items' },
  { key: 'reports',      label: 'Sales Reports',     desc: 'Access revenue and analytics' },
  { key: 'staff',        label: 'Staff Management',  desc: 'Add and manage staff members' },
  { key: 'kitchen',      label: 'Kitchen Display',   desc: 'View and manage kitchen queue' },
  { key: 'discounts',    label: 'Discounts',         desc: 'Apply and manage discounts' },
];

const ROLES = ['ADMIN', 'CASHIER', 'KITCHEN'];

const ROLE_CFG = {
  ADMIN:   { color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/20',    dot: 'bg-blue-400'    },
  CASHIER: { color: 'text-[#e5b83b]',   bg: 'bg-[#e5b83b]/10',  border: 'border-[#e5b83b]/20',   dot: 'bg-[#e5b83b]'  },
  KITCHEN: { color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/20',  dot: 'bg-orange-400'  },
};

// Default permissions per role
const DEFAULT_PERMISSIONS = {
  ADMIN:   { dashboard: true,  tables: true,  orders: true,  payments: true,  history: true,  menu: true,  reports: true,  staff: true,  kitchen: true,  discounts: true  },
  CASHIER: { dashboard: false, tables: true,  orders: true,  payments: true,  history: false, menu: true,  reports: false, staff: false, kitchen: false, discounts: true  },
  KITCHEN: { dashboard: false, tables: false, orders: false, payments: false, history: false, menu: true,  reports: false, staff: false, kitchen: true,  discounts: false },
};

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
        enabled ? 'bg-[#e5b83b]' : 'bg-neutral-700'
      }`}
    >
      <span
        className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: enabled ? 'translateX(18px)' : 'translateX(3px)' }}
      />
    </button>
  );
}

function RoleColumn({ role, permissions, onChange, onReset }) {
  const cfg = ROLE_CFG[role] || ROLE_CFG.CASHIER;
  const enabledCount = Object.values(permissions).filter(Boolean).length;

  return (
    <div className="flex flex-col">
      {/* Role header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-2 ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-bold ${cfg.color}`}>{role}</span>
        </div>
        <span className="text-[10px] text-neutral-500">{enabledCount}/{MODULES.length}</span>
      </div>

      {/* Per-module toggles */}
      <div className="flex flex-col gap-1">
        {MODULES.map(mod => (
          <div
            key={mod.key}
            className={`flex items-center justify-center py-3.5 rounded-lg border transition-all ${
              permissions[mod.key]
                ? `${cfg.bg} ${cfg.border}`
                : 'bg-[#0a0a0b] border-neutral-800/40'
            }`}
          >
            <Toggle
              enabled={permissions[mod.key]}
              onChange={() => onChange(role, mod.key)}
            />
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex gap-1 mt-3">
        <button
          onClick={() => onChange(role, '__all__', true)}
          className="flex-1 text-[10px] font-bold text-neutral-600 hover:text-emerald-400 border border-neutral-800 hover:border-emerald-500/30 rounded-lg py-1.5 transition-all"
        >
          All
        </button>
        <button
          onClick={() => onChange(role, '__all__', false)}
          className="flex-1 text-[10px] font-bold text-neutral-600 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 rounded-lg py-1.5 transition-all"
        >
          None
        </button>
        <button
          onClick={() => onReset(role)}
          className="flex-1 text-[10px] font-bold text-neutral-600 hover:text-[#e5b83b] border border-neutral-800 hover:border-[#e5b83b]/30 rounded-lg py-1.5 transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default function PermissionsPage() {
  const [outlets, setOutlets]           = useState([]);
  const [selectedOutlet, setSelected]   = useState(null);
  const [permissions, setPermissions]   = useState({});
  const [savedPerms, setSavedPerms]     = useState({});
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState(null);

  useEffect(() => {
    fetch('/api/superadmin/outlets')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setOutlets(d.data || []);
          if (d.data?.length > 0) {
            setSelected(d.data[0].id);
            const initial = {};
            d.data.forEach(o => {
              initial[o.id] = o.permissions || { ...DEFAULT_PERMISSIONS };
            });
            setPermissions(initial);
            setSavedPerms(JSON.parse(JSON.stringify(initial)));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentPerms = permissions[selectedOutlet] || { ...DEFAULT_PERMISSIONS };
  const hasChanges   = JSON.stringify(permissions[selectedOutlet]) !== JSON.stringify(savedPerms[selectedOutlet]);

  function handleToggle(role, moduleKey, forceValue) {
    setPermissions(prev => {
      const outletPerms = { ...(prev[selectedOutlet] || { ...DEFAULT_PERMISSIONS }) };
      if (moduleKey === '__all__') {
        outletPerms[role] = Object.fromEntries(MODULES.map(m => [m.key, forceValue]));
      } else {
        outletPerms[role] = {
          ...outletPerms[role],
          [moduleKey]: !outletPerms[role][moduleKey],
        };
      }
      return { ...prev, [selectedOutlet]: outletPerms };
    });
  }

  function handleReset(role) {
    setPermissions(prev => ({
      ...prev,
      [selectedOutlet]: {
        ...prev[selectedOutlet],
        [role]: { ...DEFAULT_PERMISSIONS[role] },
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/superadmin/outlets/${selectedOutlet}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: currentPerms }),
      });
      setSavedPerms(prev => ({
        ...prev,
        [selectedOutlet]: JSON.parse(JSON.stringify(currentPerms)),
      }));
      const name = outlets.find(o => o.id === selectedOutlet)?.name;
      showToast(`Permissions saved for ${name}`);
    } catch (err) {
      showToast('Failed to save permissions', true);
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg, error = false) {
    setToast({ msg, error });
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7] font-sans antialiased flex">
      <SuperAdminNav />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-neutral-900 flex items-center justify-between px-6 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-white">Permissions</h1>
            <span className="text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">Role-based module access</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-5xl mx-auto space-y-6">

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Role Permissions</h1>
                <p className="text-xs text-neutral-500 mt-1">Control which modules each role can access per outlet</p>
              </div>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 bg-[#e5b83b] hover:bg-[#f5c847] disabled:opacity-30 disabled:cursor-not-allowed text-[#0a0a0b] font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

            {/* Outlet selector */}
            <div className="flex gap-2 flex-wrap">
              {outlets.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelected(o.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedOutlet === o.id
                      ? 'bg-[#e5b83b] text-[#0a0a0b] border-[#e5b83b]'
                      : 'bg-[#111113] text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-600'
                  }`}
                >
                  {o.name}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32 gap-3 text-neutral-600">
                <div className="w-5 h-5 border-2 border-[#e5b83b] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Loading permissions...</span>
              </div>
            ) : (
              <div className="bg-[#111113] border border-neutral-800/60 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_repeat(3,140px)] gap-0">

                  {/* Module labels column */}
                  <div className="flex flex-col">
                    <div className="px-5 py-3 h-[52px] flex items-center border-b border-neutral-800/40">
                      <span className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">Module</span>
                    </div>
                    {MODULES.map((mod, i) => (
                      <div
                        key={mod.key}
                        className={`px-5 py-3.5 flex flex-col justify-center border-b border-neutral-800/20 last:border-0 ${
                          i % 2 === 0 ? 'bg-white/[0.01]' : ''
                        }`}
                      >
                        <p className="text-xs font-semibold text-white">{mod.label}</p>
                        <p className="text-[10px] text-neutral-600 mt-0.5">{mod.desc}</p>
                      </div>
                    ))}
                    {/* spacer for footer */}
                    <div className="px-5 py-3 h-[52px]" />
                  </div>

                  {/* Role columns */}
                  {ROLES.map(role => {
                    const cfg = ROLE_CFG[role] || ROLE_CFG.CASHIER;
                    const rolePerms = currentPerms[role] || DEFAULT_PERMISSIONS[role] || {};
                    const enabledCount = Object.values(rolePerms).filter(Boolean).length;

                    return (
                      <div key={role} className="flex flex-col border-l border-neutral-800/40">
                        {/* Role header */}
                        <div className={`px-4 py-3 h-[52px] flex items-center justify-between border-b border-neutral-800/40 ${cfg.bg}`}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                            <span className={`text-xs font-bold ${cfg.color}`}>{role}</span>
                          </div>
                          <span className="text-[10px] text-neutral-500">{enabledCount}/{MODULES.length}</span>
                        </div>

                        {/* Per-module toggle cells */}
                        {MODULES.map((mod, i) => (
                          <div
                            key={mod.key}
                            className={`flex items-center justify-center py-3.5 border-b border-neutral-800/20 last:border-0 ${
                              i % 2 === 0 ? 'bg-white/[0.01]' : ''
                            }`}
                          >
                            <Toggle
                              enabled={rolePerms[mod.key] || false}
                              onChange={() => handleToggle(role, mod.key)}
                            />
                          </div>
                        ))}

                        {/* Footer actions */}
                        <div className="flex gap-1 px-3 py-3 h-[52px] items-center border-t border-neutral-800/40">
                          <button
                            onClick={() => handleToggle(role, '__all__', true)}
                            className="flex-1 text-[9px] font-bold text-neutral-600 hover:text-emerald-400 border border-neutral-800 hover:border-emerald-500/30 rounded-md py-1 transition-all"
                          >
                            All
                          </button>
                          <button
                            onClick={() => handleToggle(role, '__all__', false)}
                            className="flex-1 text-[9px] font-bold text-neutral-600 hover:text-red-400 border border-neutral-800 hover:border-red-500/30 rounded-md py-1 transition-all"
                          >
                            None
                          </button>
                          <button
                            onClick={() => handleReset(role)}
                            className="flex-1 text-[9px] font-bold text-neutral-600 hover:text-[#e5b83b] border border-neutral-800 hover:border-[#e5b83b]/30 rounded-md py-1 transition-all"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-6 text-[11px] text-neutral-600">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-2.5 rounded-full bg-[#e5b83b]" />
                <span>Enabled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-2.5 rounded-full bg-neutral-700" />
                <span>Disabled</span>
              </div>
              <span>Changes are per-outlet and saved independently.</span>
            </div>
          </div>
        </main>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-2.5 border text-xs font-semibold px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm z-50 ${
          toast.error
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {toast.msg}
        </div>
      )}
    </div>
  );
}