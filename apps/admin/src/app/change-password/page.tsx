'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Key, Lock, Loader2, ShieldAlert, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Validation
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
      toast.error('Please meet all password requirements.');
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
      if (user?.role?.type === 'WEBSITE_OWNER' || user?.role?.type === 'OWNER') {
        router.replace('/my-websites');
      } else {
        router.replace('/websites');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to change password.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 select-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">
          Update Your Password
        </h1>
        <p className="text-sm text-[#9CA3AF] mt-1">
          Set a secure permanent password to protect your account, website management, and mirror settings.
        </p>
      </div>

      <div className="bg-[#1E2024] rounded-xl border border-[#33373D] p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  Current / Temporary Password *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-sm rounded-lg border border-[#33373D] bg-[#16181B] text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-sm rounded-lg border border-[#33373D] bg-[#16181B] text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#0B9DF7] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#6B7280]" />
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
            </div>

            {/* Password Requirements & Security Box */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#16181B] border border-[#33373D] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#33373D] pb-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#F3F4F6]">
                    Password Requirements
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasMinLength ? 'text-emerald-400' : 'text-[#6B7280]'
                    }`}
                  >
                    {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
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
                    {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B9DF7]/10 border border-[#0B9DF7]/20 text-xs text-[#9CA3AF] space-y-1">
                <p className="font-semibold text-[#F3F4F6]">Security Tip</p>
                <p className="leading-relaxed">
                  Never reuse passwords across administrative platforms. We strongly advise using a password manager.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-[#33373D]">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white font-medium text-sm transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Save Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
