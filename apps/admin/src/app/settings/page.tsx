'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Save, RefreshCw, Globe, Sliders, Zap, Loader2 } from 'lucide-react';
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
  site_name: 'FindFunLinks',
  site_tagline: 'Discover fun, entertaining, and unique websites with active mirrors',
  support_email: 'support@findfunlinks.com',
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
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
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
  }, []);

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

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#F1F5F9] tracking-tight">Platform Settings</h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Global directory parameters, health-check automation frequencies, and operational
            controls.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#1A2442] bg-[#0A1226] text-xs font-semibold text-[#A8B3C7] hover:bg-[#0E182F] hover:text-[#F1F5F9] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* General Information */}
          <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#1A2442] pb-3">
              <Globe className="h-4 w-4 text-[#3B82F6]" />
              <h2 className="font-bold text-sm text-[#F1F5F9]">Brand & Public Directory</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
                  Site Tagline
                </label>
                <input
                  type="text"
                  value={settings.site_tagline}
                  onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>
            </div>
          </div>

          {/* Health Check Engine */}
          <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#1A2442] pb-3">
              <Zap className="h-4 w-4 text-[#22C55E]" />
              <h2 className="font-bold text-sm text-[#F1F5F9]">
                Health Check Engine & Mirrror Probes
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
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
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
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
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F1F5F9] uppercase mb-1">
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
                  className="w-full rounded-xl border border-[#1A2442] bg-[#050A18] px-3 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>
            </div>
          </div>

          {/* Operational Toggles */}
          <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#1A2442] pb-3">
              <Sliders className="h-4 w-4 text-[#F59E0B]" />
              <h2 className="font-bold text-sm text-[#F1F5F9]">Policy & Registration Flags</h2>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-[#070D1E] border border-[#1A2442] cursor-pointer hover:bg-[#0E182F] transition-colors">
                <div>
                  <span className="font-semibold text-[#F1F5F9] block">
                    Allow New Registrations
                  </span>
                  <span className="text-[11px] text-[#A8B3C7] block">
                    Public applicants can submit websites to the review queue.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allow_registrations}
                  onChange={(e) =>
                    setSettings({ ...settings, allow_registrations: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#2563EB]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#070D1E] border border-[#1A2442] cursor-pointer hover:bg-[#0E182F] transition-colors">
                <div>
                  <span className="font-semibold text-[#F1F5F9] block">
                    Auto-Block Offline Mirrors
                  </span>
                  <span className="text-[11px] text-[#A8B3C7] block">
                    Automatically mark domains as DOWN if consecutive probes time out.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.auto_block_failing_mirrors}
                  onChange={(e) =>
                    setSettings({ ...settings, auto_block_failing_mirrors: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#2563EB]"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-[#070D1E] border border-[#1A2442] cursor-pointer hover:bg-[#0E182F] transition-colors">
                <div>
                  <span className="font-semibold text-[#F1F5F9] block">
                    Mature Content Filter Default
                  </span>
                  <span className="text-[11px] text-[#A8B3C7] block">
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
                  className="h-4 w-4 rounded accent-[#2563EB]"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md shadow-[#2563EB]/25 disabled:opacity-50"
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
