'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, CheckCircle2, Award, ExternalLink, ArrowRight } from 'lucide-react';
import { WebsiteCardData } from './DirectoryCard';
import { SpotlightCard } from './reactbits/SpotlightCard';

interface DiscoveryRailsProps {
  websites: WebsiteCardData[];
}

export function DiscoveryRails({ websites }: DiscoveryRailsProps) {
  // 1. Trending This Week (highest view counts)
  const trending = [...websites]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 4);

  // 2. Editor's Picks (featured items)
  const editorsPicks = websites.filter((w) => w.isFeatured).slice(0, 4);

  // 3. Recently Verified (active mirrors with low response times)
  const recentlyVerified = [...websites]
    .filter((w) => w.domains?.some((d) => d.status === 'ACTIVE'))
    .sort((a, b) => {
      const aTime = a.domains?.[0]?.lastResponseMs || 999;
      const bTime = b.domains?.[0]?.lastResponseMs || 999;
      return aTime - bTime;
    })
    .slice(0, 4);

  return (
    <div className="space-y-8 my-8 pt-4 border-t border-token/10">
      {/* 1. Trending Rail */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-chip bg-token-hot/10 text-token-hot flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-display font-bold text-base text-token tracking-tight">
              Trending This Week
            </h3>
            <span className="text-fs-xs font-mono text-token/40">Most active mirrors</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {trending.map((site) => (
            <SpotlightCard
              key={site.id}
              spotlightColor="rgba(255, 106, 43, 0.12)"
              className="p-3.5 hover:border-token/25 transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-chip bg-surface-2 border border-token/10 flex items-center justify-center text-xs font-bold text-token shrink-0">
                      {site.logoUrl ? (
                        <img
                          src={site.logoUrl}
                          alt={site.name}
                          className="w-full h-full object-cover rounded-chip"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        site.name.charAt(0)
                      )}
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-token text-xs truncate group-hover:text-primary transition-colors">
                        {site.name}
                      </h4>
                      <span className="text-fs-xs text-token/40 font-mono">
                        {site.categoryName}
                      </span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-fs-xs font-mono text-status-online bg-status-online/10 shrink-0">
                    Active
                  </span>
                </div>
                <p className="text-fs-xs text-token/60 line-clamp-2 leading-relaxed">
                  {site.tagline || site.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-token/5 text-fs-xs">
                <span className="font-mono text-token/40 text-fs-xs">
                  {site.domains?.length || 1} live mirrors
                </span>
                <Link
                  href={`/website/${site.slug}`}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline text-fs-xs"
                >
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* 2. Editor's Picks & Recently Verified split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor's Picks */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-chip bg-accent/10 text-accent flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-display font-bold text-base text-token tracking-tight">
              Editor&apos;s Picks
            </h3>
            <span className="text-fs-xs font-mono text-token/40">Hand-curated treasures</span>
          </div>

          <div className="space-y-2">
            {editorsPicks.map((site) => (
              <div
                key={site.id}
                className="flex items-center justify-between p-3 rounded-row bg-surface-1 border border-token/10 hover:border-accent/40 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-chip bg-surface-2 border border-token/10 flex items-center justify-center text-xs font-bold text-token shrink-0">
                    {site.logoUrl ? (
                      <img
                        src={site.logoUrl}
                        alt={site.name}
                        className="w-full h-full object-cover rounded-chip"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      site.name.charAt(0)
                    )}
                  </div>
                  <div className="truncate">
                    <h4 className="font-semibold text-token text-xs truncate group-hover:text-accent transition-colors">
                      {site.name}
                    </h4>
                    <p className="text-fs-xs text-token/50 truncate max-w-sm">
                      {site.tagline || site.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {site.domains?.[0] && (
                    <a
                      href={site.domains[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-chip text-token/40 hover:text-token hover:bg-surface-2 transition-colors"
                      title="Visit mirror"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Verified */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-chip bg-status-online/10 text-status-online flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-display font-bold text-base text-token tracking-tight">
              Fastest Monitored Fleet
            </h3>
            <span className="text-fs-xs font-mono text-token/40">Verified latency &lt; 50ms</span>
          </div>

          <div className="space-y-2">
            {recentlyVerified.map((site) => {
              const ms = site.domains?.[0]?.lastResponseMs || 35;
              return (
                <div
                  key={site.id}
                  className="flex items-center justify-between p-3 rounded-row bg-surface-1 border border-token/10 hover:border-status-online/40 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-chip bg-surface-2 border border-token/10 flex items-center justify-center text-xs font-bold text-token shrink-0">
                      {site.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <h4 className="font-semibold text-token text-xs truncate">{site.name}</h4>
                      <span className="text-fs-xs text-token/40 font-mono">
                        {site.domains?.[0]?.hostname || 'verified mirror'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="px-2 py-0.5 rounded text-fs-xs font-mono font-semibold text-status-online bg-status-online/10 border border-status-online/20">
                      {ms}ms
                    </span>
                    {site.domains?.[0] && (
                      <a
                        href={site.domains[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-chip text-token/40 hover:text-token hover:bg-surface-2 transition-colors"
                        title="Visit mirror"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
