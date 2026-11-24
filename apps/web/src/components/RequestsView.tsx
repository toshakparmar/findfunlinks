'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  Layers,
  Activity,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Send,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';
import { CustomSelect } from './ui/CustomSelect';
import { CircularLoader } from './ui/CircularLoader';

type RequestTab = 'suggest' | 'report';

export function RequestsView() {
  const [activeTab, setActiveTab] = useState<RequestTab>('suggest');

  // Suggest Form State
  const [suggestName, setSuggestName] = useState('');
  const [suggestUrl, setSuggestUrl] = useState('');
  const [suggestCategory, setSuggestCategory] = useState(
    CLIENT_18_CATEGORIES[0]?.slug || 'ott-platforms',
  );
  const [suggestEmail, setSuggestEmail] = useState('');
  const [suggestNotes, setSuggestNotes] = useState('');
  const [suggestSubmitting, setSuggestSubmitting] = useState(false);
  const [suggestSuccess, setSuggestSuccess] = useState(false);

  // Report Form State
  const [reportUrl, setReportUrl] = useState('');
  const [reportReason, setReportReason] = useState('down');
  const [reportNotes, setReportNotes] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const categoryOptions = CLIENT_18_CATEGORIES.map((cat) => ({
    value: cat.slug,
    label: cat.name,
  }));

  const issueOptions = [
    { value: 'down', label: 'Domain Down / Offline (502 / 503 / DNS)' },
    { value: 'blocked', label: 'Domain Blocked by ISP or Firewall' },
    { value: 'redirect', label: 'Redirects to Unrelated / Spam Domain' },
    { value: 'slow', label: 'Extremely Slow / High Latency' },
    { value: 'other', label: 'Other Issue' },
  ];

  const handleSuggestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestName.trim() || !suggestUrl.trim()) return;

    setSuggestSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSuggestSubmitting(false);
    setSuggestSuccess(true);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportUrl.trim()) return;

    setReportSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setReportSubmitting(false);
    setReportSuccess(true);
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Clean Page Header (Section 5: Title only, no banner box, no visible breadcrumb) */}
      <div className="flex flex-col gap-0.5 sm:gap-1">
        <h1 className="text-lg sm:text-xl md:text-fs-2xl font-bold tracking-tight text-slate-900 dark:text-white font-heading">
          Website Requests & Curation
        </h1>
        <p className="text-xs sm:text-fs-sm text-[var(--text-2,#A8B3C7)]">
          Direct portal for website owners to list verified mirror links, and for visitors to
          suggest new entries or report broken domains.
        </p>
      </div>

      {/* 2. Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        {/* Left Column: Owner Program Card (Structured like CategoryCard) */}
        <div className="lg:col-span-5 h-full rounded-[14px] sm:rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] hover:border-[var(--primary,#2563EB)]/40 transition-all flex flex-col justify-between overflow-hidden shadow-sm">
          {/* Card Header */}
          <div className="p-2.5 sm:p-5 border-b border-[var(--line,#1A2442)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] sm:rounded-[10px] bg-[var(--primary,#2563EB)]/15 border border-[var(--primary,#2563EB)]/30 flex items-center justify-center text-[var(--brand-link,#3B82F6)] shrink-0">
                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--primary,#2563EB)]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm md:text-fs-base font-bold text-slate-900 dark:text-white font-heading truncate">
                  Website Owner Program
                </h2>
                <p className="text-[10px] sm:text-fs-xs text-[var(--text-3,#6B7893)] truncate">
                  Owner Portal &amp; Mirrors
                </p>
              </div>
            </div>

            <span className="text-[9px] sm:text-xs font-semibold text-slate-300 bg-[var(--line,#1A2442)]/70 px-1.5 sm:px-2 py-0.5 rounded-full border border-[var(--line,#1A2442)] shrink-0 whitespace-nowrap">
              Verified Tier
            </span>
          </div>

          {/* Feature List (Structured Rows) */}
          <div className="p-3 sm:p-5 space-y-2.5 sm:space-y-4 flex-1 flex flex-col justify-around">
            <div className="flex items-start gap-2.5 sm:gap-3 p-3 rounded-[10px] sm:rounded-[12px] bg-[var(--card-hover,#0E182F)]/50 border border-[var(--line,#1A2442)]">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[7px] sm:rounded-[8px] bg-[var(--primary,#2563EB)]/15 text-[var(--brand-link,#3B82F6)] flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-fs-sm font-semibold text-slate-900 dark:text-white">
                  Unlimited Domains & Mirrors
                </h3>
                <p className="text-[11px] sm:text-fs-xs text-[var(--text-2,#A8B3C7)] mt-0.5 leading-relaxed">
                  List your primary website, backup mirrors, and unblocked proxy URLs with zero
                  domain restrictions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:gap-3 p-3 rounded-[10px] sm:rounded-[12px] bg-[var(--card-hover,#0E182F)]/50 border border-[var(--line,#1A2442)]">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[7px] sm:rounded-[8px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-fs-sm font-semibold text-slate-900 dark:text-white">
                  Automated Health Checks
                </h3>
                <p className="text-[11px] sm:text-fs-xs text-[var(--text-2,#A8B3C7)] mt-0.5 leading-relaxed">
                  Our network monitors uptime every 5 minutes and routes visitors directly to
                  fastest online mirrors.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:gap-3 p-3 rounded-[10px] sm:rounded-[12px] bg-[var(--card-hover,#0E182F)]/50 border border-[var(--line,#1A2442)]">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[7px] sm:rounded-[8px] bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-fs-sm font-semibold text-slate-900 dark:text-white">
                  Verified Ownership Badge
                </h3>
                <p className="text-[11px] sm:text-fs-xs text-[var(--text-2,#A8B3C7)] mt-0.5 leading-relaxed">
                  Gain official verified directory status and build audience trust with a dedicated
                  Owner Console.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Card Action */}
          <div className="p-3 sm:p-3.5 border-t border-[var(--line,#1A2442)] bg-[var(--card-hover,#0E182F)]/30">
            <Link
              href="/register"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).va) {
                  (window as any).va('event', {
                    name: 'cta_register_click',
                    data: { source: 'requests_card' },
                  });
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-[10px] sm:rounded-[12px] text-xs sm:text-fs-sm font-semibold bg-[var(--primary,#2563EB)] hover:bg-[var(--primary-hover,#1D4ED8)] text-white shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>List Your Website</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Right Column: Community Submissions (Tabs Card) */}
        <div className="lg:col-span-7 h-full rounded-[14px] sm:rounded-[16px] bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] overflow-hidden shadow-sm flex flex-col justify-between">
          {/* Segmented Filter Tab Controls */}
          <div className="p-2.5 sm:p-4 border-b border-[var(--line,#1A2442)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--card-hover,#0E182F)]/30">
            <div className="grid grid-cols-2 w-full sm:w-auto p-1 rounded-[8px] sm:rounded-[10px] bg-[var(--bg,#050A18)] border border-[var(--line,#1A2442)] text-xs sm:text-fs-sm font-medium gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('suggest')}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-[6px] sm:rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center text-xs sm:text-fs-sm ${
                  activeTab === 'suggest'
                    ? 'bg-[var(--primary,#2563EB)] text-white font-semibold shadow-sm'
                    : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Suggest Website</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-[6px] sm:rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center text-xs sm:text-fs-sm ${
                  activeTab === 'report'
                    ? 'bg-[var(--hot,#EF4444)] text-white font-semibold shadow-sm'
                    : 'text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">Report Broken</span>
              </button>
            </div>

            <span className="text-fs-xs text-[var(--text-3,#6B7893)] hidden sm:inline">
              Community Moderated
            </span>
          </div>

          {/* Form Content Area */}
          <div className="p-3.5 sm:p-6 flex-1 flex flex-col justify-between">
            {activeTab === 'suggest' ? (
              suggestSuccess ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-[12px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-fs-lg font-bold text-white font-heading">Suggestion Received</h3>
                  <p className="text-fs-sm text-[var(--text-2,#A8B3C7)] max-w-sm mx-auto leading-relaxed">
                    Thank you for contributing. Our directory editors test and verify all links and
                    mirrors before publishing.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSuggestSuccess(false);
                      setSuggestName('');
                      setSuggestUrl('');
                      setSuggestNotes('');
                    }}
                    className="inline-flex px-4 py-2 rounded-[10px] text-fs-sm font-semibold bg-[var(--primary,#2563EB)] text-white cursor-pointer mt-1"
                  >
                    Suggest Another Site
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSuggestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-fs-sm font-semibold text-slate-900 dark:text-white">
                        Website Name <span className="text-[var(--primary,#2563EB)]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={suggestName}
                        onChange={(e) => setSuggestName(e.target.value)}
                        placeholder="e.g. Retro Arcade"
                        className="w-full bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] focus:border-[var(--primary,#2563EB)] rounded-[12px] px-3.5 py-2.5 text-fs-base text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-fs-sm font-semibold text-slate-900 dark:text-white">
                        Primary URL <span className="text-[var(--primary,#2563EB)]">*</span>
                      </label>
                      <input
                        type="url"
                        required
                        value={suggestUrl}
                        onChange={(e) => setSuggestUrl(e.target.value)}
                        placeholder="https://retroarcade.io"
                        className="w-full bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] focus:border-[var(--primary,#2563EB)] rounded-[12px] px-3.5 py-2.5 text-fs-base text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-fs-sm font-semibold text-slate-900 dark:text-white">
                        Category <span className="text-[var(--primary,#2563EB)]">*</span>
                      </label>
                      <CustomSelect
                        value={suggestCategory}
                        onChange={(val) => setSuggestCategory(val)}
                        options={categoryOptions}
                        size="md"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-fs-sm font-semibold text-slate-900 dark:text-white">
                        Your Email{' '}
                        <span className="text-[var(--text-3,#6B7893)] font-normal">(optional)</span>
                      </label>
                      <input
                        type="email"
                        value={suggestEmail}
                        onChange={(e) => setSuggestEmail(e.target.value)}
                        placeholder="notification@example.com"
                        className="w-full bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] focus:border-[var(--primary,#2563EB)] rounded-[12px] px-3.5 py-2.5 text-fs-base text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-fs-sm font-semibold text-slate-900 dark:text-white">
                      Known Mirrors or Description{' '}
                      <span className="text-[var(--text-3,#6B7893)] font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={suggestNotes}
                      onChange={(e) => setSuggestNotes(e.target.value)}
                      placeholder="List alternate domain names, proxy links, or why this site belongs in the directory..."
                      className="w-full bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] focus:border-[var(--primary,#2563EB)] rounded-[12px] px-3.5 py-2.5 text-fs-base text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] outline-none transition-colors resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={suggestSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[10px] sm:rounded-[12px] text-xs sm:text-sm font-semibold bg-[var(--primary,#2563EB)] hover:bg-[var(--primary-hover,#1D4ED8)] text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50 min-h-[40px] sm:min-h-[44px]"
                  >
                    {suggestSubmitting ? (
                      <>
                        <CircularLoader size="xs" color="#ffffff" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Send Suggestion</span>
                      </>
                    )}
                  </button>
                </form>
              )
            ) : reportSuccess ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-[12px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-fs-lg font-bold text-white font-heading">Report Logged</h3>
                <p className="text-fs-sm text-[var(--text-2,#A8B3C7)] max-w-sm mx-auto leading-relaxed">
                  Thank you. Our automated health checkers and directory monitors will probe this
                  domain and update the live mirror records.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setReportSuccess(false);
                    setReportUrl('');
                    setReportNotes('');
                  }}
                  className="inline-flex px-4 py-2 rounded-[10px] text-fs-sm font-semibold bg-[var(--primary,#2563EB)] text-white cursor-pointer mt-1"
                >
                  Report Another Link
                </button>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-fs-sm font-semibold text-slate-900 dark:text-white">
                      Broken Domain or Website <span className="text-[var(--hot,#EF4444)]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={reportUrl}
                      onChange={(e) => setReportUrl(e.target.value)}
                      placeholder="e.g. mirror-1.domain.com"
                      className="w-full bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] focus:border-[var(--hot,#EF4444)] rounded-[12px] px-3.5 py-2.5 text-fs-base text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-fs-sm font-semibold text-slate-900 dark:text-white">
                      Issue Type <span className="text-[var(--hot,#EF4444)]">*</span>
                    </label>
                    <CustomSelect
                      value={reportReason}
                      onChange={(val) => setReportReason(val)}
                      options={issueOptions}
                      size="md"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-fs-sm font-semibold text-slate-900 dark:text-white">
                    Details / Error Encountered
                  </label>
                  <textarea
                    rows={3}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    placeholder="What error occurred? (e.g. Cloudflare error 522, ISP block page, domain expired)..."
                    className="w-full bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] focus:border-[var(--hot,#EF4444)] rounded-[12px] px-3.5 py-2.5 text-fs-base text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] outline-none transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-fs-sm font-semibold text-slate-900 dark:text-white">
                    Your Email{' '}
                    <span className="text-[var(--text-3,#6B7893)] font-normal">
                      (optional, for status follow-up)
                    </span>
                  </label>
                  <input
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] focus:border-[var(--hot,#EF4444)] rounded-[12px] px-3.5 py-2.5 text-fs-base text-slate-900 dark:text-white placeholder-[var(--text-3,#6B7893)] outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reportSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-[10px] sm:rounded-[12px] text-xs sm:text-sm font-semibold bg-[var(--hot,#EF4444)] hover:bg-[var(--hot,#EF4444)]/90 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50 min-h-[40px] sm:min-h-[44px]"
                >
                  {reportSubmitting ? (
                    <>
                      <CircularLoader size="xs" color="#ffffff" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Submit Broken Link Report</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
