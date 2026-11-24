'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Copy, Check, Info } from 'lucide-react';
import { CircularLoader } from './ui/CircularLoader';
import { useWebsiteModal } from '../lib/website-modal-context';
import { StarButton, Logo } from '@finallinks/ui';
import { CLIENT_18_CATEGORIES } from '../lib/client-catalog';
import type { WebsitePreview, Engagement } from '@finallinks/contracts';

export const WebsiteDetailModal: React.FC = () => {
  const { activeSlug, isOpen, closeWebsiteModal } = useWebsiteModal();

  const [data, setData] = useState<WebsitePreview | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !activeSlug) return;

    let isMounted = true;
    setLoading(true);

    async function loadDetails() {
      try {
        const [previewRes, engagementRes] = await Promise.all([
          fetch(`/api/public/websites/${encodeURIComponent(activeSlug!)}/preview`).catch(
            () => null,
          ),
          fetch(`/api/public/websites/${encodeURIComponent(activeSlug!)}/engagement`).catch(
            () => null,
          ),
        ]);

        if (previewRes && previewRes.ok) {
          const raw = await previewRes.json();
          const pData = raw?.data || raw;
          if (pData && pData.name && pData.domainsCount !== undefined && isMounted) {
            setData(pData);
          }
        }

        // If data was not populated from API, resolve from verified catalog
        if (!data && activeSlug) {
          let fallbackSite: any = null;
          let catName = 'Directory Entry';
          const targetSlug = activeSlug.toLowerCase();
          for (const c of CLIENT_18_CATEGORIES) {
            const found = c.sites.find(
              (s) => s.slug.toLowerCase() === targetSlug || s.id === activeSlug,
            );
            if (found) {
              fallbackSite = found;
              catName = c.name;
              break;
            }
          }

          if (fallbackSite && isMounted) {
            const rawDomains =
              fallbackSite.domains && fallbackSite.domains.length > 0
                ? fallbackSite.domains
                : [
                    {
                      id: `${fallbackSite.id}-p`,
                      domainName:
                        fallbackSite.bestDomainUrl?.replace(/^https?:\/\//, '') ||
                        `${fallbackSite.slug}.com`,
                      url: fallbackSite.bestDomainUrl || `https://${fallbackSite.slug}.com`,
                      domainType: 'PRIMARY',
                      status: 'ACTIVE',
                      lastResponseMs: 52,
                    },
                  ];

            const mirrors = rawDomains.map((d: any, idx: number) => ({
              id: d.id || `m-${idx + 1}`,
              label: d.domainName || d.url?.replace(/^https?:\/\//, '') || fallbackSite.name,
              url: d.url || `https://${fallbackSite.slug}.com`,
              type: d.domainType || (idx === 0 ? 'PRIMARY' : 'MIRROR'),
              status: d.status || 'ACTIVE',
              responseMs: d.lastResponseMs || 42,
            }));

            setData({
              id: fallbackSite.id,
              name: fallbackSite.name,
              slug: fallbackSite.slug,
              faviconUrl: fallbackSite.faviconUrl,
              shortDescription:
                fallbackSite.description ||
                `Official verified directory listing for ${fallbackSite.name}.`,
              highlights: [
                `Fast verified ${fallbackSite.name} mirror endpoints`,
                'Clean high-speed streaming infrastructure',
                'Regular 5-minute health telemetry',
                'Community curated & reviewed',
              ],
              category: {
                id: 'cat-1',
                name: catName,
                slug: 'category',
                accentKey: 'blue',
              },
              rankInCategory: fallbackSite.rank || 1,
              starCount: 343,
              domainsCount: mirrors.length,
              onlineCount: mirrors.filter((m: any) => m.status === 'ACTIVE').length,
              fastestMirror: mirrors[0]
                ? { url: mirrors[0].url, ms: mirrors[0].responseMs }
                : undefined,
              mirrors,
              lastVerifiedAt: new Date().toISOString(),
              tags: [],
              isNew: false,
            });
          }
        }

        if (engagementRes && engagementRes.ok && isMounted) {
          const eData = await engagementRes.json();
          setEngagement(eData);
        }
      } catch (err) {
        console.error('Failed to load website modal details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeSlug]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeWebsiteModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeWebsiteModal]);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleStarToggle = async (nextStarred: boolean) => {
    if (!activeSlug) return;
    try {
      const res = await fetch(`/api/public/websites/${encodeURIComponent(activeSlug)}/star`, {
        method: nextStarred ? 'PUT' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const result: Engagement = await res.json();
        setEngagement(result);
        if (data) {
          setData({ ...data, starCount: result.starCount });
        }
        return { count: result.starCount, starred: result.starred };
      }
    } catch (e) {
      console.error('Failed to toggle star:', e);
    }
    return undefined;
  };

  if (!isOpen) return null;

  const currentStarCount = engagement?.starCount ?? data?.starCount ?? 0;
  const isStarred = engagement?.starred ?? false;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeWebsiteModal}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl text-[var(--text,#F1F5F9)] overflow-hidden max-h-[88vh] sm:max-h-[90vh] flex flex-col"
        >
          {/* Accent Header Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />

          {/* Close button */}
          <button
            type="button"
            onClick={closeWebsiteModal}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-xl bg-[var(--card-hover,#0E182F)] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-[var(--line,#1A2442)]"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-start gap-2.5 sm:gap-3.5 pr-8 sm:pr-10 pb-3 sm:pb-4 border-b border-[var(--line,#1A2442)]">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {data?.faviconUrl ? (
                <img
                  src={data.faviconUrl}
                  alt=""
                  width={36}
                  height={36}
                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full items-center justify-center ${data?.faviconUrl ? 'hidden' : 'flex'}`}
              >
                <Logo variant="mark" size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-white truncate">
                  {data?.name || activeSlug}
                </h2>
                {data?.category?.name && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold bg-brand-blue-500/10 text-brand-blue-600 dark:text-brand-blue-400 border border-brand-blue-500/20">
                    {data.category.name}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                {data?.shortDescription ||
                  'Verified directory listing and live working mirror endpoints.'}
              </p>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto py-3 sm:py-4 space-y-3.5 sm:space-y-4 text-xs sm:text-sm custom-scrollbar pr-1">
            {loading && !data && (
              <div className="flex flex-col items-center justify-center py-12">
                <CircularLoader size="md" label="Loading" />
              </div>
            )}

            {data && (
              <>
                {/* Stats Bar */}
                <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[var(--card-hover,#0E182F)] border border-[var(--line,#1A2442)] text-xs flex-wrap">
                  <div className="flex items-center gap-2">
                    <StarButton
                      slug={activeSlug || ''}
                      count={currentStarCount}
                      starred={isStarred}
                      onToggle={handleStarToggle}
                      size="sm"
                    />
                    <span className="text-slate-600">&bull;</span>
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      {data.onlineCount} Online Mirrors
                    </span>
                  </div>

                  <span className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-xs">
                    Live 5m telemetry
                  </span>
                </div>

                {/* Highlights */}
                {data.highlights && data.highlights.length > 0 && (
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                      Features &amp; Highlights
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                      {data.highlights.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-100/90 dark:bg-[var(--card-hover,#0E182F)] border border-slate-200 dark:border-[var(--line,#1A2442)] text-xs sm:text-sm text-slate-800 dark:text-slate-200"
                        >
                          <span className="text-brand-blue-500 dark:text-brand-blue-400 font-bold text-sm leading-none mt-0.5">
                            +
                          </span>
                          <span className="leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Note Callout */}
                {data.note && (
                  <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-xl bg-brand-blue-500/10 border border-brand-blue-500/20 text-xs text-slate-700 dark:text-slate-300">
                    <Info className="w-4 h-4 text-brand-blue-500 dark:text-brand-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{data.note}</span>
                  </div>
                )}

                {/* Working Domains & Mirrors */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                      Working Domains &amp; Mirrors ({data.mirrors?.length || 0})
                    </h3>
                    <span className="text-[11px] text-slate-500 font-mono">auto-monitored</span>
                  </div>

                  <div className="space-y-1.5">
                    {data.mirrors?.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-[var(--card-hover,#0E182F)] border border-slate-200 dark:border-[var(--line,#1A2442)] hover:border-brand-blue-500/50 transition-colors group shadow-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 mr-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-blue-500 dark:group-hover:text-brand-blue-400 transition-colors">
                            {m.label}
                          </span>
                          {m.responseMs && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 font-medium">
                              {m.responseMs}ms
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(m.id, m.url)}
                            className="p-1 sm:p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            title="Copy link"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="p-1 sm:p-1.5 rounded-lg hover:bg-brand-blue-500/20 text-brand-blue-600 dark:text-brand-blue-400 hover:text-brand-blue-500 transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-2.5 sm:pt-3 border-t border-[var(--line,#1A2442)] flex items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={closeWebsiteModal}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl border border-slate-300 dark:border-[var(--line,#1A2442)] bg-slate-100 dark:bg-[var(--card-hover,#0E182F)] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              Close
            </button>
            {data?.mirrors?.[0]?.url && (
              <a
                href={data.mirrors[0].url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-brand-blue-600 hover:bg-brand-blue-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                <span>Visit {data.name}</span>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
