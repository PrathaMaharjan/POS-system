"use client";

import React, { useState, useRef } from 'react';

// Change the function signature
export default function PaymentModal({ isOpen, onClose, totalAmount, cart = [], onPaymentSuccess, orderType = 'TAKEAWAY', tableId = null }) {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const receiptRef = useRef(null);

  if (!isOpen) return null;

  const tax = totalAmount * 0.08;
  const grandTotal = totalAmount + tax;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      console.log("Attempting payload submission with data:", {
        paymentMethod,
        cashReceived: paymentMethod === 'Cash' ? parseFloat(cashReceived) : grandTotal,
        grandTotal,
        status: 'COMPLETED'
      });

      await onPaymentSuccess({
        paymentMethod,
        cashReceived: paymentMethod === 'Cash' ? parseFloat(cashReceived) : grandTotal,
        grandTotal,
        status: 'COMPLETED' 
      });
      
      console.log("onPaymentSuccess resolved successfully! Shifting UI view.");
      setIsSuccess(true);

    } catch (err) {
      console.error("CRITICAL BREAKDOWN INSIDE onPaymentSuccess:", err);
      alert(`Payment failed to register: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setCashReceived('');
    setPaymentMethod('Cash');
    setIsSuccess(false);
    onClose();
  };

  const handlePrintBill = async () => {
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = receiptRef.current;

      if (!element) {
        console.error("Receipt element DOM reference is missing!");
        return;
      }

      const opt = {
        margin:       [0.15, 0.2, 0.15, 0.2], 
        filename:     `POS_Bill_${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          logging: false, 
          useCORS: true,
          container: document.body 
        }, 
        jsPDF:        { unit: 'in', format: [3.15, 7.5], orientation: 'portrait' } 
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error executing client-side canvas snapshot layout capture:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-[#141416] border border-neutral-800 rounded-2xl p-8 w-full max-w-md flex flex-col gap-6 relative overflow-hidden">

        {isSuccess ? (
          /* ── SUCCESS VIEW ─────────────────────────── */
          <div className="flex flex-col items-center justify-center text-center py-4 gap-6 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center text-[#22c55e]">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Payment Completed Successfully!</h2>
              <p className="text-sm text-neutral-500 mt-1.5">
                Transaction settled via <span className="text-[#e5b83b] font-medium">{paymentMethod}</span>
              </p>
            </div>

            <div className="w-full bg-[#0c0c0d] rounded-xl p-4 border border-neutral-900 flex justify-between items-center text-sm">
              <span className="text-neutral-400">Total Settled</span>
              <span className="text-white font-bold text-base">Rs.{grandTotal.toFixed(2)}</span>
            </div>

            <div className="w-full flex flex-col gap-2 mt-2">
              <button
                onClick={handlePrintBill}
                className="w-full bg-[#e5b83b] hover:bg-[#f5c847] text-[#0c0c0d] font-bold py-3 rounded-xl transition-all duration-150 text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Download Bill PDF
              </button>
              
              <button
                onClick={handleCloseModal}
                className="w-full bg-transparent hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white font-semibold py-3 rounded-xl transition-all duration-150 text-sm"
              >
                Done & Close
              </button>
            </div>
          </div>
        ) : (
          /* ── ACTIVE PAYMENT SETTLEMENT VIEW ─────────────────────────── */
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Payment Settle</h2>
              <button onClick={handleCloseModal} className="text-neutral-500 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="bg-[#0c0c0d] rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Subtotal</span>
                <span>Rs.{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Tax (8%)</span>
                <span>Rs.{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white border-t border-neutral-800 pt-2 mt-1">
                <span>Total Due</span>
                <span className="text-[#e5b83b] text-lg">Rs.{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Cash', label: 'Cash', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /></svg> },
                  { id: 'Card', label: 'Card', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
                  { id: 'QR', label: 'QR', icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="6" height="6" rx="1" /><rect x="16" y="2" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /></svg> },
                ].map(method => {
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all duration-150 flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-[#e5b83b] text-[#0c0c0d] border-[#e5b83b]'
                          : 'bg-[#0c0c0d] text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      <span className={isSelected ? 'text-[#0c0c0d]' : 'text-[#e5b83b]'}>
                        {method.icon}
                      </span>
                      {method.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMethod === 'Cash' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Amount Received</label>
                <input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder={`Rs. ${grandTotal.toFixed(2)}`}
                  className="bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b] outline-none rounded-xl px-4 py-3 text-sm text-white transition-colors"
                />
                {cashReceived && parseFloat(cashReceived) >= grandTotal && (
                  <p className="text-sm text-[#22c55e] font-semibold mt-1">
                    Change: Rs.{(parseFloat(cashReceived) - grandTotal).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={isSubmitting || (paymentMethod === 'Cash' && (!cashReceived || parseFloat(cashReceived) < grandTotal))}
              className="w-full bg-[#e5b83b] hover:bg-[#f5c847] disabled:opacity-40 disabled:cursor-not-allowed text-[#0c0c0d] font-bold py-3 rounded-xl transition-all duration-150 text-sm"
            >
              {isSubmitting ? 'Processing Payment...' : 'Confirm Payment'}
            </button>
          </>
        )}

      </div>

      {/* Hidden Receipt Area */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none', userSelect: 'none' }}>
        <div 
          ref={receiptRef}
          style={{
            width: '260px',
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '16px 12px',
            fontFamily: 'monospace',
            fontSize: '11px',
            lineHeight: '1.4'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', textTransform: 'uppercase', color: '#000000' }}>RESTAURANT RECEIPT</h2>
            <p style={{ fontSize: '10px', color: '#4b5563', margin: '0' }}>Kathmandu, Nepal</p>
            <p style={{ margin: '6px 0', color: '#000000' }}>---------------------------------------</p>
          </div>

          <div style={{ margin: '8px 0', color: '#000000' }}>
            <p style={{ margin: '3px 0' }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p style={{ margin: '3px 0' }}><strong>Time:</strong> {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
<p style={{ margin: '3px 0' }}><strong>Type:</strong> {orderType === 'DINE_IN' ? `DINE IN${tableId ? ` — Table ${tableId}` : ''}` : 'TAKEAWAY'}</p>
          </div>

          <p style={{ margin: '6px 0', color: '#000000' }}>--- ITEMS ---------------------</p>
          
          {/* Active Items breakdown mapper added */}
          <div style={{ margin: '8px 0', color: '#000000' }}>
            {cart.map((item, idx) => {
             const price = ((item.product?.price ?? item.price ?? 0) + (item.extraCost || 0)) * item.quantity;
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>{item.quantity}x {item.product?.name || item.name || 'Item'}</span>
                  <span>Rs.{price.toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <p style={{ margin: '6px 0', color: '#000000' }}>---------------------------------------</p>
          
          <div style={{ margin: '12px 0', color: '#000000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <strong>Subtotal:</strong>
              <span>Rs.{totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151', marginBottom: '4px' }}>
              <span>Tax (8%):</span>
              <span>Rs.{tax.toFixed(2)}</span>
            </div>
            <p style={{ margin: '8px 0' }}>---------------------------------------</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', paddingTop: '4px' }}>
              <span>TOTAL BILL:</span>
              <span>Rs.{grandTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#4b5563', marginTop: '4px' }}>
              <span>Paid Via:</span>
              <span>{paymentMethod}</span>
            </div>
          </div>

          <p style={{ margin: '6px 0', color: '#000000' }}>---------------------------------------</p>

          <div style={{ marginTop: '20px', textAlign: 'center', color: '#000000' }}>
            <p style={{ fontWeight: 'bold', fontSize: '10px', margin: '0', textTransform: 'uppercase' }}>Thank You For Dining With Us!</p>
            <p style={{ fontSize: '8px', color: '#9ca3af', margin: '4px 0 0 0' }}>DELIGHTS</p>
          </div>
        </div>
      </div>
    </div>
  );
}