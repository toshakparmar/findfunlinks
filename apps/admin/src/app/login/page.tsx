'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useAuth } from '../../lib/auth-context';
import { Shield, Mail, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { BRAND } from '@finallinks/config';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fillAdminCredentials = () => {
    setEmail('admin@finallinks.com');
    setPassword('SuperAdminSecretPass123!');
    setErrorMessage(null);
    toast.info('Filled default administrator credentials.');
  };

  const fillOwnerCredentials = () => {
    setEmail('owner@finallinks.com');
    setPassword('OwnerSecurePassword2026!');
    setErrorMessage(null);
    toast.info('Filled demo owner credentials.');
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
      const success = await login(email.trim(), password.trim());
      if (!success) {
        setErrorMessage('Invalid credentials. Please verify your email and password.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Access denied.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#16181B] select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="relative w-12 h-12">
              <Image
                src="/mark-blue.svg"
                alt={BRAND.name}
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B9DF7]/15 text-[#0B9DF7] border border-[#0B9DF7]/30 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>{BRAND.name} Console</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">Account Sign In</h1>
          <p className="text-sm text-[#9CA3AF]">
            Sign in with your Administrator or Website Owner credentials.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-xl border border-[#33373D] bg-[#1E2024] p-8 shadow-xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444] text-sm font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@domain.com"
                  className="w-full h-11 px-4 pl-10 rounded-lg bg-[#16181B] border border-[#33373D] text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] focus:ring-1 focus:ring-[#0B9DF7] transition-colors"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#6B7280]" />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-[#F3F4F6] uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-11 px-4 pl-4 pr-10 rounded-lg bg-[#16181B] border border-[#33373D] text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] focus:ring-1 focus:ring-[#0B9DF7] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#6B7280] hover:text-[#F3F4F6] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0A8FE0] disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-[#33373D] flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="flex-1 h-9 px-3 text-xs font-medium text-[#9CA3AF] hover:text-[#0B9DF7] hover:bg-[#26292F] border border-[#33373D] rounded-lg transition-colors text-center"
            >
              Fill Admin Demo
            </button>
            <button
              type="button"
              onClick={fillOwnerCredentials}
              className="flex-1 h-9 px-3 text-xs font-medium text-[#9CA3AF] hover:text-[#10B981] hover:bg-[#26292F] border border-[#33373D] rounded-lg transition-colors text-center"
            >
              Fill Owner Demo
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-[#6B7280]">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
