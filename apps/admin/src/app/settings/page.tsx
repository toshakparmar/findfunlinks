'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Save, RefreshCw, Globe, Sliders, Zap } from 'lucide-react';
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
      toast.success('Platform settings successfully saved');
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Platform Configuration
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Configure directory metadata, registration intake policies, and mirror health probing
            parameters.
          </p>
        </div>
        <button
          onClick={fetchSettings}
          disabled={loading || saving}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Reload
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-neutral-400 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          Loading settings...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* General Settings */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                General Branding & Directory Info
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.site_name}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Directory Headline
                </label>
                <input
                  type="text"
                  value={settings.directory_title}
                  onChange={(e) => setSettings({ ...settings, directory_title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Site Tagline / Meta Description
                </label>
                <input
                  type="text"
                  value={settings.site_tagline}
                  onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Platform Support Email
                </label>
                <input
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Registrations & Limits */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Sliders className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Registration & Directory Policies
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-neutral-900 dark:text-white block">
                    Allow New Website Registrations
                  </span>
                  <span className="text-xs text-neutral-500">
                    If disabled, the public registration form displays an intake paused message.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allow_registrations}
                  onChange={(e) =>
                    setSettings({ ...settings, allow_registrations: e.target.checked })
                  }
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-neutral-900 dark:text-white block">
                    Filter Mature Content by Default
                  </span>
                  <span className="text-xs text-neutral-500">
                    Hides 18+ items on the public directory unless visitors opt-in.
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
                  className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-neutral-900 dark:text-white block">
                    Maintenance Mode
                  </span>
                  <span className="text-xs text-neutral-500 text-amber-600 dark:text-amber-400">
                    Directs all public traffic to the maintenance splash page.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenance_mode}
                  onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                  className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Mirror Health Check Prober */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <Zap className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Mirror Health Probing Engine
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Health Check Interval (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={72}
                  value={settings.health_check_interval_hours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      health_check_interval_hours: parseInt(e.target.value) || 6,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Probe Timeout (Milliseconds)
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
                      health_check_timeout_ms: parseInt(e.target.value) || 8000,
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
