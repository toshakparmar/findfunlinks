'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type RegistrationRequestDetails } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  Globe,
  Radio,
  ClipboardCheck,
  Flag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWebsites: 0,
    activeDomains: 0,
    downDomains: 0,
    pendingRegistrations: 0,
    openReports: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<RegistrationRequestDetails[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [regRes, webRes, repRes] = await Promise.all([
          api.admin.getRegistrations({ limit: 10 }).catch(() => null),
          api.admin.getWebsites({ limit: 100 }).catch(() => null),
          api.admin.getReports({ limit: 100, status: 'PENDING' }).catch(() => null),
        ]);

        const pendingCount = (regRes?.items || []).filter((r) => r.status === 'PENDING').length;
        const totalSites = webRes?.total || 0;
        const openReports = repRes?.total || 0;

        let activeDoms = 0;
        let downDoms = 0;
        if (webRes && webRes.items) {
          for (const site of webRes.items) {
            activeDoms += site.activeDomainsCount || 1;
          }
        }

        setStats({
          totalWebsites: totalSites,
          activeDomains: activeDoms,
          downDomains: downDoms,
          pendingRegistrations: pendingCount,
          openReports,
        });

        if (regRes && regRes.items) {
          setRecentRegistrations(regRes.items.slice(0, 5));
        }
      } catch {
        // Fallback or demo state
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F1F5F9] tracking-tight">
            Platform Dashboard
          </h1>
          <p className="text-xs text-[#A8B3C7] mt-1">
            Real-time overview of directory health, registration review pipeline, and reported
            issues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/registrations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-md shadow-[#2563EB]/25"
          >
            <ClipboardCheck className="h-4 w-4" />
            Review Queue ({stats.pendingRegistrations})
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Websites"
          value={stats.totalWebsites}
          icon={Globe}
          description="Verified listings"
          color="blue"
        />
        <StatCard
          title="Active Mirror Domains"
          value={stats.activeDomains}
          icon={Radio}
          description="Ping checks operational"
          color="emerald"
        />
        <StatCard
          title="Pending Applications"
          value={stats.pendingRegistrations}
          icon={ClipboardCheck}
          description="Awaiting review"
          color="orange"
        />
        <StatCard
          title="Open Reports"
          value={stats.openReports}
          icon={Flag}
          description="Community moderation"
          color="rose"
        />
      </div>

      {/* Review Queue & Health Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Pending Requests Quick View */}
        <div className="lg:col-span-2 rounded-2xl border border-[#1A2442] bg-[#0A1226] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#3B82F6]" />
              <h2 className="text-sm font-bold text-[#F1F5F9]">Incoming Owner Registrations</h2>
            </div>
            <Link
              href="/registrations"
              className="text-xs font-semibold text-[#3B82F6] hover:underline inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
            </div>
          ) : recentRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1A2442] bg-[#070D1E] text-[#A8B3C7]">
                    <th className="py-2.5 px-3 font-semibold rounded-l-lg">Website</th>
                    <th className="py-2.5 px-3 font-semibold">Applicant</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right rounded-r-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2442]/60">
                  {recentRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-[#0E182F] transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#F1F5F9]">{reg.websiteName}</div>
                        <a
                          href={reg.primaryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-[#3B82F6] hover:underline inline-flex items-center gap-1 truncate max-w-[200px]"
                        >
                          {reg.primaryUrl}
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      </td>
                      <td className="py-3 px-3 text-[#A8B3C7]">
                        <div className="text-[#F1F5F9] font-medium">{reg.applicantName}</div>
                        <div className="text-[11px]">{reg.applicantEmail}</div>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/registrations?id=${reg.id}`}
                          className="px-2.5 py-1 rounded-lg bg-[#2563EB]/15 text-[#3B82F6] hover:bg-[#2563EB] hover:text-white transition-colors text-[11px] font-semibold inline-block border border-[#2563EB]/30"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-[#A8B3C7] space-y-1">
              <CheckCircle2 className="h-8 w-8 text-[#22C55E] mx-auto mb-2" />
              <p className="font-semibold text-[#F1F5F9]">All caught up!</p>
              <p>No registration requests require operator verification right now.</p>
            </div>
          )}
        </div>

        {/* Right Col: Quick Moderation Controls */}
        <div className="rounded-2xl border border-[#1A2442] bg-[#0A1226] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#22C55E]" />
            <h2 className="text-sm font-bold text-[#F1F5F9]">Quick Management</h2>
          </div>

          <div className="space-y-2">
            <Link
              href="/websites"
              className="flex items-center justify-between p-3 rounded-xl border border-[#1A2442] bg-[#070D1E] hover:bg-[#0E182F] hover:border-[#2563EB]/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-[#3B82F6]" />
                <span className="text-xs font-semibold text-[#F1F5F9]">Moderate Websites</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#6B7893] group-hover:text-[#F1F5F9] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/domains"
              className="flex items-center justify-between p-3 rounded-xl border border-[#1A2442] bg-[#070D1E] hover:bg-[#0E182F] hover:border-[#2563EB]/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Radio className="h-4 w-4 text-[#22C55E]" />
                <span className="text-xs font-semibold text-[#F1F5F9]">Domain Ping Inspector</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#6B7893] group-hover:text-[#F1F5F9] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/reports"
              className="flex items-center justify-between p-3 rounded-xl border border-[#1A2442] bg-[#070D1E] hover:bg-[#0E182F] hover:border-[#2563EB]/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Flag className="h-4 w-4 text-[#EF4444]" />
                <span className="text-xs font-semibold text-[#F1F5F9]">
                  Resolve Reports ({stats.openReports})
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#6B7893] group-hover:text-[#F1F5F9] transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/categories"
              className="flex items-center justify-between p-3 rounded-xl border border-[#1A2442] bg-[#070D1E] hover:bg-[#0E182F] hover:border-[#2563EB]/40 transition-all group"
            >
              <div className="flex items-center gap-3">
                <ClipboardCheck className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-xs font-semibold text-[#F1F5F9]">Directory Taxonomy</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#6B7893] group-hover:text-[#F1F5F9] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="p-3.5 rounded-xl border border-[#1A2442] bg-[#070D1E] space-y-1.5">
            <div className="text-[11px] font-bold text-[#F1F5F9] uppercase tracking-wider">
              Health Check Daemon
            </div>
            <p className="text-[11px] text-[#A8B3C7] leading-relaxed">
              Automated HTTP status and latency probes run every 6 hours across all working mirrors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
