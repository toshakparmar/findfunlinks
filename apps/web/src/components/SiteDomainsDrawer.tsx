'use client';

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Copy, Check, AlertTriangle, Clock, ShieldCheck, Star } from 'lucide-react';
import { api } from '../lib/api';

export interface DomainItemData {
  id: string;
  domainName: string;
  url: string;
  domainType: string; // 'PRIMARY' | 'MIRROR' | 'PROXY' | 'ALTERNATE'
  status: string; // 'ACTIVE' | 'DEGRADED' | 'DOWN'
  lastResponseMs?: number | null;
  lastCheckedAt?: string | null;
}

export interface SiteDetailModalData {
  id: string;
  name: string;
  displayName?: string | null;
  slug: string;
  description?: string | null;
  faviconUrl?: string | null;
  categoryName?: string;
  accentColor?: string;
  domains: DomainItemData[];
}

export interface SiteDomainsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  site: SiteDetailModalData | null;
  onReportDomain?: (domain: DomainItemData) => void;
}

export const SiteDomainsDrawer: React.FC<SiteDomainsDrawerProps> = ({
  isOpen,
  onClose,
  site,
  onReportDomain,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [starCount, setStarCount] = useState<number>(0);
  const [hasStarred, setHasStarred] = useState<boolean>(false);

  useEffect(() => {
    if (site?.id) {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`finallinks_star_${site.id}`);
        setHasStarred(!!stored);
      }
      setStarCount((site as any).stars || 0);
    }
  }, [site?.id]);

  const handleGiveStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!site?.id || hasStarred) return;
    setHasStarred(true);
    setStarCount((prev) => prev + 1);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`finallinks_star_${site.id}`, 'true');
    }
    try {
      const res = await api.public.starWebsite(site.id);
      if (typeof res?.stars === 'number') {
        setStarCount(res.stars);
      }
    } catch {
      // rollback handled gracefully
    }
  };

  if (!isOpen || !site) return null;

  const accentColor = site.accentColor || '#3B82F6';

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (Side drawer on desktop, bottom sheet on mobile) */}
      <div className="relative w-full md:max-w-md h-[85vh] md:h-full bg-[var(--card,#0A1226)] border-t md:border-t-0 md:border-l border-[var(--line,#1A2442)] shadow-2xl flex flex-col z-10 rounded-t-[20px] md:rounded-none overflow-hidden animate-in fade-in slide-in-from-bottom md:slide-in-from-right duration-200">
        {/* Header Strip */}
        <div
          className="p-4 border-b border-[var(--line,#1A2442)] flex items-center justify-between"
          style={{
            background: `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 18%, transparent), transparent)`,
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-[var(--line,#1A2442)] shrink-0"
              style={{
                border: `1.5px solid ${accentColor}`,
              }}
            >
              {site.faviconUrl ? (
                <img
                  src={site.faviconUrl}
                  alt=""
                  width={24}
                  height={24}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <span className="text-sm font-bold" style={{ color: accentColor }}>
                  {site.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {site.displayName || site.name}
              </h3>
              {site.categoryName && (
                <span className="text-fs-xs text-[var(--text-2,#A8B3C7)] font-medium">
                  {site.categoryName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGiveStar}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                hasStarred
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-[var(--card,#0A1226)] text-[var(--text-2,#A8B3C7)] hover:text-amber-400 border border-[var(--line,#1A2442)]'
              }`}
              title={hasStarred ? 'You loved this website' : 'Give a star to this website'}
            >
              <Star className={`w-3.5 h-3.5 ${hasStarred ? 'fill-amber-400 text-amber-400' : 'text-amber-400'}`} />
              <span>{starCount}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[var(--header,#070D1E)] border border-[var(--line,#1A2442)] flex items-center justify-center text-[var(--text-2,#A8B3C7)] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {site.description && (
            <p className="text-xs text-[var(--text-2,#A8B3C7)] leading-relaxed">
              {site.description}
            </p>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Active Mirrors & Domains ({site.domains?.length || 0})
              </h4>
              <span className="text-fs-xs text-[var(--text-3,#6B7893)]">Click link to open</span>
            </div>

            <div className="space-y-2">
              {site.domains && site.domains.length > 0 ? (
                site.domains.map((domain, index) => {
                  const isOnline = domain.status === 'ACTIVE';
                  const isDegraded = domain.status === 'DEGRADED';
                  const statusColor = isOnline ? '#22C55E' : isDegraded ? '#F59E0B' : '#EF4444';

                  return (
                    <div
                      key={domain.id || index}
                      className="p-3 rounded-xl bg-[var(--header,#070D1E)] border border-[var(--line,#1A2442)] hover:border-[var(--line,#1A2442)]/80 transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: statusColor }}
                          />
                          <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {domain.domainName}
                          </span>
                          {domain.domainType && (
                            <span className="px-1.5 py-0.2 rounded text-fs-xs font-semibold uppercase tracking-wider bg-slate-100 dark:bg-[var(--card,#0A1226)] text-slate-700 dark:text-[var(--text-2,#A8B3C7)] border border-[var(--line,#1A2442)]">
                              {domain.domainType}
                            </span>
                          )}
                        </div>

                        {domain.lastResponseMs !== undefined && domain.lastResponseMs !== null && (
                          <span className="text-fs-xs font-mono text-[var(--text-3,#6B7893)] flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {domain.lastResponseMs}ms
                          </span>
                        )}
                      </div>

                      {/* Domain URL & Action Buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-[var(--line,#1A2442)]/50">
                        <span className="text-fs-xs text-[var(--text-2,#A8B3C7)] truncate max-w-[200px] font-mono">
                          {domain.url}
                        </span>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => copyUrl(domain.id, domain.url)}
                            className="p-1.5 rounded-lg bg-[var(--card,#0A1226)] text-[var(--text-2,#A8B3C7)] hover:text-white transition-colors cursor-pointer"
                            title="Copy link"
                          >
                            {copiedId === domain.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <a
                            href={domain.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            onClick={() => {
                              api.public.trackDomainClick(domain.id).catch(() => {});
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary,#2563EB)] text-white text-fs-xs font-semibold hover:bg-[var(--primary-hover,#1D4ED8)] transition-colors cursor-pointer"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          {onReportDomain && (
                            <button
                              type="button"
                              onClick={() => onReportDomain(domain)}
                              className="p-1.5 rounded-lg bg-[var(--card,#0A1226)] text-[var(--text-3,#6B7893)] hover:text-amber-400 transition-colors cursor-pointer"
                              title="Report broken mirror"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-[var(--text-3,#6B7893)]">
                  No alternate mirrors registered for this site.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[var(--line,#1A2442)] bg-[var(--header,#070D1E)] flex items-center justify-between text-fs-xs text-[var(--text-3,#6B7893)]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--ok,#22C55E)]" />
            Verified & monitored mirrors
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[var(--primary,#2563EB)] hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
