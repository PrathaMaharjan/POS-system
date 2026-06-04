"use client";

import React, { useState, useEffect } from 'react';

export default function PerformanceOverview() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('24H');

 async function fetchDashboardMetrics() {
  try {
    setLoading(true);
    const res = await fetch(`/api/admin/metrics?timeFilter=${timeFilter}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
      }
    }
  } catch (err) {
    console.error("Failed to gather metrics:", err);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    fetchDashboardMetrics();
  }, [timeFilter]); 

  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center gap-3 text-neutral-500 font-medium">
        <div className="w-6 h-6 border-2 border-[#e5b83b] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs tracking-widest uppercase">Aggregating Terminal Streams...</span>
      </div>
    );
  }

  // Fallback structural initialization variables
  const data = metrics || {
    totalSales: 0,
    averageOrderValue: 0,
    customerCount: 0,
    trendData: [20, 20, 20, 20, 20, 20, 20],
    topSelling: [],
    alerts: []
  };

  return (
    <div className="w-full space-y-6 text-white animate-fadeIn">
  
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Performance Overview</h2>
          <p className="text-xs text-neutral-500 mt-1">Real-time terminal data computed instantly</p>
        </div>
        {/* Time Filter Tabs */}
        <div className="bg-[#141416] border border-neutral-800 p-1 rounded-xl flex items-center gap-1">
          {['24H', '7D', '30D'].map((time) => (
            <button
              key={time}
              onClick={() => setTimeFilter(time)}
              className={`font-bold text-xs px-4 py-1.5 rounded-lg transition-all ${
                timeFilter === time
                  ? 'bg-[#e5b83b] text-[#0c0c0d]'
                  : 'text-neutral-400 hover:text-white font-semibold'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric Card 1: Live Calculated Volume */}
        <div className="bg-[#141416] border-l-2 border-l-[#e5b83b] border-y border-r border-neutral-800/60 rounded-xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-[#e5b83b]/10 border border-[#e5b83b]/20 flex items-center justify-center text-[#e5b83b]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
         
          </div>
          <div className="mt-4">
            <span className="text-xs text-neutral-400 font-medium">Daily Sales Total</span>
            <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
              Rs. {parseFloat(data.totalSales).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Metric Card 2: Average Basket Spending */}
        <div className="bg-[#141416] border-l-2 border-l-[#e5b83b] border-y border-r border-neutral-800/60 rounded-xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-[#e5b83b]/10 border border-[#e5b83b]/20 flex items-center justify-center text-[#e5b83b]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>

          </div>
          <div className="mt-4">
            <span className="text-xs text-neutral-400 font-medium">Average Order Value</span>
            <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
              Rs. {parseFloat(data.averageOrderValue).toFixed(2)}
            </h3>
          </div>
        </div>

        {/* Metric Card 3: Foot Traffic Estimates */}
        <div className="bg-[#141416] border-y border-r border-neutral-800/60 rounded-xl p-5 relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-[#e5b83b]/10 border border-[#e5b83b]/20 flex items-center justify-center text-[#e5b83b]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
              </svg>
            </div>

          </div>
          <div className="mt-4">
            <span className="text-xs text-neutral-400 font-medium">Estimated Customers Served</span>
            <h3 className="text-3xl font-bold text-white tracking-tight mt-1">
              {Math.round(data.customerCount)}
            </h3>
          </div>
        </div>
      </div>

    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Trend Vector Array Bars */}
        <div className="lg:col-span-2 bg-[#141416] border border-neutral-900 rounded-xl p-5 flex flex-col justify-between gap-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
              <svg className="w-3.5 h-3.5 text-[#e5b83b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              </svg>
              Sales Load Curve
            </div>
            <button onClick={fetchDashboardMetrics} className="text-[10px] text-neutral-500 hover:text-white transition-colors">
              Refresh Monitor
            </button>
          </div>

          <div className="flex-1 flex items-end justify-between h-44 gap-3 px-2 border-b border-neutral-800/70 pb-1">
            {data.trendData.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div 
                  style={{ height: `${val}%` }} 
                  className="w-full bg-[#e5b83b]/20 group-hover:bg-[#e5b83b]/40 border-t-2 border-[#e5b83b]/60 transition-all duration-300 rounded-t-sm"
                />
              </div>
            ))}
          </div>
<div className="flex justify-between items-center text-[10px] text-neutral-500 font-mono tracking-wider px-1">
  {timeFilter === '24H' && <>
    <span>08:00</span><span>10:00</span><span>12:00</span>
    <span>14:00</span><span>16:00</span><span>18:00</span><span>20:00</span>
  </>}
  {timeFilter === '7D' && <>
    <span>6d ago</span><span>5d ago</span><span>4d ago</span>
    <span>3d ago</span><span>2d ago</span><span>Yesterday</span><span>Today</span>
  </>}
  {timeFilter === '30D' && <>
    <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
  </>}
</div>
        </div>

        {/* Top Products Block Loop */}
        <div className="bg-[#141416] border border-neutral-900 rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
            <svg className="w-3.5 h-3.5 text-[#e5b83b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7"/>
            </svg>
           Popular Menu Items
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {data.topSelling.map((prod, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-900/40 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={prod.img} alt="" className="w-10 h-10 object-cover rounded-lg bg-neutral-900 border border-neutral-800" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{prod.name}</span>
                    <span className="text-[10px] text-neutral-500 mt-0.5">{prod.units}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#e5b83b]">{prod.price}</span>
              </div>
            ))}
            {data.topSelling.length === 0 && (
              <p className="text-xs text-neutral-600 text-center py-6">No menu products cataloged.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#141416] border border-neutral-900 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
            <svg className="w-3.5 h-3.5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            </svg>
            System Diagnostics
          </div>
        </div>

        <div className="space-y-2">
          {data.alerts.map((alert) => (
            <div key={alert.id} className="bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-3 flex justify-between items-center gap-4 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 9v2m0 4h.01"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-200">{alert.title}</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5">{alert.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}