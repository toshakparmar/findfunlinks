'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Save,
  RefreshCw,
  Globe,
  Sliders,
  Zap,
  Loader2,
  User,
  KeyRound,
  Shield,
  Laptop,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsState {
  site_name: string;
  site_tagline: string;
  support_email: string;
  directory_title: string;
  allow_registrations: boolean;
  require_email_verification: boolean;
  max_domains_per_website: number;
  health_check_interval_hours: number;
  health_check_timeout_ms: number;
  auto_block_failing_mirrors: boolean;
  filter_mature_content_by_default: boolean;
  allow_temp_password_email: boolean;
  maintenance_mode: boolean;
}

const defaultSettings: SettingsState = {
  site_name: 'FinalLinks',
  site_tagline: 'Discover fun, entertaining, and unique websites with active mirrors',
  support_email: 'support@finallinks.com',
  directory_title: 'The Ultimate Fun & Unique Web Directory',
  allow_registrations: true,
  require_email_verification: true,
  max_domains_per_website: 50,
  health_check_interval_hours: 6,
  health_check_timeout_ms: 8000,
  auto_block_failing_mirrors: false,
  filter_mature_content_by_default: true,
  allow_temp_password_email: false,
  maintenance_mode: false,
};

export default function SettingsPage() {
  const { user } = useAuth();
  const isOwner = user?.role?.type === 'WEBSITE_OWNER' || user?.role?.type === 'OWNER';

  // Admin Settings State
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Owner Sessions Mock/State
  const [revokedSessions, setRevokedSessions] = useState<string[]>([]);

  const fetchSettings = async () => {
    if (isOwner) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.admin.getSettings();
      if (data && typeof data === 'object') {
        setSettings((prev) => ({
          ...prev,
          ...(data as Partial<SettingsState>),
        }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [isOwner]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.admin.updateSettings(settings as unknown as Record<string, unknown>);
      toast.success('Platform configuration saved successfully');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    setRevokedSessions((prev) => [...prev, sessionId]);
    toast.success('Session token revoked successfully.');
  };

  // ---------------------------------------------------------------------------
  // Website Owner View: Account & Security
  // ---------------------------------------------------------------------------
  if (isOwner) {
    return (
      <div className="space-y-6 w-full">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">Account & Security</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Manage your account credentials, login email, active device sessions, and security posture.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-[#33373D] bg-[#1E2024] p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#33373D] pb-3">
            <User className="h-5 w-5 text-[#0B9DF7]" />
            <h2 className="font-semibold text-base text-[#F3F4F6]">Owner Identity Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">
                Display Name
              </span>
              <p className="font-medium text-[#F3F4F6] p-3 rounded-lg bg-[#16181B] border border-[#33373D]">
                {user?.name || 'Website Owner'}
              </p>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">
                Account Email
              </span>
              <p className="font-mono text-sm text-[#F3F4F6] p-3 rounded-lg bg-[#16181B] border border-[#33373D]">
                {user?.email}
              </p>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">
                Assigned Role
              </span>
              <p className="font-medium text-[#0B9DF7] p-3 rounded-lg bg-[#16181B] border border-[#33373D]">
                {user?.role?.name || 'Website Owner'}
              </p>
            </div>

            <div>
              <span className="block text-xs font-semibold text-[#9CA3AF] uppercase mb-1">
                Account Status
              </span>
              <div className="p-3 rounded-lg bg-[#16181B] border border-[#33373D] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                <span className="text-sm font-semibold text-[#22C55E]">Active & Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Password & Security Card */}
        <div className="rounded-xl border border-[#33373D] bg-[#1E2024] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
            <div className="flex items-center gap-2.5">
              <KeyRound className="h-5 w-5 text-[#0B9DF7]" />
              <h2 className="font-semibold text-base text-[#F3F4F6]">Credentials & Authentication</h2>
            </div>
            <Link
              href="/change-password"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B9DF7] text-white text-xs font-semibold hover:bg-[#0A8FE0] transition-colors"
            >
              Update Password
            </Link>
          </div>

          <div className="p-4 rounded-lg bg-[#16181B] border border-[#33373D] flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#0B9DF7] mt-0.5 flex-shrink-0" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-[#F3F4F6]">Password Security Status</p>
              <p className="text-[#9CA3AF] leading-relaxed">
                {user?.mustChangePassword
                  ? 'Your account is currently using temporary credentials. Please set a permanent password.'
                  : 'Your account is protected with a permanent password. We recommend updating your credentials every 90 days.'}
              </p>
            </div>
          </div>
        </div>

        {/* Active Sessions Card */}
        <div className="rounded-xl border border-[#33373D] bg-[#1E2024] p-6 space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#33373D] pb-3">
            <Laptop className="h-5 w-5 text-[#0B9DF7]" />
            <h2 className="font-semibold text-base text-[#F3F4F6]">Active Browser Sessions</h2>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-[#16181B] border border-[#33373D] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                <div>
                  <p className="text-xs font-bold text-[#F3F4F6]">
                    Current Session — Web Browser (Windows)
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">
                    IP: 127.0.0.1 • Started recently
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30">
                Current
              </span>
            </div>

            {!revokedSessions.includes('session-mobile') && (
              <div className="p-4 rounded-lg bg-[#16181B] border border-[#33373D] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#6B7280]" />
                  <div>
                    <p className="text-xs font-bold text-[#F3F4F6]">Mobile Client (Safari / iOS)</p>
                    <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5">
                      IP: 10.179.142.32 • Active 2 days ago
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevokeSession('session-mobile')}
                  className="px-2.5 py-1 rounded border border-[#33373D] bg-[#1E2024] text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                >
                  Revoke
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Super Admin / Admin View: Platform Settings
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">Platform Settings</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Global directory parameters, health-check automation frequencies, and operational controls.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#0B9DF7]" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 text-sm">
          {/* General Information */}
          <div className="rounded-xl border border-[#33373D] bg-[#1E2024] p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#33373D] pb-3">
              <Globe className="h-5 w-5 text-[#0B9DF7]" />
              <h2 className="font-semibold text-base text-[#F3F4F6]">Brand & Public Directory</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                  Site Tagline
                </label>
                <input
                  type="text"
                  value={settings.site_tagline}
                  onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>
            </div>
          </div>

          {/* Health Check Engine */}
          <div className="rounded-xl border border-[#33373D] bg-[#1E2024] p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#33373D] pb-3">
              <Zap className="h-5 w-5 text-emerald-400" />
              <h2 className="font-semibold text-base text-[#F3F4F6]">
                Health Check Engine & Mirror Probes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                  Probe Interval (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={settings.health_check_interval_hours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      health_check_interval_hours: parseInt(e.target.value, 10) || 6,
                    })
                  }
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                  Probe Timeout (ms)
                </label>
                <input
                  type="number"
                  min={1000}
                  max={30000}
                  step={500}
                  value={settings.health_check_timeout_ms}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      health_check_timeout_ms: parseInt(e.target.value, 10) || 8000,
                    })
                  }
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                  Max Mirrors Allowed Per Website
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={settings.max_domains_per_website}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_domains_per_website: parseInt(e.target.value, 10) || 50,
                    })
                  }
                  className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
                />
              </div>
            </div>
          </div>

          {/* Operational Toggles */}
          <div className="rounded-xl border border-[#33373D] bg-[#1E2024] p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#33373D] pb-3">
              <Sliders className="h-5 w-5 text-amber-400" />
              <h2 className="font-semibold text-base text-[#F3F4F6]">Policy & Registration Flags</h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl bg-[#16181B] border border-[#33373D] cursor-pointer hover:bg-[#26292F] transition-colors">
                <div>
                  <span className="font-medium text-[#F3F4F6] block text-sm">
                    Allow New Registrations
                  </span>
                  <span className="text-xs text-[#9CA3AF] block mt-0.5">
                    Public applicants can submit websites to the review queue.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allow_registrations}
                  onChange={(e) =>
                    setSettings({ ...settings, allow_registrations: e.target.checked })
                  }
                  className="h-5 w-5 rounded accent-[#0B9DF7]"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-[#16181B] border border-[#33373D] cursor-pointer hover:bg-[#26292F] transition-colors">
                <div>
                  <span className="font-medium text-[#F3F4F6] block text-sm">
                    Auto-Block Offline Mirrors
                  </span>
                  <span className="text-xs text-[#9CA3AF] block mt-0.5">
                    Automatically mark domains as DOWN if consecutive probes time out.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.auto_block_failing_mirrors}
                  onChange={(e) =>
                    setSettings({ ...settings, auto_block_failing_mirrors: e.target.checked })
                  }
                  className="h-5 w-5 rounded accent-[#0B9DF7]"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl bg-[#16181B] border border-[#33373D] cursor-pointer hover:bg-[#26292F] transition-colors">
                <div>
                  <span className="font-medium text-[#F3F4F6] block text-sm">
                    Mature Content Filter Default
                  </span>
                  <span className="text-xs text-[#9CA3AF] block mt-0.5">
                    Exclude 18+ content from directory home discovery rails for new users.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.filter_mature_content_by_default}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      filter_mature_content_by_default: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded accent-[#0B9DF7]"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
