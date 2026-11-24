'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Info, Flag, ArrowRight, RefreshCw } from 'lucide-react';
import { CircularLoader } from './ui/CircularLoader';
import { HighlightList, MirrorChip, StarButton } from '@finallinks/ui';
import type { WebsitePreview, Engagement } from '@finallinks/contracts';
import { formatTimeAgo } from '../lib/api';
import { useWebsiteModal } from '../lib/website-modal-context';

export interface SiteRowPanelProps {
  slug: string;
  categoryName?: string;
  categorySlug?: string;
  accentColor?: string;
  panelId?: string;
  headerId?: string;
  onClose?: () => void;
  onReport?: (slug: string) => void;
}

export const SiteRowPanel: React.FC<SiteRowPanelProps> = ({
  slug,
  categoryName: _categoryName,
  accentColor = '#2563EB',
  panelId,
  headerId,
  onClose,
  onReport,
}) => {
  const { openWebsiteModal } = useWebsiteModal();
  const [data, setData] = useState<WebsitePreview | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [previewRes, engagementRes] = await Promise.all([
        fetch(`/api/public/websites/${encodeURIComponent(slug)}/preview`),
        fetch(`/api/public/websites/${encodeURIComponent(slug)}/engagement`),
      ]);

      if (!previewRes.ok) {
        throw new Error(`Failed to load preview (status ${previewRes.status})`);
      }

      const rawPreview: any = await previewRes.json();
      const previewData: WebsitePreview = rawPreview?.data || rawPreview;
      setData(previewData);

      if (engagementRes.ok) {
        const rawEng: any = await engagementRes.json();
        const engData: Engagement = rawEng?.data || rawEng;
        setEngagement(engData);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleStarToggle = async (nextStarred: boolean) => {
    try {
      const res = await fetch(`/api/public/websites/${encodeURIComponent(slug)}/star`, {
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
      return undefined;
    } catch (e) {
      console.error('Failed to toggle star:', e);
      throw e;
    }
  };

  const currentStarCount = engagement?.starCount ?? data?.starCount ?? 0;
  const isStarred = engagement?.starred ?? false;

  return (
    <motion.div
      id={panelId}
      role="region"
      aria-labelledby={headerId}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
      className="overflow-hidden bg-[var(--card-hover,#0E182F)] border-t border-[var(--line,#1A2442)] rounded-b-xl"
    >
      <div className="p-4 sm:p-5">
        {/* Accent Top Indicator Bar */}
        <div
          className="w-12 h-[2px] mb-3.5 rounded-full"
          style={{ backgroundColor: accentColor }}
        />

        {/* Loading State with Circular Loader */}
        {loading && (
          <div className="py-8 flex items-center justify-center" aria-busy="true">
            <CircularLoader size="md" label="Loading" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-4 text-center space-y-2">
            <p className="text-fs-sm text-rose-400">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-fs-xs font-semibold bg-slate-800 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loaded Data Content */}
        {data && !loading && (
          <div>
            {/* Two-Column Body for Desktop/Tablet (>=520px) / Stacked for Mobile */}
            <div className="grid grid-cols-1 min-[520px]:grid-cols-2 gap-5 items-start">
              {/* Left Column: Short description, Highlights, Note */}
              <div className="space-y-3 min-[520px]:border-r min-[520px]:border-[var(--line,#1A2442)] min-[520px]:pr-5">
                {/* Short Description */}
                {data.shortDescription && (
                  <p className="text-fs-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {data.shortDescription}{' '}
                    <button
                      type="button"
                      onClick={() => openWebsiteModal(slug)}
                      className="font-medium text-brand-blue-400 hover:underline inline-flex items-center ml-1 text-fs-xs"
                    >
                      Read more &rarr;
                    </button>
                  </p>
                )}

                {/* Highlights List */}
                {data.highlights && data.highlights.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-3,#6B7893)] block mb-1.5">
                      Highlights
                    </span>
                    <HighlightList
                      highlights={data.highlights}
                      maxCount={6}
                      accentColor={accentColor}
                      detailUrl={`/site/${slug}`}
                    />
                  </div>
                )}

                {/* Note Callout */}
                {data.note && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--card,#0A1226)] border border-[var(--line,#1A2442)] text-fs-xs text-slate-400">
                    <Info className="w-4 h-4 text-brand-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{data.note}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Mirror Status, Mirror Buttons Stack, Fastest Button */}
              <div className="space-y-3">
                {/* Header Line: Domains count, Online status, Last Checked */}
                <div className="flex items-center justify-between text-fs-xs text-[var(--text-3,#6B7893)] pb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        data.onlineCount > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {data.domainsCount} {data.domainsCount === 1 ? 'domain' : 'domains'}
                    </span>
                    <span>&middot;</span>
                    <span className="text-emerald-400 font-medium">
                      {data.onlineCount} online
                    </span>
                  </div>
                  <span className="tabular-nums">
                    {formatTimeAgo(data.lastVerifiedAt)}
                  </span>
                </div>

                {/* Stack of Top Mirror Buttons */}
                <div className="space-y-1.5 pt-1">
                  {(data.mirrors || []).slice(0, 8).map((m) => (
                    <MirrorChip
                      key={m.id}
                      id={m.id}
                      label={m.label}
                      url={m.url}
                      type={m.type}
                      status={m.status}
                      responseMs={m.responseMs}
                      accentColor={accentColor}
                    />
                  ))}
                </div>

                {/* View All Domains Link if > 8 domains */}
                {data.domainsCount > 8 && (
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => openWebsiteModal(slug)}
                      className="text-fs-xs font-semibold text-brand-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      View all {data.domainsCount} domains &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Strip (Full Width) */}
            <div className="pt-3.5 mt-3.5 border-t border-[var(--line,#1A2442)] flex flex-wrap items-center justify-between gap-3 text-fs-xs">
              {/* Left group: StarButton, Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <StarButton
                  slug={slug}
                  count={currentStarCount}
                  starred={isStarred}
                  onToggle={handleStarToggle}
                  size="sm"
                />

                {data.tags &&
                  data.tags.slice(0, 2).map((t) => (
                    <span
                      key={t.id}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {t.name}
                    </span>
                  ))}
              </div>

              {/* Right group: Report, View details */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onReport?.(slug)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Report broken mirror"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => openWebsiteModal(slug)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-semibold text-brand-blue-400 hover:text-brand-blue-300 hover:bg-brand-blue-500/10 transition-colors"
                >
                  <span>View details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
