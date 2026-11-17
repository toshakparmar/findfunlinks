'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Key, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const hasMinLength = newPassword.length >= 12;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSymbol &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Please fulfill all password requirements.');
      return;
    }

    setLoading(true);
    try {
      await api.auth.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      await refreshProfile();
      toast.success('Your password has been successfully updated!');
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password.';
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
              Password Update Required
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              For your account security, you must set a new password before accessing your website
              owner dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Current / Temporary Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 12 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Checklist */}
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
                  className={hasNumber ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}
                >
                  ✓ Number (0-9)
                </span>
                <span
                  className={hasSymbol ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}
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
                  Updating Password...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Save Password & Proceed
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
