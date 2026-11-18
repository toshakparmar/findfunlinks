'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Check, Copy, Activity } from 'lucide-react';
import { WebsiteCardData } from './DirectoryCard';

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
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#141418] border border-[#24242c] rounded-lg">
        {letters.map((ltr) => (
          <button
            key={ltr}
            type="button"
            onClick={() => setFilterLetter(ltr)}
            className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
              filterLetter === ltr
                ? 'bg-brand-blue-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-[#1f1f26]'
            }`}
          >
            {ltr}
          </button>
        ))}
      </div>

      {/* Websites Index Table */}
      <div className="bg-[#141418] border border-[#24242c] rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#24242c] flex items-center justify-between text-xs text-neutral-400">
          <span className="font-semibold text-white">Simple Index ({filtered.length} entries)</span>
          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
            <Activity className="w-3.5 h-3.5" />
            Live Mirror Status
          </span>
        </div>

        <div className="divide-y divide-[#1e1e26] text-xs">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              No websites found starting with &quot;{filterLetter}&quot;.
            </div>
          ) : (
            filtered.map((site) => {
              const domains = site.domains || [];
              const primary = domains.find((d) => d.type === 'PRIMARY') || domains[0];
              return (
                <div
                  key={site.id}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-[#18181f] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-6 h-6 rounded bg-[#202028] flex items-center justify-center shrink-0 text-[10px] font-bold text-neutral-300">
                      {site.logoUrl ? (
                        <img
                          src={site.logoUrl}
                          alt={site.name}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        site.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/website/${site.slug}`}
                        className="font-medium text-white hover:text-brand-blue-400 hover:underline truncate block"
                      >
                        {site.name}
                      </Link>
                      <span className="text-[11px] text-neutral-500 truncate block">
                        {site.categoryName} • {domains.length} mirrors
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {primary && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleCopy(site.id, primary.url)}
                          title="Copy primary mirror URL"
                          className="p-1 rounded bg-[#20202a] text-neutral-400 hover:text-white transition-colors"
                        >
                          {copiedId === site.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={primary.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e1e26] hover:bg-brand-blue-600 text-neutral-200 hover:text-white transition-colors"
                        >
                          <span className="font-mono text-[11px]">{primary.hostname}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
