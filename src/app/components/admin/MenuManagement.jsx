"use client";

import React, { useState, useEffect } from 'react';

export default function MenuManagement() {
  const [activeFilter, setActiveFilter] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [categories, setCategories] = useState(['All Items']);
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', category: '', price: '', desc: '', img: '' });
  const [customCategory, setCustomCategory] = useState('');

  // Load from DB on mount
  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(data => {
        const items = data.items.map(p => ({ ...p, img: p.imageUrl }));
        setMenuItems(items);
        const cats = ['All Items', ...new Set(items.map(i => i.category))];
        setCategories(cats);
        if (data.categories.length > 0) {
          setNewItem(prev => ({ ...prev, category: data.categories[0] }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Add new item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;

    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newItem.name,
        category: newItem.category,
        price: newItem.price,
        imageUrl: newItem.img || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400',
      }),
    });

    const saved = await res.json();
    const formatted = { ...saved, img: saved.imageUrl };
    setMenuItems(prev => [...prev, formatted]);

    // Add new category if not exists
    if (!categories.includes(saved.category)) {
      setCategories(prev => [...prev, saved.category]);
    }

    setNewItem({ name: '', category: categories[1] || '', price: '', desc: '', img: '' });
    setIsModalOpen(false);
  };

  // Open edit modal
  const handleOpenEdit = (item) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  // Save edited item
  const handleEditItem = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/menu/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editingItem.name,
        category: editingItem.category,
        price: editingItem.price,
        imageUrl: editingItem.img,
      }),
    });
    const updated = await res.json();
    setMenuItems(prev => prev.map(m => m.id === updated.id ? { ...updated, img: updated.imageUrl } : m));
    setEditingItem(null);
    setIsModalOpen(false);
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    setMenuItems(prev => prev.filter(m => m.id !== id));
    setDeleteConfirmId(null);
  };

  // Add custom category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!customCategory || categories.includes(customCategory)) return;
    setCategories(prev => [...prev, customCategory]);
    if (editingItem) setEditingItem(prev => ({ ...prev, category: customCategory }));
    else setNewItem(prev => ({ ...prev, category: customCategory }));
    setCustomCategory('');
  };

  const filteredItems = menuItems.filter(item => {
    const matchesFilter = activeFilter === 'All Items' || item.category === activeFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const formData = editingItem || newItem;
  const setFormData = editingItem
    ? (val) => setEditingItem(prev => ({ ...prev, ...val }))
    : (val) => setNewItem(prev => ({ ...prev, ...val }));

  return (
    <div className="w-full space-y-6 text-white h-full max-h-[85vh] flex flex-col">

      {/* Header (Stays Fixed) */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#f3f4f6]">Menu Editor</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Add, edit or remove items from the menu.</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-[#e5b83b] active:scale-95 text-[#0c0c0d] font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all shrink-0 min-h-[44px]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add New Item
        </button>
      </div>

      {/* Controls Wrapper (Stays Fixed) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 bg-[#0c0c0d] py-2 z-10">
        {/* 📱 Horizontal Swipe Scrollable Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain scrollbar-none max-w-full pb-1 -mb-1 w-full md:w-auto snap-x">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`snap-tight shrink-0 px-5 py-2.5 min-h-[40px] rounded-xl text-xs font-semibold transition-all active:scale-[0.97] ${
                activeFilter === cat
                  ? 'bg-[#e5b83b] text-[#0c0c0d]'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* Search Input Box */}
        <div className="relative w-full md:w-72 shrink-0">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#141416] border border-neutral-800 focus:border-[#e5b83b]/40 outline-none pl-10 pr-4 py-3 min-h-[44px] rounded-xl text-xs text-white placeholder-neutral-600 transition-colors"
          />
        </div>
      </div>

      {/* Loading State Display */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32 text-[#e5b83b] animate-pulse text-sm font-semibold tracking-widest flex-1">
          LOADING MENU...
        </div>
      )}

      {/* 📜 Scrollable Grid Track Area */}
      {!loading && (
        <div className="flex-1 overflow-y-auto pr-1 overscroll-contain scrollbar-thin scrollbar-thumb-neutral-800 max-h-[calc(100vh-280px)] pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 content-start">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-[#141416] border border-neutral-800/60 rounded-2xl overflow-hidden flex flex-col h-[332px]">
                <div className="relative h-44 w-full bg-neutral-900 overflow-hidden shrink-0">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  <span className="absolute left-3 bottom-3 bg-[#0c0c0d]/80 border border-neutral-800 text-[#e5b83b] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </div>

                <div className="p-5 flex flex-col justify-between flex-1 min-h-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-white tracking-wide truncate max-w-[70%]">{item.name}</h4>
                    <span className="text-sm font-black text-[#e5b83b] shrink-0">Rs.{item.price.toFixed(2)}</span>
                  </div>

                  {/* Operational Action Row Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-neutral-800/80 mt-auto">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-[40px] rounded-xl bg-neutral-900 active:bg-neutral-800 text-neutral-400 active:text-white text-xs font-semibold transition-all border border-neutral-800"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 min-h-[40px] rounded-xl bg-neutral-900 active:bg-red-500/10 text-neutral-400 active:text-red-400 text-xs font-semibold transition-all border border-neutral-800 active:border-red-500/30"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Tap placeholder element */}
            <div
              onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
              className="border-2 border-dashed border-neutral-800 active:border-neutral-700 bg-neutral-900/10 active:bg-neutral-900/30 rounded-2xl h-[332px] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 transition-colors mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <h4 className="text-xs font-bold text-neutral-300">Add New Item</h4>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-[#0c0c0d]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-neutral-800 w-full max-w-sm rounded-2xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white">Delete Item?</h3>
            <p className="text-sm text-neutral-400">This action cannot be undone. The item will be permanently removed from the menu.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 bg-neutral-900 border border-neutral-800 active:bg-neutral-800 text-neutral-400 font-bold text-xs py-3 rounded-xl transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(deleteConfirmId)}
                className="flex-1 bg-red-500/10 border border-red-500/30 active:bg-red-500/20 text-red-400 font-bold text-xs py-3 rounded-xl transition-colors min-h-[44px]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0c0c0d]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141416] border border-neutral-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button onClick={closeModal} className="text-neutral-500 active:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-end">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Category creator */}
            <div className="bg-[#0c0c0d] border border-neutral-900 p-3 rounded-xl space-y-2">
              <label className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Add New Category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Smoothies"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  className="flex-1 bg-[#141416] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white outline-none placeholder-neutral-700 min-h-[40px]"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="bg-neutral-800 active:bg-neutral-700 text-[#e5b83b] text-xs px-4 rounded-lg border border-neutral-700 font-bold transition-all min-h-[40px]"
                >
                  Add
                </button>
              </div>
            </div>

            <form onSubmit={editingItem ? handleEditItem : handleAddItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Iced Matcha"
                    value={formData.name}
                    onChange={e => setFormData({ name: e.target.value })}
                    className="w-full bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl px-4 py-3 text-xs text-white outline-none min-h-[44px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ category: e.target.value })}
                    className="w-full bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl px-3 py-3 text-xs text-white outline-none min-h-[44px]"
                  >
                    {categories.filter(c => c !== 'All Items').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Price (Rs.)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 250"
                  value={formData.price}
                  onChange={e => setFormData({ price: e.target.value })}
                  className="w-full bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl px-4 py-3 text-xs text-white outline-none min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Image URL (optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.img}
                  onChange={e => setFormData({ img: e.target.value })}
                  className="w-full bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b]/50 rounded-xl px-4 py-3 text-xs text-white outline-none min-h-[44px]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-neutral-900 border border-neutral-800 active:bg-neutral-800 text-neutral-400 font-bold text-xs py-3 rounded-xl transition-colors min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#e5b83b] active:bg-[#f5c847] text-[#0c0c0d] font-bold text-xs py-3 rounded-xl transition-colors min-h-[44px]"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}