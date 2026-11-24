'use client';

import React, { useState } from 'react';
import { Save, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BRAND } from '@finallinks/config';

interface CmsPage {
  slug: string;
  title: string;
  summary: string;
  lastUpdated: string;
  content: string;
}

const DEFAULT_PAGES: CmsPage[] = [
  {
    slug: 'about',
    title: `About ${BRAND.name}`,
    summary: 'Platform mission, editorial curation guidelines, and working mirror philosophy.',
    lastUpdated: 'Nov 20, 2026',
    content: `# About ${BRAND.name}\n\n${BRAND.name} is the premier curated web directory dedicated to cataloging entertaining, unique, and essential online platforms while actively tracking verified working mirrors and alternative domain names.\n\n## Our Mission\nWe ensure that audiences never lose access to their favorite resources due to DNS censorship, ISP blocks, or unexpected domain migrations.\n\n## Automated Health Monitoring\nEvery registered link is verified round-the-clock using real-time HTTP/TLS latency probes to provide instant live alternatives.`,
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    summary:
      'User telemetry, cookie handling, zero-tracking policy, and data protection guidelines.',
    lastUpdated: 'Nov 19, 2026',
    content: `# Privacy Policy\n\nYour privacy is paramount at ${BRAND.name}.\n\n## Data Collection\nWe operate on a minimal-telemetry principle. We do not track personal identifying information, sell user data, or deploy invasive third-party ad pixels.\n\n## Local Storage & Cookies\nPreferences such as dark/light themes and directory favorites are saved locally on your device using client storage.\n\n## Contact Us\nFor privacy inquiries, contact us at ${BRAND.supportEmail || 'support@finallinks.com'}.`,
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    summary: 'Acceptable directory usage, applicant submissions, and disclaimer of liability.',
    lastUpdated: 'Nov 18, 2026',
    content: `# Terms of Service\n\nWelcome to ${BRAND.name}.\n\n## 1. Directory Usage\n${BRAND.name} provides an informational index of publicly accessible websites and alternative domain hostnames. We do not host copyrighted files or streaming content directly on our servers.\n\n## 2. Operator Submissions\nWebsite owners submitting applications must own or be legally authorized to manage the registered domain names.\n\n## 3. Disclaimers\nAll listings are indexed for informational purposes. External links lead to third-party services outside our direct control.`,
  },
  {
    slug: 'dmca',
    title: 'DMCA & Copyright Policy',
    summary:
      'Notice and takedown procedure, designated agent information, and reporting guidelines.',
    lastUpdated: 'Nov 18, 2026',
    content: `# DMCA & Copyright Policy\n\n${BRAND.name} respects intellectual property rights and complies with the Digital Millennium Copyright Act (DMCA).\n\n## Notice & Takedown Procedure\nIf you believe an indexed directory listing infringes on your copyright, please submit an official takedown notification to our designated agent.\n\n## Required Information\n- Identification of the copyrighted work.\n- Exact URL listing on ${BRAND.name}.\n- Your contact details and signature.\n\nSend notices to: ${BRAND.supportEmail || 'dmca@finallinks.com'}.`,
  },
];

export default function PagesAdminPage() {
  const [pages, setPages] = useState<CmsPage[]>(DEFAULT_PAGES);
  const [selectedPage, setSelectedPage] = useState<CmsPage>(DEFAULT_PAGES[0]!);
  const [title, setTitle] = useState(DEFAULT_PAGES[0]!.title);
  const [content, setContent] = useState(DEFAULT_PAGES[0]!.content);
  const [saving, setSaving] = useState(false);

  const handleSelectPage = (page: CmsPage) => {
    setSelectedPage(page);
    setTitle(page.title);
    setContent(page.content);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setPages((prev) =>
        prev.map((p) =>
          p.slug === selectedPage.slug
            ? {
                ...p,
                title,
                content,
                lastUpdated: new Date().toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
              }
            : p,
        ),
      );
      toast.success(`Page "${selectedPage.title}" updated successfully!`);
    } catch {
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F4F6] tracking-tight">CMS Static Pages</h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Manage public informational, policy, and legal documentation content.
          </p>
        </div>

        <a
          href={`http://localhost:3000/${selectedPage.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 h-11 rounded-lg border border-[#33373D] bg-[#1E2024] text-sm font-medium text-[#D1D5DB] hover:bg-[#26292F] hover:text-white transition-colors self-start sm:self-auto"
        >
          <ExternalLink className="h-4 w-4 text-[#0B9DF7]" />
          <span>View on Public Site</span>
        </a>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pages List (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-[#33373D] bg-[#1E2024] p-4 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF] px-2 block mb-3">
            Public Documents ({pages.length})
          </span>

          <div className="space-y-1.5">
            {pages.map((p) => {
              const isSelected = p.slug === selectedPage.slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => handleSelectPage(p)}
                  className={`w-full text-left p-3.5 rounded-lg transition-colors border ${
                    isSelected
                      ? 'bg-[#26292F] border-[#0B9DF7] text-white'
                      : 'border-transparent text-[#D1D5DB] hover:bg-[#26292F]/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{p.title}</span>
                    <span className="text-xs font-mono text-[#0B9DF7]">/{p.slug}</span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">{p.summary}</p>
                  <span className="text-[11px] text-[#6B7280] block mt-2">
                    Updated {p.lastUpdated}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Markdown / Content Editor (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-[#33373D] bg-[#1E2024] p-6 space-y-5">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#33373D] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#F3F4F6]">{selectedPage.title}</h2>
                <span className="text-xs font-mono text-[#0B9DF7]">URL: /{selectedPage.slug}</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-lg bg-[#0B9DF7] hover:bg-[#0987d6] text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Changes</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                Page Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 rounded-lg border border-[#33373D] bg-[#16181B] px-3.5 text-sm text-[#F3F4F6] focus:outline-none focus:border-[#0B9DF7]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] uppercase mb-1.5">
                Markdown Page Content
              </label>
              <textarea
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-lg border border-[#33373D] bg-[#16181B] p-3.5 font-mono text-xs text-[#D1D5DB] leading-relaxed focus:outline-none focus:border-[#0B9DF7]"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
