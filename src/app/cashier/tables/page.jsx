"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/header/page';
import { useRouter } from 'next/navigation';
import TableModal from '../../components/TableModal';

// Simplified configuration mapping exactly to your active statuses
const STATUS_CONFIG = {
  available: { 
    color: '#22c55e', 
    borderColor: 'border-[#22c55e]/20 hover:border-[#22c55e]/50', 
    shadowColor: 'hover:shadow-[0_0_15px_rgba(34,197,94,0.1)]',
    iconColor: 'text-[#22c55e]', 
    label: 'Available', 
    dotColor: 'bg-[#22c55e]' 
  },
  occupied: { 
    color: '#ef4444', 
    borderColor: 'border-[#ef4444]/40 hover:border-[#ef4444]/70', 
    shadowColor: 'hover:shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    iconColor: 'text-[#ef4444]', 
    label: 'Occupied', 
    dotColor: 'bg-[#ef4444]' 
  },
};

// Represents the standard table/chair logo
function ChairIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5" />
      <path d="M3 9h18v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
      <path d="M7 13v6M17 13v6M5 19h14" />
    </svg>
  );
}

// Represents the active users/people group logo
function UsersIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Switches icons directly between people or a table logo
function TableIcon({ status, iconColor }) {
  const cls = `w-7 h-7 ${iconColor} transition-transform duration-200 group-hover:scale-105`;
  if (status === 'occupied') {
    return <UsersIcon className={cls} />;
  }
  return <ChairIcon className={cls} />;
}

function TableCard({ table, onClick }) {
  const cfg = STATUS_CONFIG[table.status] || STATUS_CONFIG.available;
  const isRound = table.shape === 'round';

  return (
    <div 
      onClick={onClick}
      className={`
        group relative flex flex-col items-center justify-center text-center cursor-pointer
        bg-[#141416] border ${cfg.borderColor} ${cfg.shadowColor} transition-all duration-300
        hover:-translate-y-1 p-5 gap-3 w-full aspect-square select-none
        ${isRound ? 'rounded-full' : 'rounded-2xl'}
      `}
    >
      {/* Table Identifier Label */}
      <span className="text-[12px] font-medium text-neutral-400 tracking-wider uppercase group-hover:text-white transition-colors">
        {table.label}
      </span>

      {/* Main Status Icon */}
      <TableIcon status={table.status} iconColor={cfg.iconColor} />

      {/* Unified Bottom Slot: Uniform Seat Number display across all table states */}
      <div className="min-h-[24px] flex items-center justify-center w-full mt-1">
        {table.seats && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-900/60 border border-neutral-800 rounded-full">
            <span className="text-[11px] font-medium text-neutral-400 tracking-wide">
              {table.seats} Seats
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const router = useRouter();
  
  // Sync state data from local API
  useEffect(() => {
    fetch('/api/tables')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setTables(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Compute metrics from simplified active states
  const occupied = tables.filter(t => t.status === 'occupied').length;
  const total = tables.length;
  const occupancyPct = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const activeRevenue = tables.filter(t => t.amount).reduce((s, t) => s + (t.amount ?? 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0d] text-[#e4e4e7] flex items-center justify-center font-sans">
        <div className="text-[#e5b83b] text-sm font-bold tracking-[0.2em] animate-pulse">
          LOADING FLOORPLAN...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-[#e4e4e7] flex flex-col font-sans select-none antialiased">
      <Header />

      <main className="flex-1 flex flex-col px-8 py-6 gap-6 max-w-[1400px] mx-auto w-full">

        {/* Legend Filter Banner */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-[#141416]/40 border border-neutral-900/60 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-5 flex-wrap">
            {['available', 'occupied'].map((s) => (
              <div key={s} className="flex items-center gap-2 bg-[#0c0c0d]/60 px-3 py-1.5 rounded-lg border border-neutral-900">
                <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dotColor} shadow-sm`} />
                <span className="text-xs font-medium text-neutral-400">{STATUS_CONFIG[s].label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/cashier')}
            className="flex items-center gap-2 bg-[#141416] border border-neutral-800 hover:border-[#e5b83b]/60 text-neutral-400 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all duration-150 shrink-0"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Go Back
          </button>
        </div>

        {/* Dynamic Table Grid Layout with Enhanced Spaces */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 flex-1 content-start py-2">
          {tables.map((table) => (
            <TableCard key={table.id} table={table} onClick={() => setSelectedTable(table)} />
          ))}
        </div>

        {/* Bottom Metrics Panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-auto pt-4 border-t border-neutral-900">
          <div className="bg-[#141416] border border-neutral-900/80 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">Total Occupancy</span>
                <svg className="w-4 h-4 text-[#e5b83b]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <span className="text-3xl font-extrabold text-[#e5b83b]">{occupancyPct}%</span>
            </div>
            <div className="mt-4">
              <div className="h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                <div className="h-full bg-[#e5b83b] rounded-full transition-all duration-700" style={{ width: `${occupancyPct}%` }} />
              </div>
              <p className="text-[11px] text-neutral-500 font-medium mt-2">{occupied} Tables Occupied &bull; {total} Total</p>
            </div>
          </div>

          <div className="bg-[#141416] border border-neutral-900/80 rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">Revenue (Active)</span>
              <svg className="w-4 h-4 text-[#e5b83b]/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-[#e5b83b]">Rs.{activeRevenue.toFixed(2)}</span>
              <p className="text-[11px] text-[#22c55e] font-semibold mt-4 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-[#22c55e]" /> +12% from yesterday
              </p>
            </div>
          </div>
        </div>
      </main>

      {selectedTable && (
        <TableModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </div>
  );
}