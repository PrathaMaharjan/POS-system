"use client";

import React, { useState } from 'react';
import PerformanceOverview from '../components/admin/PerformanceOverview';
import MenuManagement from '../components/admin/MenuManagement';
import TableManagement from '../components/admin/TableManagement';
import PaymentManagement from '../components/admin/PaymentManagement'; 
import Staff from '../components/admin/Staff'; 
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); 

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        window.location.replace("/login");
      } else {
        alert("Failed to safely destroy session tokens.");
      }
    } catch (error) {
      console.error("Logout runtime communication breakdown:", error);
      window.location.replace("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0d] p-6 md:p-10 flex flex-col gap-8 select-none">
   
      <header className="w-full flex justify-center items-center shrink-0">

        <div className="bg-[#141416] border border-neutral-800 p-1.5 rounded-full flex items-center shadow-lg max-w-3xl w-full justify-between">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
              activeTab === 'overview'
                ? 'bg-[#e5b83b] text-[#0c0c0d] shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
            </svg>
            Overview
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
              activeTab === 'menu'
                ? 'bg-[#e5b83b] text-[#0c0c0d] shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Manage Menu
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
              activeTab === 'tables'
                ? 'bg-[#e5b83b] text-[#0c0c0d] shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
            Manage Tables
          </button>

          
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
              activeTab === 'payments'
                ? 'bg-[#e5b83b] text-[#0c0c0d] shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            Payments
          </button>
          <button
  onClick={() => setActiveTab('staff')}
  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold transition-all duration-200 ${
    activeTab === 'staff'
      ? 'bg-[#e5b83b] text-[#0c0c0d] shadow-md'
      : 'text-neutral-400 hover:text-white'
  }`}
>
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
  Staff
</button>

        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto flex-1">
        {activeTab === 'overview' && <PerformanceOverview />}
        {activeTab === 'menu' && <MenuManagement />}
        {activeTab === 'tables' && <TableManagement />}
        {activeTab === 'payments' && <PaymentManagement />}
        {activeTab === 'staff' && <Staff />} 
      </main>

      <div className="w-full max-w-6xl mx-auto flex justify-end pt-4 border-t border-neutral-900/60 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900/40 hover:bg-[#ef4444]/10 border border-neutral-800 hover:border-[#ef4444]/40 text-neutral-500 hover:text-[#ef4444] font-bold text-xs rounded-xl transition-all duration-200 shadow-md group min-h-[40px]"
        >
          <svg 
            className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" 
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          LOGOUT    
        </button>
      </div>

    </div>
  );
}