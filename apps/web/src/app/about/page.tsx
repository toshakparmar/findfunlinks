import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Compass,
  Radio,
  ArrowRight,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About FindFunLinks — Mission, How It Works & FAQ',
  description:
    'Learn how FindFunLinks curates entertaining websites, verifies active working mirrors, and protects internet navigation against broken links.',
  alternates: {
    canonical: 'https://findfunlinks.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="w-full space-y-8 max-w-5xl mx-auto">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-[var(--text-3,#6B7893)] font-medium"
      >
        <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--line,#1A2442)]" />
        <span className="text-slate-900 dark:text-white font-semibold">About FindFunLinks</span>
      </nav>

      {/* 2. Page Header Banner */}
      <div className="rounded-[16px] p-4 sm:p-5 md:p-6 bg-[var(--card,#0A1226)] border border-[var(--primary,#2563EB)]/50 shadow-[0_0_24px_-8px_rgba(37,99,235,0.35)] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[12px] bg-[var(--primary,#2563EB)]/15 border border-[var(--primary,#2563EB)]/40 flex items-center justify-center text-[var(--brand-link,#3B82F6)] shrink-0">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary,#2563EB)]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
                  About FindFunLinks
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--primary,#2563EB)]/15 border border-[var(--primary,#2563EB)]/30 text-[var(--brand-link,#3B82F6)]">
                  Directory Manifesto
                </span>
              </div>
              <p className="text-xs text-[var(--text-2,#A8B3C7)] mt-1 max-w-2xl leading-relaxed">
                FindFunLinks was built to index the most entertaining, novel websites on the
                internet and ensure broken links or ISP blocking never stop you from accessing them.
              </p>
            </div>
          </div>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[12px] text-xs font-semibold bg-[var(--primary,#2563EB)] hover:bg-[var(--primary-hover,#1D4ED8)] text-white shadow-sm transition-colors shrink-0 self-start md:self-auto cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List Your Website</span>
          </Link>
        </div>
      </div>

      {/* 3. Live Directory Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] text-center space-y-1">
          <p className="text-2xl font-bold font-heading text-slate-900 dark:text-white">270+</p>
          <p className="text-xs text-[var(--text-2,#A8B3C7)]">Curated Websites</p>
        </div>
        <div className="p-4 rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] text-center space-y-1">
          <p className="text-2xl font-bold font-heading text-[var(--brand-link,#3B82F6)]">18</p>
          <p className="text-xs text-[var(--text-2,#A8B3C7)]">Primary Categories</p>
        </div>
        <div className="p-4 rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] text-center space-y-1">
          <p className="text-2xl font-bold font-heading text-emerald-500 dark:text-emerald-400">
            1,200+
          </p>
          <p className="text-xs text-[var(--text-2,#A8B3C7)]">Monitored Mirrors</p>
        </div>
        <div className="p-4 rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] text-center space-y-1">
          <p className="text-2xl font-bold font-heading text-[#EAB308]">99.8%</p>
          <p className="text-xs text-[var(--text-2,#A8B3C7)]">Verified Mirror Uptime</p>
        </div>
      </div>

      {/* 4. How It Works (Anchor #how-it-works) */}
      <div id="how-it-works" className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              How FindFunLinks Works
            </h2>
            <p className="text-xs text-[var(--text-2,#A8B3C7)]">
              Our 3-step engine keeps entertaining web destinations accessible at all times.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[var(--text-3,#6B7893)]">
            Architecture
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] p-5 space-y-3 hover:border-[var(--primary,#2563EB)]/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-[10px] bg-[var(--primary,#2563EB)]/15 text-[var(--brand-link,#3B82F6)] flex items-center justify-center font-bold text-xs">
                01
              </div>
              <Compass className="w-4 h-4 text-[var(--text-3,#6B7893)]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Curated Discovery</h3>
            <p className="text-xs text-[var(--text-2,#A8B3C7)] leading-relaxed">
              Every website is hand-vetted or approved through our owner verification system to
              guarantee high entertainment value, zero malware, and genuine utility.
            </p>
          </div>

          <div className="rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] p-5 space-y-3 hover:border-[var(--primary,#2563EB)]/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <Radio className="w-4 h-4 text-[var(--text-3,#6B7893)]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Automated Health Probes
            </h3>
            <p className="text-xs text-[var(--text-2,#A8B3C7)] leading-relaxed">
              Our background monitoring probes ping domains every 5 minutes across multiple global
              checkpoints, calculating exact response latency and detecting ISP or DNS blocks.
            </p>
          </div>

          <div className="rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] p-5 space-y-3 hover:border-[var(--primary,#2563EB)]/40 transition-colors">
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <Zap className="w-4 h-4 text-[var(--text-3,#6B7893)]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Instant Working Mirrors
            </h3>
            <p className="text-xs text-[var(--text-2,#A8B3C7)] leading-relaxed">
              When a primary domain faces downtime or regional restrictions, clicking on any site
              opens the Domains Drawer with verified alternate links and lowest latency routing.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Verification Pipeline Card */}
      <div className="rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[var(--primary,#2563EB)]" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
            The Editorial Verification Pipeline
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-[12px] bg-[var(--card-hover,#0E182F)]/50 border border-[var(--line,#1A2442)] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[var(--text-3,#6B7893)]">
              STEP 1
            </span>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              Pre-Flight Safety Check
            </p>
            <p className="text-[11px] text-[var(--text-2,#A8B3C7)] leading-relaxed">
              Automated tests verify SSL certificates, domain ownership tokens (DNS TXT / HTML
              Meta), and safe redirect status.
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[var(--card-hover,#0E182F)]/50 border border-[var(--line,#1A2442)] space-y-1">
            <span className="text-[10px] font-mono font-bold text-[var(--text-3,#6B7893)]">
              STEP 2
            </span>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              Human Super Admin Review
            </p>
            <p className="text-[11px] text-[var(--text-2,#A8B3C7)] leading-relaxed">
              Our moderation editors inspect category placement, review safety guidelines, and
              confirm owner authenticity.
            </p>
          </div>

          <div className="p-3.5 rounded-[12px] bg-[var(--card-hover,#0E182F)]/50 border border-[var(--line,#1A2442)] space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white">
              STEP 3
            </span>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">
              Owner Credential Provisioning
            </p>
            <p className="text-[11px] text-[var(--text-2,#A8B3C7)] leading-relaxed">
              Approved owners receive an invite link to the Owner Console to manage unlimited mirror
              domains in real time.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--line,#1A2442)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-[var(--text-2,#A8B3C7)]">
            Own an entertaining web project or online tool?
          </span>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[var(--primary,#2563EB)] text-white text-xs font-semibold hover:bg-[var(--primary-hover,#1D4ED8)] transition-colors self-start sm:self-auto"
          >
            <span>Submit Your Website</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 6. FAQ Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[var(--primary,#2563EB)]" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          <div className="rounded-[14px] border border-[var(--line,#1A2442)] bg-[var(--card,#0A1226)] p-4 sm:p-5 space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Do you host any files, videos, or external media?
            </h3>
            <p className="text-xs text-[var(--text-2,#A8B3C7)] leading-relaxed">
              No. FindFunLinks is strictly a non-hosting web directory and mirror index. We do not
              host, store, or stream any media files. We index publicly accessible web links and
              monitor domain uptime.
            </p>
          </div>

          <div className="rounded-[14px] border border-[var(--line,#1A2442)] bg-[var(--card,#0A1226)] p-4 sm:p-5 space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              How frequently are domain health checks performed?
            </h3>
            <p className="text-xs text-[var(--text-2,#A8B3C7)] leading-relaxed">
              Our automated probe engines conduct HTTP latency and DNS status checks every 5
              minutes. If a domain becomes unresponsive or returns consecutive errors, it is flagged
              as down and alternate mirrors are prioritized.
            </p>
          </div>

          <div className="rounded-[14px] border border-[var(--line,#1A2442)] bg-[var(--card,#0A1226)] p-4 sm:p-5 space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Can I add more mirror links after my website is approved?
            </h3>
            <p className="text-xs text-[var(--text-2,#A8B3C7)] leading-relaxed">
              Yes! Verified website owners have access to the dedicated Owner Console where they can
              add unlimited domain links, set primary vs backup mirrors, and trigger on-demand
              health scans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
