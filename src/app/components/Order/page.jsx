"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import PaymentModal from '../PaymentModal';

export default function Order({tableId = null, orderType = 'TAKEAWAY', showHeader = true}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const router = useRouter();
  
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        setProducts(data.items);
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setActiveCategory(data.categories[0]);
        }
      });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = p.category === activeCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  const handleAddProduct = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.filter(item => item.product.id !== product.id);
      } else {
        return [...prevCart, { product, quantity: 1, note: 'Standard Cup' }];
      }
    });
  };

  const handleDecreaseQuantity = (productId) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === productId);
      if (existing.quantity === 1) {
        return prevCart.filter(item => item.product.id !== productId);
      } else {
        return prevCart.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
    });
  };

  const handleIncreaseQuantity = (productId) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const handleClearCart = () => setCart([]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const basePrice = item.product.price;
      const extra = item.extraCost || 0;
      return sum + (basePrice + extra) * item.quantity;
    }, 0);
  }, [cart]);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  // Handles raw data transaction and bubbles errors cleanly back to the modal trigger
  const handlePaymentSuccess = async (paymentDetails) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        type: orderType,
        tableId: tableId || null,
        staffId: null, 
        paymentMethod: paymentDetails.paymentMethod,
        subtotal,
        tax: paymentDetails.grandTotal - subtotal,
        total: paymentDetails.grandTotal,
        status: paymentDetails.status, 
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to save order on remote database target');
    }

    if (orderType === 'DINE_IN' && tableId) {
      try {
        await fetch(`/api/tables/${tableId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'occupied' }),
        });
      } catch (tableErr) {
        console.error('Failed to auto-update table to occupied:', tableErr);
      }
    }

    // For DINE_IN (unpaid flows that skip the modal layout visual loop), clear and reload directly
    if (orderType === 'DINE_IN') {
      setCart([]);
      setShowCheckout(false);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  // This is triggered ONLY when the user clicks 'Done & Close' inside your custom success modal
  const handleFinalizeOrder = () => {
    setCart([]);
    setShowCheckout(false);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="h-full bg-[#0c0c0d] text-[#e4e4e7] flex flex-col font-sans select-none antialiased">
      <div className="flex-1 flex overflow-hidden">

        {/* Menu */}
        <main className="flex-1 px-10 py-6 flex flex-col gap-4 overflow-hidden">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141416] border border-neutral-800 focus:border-[#e5b83b]/60 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-all duration-150"
              />
            </div>
            <button
              onClick={() => router.push('/cashier')}
              className="flex items-center gap-2 bg-[#141416] border border-neutral-800 hover:border-[#e5b83b]/60 text-neutral-400 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Go Back
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  activeCategory === category
                    ? 'bg-[#e5b83b] text-[#0c0c0d] font-bold'
                    : 'bg-[#1c1c1e] text-neutral-400 border border-neutral-800 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1 pb-4">
              {filteredProducts.map(product => {
                const isInCart = !!cart.find(item => item.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className={`relative bg-[#141416] border rounded-2xl p-3 flex flex-col gap-2 cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 ${
                      isInCart ? 'border-[#e5b83b] ring-1 ring-[#e5b83b]/20' : 'border-neutral-800'
                    }`}
                  >
                    <div className="relative w-full aspect-[4/3] bg-neutral-900 rounded-xl overflow-hidden">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {isInCart && (
                        <div className="absolute inset-0 bg-[#0c0c0d]/65 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="w-9 h-9 rounded-full bg-[#e5b83b] flex items-center justify-center text-[#0c0c0d] shadow-lg">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[13px] font-semibold text-neutral-200 truncate">{product.name}</span>
                      <span className="text-sm font-bold text-[#e5b83b]">Rs.{product.price.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* RIGHT: Cart Sidebar */}
        <aside className="w-[300px] xl:w-[340px] border-l border-neutral-900 bg-[#0c0c0d] p-5 flex flex-col gap-4 overflow-hidden shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-wide">Active Order</h2>
            {cart.length > 0 && (
              <button onClick={handleClearCart} className="text-neutral-500 hover:text-[#ef4444] transition-colors p-1.5 rounded-lg hover:bg-neutral-900/50">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-0">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 gap-2">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span className="text-sm font-medium">Cart is empty</span>
              </div>
            ) : (
              cart.map((item, idx) => {
                const totalItemPrice = (item.product.price + (item.extraCost || 0)) * item.quantity;
                return (
                  <div key={idx} className="group relative flex items-center justify-between p-3 rounded-xl bg-[#141416] border border-neutral-800 hover:border-[#e5b83b]/30 transition-all duration-150">
                    <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-[#e5b83b] rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-[#1c1c1e] rounded-lg border border-neutral-800 p-0.5 gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleDecreaseQuantity(item.product.id); }} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-[#ef4444] transition-colors text-sm font-bold">-</button>
                        <span className="text-xs font-bold text-[#e5b83b] w-4 text-center">{item.quantity}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleIncreaseQuantity(item.product.id); }} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-[#22c55e] transition-colors text-sm font-bold">+</button>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-white">{item.product.name}</span>
                        <span className="text-[11px] text-neutral-500">{item.note}</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-neutral-200">Rs.{totalItemPrice.toFixed(2)}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Pricing Totals & Conditional Trigger */}
          <div className="border-t border-neutral-900 pt-4 flex flex-col gap-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Subtotal</span>
                <span className="font-semibold text-neutral-200">Rs.{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Tax (8%)</span>
                <span className="font-semibold text-neutral-200">Rs.{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-neutral-900 pt-2 mt-1">
                <span className="text-white">Total</span>
                <span className="text-[#e5b83b] text-xl">Rs.{total.toFixed(2)}</span>
              </div>
            </div>
            
            <button
              onClick={() => {
                if (orderType === 'DINE_IN') {
                  handlePaymentSuccess({
                    paymentMethod: 'Unpaid', 
                    grandTotal: total,
                    status: 'PENDING' 
                  });
                } else {
                  setShowCheckout(true);
                }
              }}
              disabled={cart.length === 0}
              className="w-full bg-[#e5b83b] hover:bg-[#f5c847] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-[#0c0c0d] font-bold text-[14px] py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(229,184,59,0.15)] transition-all duration-150"
            >
              {orderType === 'DINE_IN' ? (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Place Order
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                  Checkout
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      <PaymentModal 
        isOpen={showCheckout} 
        onClose={handleFinalizeOrder}
        totalAmount={subtotal} 
        onPaymentSuccess={handlePaymentSuccess} 
      />
    </div>
  );
}