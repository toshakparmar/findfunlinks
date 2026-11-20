'use client';

import React, { useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Key, User, Loader2, ShieldCheck, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerSettingsPage() {
  const { user, refreshProfile } = useAuth();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const hasMinLength = newPassword.length >= 12;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSymbol &&
    passwordsMatch;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setSavingPassword(true);
    try {
      await api.auth.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      await refreshProfile();
      toast.success('Your password has been successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password.';
      toast.error(message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">
          Security & Account Settings
        </h1>
        <p className="text-xs text-[#A8B3C7] mt-1">
          Manage your owner operator account credentials, security preferences, and active role
          permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Account Profile Summary */}
        <div className="space-y-6">
          <div className="bg-[#0A1226] rounded-2xl border border-[#1A2442] p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1A2442] pb-3">
              <User className="w-4 h-4 text-[#3B82F6]" />
              <h2 className="font-bold text-sm text-[#F1F5F9]">Account Profile</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#A8B3C7] block text-[11px] uppercase">Full Name</span>
                <span className="font-semibold text-[#F1F5F9] block mt-0.5">
                  {user?.name || 'Owner'}
                </span>
              </div>
              <div>
                <span className="text-[#A8B3C7] block text-[11px] uppercase">Email Address</span>
                <span className="font-mono text-[#F1F5F9] block mt-0.5">
                  {user?.email || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[#A8B3C7] block text-[11px] uppercase">
                  Role Authorization
                </span>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2563EB]/15 text-[#3B82F6] border border-[#2563EB]/30">
                    <ShieldCheck className="w-3 h-3" />
                    Website Owner
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[#A8B3C7] block text-[11px] uppercase">Account Status</span>
                <div className="mt-1 flex items-center gap-1.5 text-[#22C55E] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                  Active & Verified
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Password Form */}
        <div className="md:col-span-2">
          <div className="bg-[#0A1226] rounded-2xl border border-[#1A2442] p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#1A2442] pb-3">
              <Key className="w-4 h-4 text-[#F59E0B]" />
              <h2 className="font-bold text-sm text-[#F1F5F9]">Change Security Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#1A2442] bg-[#050A18] text-[#F1F5F9] placeholder-[#6B7893] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              {/* Password Checklist */}
              <div className="p-3.5 rounded-xl bg-[#070D1E] border border-[#1A2442] space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A8B3C7]">
                  Password Policy
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasMinLength ? 'text-[#22C55E]' : 'text-[#6B7893]'
                    }`}
                  >
                    {hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>12+ characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasUpper ? 'text-[#22C55E]' : 'text-[#6B7893]'
                    }`}
                  >
                    {hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Uppercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasLower ? 'text-[#22C55E]' : 'text-[#6B7893]'
                    }`}
                  >
                    {hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Lowercase letter</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasNumber ? 'text-[#22C55E]' : 'text-[#6B7893]'
                    }`}
                  >
                    {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Number digit</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasSymbol ? 'text-[#22C55E]' : 'text-[#6B7893]'
                    }`}
                  >
                    {hasSymbol ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Special symbol</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      passwordsMatch ? 'text-[#22C55E]' : 'text-[#6B7893]'
                    }`}
                  >
                    {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Passwords match</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPassword || !isPasswordValid}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md shadow-[#2563EB]/25 transition-all disabled:opacity-50"
                >
                  {savingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
