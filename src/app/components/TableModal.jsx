"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Order from './Order/page';

import PaymentModal from './PaymentModal'; 

const TABS = [
  'Add Order',
  'Order List',
  
  'Join Table'
];

export default function TableModal({ table, onClose }) {
  const [activeTab, setActiveTab] = useState('Add Order');
  const [orders, setOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  
  // Controls the payment window context for settling the bill
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'Order List') {
      fetchOrders();
    }
  }, [activeTab, table.id]);

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();

      const activeOrders = data.filter(
        order =>
          order.tableId === table.id &&
          order.status === 'PENDING'
      );

      const completedOrders = data.filter(
        order =>
          order.tableId === table.id &&
          order.status === 'COMPLETED'
      );

      setOrders(activeOrders);
      setHistoryOrders(completedOrders); 
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }

  // Calculates the current subtotal for all combined pending orders on this specific table
  const totalTableBalance = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
  }, [orders]);

  // Invoked when the PaymentModal successfully executes
  const handleTableSettlement = async (paymentDetails) => {
    try {
      // 1. Process and settle all pending orders for this table
      const updatePromises = orders.map(order => 
        fetch(`/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'COMPLETED',
            paymentMethod: paymentDetails.paymentMethod 
          })
        })
      );
      
      await Promise.all(updatePromises);

      // 2. Clear table state by changing status back to available
      const tableRes = await fetch(`/api/tables/${table.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'available' }),
      });

      if (!tableRes.ok) throw new Error('Failed to free table status');

      setShowPaymentModal(false);
      onClose(); // Close out modal window
      window.location.reload(); // Refresh viewport to sync table canvas layout
    } catch (err) {
      console.error("Settlement transaction failure:", err);
      alert("An error occurred during order settlement processing.");
    }
  };

  async function updateTableStatus(status) {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();

      const pendingOrders = data.filter(
        order =>
          order.tableId === table.id &&
          order.status === 'PENDING'
      );

      if (status === 'available' && pendingOrders.length > 0) {
        alert('Cannot manually free table. You must clear the active balance first.');
        return;
      }

      const updateRes = await fetch(`/api/tables/${table.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!updateRes.ok) throw new Error('Failed to update table status');

      window.location.reload();
    } catch (err) {
      console.error('updateTableStatus error:', err);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0c0c0d] border border-neutral-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{table.label}</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {table.seats ? `${table.seats} Seats · ` : ''}Dine-in
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors p-2 rounded-lg hover:bg-neutral-800"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-6 pt-4 pb-0 border-b border-neutral-800 shrink-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all duration-150 border-b-2 -mb-[1px] ${
                activeTab === tab
                  ? 'text-[#e5b83b] border-[#e5b83b] bg-[#e5b83b]/5'
                  : 'text-neutral-500 border-transparent hover:text-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Canvas */}
        <div className="flex-1 overflow-hidden">

          {/* Add Order — Now simply appends items seamlessly */}
          {activeTab === 'Add Order' && (
            <Order
              tableId={table.id}
              orderType="DINE_IN"
              showHeader={false}
              onOrderCreated={fetchOrders}
            />
          )}

          {/* Order List */}
          {activeTab === 'Order List' && (
            <div className="h-full flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {orders.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-600 gap-3">
                    <svg className="w-12 h-12 stroke-[1.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3m8 11v-4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4M3 8h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
                    </svg>
                    <p className="text-sm">No pending items found for {table.label}</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="bg-[#141416] border border-neutral-800 rounded-xl p-4">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-sm">Order #{order.orderNumber}</h3>
                          <p className="text-[11px] text-neutral-500">{new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <span className="text-[#e5b83b] text-sm font-bold">Rs.{order.total.toFixed(2)}</span>
                      </div>

                      <div className="space-y-2 border-t border-neutral-900/50 pt-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-neutral-400">{item.quantity} × {item.product?.name || item.name}</span>
                            <span className="text-neutral-200">Rs.{(item.subtotal || (item.product?.price * item.quantity)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Table Bottom Action Summary Block */}
              {orders.length > 0 && (
                <div className="bg-[#141416] border-t border-neutral-800 p-5 flex items-center justify-between gap-6 shrink-0">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">Unsettled Balance</span>
                    <span className="text-xl font-black text-white">Rs. {totalTableBalance.toFixed(2)} <span className="text-xs text-neutral-400 font-normal">(Before Taxes)</span></span>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-[#e5b83b] hover:bg-[#f5c847] active:scale-[0.98] text-[#0c0c0d] font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-150 shadow-[0_4px_20px_rgba(229,184,59,0.1)]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                    Process Table Payment
                  </button>
                </div>
              )}
            </div>
          )}

         

          {/* Join Table View */}
          {activeTab === 'Join Table' && (
            <div className="h-full p-6 flex flex-col gap-4 overflow-y-auto">
              <p className="text-xs font-bold tracking-widest text-neutral-500 uppercase">Merge with another table</p>
              <p className="text-sm text-neutral-500">Select a table to join with {table.label}:</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {['T-01', 'T-03', 'T-04', 'T-05', 'T-06', 'T-07'].map(t => (
                  <button
                    key={t}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-neutral-800 bg-[#141416] hover:border-[#e5b83b]/60 hover:bg-[#e5b83b]/5 transition-all duration-150"
                  >
                    <svg className="w-6 h-6 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 18v3M20 18v3M3 8h18v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8zM12 14v4M8 18h8"/>
                    </svg>
                    <span className="text-sm font-semibold text-white">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Shared Payment Instance */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        totalAmount={totalTableBalance}
        onPaymentSuccess={handleTableSettlement}
      />

    </div>
  );
}