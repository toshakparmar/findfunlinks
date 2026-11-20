'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../lib/auth-context';
import { Key, Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function OwnerLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  const publicWebUrl = process.env.NEXT_PUBLIC_PUBLIC_WEB_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050A18] relative overflow-hidden select-none">
      {/* Background radial blue glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2563EB]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Card */}
        <div className="bg-[#0A1226]/90 backdrop-blur-xl rounded-3xl border border-[#1A2442] p-8 shadow-2xl space-y-6">
          {/* Logo & Headline */}
          <div className="text-center space-y-3">
            <div className="relative w-12 h-12 mx-auto">
              <Image
                src="/logo-mark.svg"
                alt="FindFunLinks"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Owner Portal</span>
            </div>
            <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">
              Website Owner Login
            </h1>
            <p className="text-xs text-[#A8B3C7]">
              Manage your verified directory profile, active mirror domains, and link uptime.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#6B7893]" />
                <input
                  type="email"
                  required
                  placeholder="owner@yourdomain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-[#6B7893]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-[#2563EB]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In to Owner Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Help */}
          <div className="pt-3 border-t border-[#1A2442] text-center space-y-2">
            <p className="text-[11px] text-[#A8B3C7]">
              Need to register your website?{' '}
              <a
                href={`${publicWebUrl}/requests`}
                target="_blank"
                rel="noreferrer"
                className="text-[#3B82F6] font-semibold hover:underline"
              >
                Submit an application ↗
              </a>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-[11px] text-center text-[#6B7893]">
          Protected by Argon2id encryption, rate limiting, and secure sessions.
        </p>
      </div>
    </div>
  );
}
