'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import {
  Key,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Password rules validation
  const hasMinLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isFormValid =
    hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invitation token is missing or invalid.');
      return;
    }
    if (!isFormValid) {
      toast.error('Please fulfill all password requirements.');
      return;
    }

    setLoading(true);
    try {
      await api.auth.acceptInvite({
        token,
        password,
        confirmPassword,
      });
      setCompleted(true);
      toast.success('Your password has been successfully established!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to accept invitation.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#16181B] select-none">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#1E2024] rounded-2xl border border-[#33373D] p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="relative w-12 h-12 mx-auto">
              <Image
                src="/logo-mark.svg"
                alt="FinalLinks"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B9DF7]/10 text-[#0B9DF7] border border-[#0B9DF7]/30 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Owner Setup</span>
            </div>
            <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
              Welcome to FinalLinks
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              Your website registration has been approved. Please set your secure password to
              activate your owner account.
            </p>
          </div>

          {!token ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4" />
                Missing Invitation Token
              </div>
              <p className="text-[#9CA3AF] text-xs">
                The setup link appears to be incomplete. Please use the exact link sent to your
                email or provided by the platform administrators.
              </p>
            </div>
          ) : completed ? (
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h2 className="text-base font-bold text-[#F3F4F6]">Account Activated!</h2>
              <p className="text-xs text-[#9CA3AF]">
                Your password is set and your account is ready. Redirecting you to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-sm rounded-lg border border-[#33373D] bg-[#16181B] text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-sm rounded-lg border border-[#33373D] bg-[#16181B] text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
                  />
                </div>
              </div>

              {/* Security Checklist */}
              <div className="p-4 rounded-xl bg-[#16181B] border border-[#33373D] space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  Password Policy
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasMinLength ? 'text-emerald-400' : 'text-[#6B7280]'
                    }`}
                  >
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    <span>12+ characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasUpper ? 'text-emerald-400' : 'text-[#6B7280]'
                    }`}
                  >
                    {hasUpper ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Uppercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasLower ? 'text-emerald-400' : 'text-[#6B7280]'
                    }`}
                  >
                    {hasLower ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Lowercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasNumber ? 'text-emerald-400' : 'text-[#6B7280]'
                    }`}
                  >
                    {hasNumber ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Number digit</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasSymbol ? 'text-emerald-400' : 'text-[#6B7280]'
                    }`}
                  >
                    {hasSymbol ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Special symbol</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordsMatch ? 'text-emerald-400' : 'text-[#6B7280]'
                    }`}
                  >
                    {passwordsMatch ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full h-11 px-4 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting Password...
                  </>
                ) : (
                  'Complete Account Setup'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#16181B] text-sm text-[#9CA3AF]">
          Loading invite setup...
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
