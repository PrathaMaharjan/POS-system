"use client";

import React, { useState } from 'react';

export default function PaymentModal({ isOpen, onClose, totalAmount, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const tax = totalAmount * 0.08;
  const grandTotal = totalAmount + tax;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Pass the payment details AND the final status back up to the parent handler
      await onPaymentSuccess({
        paymentMethod,
        cashReceived: paymentMethod === 'Cash' ? parseFloat(cashReceived) : grandTotal,
        grandTotal,
        status: 'COMPLETED' 
      });
      
      // Reset state on successful completion
      setCashReceived('');
      setPaymentMethod('Cash');
    } catch (err) {
      console.error("Payment handler error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-[#141416] border border-neutral-800 rounded-2xl p-8 w-full max-w-md flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Payment Settle</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Breakdown Summary */}
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

        {/* Method Toggles */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Payment Method</label>
          <div className="grid grid-cols-3 gap-3">
            {['Cash', 'Card', 'QR'].map(method => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`py-3 rounded-xl text-sm font-semibold border transition-all duration-150 flex items-center justify-center gap-1 ${
                  paymentMethod === method
                    ? 'bg-[#e5b83b] text-[#0c0c0d] border-[#e5b83b]'
                    : 'bg-[#0c0c0d] text-neutral-400 border-neutral-800 hover:border-neutral-600 hover:text-white'
                }`}
              >
                <span>
                  {method === 'Cash' && '💵'}
                  {method === 'Card' && '💳'}
                  {method === 'QR' && '📱'}
                </span>
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Cash Input Fields */}
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

        {/* Action Button */}
        <button
          onClick={handleConfirm}
          disabled={isSubmitting || (paymentMethod === 'Cash' && (!cashReceived || parseFloat(cashReceived) < grandTotal))}
          className="w-full bg-[#e5b83b] hover:bg-[#f5c847] disabled:opacity-40 disabled:cursor-not-allowed text-[#0c0c0d] font-bold py-3 rounded-xl transition-all duration-150 text-sm"
        >
          {isSubmitting ? 'Processing Payment...' : 'Confirm & Settle'}
        </button>

      </div>
    </div>
  );
}