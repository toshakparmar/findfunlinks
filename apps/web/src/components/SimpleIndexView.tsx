'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Check, Copy } from 'lucide-react';
import { WebsiteCardData } from './DirectoryCard';
import { ClickSpark } from './reactbits/ClickSpark';

interface SimpleIndexViewProps {
  websites: WebsiteCardData[];
}

export function SimpleIndexView({ websites }: SimpleIndexViewProps) {
  const [filterLetter, setFilterLetter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const letters = ['ALL', ...'#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const sortedWebsites = [...websites].sort((a, b) => a.name.localeCompare(b.name));

  const filtered = sortedWebsites.filter((site) => {
    if (filterLetter === 'ALL') return true;
    if (filterLetter === '#') return !/^[a-zA-Z]/.test(site.name);
    return site.name.toUpperCase().startsWith(filterLetter);
  });

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Alphabet Quick Filter Bar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-surface-1 border border-token/10 rounded-card shadow-warm">
        {letters.map((ltr) => (
          <button
            key={ltr}
            type="button"
            onClick={() => setFilterLetter(ltr)}
            className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-chip transition-all ${
              filterLetter === ltr
                ? 'bg-primary text-primary-fg shadow-subtle'
                : 'text-token/60 hover:text-token hover:bg-surface-2'
            }`}
          >
            {ltr}
          </button>
        ))}
      </div>

      {/* Directory Table View */}
      <div className="bg-surface-1 border border-token/10 rounded-card shadow-warm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2/60 border-b border-token/10 text-token-text-faint font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold w-12 text-center">#</th>
                <th className="py-3 px-4 font-semibold">Website</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Category</th>
                <th className="py-3 px-4 font-semibold hidden sm:table-cell">Working Domain</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-token/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-token/40 font-mono">
                    No websites found starting with letter &quot;{filterLetter}&quot;.
                  </td>
                </tr>
              ) : (
                filtered.map((site, index) => {
                  const domains = site.domains || [];
                  const primaryDomain = domains.find((d) => d.type === 'PRIMARY') || domains[0];
                  const hasActive = domains.some((d) => d.status === 'ACTIVE');
                  const faviconUrl = primaryDomain?.hostname
                    ? `https://www.google.com/s2/favicons?domain=${primaryDomain.hostname}&sz=64`
                    : site.logoUrl;

                  return (
                    <tr key={site.id} className="hover:bg-surface-2/50 transition-colors">
                      {/* Index */}
                      <td className="py-3 px-4 text-center font-mono text-token-text-faint">
                        {index + 1}
                      </td>

                      {/* Site Name + Favicon */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-chip bg-surface-2 border border-token/10 flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden">
                            {faviconUrl ? (
                              <img
                                src={faviconUrl}
                                alt={site.name}
                                className="w-full h-full object-contain p-0.5"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              site.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/website/${site.slug}`}
                              className="font-medium text-token hover:text-primary transition-colors block"
                            >
                              {site.name}
                            </Link>
                            <span className="text-[11px] text-token/50 line-clamp-1">
                              {site.tagline || site.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-2 text-token/70 border border-token/10">
                          {site.categoryName}
                        </span>
                      </td>

                      {/* Working Domain */}
                      <td className="py-3 px-4 hidden sm:table-cell font-mono text-token/80">
                        {primaryDomain?.hostname || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {hasActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-status-online bg-status-online/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-online status-dot-pulse" />
                            Online
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-token-text-faint bg-surface-2">
                            Unknown
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {primaryDomain && (
                            <>
                              <ClickSpark sparkColor="var(--primary)">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(primaryDomain.id, primaryDomain.url)}
                                  className="p-1.5 rounded text-token/40 hover:text-token hover:bg-surface-2 transition-colors"
                                  title="Copy URL"
                                >
                                  {copiedId === primaryDomain.id ? (
                                    <Check className="w-3.5 h-3.5 text-status-online" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </ClickSpark>

                              <a
                                href={primaryDomain.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-chip bg-primary text-primary-fg font-medium text-xs hover:opacity-90 shadow-subtle transition-opacity"
                              >
                                <span>Visit</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
