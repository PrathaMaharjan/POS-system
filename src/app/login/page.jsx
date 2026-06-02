"use client";

import React, { useState } from 'react';
import Header from '../components/header/page';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/cashier');
        }
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c0d] text-[#e4e4e7] flex flex-col font-sans antialiased">
      <Header />

      <div className="flex-1 flex items-start justify-center px-4 pt-12">
        <div className="w-full max-w-md">

          <div className="bg-[#141416] border border-neutral-800 rounded-2xl p-10 flex flex-col gap-7">

            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">LOGIN</h1>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">

              {/* Employee ID */}
              <div className="flex flex-col gap-4">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter your ID"
                  required
                  className="bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b] outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors duration-150"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-4">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-[#0c0c0d] border border-neutral-800 focus:border-[#e5b83b] outline-none rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-neutral-600 transition-colors duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e5b83b] hover:bg-[#f5c847] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-[#0c0c0d] font-bold text-[14px] py-3 rounded-xl transition-all duration-150 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Logging in...
                  </>
                ) : 'Login'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}