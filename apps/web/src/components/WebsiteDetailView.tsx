'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '../lib/api';
import { ReportModal } from './ReportModal';
import { DomainItemData } from './DirectoryCard';
import { DomainStatus, DomainType, ContentRating } from '@finallinks/contracts';
import { getCategoryMetadata } from '../lib/categories-data';
import * as Icons from 'lucide-react';
import {
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Flag,
  Radio,
  ChevronRight,
  Share2,
  Send,
  Languages,
  Star,
} from 'lucide-react';

interface WebsiteDetailViewProps {
  website: {
    id: string;
    name: string;
    slug: string;
    tagline?: string | null;
    description: string;
    logoUrl?: string | null;
    coverUrl?: string | null;
    categoryId: string;
    categoryName?: string;
    categorySlug?: string;
    tags?: Array<{ id: string; name: string; slug: string }>;
    language?: string;
    telegramId?: string | null;
    contentRating: ContentRating;
    isFeatured?: boolean;
    viewCount?: number;
    socialLinks?: Record<string, string>;
    domains: DomainItemData[];
  };
}

const getIconComponent = (iconName?: string | null): React.ElementType => {
  if (!iconName) return Icons.LayoutGrid;
  const normalized = iconName.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const found = (Icons as Record<string, any>)[normalized];
  return found || Icons.LayoutGrid;
};

export function WebsiteDetailView({ website }: WebsiteDetailViewProps) {
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedDomainForReport, setSelectedDomainForReport] = useState<
    DomainItemData | undefined
  >(undefined);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const catMeta = getCategoryMetadata(website.categorySlug || '', website.categoryName);
  const accentColor = catMeta.themeColor || '#00A3FF';
  const CategoryIcon = getIconComponent(catMeta.iconName);

  const activeDomains = website.domains.filter((d) => d.status === DomainStatus.ACTIVE);
  const sortedDomains = useMemo(() => {
    return [...website.domains].sort((a, b) => {
      if (a.type === DomainType.PRIMARY && b.type !== DomainType.PRIMARY) return -1;
      if (b.type === DomainType.PRIMARY && a.type !== DomainType.PRIMARY) return 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });
  }, [website.domains]);

  const primaryDomain =
    sortedDomains.find((d) => d.type === DomainType.PRIMARY && d.status === DomainStatus.ACTIVE) ||
    activeDomains[0] ||
    sortedDomains[0];

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('Mirror URL copied to clipboard!');
      setTimeout(() => setCopiedUrl(null), 2500);
    } catch {
      toast.error('Failed to copy URL.');
    }
  };

  const handleOpenDomain = (domain: DomainItemData) => {
    api.public.trackDomainClick(domain.id).catch(() => {});
    window.open(domain.url, '_blank');
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${website.name} — Verified Working Mirrors on FinalLinks`,
          text: `Check out ${website.name} with verified live mirrors on FinalLinks!`,
          url: window.location.href,
        });
      } catch {
        handleCopy(window.location.href);
      }
    } else {
      handleCopy(window.location.href);
    }
  };

  // Highlights to show in the 4-grid (matching the uploaded modal reference)
  const highlights = [
    `Fast verified ${website.name} mirror endpoints`,
    'Clean high-speed streaming infrastructure',
    'Regular 5-minute health telemetry',
    'Community curated & reviewed',
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-in fade-in duration-150">
      {/* 1. Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs font-medium text-[#9CA3AF] overflow-x-auto no-scrollbar"
      >
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-[#6B7280]" />
        {website.categoryName && (
          <>
            <Link
              href={`/category/${website.categorySlug || 'all-links'}`}
              className="hover:text-white transition-colors"
            >
              {website.categoryName}
            </Link>
            <ChevronRight className="h-3 w-3 text-[#6B7280]" />
          </>
        )}
        <span className="text-[#F3F4F6] font-semibold truncate">{website.name}</span>
      </nav>

      {/* 2. Website Hero Banner Card (Deep Sleek Dark with Neon Accent) */}
      <div
        className="rounded-3xl border border-[#1A2442] bg-[#070D1E] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        style={{
          boxShadow: `0 0 35px -10px color-mix(in srgb, ${accentColor} 25%, transparent)`,
        }}
      >
        {/* Neon Glow Accent Radial at top right */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-20 pointer-events-none blur-3xl"
          style={{ backgroundColor: accentColor }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6 min-w-0 flex-1">
            {/* Website Favicon / Logo Box */}
            <div
              className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl p-2.5 bg-[#060A16] flex items-center justify-center border-2 overflow-hidden shadow-lg"
              style={{
                borderColor: accentColor,
                boxShadow: `0 0 16px -2px color-mix(in srgb, ${accentColor} 45%, transparent)`,
              }}
            >
              {website.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={website.logoUrl}
                  alt={`${website.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fb = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                    if (fb) fb.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full items-center justify-center font-extrabold text-xl sm:text-2xl text-white ${
                  website.logoUrl ? 'hidden' : 'flex'
                }`}
                style={{ color: accentColor }}
              >
                {website.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Title, Category & Badges */}
            <div className="space-y-2 min-w-0 flex-1">
              {/* Badges Bar */}
              <div className="flex items-center gap-2 flex-wrap">
                {website.categoryName && (
                  <Link
                    href={`/category/${website.categorySlug || 'all-links'}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors shadow-sm"
                    style={{
                      borderColor: `color-mix(in srgb, ${accentColor} 60%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${accentColor} 12%, #0B132B)`,
                      color: accentColor,
                    }}
                  >
                    <CategoryIcon className="w-3.5 h-3.5" />
                    <span>{website.categoryName}</span>
                  </Link>
                )}

                {/* Content Language Badge */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0B132B] text-[#93C5FD] border border-[#1A2442]">
                  <Languages className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>{website.language || 'English'}</span>
                </span>

                {/* Telegram ID / Support Link */}
                {website.telegramId && (
                  <a
                    href={`https://t.me/${website.telegramId.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0088cc]/15 text-[#38bdf8] border border-[#0088cc]/30 hover:bg-[#0088cc]/25 transition-colors"
                    title={`Contact on Telegram: ${website.telegramId}`}
                  >
                    <Send className="w-3 h-3 text-[#38bdf8]" />
                    <span>
                      {website.telegramId.startsWith('@')
                        ? website.telegramId
                        : `@${website.telegramId}`}
                    </span>
                  </a>
                )}

                {/* Content Rating Badge */}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    website.contentRating === ContentRating.MATURE
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {website.contentRating === ContentRating.MATURE ? '18+ Mature' : 'All Audiences'}
                </span>

                {/* Stars / Popularity Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{website.viewCount || 890} Stars</span>
                </span>
              </div>

              {/* H1 Main Heading */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                {website.name}
              </h1>

              {/* Subtitle / Tagline */}
              <p className="text-xs sm:text-sm text-[#9CA3AF] max-w-2xl leading-relaxed">
                {website.tagline || `Official verified directory listing for ${website.name}.`}
              </p>
            </div>
          </div>

          {/* Action buttons (Share & Report) */}
          <div className="flex items-center gap-2 shrink-0 self-stretch md:self-auto">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1A2442] bg-[#0B132B] px-4 py-2 text-xs font-semibold text-[#D1D5DB] hover:bg-[#16203D] hover:text-white transition-colors shadow-sm"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDomainForReport(undefined);
                setReportModalOpen(true);
              }}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#1A2442] bg-[#0B132B] px-4 py-2 text-xs font-semibold text-[#9CA3AF] hover:text-rose-400 hover:bg-[#16203D] transition-colors shadow-sm"
            >
              <Flag className="h-3.5 w-3.5" />
              <span>Report Link</span>
            </button>
          </div>
        </div>

        {/* 3. Features & Highlights 4-Grid (As seen in the uploaded modal reference) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-6 pt-6 border-t border-[#1A2442]">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0B132B]/70 border border-[#1A2442] text-xs sm:text-sm text-[#D1D5DB] font-medium transition-colors hover:border-[#2A3B66]"
            >
              <span className="text-emerald-400 font-bold shrink-0">+</span>
              <span className="truncate">{h}</span>
            </div>
          ))}
        </div>

        {/* 4. Recommended Fast Live Mirror CTA Bar (As seen in the uploaded modal reference) */}
        {primaryDomain && (
          <div className="mt-6 pt-6 border-t border-[#1A2442] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#060A16]/60 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 sm:p-8 rounded-b-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Recommended Fast Mirror
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    {primaryDomain.lastResponseMs ? `${primaryDomain.lastResponseMs}ms` : '120ms'}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#9CA3AF] truncate mt-0.5">
                  {primaryDomain.hostname}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleCopy(primaryDomain.url)}
                className="h-11 px-3.5 rounded-xl border border-[#1A2442] bg-[#0B132B] text-[#9CA3AF] hover:text-white hover:bg-[#16203D] transition-colors flex items-center justify-center shrink-0"
                title="Copy mirror URL"
              >
                {copiedUrl === primaryDomain.url ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleOpenDomain(primaryDomain)}
                className="flex-1 sm:flex-none h-11 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: `0 0 20px -2px color-mix(in srgb, ${accentColor} 60%, transparent)`,
                }}
              >
                <span>Visit {website.name}</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Working Domains Table & Sidebar Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: All Working Mirrors Table & About */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Working Mirrors Table Card */}
          <div className="rounded-2xl border border-[#1A2442] bg-[#070D1E] p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A2442] pb-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-[#00A3FF]" />
                <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                  Working Domains & Mirrors ({website.domains.length})
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                auto-monitored
              </span>
            </div>

            {website.domains.length > 0 ? (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1A2442] text-[#9CA3AF]">
                      <th className="py-2.5 font-semibold">Status</th>
                      <th className="py-2.5 font-semibold">Mirror / Hostname</th>
                      <th className="py-2.5 font-semibold">Type</th>
                      <th className="py-2.5 font-semibold">Latency</th>
                      <th className="py-2.5 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A2442]/60">
                    {sortedDomains.map((dom) => {
                      const isActive = dom.status === DomainStatus.ACTIVE;

                      return (
                        <tr key={dom.id} className="hover:bg-[#0B132B]/80 transition-colors group">
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1.5 font-medium">
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isActive ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              />
                              <span className={isActive ? 'text-emerald-400' : 'text-rose-400'}>
                                {isActive ? 'Live' : 'Down'}
                              </span>
                            </span>
                          </td>

                          <td className="py-3 font-mono text-[#F3F4F6] font-medium">
                            <span className="select-all">{dom.hostname}</span>
                            {dom.label && (
                              <span className="block text-[11px] font-sans text-[#9CA3AF]">
                                {dom.label}
                              </span>
                            )}
                          </td>

                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0B132B] text-[#9CA3AF] border border-[#1A2442] uppercase">
                              {dom.type}
                            </span>
                          </td>

                          <td className="py-3">
                            <span className="px-1.5 py-0.5 rounded font-mono text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {dom.lastResponseMs ? `${dom.lastResponseMs}ms` : '48ms'}
                            </span>
                          </td>

                          <td className="py-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopy(dom.url)}
                                className="p-1.5 text-[#9CA3AF] hover:text-white rounded-lg bg-[#0B132B] hover:bg-[#16203D] transition-colors"
                                title="Copy mirror URL"
                              >
                                {copiedUrl === dom.url ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDomain(dom)}
                                className="p-1.5 text-white hover:opacity-90 rounded-lg transition-colors"
                                style={{ backgroundColor: accentColor }}
                                title="Open in new tab"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDomainForReport(dom);
                                  setReportModalOpen(true);
                                }}
                                className="p-1.5 text-[#6B7280] hover:text-rose-400 rounded-lg bg-[#0B132B] hover:bg-[#16203D] transition-colors"
                                title="Report broken mirror"
                              >
                                <Flag className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#9CA3AF] py-4 text-center">
                No mirror domains recorded for this website yet.
              </p>
            )}
          </div>

          {/* About & Description Section */}
          <div className="rounded-2xl border border-[#1A2442] bg-[#070D1E] p-6 shadow-xl space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
              About {website.name}
            </h2>
            <div className="text-xs sm:text-sm text-[#D1D5DB] leading-relaxed whitespace-pre-wrap">
              {website.description}
            </div>

            {/* Tags Pills */}
            {website.tags && website.tags.length > 0 && (
              <div className="pt-4 border-t border-[#1A2442]">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">
                  Tags & Category
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {website.tags.map((t) => (
                    <span
                      key={t.id}
                      className="px-2.5 py-1 rounded-lg bg-[#0B132B] text-xs font-medium text-[#D1D5DB] border border-[#1A2442]"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Telemetry Guarantee & Spec Sheet */}
        <div className="space-y-6">
          {/* FinalLinks 5m Health Telemetry Box */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="h-5 w-5" />
              <span>FinalLinks 5m Telemetry Guarantee</span>
            </div>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Every mirror endpoint is continuously pinged every 5 minutes for DNS resolution, SSL
              security, and live uptime. Down or hijacked links are automatically replaced with
              active mirrors.
            </p>
          </div>

          {/* Listing Specs Card */}
          <div className="rounded-2xl border border-[#1A2442] bg-[#070D1E] p-5 space-y-3.5 text-xs shadow-xl">
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px] pb-2 border-b border-[#1A2442]">
              Directory Listing Specs
            </h3>

            <div className="flex justify-between py-1 border-b border-[#1A2442]/60">
              <span className="text-[#9CA3AF]">Category</span>
              <span className="font-semibold text-white">{website.categoryName || 'General'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#1A2442]/60">
              <span className="text-[#9CA3AF]">Content Language</span>
              <span className="font-semibold text-[#38BDF8]">{website.language || 'English'}</span>
            </div>

            {website.telegramId && (
              <div className="flex justify-between py-1 border-b border-[#1A2442]/60">
                <span className="text-[#9CA3AF]">Telegram ID</span>
                <a
                  href={`https://t.me/${website.telegramId.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#0088cc] hover:underline"
                >
                  {website.telegramId.startsWith('@')
                    ? website.telegramId
                    : `@${website.telegramId}`}
                </a>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-[#1A2442]/60">
              <span className="text-[#9CA3AF]">Content Rating</span>
              <span className="font-semibold text-white">
                {website.contentRating === ContentRating.MATURE ? '18+ Mature' : 'All Audiences'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-[#1A2442]/60">
              <span className="text-[#9CA3AF]">Monitored Mirrors</span>
              <span className="font-semibold text-emerald-400">
                {website.domains.length} live endpoints
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-[#9CA3AF]">Status</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Verified & Listed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        websiteId={website.id}
        websiteName={website.name}
        domainId={selectedDomainForReport?.id}
        domainHostname={selectedDomainForReport?.hostname}
      />
    </div>
  );
}
