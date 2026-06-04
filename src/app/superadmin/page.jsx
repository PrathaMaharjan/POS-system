"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminNav from '../components/superadmin/SuperAdminNav';




function Sparkline({ data = [], color = '#e5b83b' }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm transition-all duration-300"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.6 }}
        />
      ))}
    </div>
  );
}


function StatusPill({ status }) {
  const cfg = {
    Online:  { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
    Offline: { dot: 'bg-red-400',     text: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20' },
  }[status] || { dot: 'bg-neutral-400', text: 'text-neutral-400', bg: 'bg-neutral-400/10 border-neutral-400/20' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {status}
    </span>
  );
}


function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/superadmin/overview')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const data = stats || { totalOrders: 0, totalRevenue: 0, totalStaff: 0, totalTables: 0, recentOrders: [] };

  const topCards = [
    {
      label: 'Total Revenue',
      value: `Rs.${Number(data.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: 'Completed orders',
      accent: '#e5b83b',
      spark: [30, 55, 40, 70, 45, 80, 95],
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
    },
    {
      label: 'Total Orders',
      value: data.totalOrders,
      sub: 'All time',
      accent: '#3b82f6',
      spark: [20, 45, 30, 60, 35, 70, 85],
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/></svg>,
    },
    {
      label: 'Staff Members',
      value: data.totalStaff,
      sub: 'Across all roles',
      accent: '#22c55e',
      spark: [10, 10, 20, 20, 30, 30, 40],
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>,
    },
    {
      label: 'Tables',
      value: data.totalTables,
      sub: 'Configured',
      accent: '#a855f7',
      spark: [5, 5, 10, 15, 15, 20, 20],
      icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 18v3M20 18v3M3 8h18v4a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>,
    },
  ];

  return (
    <div className="space-y-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {topCards.map(card => (
          <div key={card.label} className="bg-[#111113] border border-neutral-800/60 rounded-2xl p-5 flex flex-col gap-4 hover:border-neutral-700 transition-all duration-200 group">
            <div className="flex items-start justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ background: `${card.accent}15`, borderColor: `${card.accent}30`, color: card.accent }}>
                {card.icon}
              </div>
              <Sparkline data={card.spark} color={card.accent} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-bold text-white mt-1 tracking-tight">{card.value}</p>
              <p className="text-[11px] text-neutral-600 mt-0.5">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent orders — 2 cols */}
        <div className="lg:col-span-2 bg-[#111113] border border-neutral-800/60 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/60">
            <div>
              <h3 className="text-sm font-bold text-white">Recent Orders</h3>
              <p className="text-[11px] text-neutral-500 mt-0.5">Latest transactions across all outlets</p>
            </div>
            <span className="text-[10px] font-bold text-[#e5b83b] bg-[#e5b83b]/10 border border-[#e5b83b]/20 px-2.5 py-1 rounded-full">LIVE</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-[#e5b83b] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest border-b border-neutral-800/40">
                    <th className="py-3 px-5 text-left">Order</th>
                    <th className="py-3 px-5 text-left">Type</th>
                    <th className="py-3 px-5 text-left">Status</th>
                    <th className="py-3 px-5 text-left">Payment</th>
                    <th className="py-3 px-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/30">
                  {data.recentOrders.map(o => (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-5 font-bold text-white">#{String(o.orderNumber).padStart(4,'0')}</td>
                      <td className="py-3 px-5 text-neutral-400">{o.type === 'TAKEAWAY' ? 'Takeaway' : ' Dine-in'}</td>
                      <td className="py-3 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          o.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          o.status === 'PENDING'   ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                     'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>{o.status}</span>
                      </td>
                      <td className="py-3 px-5 text-neutral-500">{o.paymentMethod || '—'}</td>
                      <td className="py-3 px-5 text-right font-bold text-white">Rs.{Number(o.total).toFixed(2)}</td>
                    </tr>
                  ))}
                  {data.recentOrders.length === 0 && (
                    <tr><td colSpan={5} className="py-12 text-center text-neutral-700 text-xs">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System integrity — 1 col */}
        <div className="bg-[#111113] border border-neutral-800/60 rounded-2xl p-5 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">System Integrity</h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">Platform health indicators</p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Database',       value: 'Connected',  status: 'good' },
              { label: 'Auth Service',   value: 'Operational', status: 'good' },
              { label: 'API Endpoints',  value: 'Healthy',    status: 'good' },
              { label: 'Menu Items',     value: `${data.totalOrders > 0 ? 'Active' : 'Check'}`, status: data.totalOrders > 0 ? 'good' : 'warn' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-neutral-800/40 last:border-0">
                <span className="text-xs text-neutral-400">{item.label}</span>
                <span className={`text-[11px] font-bold ${item.status === 'good' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-2">
            <div className="bg-[#e5b83b]/5 border border-[#e5b83b]/20 rounded-xl p-4 text-center">
              <p className="text-[10px] font-bold text-[#e5b83b] uppercase tracking-widest">Uptime</p>
              <p className="text-2xl font-bold text-white mt-1">99.9%</p>
              <p className="text-[11px] text-neutral-600 mt-0.5">Last 30 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Staff Tab ─────────────────────────────────────────────────────────────────
function StaffTab() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/superadmin/staff')
      .then(r => r.json())
      .then(d => { if (d.success) setStaff(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const ROLE_STYLES = {
    SUPER_ADMIN: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    ADMIN:       'bg-[#e5b83b]/10 text-[#e5b83b] border-[#e5b83b]/20',
    CASHIER:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">All Staff</h2>
        <p className="text-xs text-neutral-500 mt-1">Every staff member in the system</p>
      </div>
      <div className="bg-[#111113] border border-neutral-800/60 rounded-2xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest border-b border-neutral-800/40">
              <th className="py-3 px-5 text-left">Name</th>
              <th className="py-3 px-5 text-left">Employee ID</th>
              <th className="py-3 px-5 text-left">Role</th>
              <th className="py-3 px-5 text-left">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/30">
            {staff.map(s => (
              <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-5 font-semibold text-white">{s.name}</td>
                <td className="py-3.5 px-5 font-mono text-neutral-400">{s.pin}</td>
                <td className="py-3.5 px-5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ROLE_STYLES[s.role] || ''}`}>{s.role}</span>
                </td>
                <td className="py-3.5 px-5 text-neutral-500">
                  {new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {!loading && staff.length === 0 && (
              <tr><td colSpan={4} className="py-12 text-center text-neutral-700">No staff found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function PlaceholderTab({ title, desc }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-neutral-700 gap-3">
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
      </svg>
      <p className="text-sm font-semibold text-neutral-600">{title}</p>
      <p className="text-xs text-neutral-700">{desc}</p>
      <span className="text-[10px] font-bold text-[#e5b83b] bg-[#e5b83b]/10 border border-[#e5b83b]/20 px-3 py-1 rounded-full mt-2">Coming Soon</span>
    </div>
  );
}


export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e4e4e7] flex font-sans antialiased">


     <SuperAdminNav />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="h-14 border-b border-neutral-900 flex items-center justify-between px-6 shrink-0 bg-[#0a0a0b]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-white capitalize">
              {{ overview: 'Dashboard', permissions: 'Permissions', staff: 'Staff', audit: 'Audit' }[activeTab]}
            </h1>
            <span className="text-neutral-700">·</span>
            <span className="text-xs text-neutral-500">Real-time Global Stats</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Online
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'overview'    && <OverviewTab />}

          {activeTab === 'permissions' && <PlaceholderTab title="Permissions" desc="Control module access per outlet and role" />}
          {activeTab === 'staff'       && <StaffTab />}
          {activeTab === 'audit'       && <PlaceholderTab title="Audit Log" desc="Track all staff actions across the system" />}
        </main>
      </div>
    </div>
  );
}