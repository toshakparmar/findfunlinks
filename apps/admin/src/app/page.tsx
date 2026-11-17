'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, type RegistrationRequestDetails } from '../lib/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatTimeAgo } from '../lib/utils';
import {
  Globe,
  Radio,
  ClipboardCheck,
  Flag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
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

        // Estimate active vs down domains from loaded websites
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
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">Platform Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time overview of directory health, registration review pipeline, and reported
            issues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/registrations"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
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
          description="Curated listings in directory"
          color="blue"
        />
        <StatCard
          title="Active Live Mirrors"
          value={stats.activeDomains}
          icon={Radio}
          description="Monitored working domains"
          color="emerald"
        />
        <StatCard
          title="Pending Applications"
          value={stats.pendingRegistrations}
          icon={ClipboardCheck}
          description="Awaiting admin approval"
          color="orange"
        />
        <StatCard
          title="Open Reports"
          value={stats.openReports}
          icon={Flag}
          description="Broken links reported"
          color="rose"
        />
      </div>

      {/* Two Column Layout: Recent Registrations & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations Queue */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Recent Submissions</h2>
            </div>
            <Link
              href="/registrations"
              className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              View Full Queue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-10 text-xs text-muted-foreground">
              Loading dashboard metrics...
            </div>
          ) : recentRegistrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="py-2.5 font-semibold">Website</th>
                    <th className="py-2.5 font-semibold">Applicant</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold">Submitted</th>
                    <th className="py-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 font-semibold text-foreground">
                        <div>{reg.websiteName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground truncate max-w-[180px]">
                          {reg.primaryUrl}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        <div>{reg.applicantName}</div>
                        <div className="text-[11px] text-muted-foreground/80">
                          {reg.applicantEmail}
                        </div>
                      </td>
                      <td className="py-3">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatTimeAgo(reg.submittedAt)}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/registrations?id=${reg.id}`}
                          className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-colors inline-block"
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
            <div className="text-center py-10 space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-xs text-muted-foreground">
                No pending registration requests! All submissions reviewed.
              </p>
            </div>
          )}
        </div>

        {/* Quick Operations & Security Summary */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground">Operations Quick Links</h2>
            <div className="space-y-2 text-xs">
              <Link
                href="/registrations"
                className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background hover:bg-muted transition-colors font-medium"
              >
                <span>Approve Websites</span>
                <span className="font-bold text-primary">{stats.pendingRegistrations} Pending</span>
              </Link>
              <Link
                href="/reports"
                className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background hover:bg-muted transition-colors font-medium"
              >
                <span>Broken Link Reports</span>
                <span className="font-bold text-rose-500">{stats.openReports} Open</span>
              </Link>
              <Link
                href="/categories"
                className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background hover:bg-muted transition-colors font-medium"
              >
                <span>Manage Categories</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/audit-logs"
                className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-background hover:bg-muted transition-colors font-medium"
              >
                <span>View Security Audit Logs</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Automated Health Engines Active</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Domain monitoring workers are active with SSRF protection, IP address blacklisting,
              and automatic failure tripping.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
