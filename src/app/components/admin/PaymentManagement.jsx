"use client";

import React, { useState, useEffect } from 'react';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [summary, setSummary] = useState({ totalReceived: 0, pendingVolume: 0, count: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  async function fetchPaymentData() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payments');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setPayments(json.data || []);
          setSummary(json.summary || { totalReceived: 0, pendingVolume: 0, count: 0 });
        }
      }
    } catch (err) {
      console.error("Failed to recover ledger streams:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const filteredPayments = payments.filter(pay => {
    const matchesSearch =
      pay.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pay.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pay.tableName && pay.tableName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (pay.cashierName && pay.cashierName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || pay.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  // ✅ FIX 2: Use paginatedPayments in the table (was using filteredPayments before)
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-3 text-neutral-500 font-medium">
        <div className="w-6 h-6 border-2 border-[#e5b83b] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs tracking-widest uppercase">Fetching Transaction Ledgers...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-white animate-fadeIn">

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Payment Ledger</h2>
          <p className="text-xs text-neutral-500 mt-1">Audit terminal transactions and gateway settlement statuses</p>
        </div>
        <button
          onClick={fetchPaymentData}
          className="text-xs font-bold text-[#e5b83b] bg-[#e5b83b]/5 hover:bg-[#e5b83b]/10 border border-[#e5b83b]/20 px-4 py-2 rounded-xl transition-all"
        >
          Refresh Audit Trail
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#141416] border-l-2 border-l-emerald-500 border-y border-r border-neutral-800/60 rounded-xl p-5">
          <span className="text-xs text-neutral-400 font-medium">Net Revenue</span>
          <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
            Rs. {parseFloat(summary.totalReceived).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="bg-[#141416] border-l-2 border-l-amber-500 border-y border-r border-neutral-800/60 rounded-xl p-5">
          <span className="text-xs text-neutral-400 font-medium">Open Tabs</span>
          <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
            Rs. {parseFloat(summary.pendingVolume).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        <div className="bg-[#141416] border-y border-r border-neutral-800/60 rounded-xl p-5">
          <span className="text-xs text-neutral-400 font-medium">Transactions</span>
          <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
            {summary.count} Transactions
          </h3>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#141416] border border-neutral-900 rounded-xl p-4">
        <div className="w-full md:max-w-sm relative">
          <svg className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search Reference and Table"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0c0c0d] border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700 transition-all"
          />
        </div>
      </div>

      {/* Table + Pagination — all inside one container */}
      <div className="bg-[#141416] border border-neutral-900 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800/80 bg-neutral-950/20 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <th className="py-4 px-5">Timestamp</th>
                <th className="py-4 px-5">Originating Point</th>
                <th className="py-4 px-5">Settlement Method</th>
                <th className="py-4 px-5">Status Node</th>
                <th className="py-4 px-5 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 text-xs">
              {/* ✅ FIX 2: paginatedPayments instead of filteredPayments */}
              {paginatedPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-neutral-950/20 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-white tracking-tight">{payment.id}</div>
                    <div className="text-[10px] text-neutral-500 mt-1">{payment.createdAt}</div>
                  </td>
                  <td className="py-4 px-5 font-medium text-neutral-300">
                    {payment.tableName || "Quick Counter"}
                  </td>
                  <td className="py-4 px-5">
                    <span className="text-[11px] font-mono bg-neutral-950 px-2 py-1 rounded border border-neutral-800/60 text-neutral-400">
                      {payment.method}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      payment.status === 'COMPLETED'
                        ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                        : payment.status === 'PENDING'
                        ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                        : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right font-bold text-white">
                    Rs. {parseFloat(payment.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12 text-xs text-neutral-600 font-medium">
            No secure payment records pass validation limits for this segment view.
          </div>
        )}

        {/* ✅ FIX 1: Pagination moved inside the table container div */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-900">
            <span className="text-xs text-neutral-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '...' ? (
                    <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-neutral-600 text-xs">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        currentPage === p
                          ? 'bg-[#e5b83b] text-[#0c0c0d]'
                          : 'border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )
              }

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}