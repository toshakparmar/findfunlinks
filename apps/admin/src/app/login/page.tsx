'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Shield, Mail, Loader2, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fillDefaultCredentials = () => {
    setEmail('admin@findfunlinks.com');
    setPassword('SuperAdminSecretPass123!');
    setErrorMessage(null);
    toast.info('Filled default administrator credentials.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.auth.login({ email: email.trim(), password: password.trim() });
      if (res?.accessToken) {
        api.setToken(res.accessToken);
      }
      if (res?.user) {
        setUser(res.user);
      }
      toast.success('Authenticated successfully. Welcome back!');
      window.location.href = '/';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Access denied.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#050A18] relative overflow-hidden select-none">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2563EB]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative w-12 h-12">
              <Image
                src="/logo-mark.svg"
                alt="FindFunLinks"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30 text-xs font-bold uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" />
            <span>Super Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F1F5F9] tracking-tight">
            Operator Sign In
          </h1>
          <p className="text-xs text-[#A8B3C7]">
            Enter your platform administrator credentials to manage FindFunLinks.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl border border-[#1A2442] bg-[#0A1226]/90 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444] text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-[#6B7893] absolute left-3.5 top-3" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@findfunlinks.com"
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] pl-10 pr-4 py-2.5 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-1.5"
              >
                Security Password
              </label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-[#6B7893] absolute left-3.5 top-3" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] pl-10 pr-10 py-2.5 text-xs text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#6B7893] hover:text-[#F1F5F9]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md shadow-[#2563EB]/25 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <span>Sign In to Console</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Helper for Development */}
          <div className="pt-2 border-t border-[#1A2442] text-center">
            <button
              type="button"
              onClick={fillDefaultCredentials}
              className="text-[11px] font-semibold text-[#3B82F6] hover:underline"
            >
              Fill Default Admin Credentials (Seed)
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <p className="text-[11px] text-center text-[#6B7893]">
          Protected by Argon2id password hashing, rate limiting, and HTTP-only session cookies.
        </p>
      </div>
    </div>
  );
}
