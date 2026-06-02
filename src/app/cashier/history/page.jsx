"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Header from '../../components/header/page';
import { useRouter } from 'next/navigation';

const STATUS_STYLES = {
  COMPLETED: { label: 'Completed', dot: 'bg-[#22c55e]', text: 'text-[#22c55e]', bg: 'bg-[#22c55e]/10 border-[#22c55e]/20' },
  CANCELLED: { label: 'Cancelled', dot: 'bg-[#ef4444]', text: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10 border-[#ef4444]/20' },
  PENDING:   { label: 'Pending',   dot: 'bg-[#e5b83b]', text: 'text-[#e5b83b]', bg: 'bg-[#e5b83b]/10 border-[#e5b83b]/20' },
};

const getPaymentBadge = (method) => {
  const cleanMethod = method?.toUpperCase() || 'UNPAID';
  
  switch (cleanMethod) {
    case 'CASH':
      return { label: 'Cash Payment', color: 'text-neutral-300 bg-neutral-900/50 border border-neutral-800 px-2 py-0.5 rounded-md text-[11px]' };
    case 'CARD':
      return { label: 'Card Payment', color: 'text-neutral-300 bg-neutral-900/50 border border-neutral-800 px-2 py-0.5 rounded-md text-[11px]' };
    case 'FONEPAY':
    case 'QR':
      return { label: 'QR Payment', color: 'text-neutral-300 bg-[#e5b83b]/10 border border-[#e5b83b]/20 px-2 py-0.5 rounded-md text-[11px]' };
    default:
      return { label: 'Unpaid Shift', color: 'text-neutral-500 bg-neutral-900/20 border border-neutral-900 px-2 py-0.5 rounded-md text-[11px] font-semibold' };
  }
};

function formatTime(iso) {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function History() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch real order history data from backend API
  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data && !data.error) {
          setOrders(Object.values(data));
        }
      })
      .catch((err) => {
        console.error("Failed fetching live history records:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, itemsPerPage]);


  const handleDeleteOrder = async (e, orderId) => {
  e.stopPropagation(); 
  
  if (!window.confirm("Are you sure you want to permanently delete this order record?")) {
    return;
  }

  try {
    const response = await fetch(`/api/orders?id=${orderId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
   
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      if (expandedId === orderId) setExpandedId(null);
    } else {

      try {
        const errData = await response.json();
        alert(errData.error || "Failed to delete order. Please try again.");
      } catch {
        alert(`Failed to delete order. Server returned status: ${response.status}`);
      }
    }
  } catch (err) {
    console.error("Critical error during deletion:", err);
    alert("Network error. Could not delete order.");
  }
};

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const currentStatus = o.status?.toUpperCase() || 'PENDING';
      const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
      
      const orderNumString = String(o.orderNumber || o.id || '');
      const itemsList = o.items || [];
      const matchesSearch =
        orderNumString.includes(search) ||
        itemsList.some(i => i.name?.toLowerCase().includes(search.toLowerCase()));
        
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const stats = useMemo(() => {
    const completedOrders = orders.filter(o => o.status?.toUpperCase() === 'COMPLETED');
    const pendingOrders = orders.filter(o => o.status?.toUpperCase() === 'PENDING');
    return {
      total: orders.length,
      revenue: completedOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      completed: completedOrders.length,
      pending: pendingOrders.length,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0d] text-[#e4e4e7] flex items-center justify-center font-sans">
        <div className="text-[#e5b83b] text-sm font-bold tracking-[0.2em] animate-pulse">
          LOADING ORDER HISTORY...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-[#e4e4e7] flex flex-col font-sans select-none antialiased">
      <Header />

      <main className="flex-1 px-10 py-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Order History</h1>
            <p className="text-sm text-neutral-500 mt-0.5">All orders from today's shift</p>
          </div>
          <button
            onClick={() => router.push('/cashier')}
            className="flex items-center gap-2 bg-[#141416] border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.total, color: 'text-white' },
            { label: 'Revenue', value: `Rs.${stats.revenue.toFixed(2)}`, color: 'text-[#e5b83b]' },
            { label: 'Completed', value: stats.completed, color: 'text-[#22c55e]' },
            { label: 'Pending', value: stats.pending, color: 'text-[#e5b83b]' },
          ].map(s => (
            <div key={s.label} className="bg-[#141416] border border-neutral-800 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#e5b83b] rounded-l-2xl" />
              <p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <input
                type="text"
                placeholder="Search order # or item..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#141416] border border-neutral-800 focus:border-[#e5b83b]/60 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-all"
              />
            </div>

            {/* Status filter */}
            <div className="flex gap-2">
              {['ALL', 'COMPLETED', 'PENDING', 'CANCELLED'].map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    statusFilter === s
                      ? 'bg-[#e5b83b] text-[#0c0c0d]'
                      : 'bg-[#141416] text-neutral-400 border border-neutral-800 hover:text-white'
                  }`}
                >
                  {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

         
        </div>

        {/* Orders list */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-600 gap-2">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p className="text-sm font-medium">No orders found</p>
            </div>
          )}

          {paginatedOrders.map(order => {
            const currentStatus = order.status?.toUpperCase() || 'PENDING';
            const s = STATUS_STYLES[currentStatus] || STATUS_STYLES.PENDING;
            const isExpanded = expandedId === order.id;
            const orderItems = order.items || [];
            
            // Dynamic payment configuration context
            const paymentBadge = getPaymentBadge(order.paymentMethod);

            return (
              <div
                key={order.id}
                className="bg-[#141416] border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-200 hover:border-neutral-700 group"
              >
                {/* Order row */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Order number */}
                    <div className="w-12 h-12 rounded-xl bg-[#0c0c0d] border border-neutral-800 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#e5b83b]">#{order.orderNumber || '---'}</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-bold text-white tracking-wide">
                          {orderItems.length > 0 ? orderItems.map(i => i.name).join(', ') : 'Empty Order'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium flex-wrap">
                        <span>{formatDate(order.createdAt)} · {formatTime(order.createdAt)}</span>
                        <span className="text-neutral-700">•</span>
                        
                        {/* Conditional Dine-in Table Display */}
                        <span>
                          {order.type?.toUpperCase() === 'TAKEAWAY' ? (
                            'Takeaway'
                          ) : (
                            `Dine-in · ${order.tableName || order.tableId || 'Table --'}`
                          )}
                        </span>
                        
                        <span className="text-neutral-700">•</span>
                        
                        {/* Clean Text-based Payment Method Badge Container */}
                        <span className={paymentBadge.color}>
                          {paymentBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status badge */}
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${s.bg} ${s.text}`}>
                      {s.label}
                    </span>

                    {/* Total */}
                    <span className="text-base font-bold text-white w-24 text-right">
                      Rs.{(order.total || 0).toFixed(2)}
                    </span>

                    {/* Trash Delete Action Button */}
                    <button
                      onClick={(e) => handleDeleteOrder(e, order.id)}
                      className="p-2 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-150 md:opacity-0 group-hover:opacity-100"
                      title="Delete Order Record"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </button>

                    {/* Expand chevron */}
                    <svg
                      className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-neutral-800 px-5 py-4 bg-[#0f0f10]">
                    <div className="flex gap-8 flex-wrap md:flex-nowrap">
                      {/* Items */}
                      <div className="flex-1 min-w-[250px]">
                        <p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-3">Items</p>
                        <div className="flex flex-col gap-2">
                          {orderItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-neutral-300">{item.quantity}x {item.name}</span>
                              <span className="text-neutral-400">Rs.{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals breakdown */}
                      <div className="w-48 ml-auto">
                        <p className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-3">Summary</p>
                        <div className="flex flex-col gap-1.5 text-sm">
                          <div className="flex justify-between text-neutral-400">
                            <span>Subtotal</span>
                            <span>Rs.{(order.subtotal || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-neutral-400">
                            <span>Tax (8%)</span>
                            <span>Rs.{(order.tax || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-white border-t border-neutral-800 pt-1.5 mt-1">
                            <span>Total</span>
                            <span className="text-[#e5b83b]">Rs.{(order.total || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination bar */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-neutral-900 pt-4 mt-2">
            <div className="text-xs text-neutral-500 font-medium">
              Showing <span className="text-neutral-300">{Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)}</span> to{' '}
              <span className="text-neutral-300">{Math.min(filtered.length, currentPage * itemsPerPage)}</span> of{' '}
              <span className="text-[#e5b83b]">{filtered.length}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 bg-[#141416] border border-neutral-800 rounded-xl text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors duration-150"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`min-w-[36px] h-9 rounded-xl text-xs font-bold transition-all duration-150 border ${
                      currentPage === pageNumber
                        ? 'bg-[#e5b83b] border-[#e5b83b] text-[#0c0c0d]'
                        : 'bg-[#141416] border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-2 bg-[#141416] border border-neutral-800 rounded-xl text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors duration-150"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}