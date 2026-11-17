'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { Key, Lock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="relative w-12 h-12 mx-auto">
              <Image
                src="/logo-mark.svg"
                alt="FindFunLinks"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
              Welcome to FindFunLinks
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Your website registration has been approved. Please set your secure password to
              activate your owner account.
            </p>
          </div>

          {!token ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Missing Invitation Token
              </div>
              <p>
                The setup link appears to be incomplete. Please use the exact link sent to your
                email by our Super Admin team.
              </p>
            </div>
          ) : completed ? (
            <div className="p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Account Activated!
              </h2>
              <p className="text-xs text-neutral-500">Redirecting you to the portal login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  New Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type="password"
                    required
                    placeholder="At least 12 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type="password"
                    required
                    placeholder="Re-type password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Requirement Checklist */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-[11px] space-y-1">
                <span className="font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                  Password Requirements:
                </span>
                <div className="grid grid-cols-2 gap-1 text-neutral-500 dark:text-neutral-400">
                  <span
                    className={
                      hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''
                    }
                  >
                    ✓ 12+ characters
                  </span>
                  <span
                    className={hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}
                  >
                    ✓ Uppercase letter
                  </span>
                  <span
                    className={hasLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}
                  >
                    ✓ Lowercase letter
                  </span>
                  <span
                    className={
                      hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''
                    }
                  >
                    ✓ Number (0-9)
                  </span>
                  <span
                    className={
                      hasSymbol ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''
                    }
                  >
                    ✓ Special character
                  </span>
                  <span
                    className={
                      passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''
                    }
                  >
                    ✓ Passwords match
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Setting Password...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Activate Account & Continue
                  </>
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
        <div className="min-h-screen flex items-center justify-center text-xs text-neutral-500">
          Loading invitation verification...
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
