"use client";

import React, { useState, useEffect } from 'react';

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [newTable, setNewTable] = useState({ name: '', seats: 4, status: 'available', shape: 'square' });

  async function loadLiveTables() {
    try {
      const res = await fetch('/api/tables');
      if (res.ok) {
        const dbTables = await res.json();
        setTables(dbTables);
      }
    } catch (error) {
      console.error("Network error fetching tables:", error);
    }
  }

  useEffect(() => {
    loadLiveTables();
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTable.name) return;

    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTable.name.toUpperCase(),
          seats: parseInt(newTable.seats) || 4,
          status: newTable.status,
          shape: newTable.shape,
        }),
      });

      const result = await res.json();
      if (result.success) {
        await loadLiveTables();
        setNewTable({ name: '', seats: 4, status: 'available', shape: 'square' });
        setIsTableModalOpen(false);
      } else {
        alert("Error adding table: " + result.error);
      }
    } catch (error) {
      console.error("Failed to add table:", error);
    }
  };

  const handleDeleteTable = async (id) => {
    try {
      const res = await fetch(`/api/tables/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setTables(prev => prev.filter(t => t.id !== id));
        setDeleteConfirmId(null);
      } else {
        alert("Failed to delete table: " + result.error);
      }
    } catch (error) {
      console.error("Failed to delete table:", error);
    }
  };

  return (
    <div className="w-full space-y-8 text-white">

      {/* Legend + Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#141416]/40 p-4 rounded-xl border border-neutral-900">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            <span className="text-neutral-400 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span className="text-neutral-400 font-medium">Occupied</span>
          </div>
        </div>

        <button
          onClick={() => setIsTableModalOpen(true)}
          className="bg-[#e5b83b] hover:bg-[#f5c847] text-[#0c0c0d] font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md self-end sm:self-auto"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Table
        </button>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
        {tables.map((table) => {
          const isAvailable = table.status === 'available';

          return (
            <div
              key={table.id}
              className={`aspect-square p-5 flex flex-col items-center justify-center border transition-all select-none group relative bg-neutral-900/20 ${
                table.shape === 'round' ? 'rounded-full' : 'rounded-2xl'
              } ${
                isAvailable
                  ? 'border-neutral-800'
                  : 'border-[#ef4444]/30'
              }`}
            >
              <div className="text-center space-y-3">
                <span className="text-xs font-bold tracking-wider block text-neutral-400 group-hover:text-white transition-colors">
                  {table.label}
                </span>

                <div className="flex justify-center">
                  <svg
                    className={`w-5 h-5 ${isAvailable ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                <span className="text-[10px] font-medium text-neutral-500 block">
                  {table.seats} Seats
                </span>
              </div>

              {/* Delete button — visible on hover */}
              <button
                onClick={() => setDeleteConfirmId(table.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 transition-all duration-150"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          );
        })}

        {tables.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-neutral-800 rounded-2xl bg-neutral-900/10">
            <p className="text-xs text-neutral-500 font-medium">No tables found. Click "Add Table" to get started.</p>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-[#0c0c0d]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-neutral-800 w-full max-w-sm rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white">Delete Table?</h3>
            <p className="text-sm text-neutral-400">This will permanently remove the table. This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 font-bold text-xs py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTable(deleteConfirmId)}
                className="flex-1 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold text-xs py-3 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c0c0d]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-neutral-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Add New Table</h3>
              <button onClick={() => setIsTableModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase">Table Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., T-09, R-03"
                    value={newTable.name}
                    onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                    className="w-full bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none placeholder-neutral-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase">Seats</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTable.seats}
                    onChange={(e) => setNewTable({ ...newTable, seats: e.target.value })}
                    className="w-full bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase">Shape</label>
                  <select
                    value={newTable.shape}
                    onChange={(e) => setNewTable({ ...newTable, shape: e.target.value })}
                    className="w-full bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="square">Square / Rectangular</option>
                    <option value="round">Round / Circular</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase">Default Status</label>
                  <select
                    value={newTable.status}
                    onChange={(e) => setNewTable({ ...newTable, status: e.target.value })}
                    className="w-full bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl px-3 py-2.5 text-xs text-white outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsTableModalOpen(false)} className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold text-xs py-3 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-[#e5b83b] text-[#0c0c0d] font-bold text-xs py-3 rounded-xl hover:bg-[#f5c847] transition-colors">
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}