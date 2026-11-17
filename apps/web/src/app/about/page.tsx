import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Compass, Radio, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About FindFunLinks — Mission, Verification, & Philosophy',
  description:
    'Learn about FindFunLinks, our automated health checks, why working mirrors matter, and our community directory philosophy.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
          Keep the Fun Web Accessible. Always.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          FindFunLinks was built with a single mission: to curate the most entertaining, creative,
          and novel websites on the internet and ensure that broken links or domain seizures never
          stop you from enjoying them.
        </p>
      </div>

      {/* Philosophy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Compass className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-foreground">Curated Discovery</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We don&apos;t index junk. Every entry in our directory is hand-vetted or approved
            through a rigorous review process ensuring quality, safety, and entertainment value.
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-brand-orange-500/10 text-brand-orange-500 flex items-center justify-center font-bold">
            <Radio className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-foreground">Working Mirrors</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Entertainment websites frequently face ISP throttling, DNS blocks, or server migrations.
            We track every alternative domain and proxy so you always have a live backup.
          </p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-foreground">Automated Health Checks</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our background monitors probe mirror links round the clock. If a domain returns 5xx
            errors or stops responding, our directory flags it down automatically.
          </p>
        </div>
      </div>

      {/* Verification Process Section */}
      <div
        id="verification"
        className="rounded-3xl border border-border/80 bg-card p-8 sm:p-10 space-y-6"
      >
        <h2 className="text-2xl font-bold text-foreground">The Verification Pipeline</h2>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            When a website creator applies on FindFunLinks, the submission passes through three
            layers of verification:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              <strong>Pre-Flight Safety Check:</strong> Our system verifies SSL certificates, DNS
              records, safe redirects, and checks against spam databases.
            </li>
            <li>
              <strong>Human Super Admin Review:</strong> Our moderation team reviews the website
              content, category fit, and confirms applicant legitimacy.
            </li>
            <li>
              <strong>Owner Credential Provisioning:</strong> Once approved, the owner receives a
              secure setup link and is given sovereign control over their website profile and mirror
              fleet.
            </li>
          </ol>
        </div>

        <div className="pt-4 border-t border-border/60 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Own an entertaining web project?</span>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Submit for Review
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-foreground">Do you host any files or media?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No. FindFunLinks is strictly an index of external websites and their publicly
              available mirrors. We do not host, store, or stream any third-party media or content
              on our servers.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-foreground">How often are health checks run?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Our automated health-check engines probe domains periodically using latency-aware HTTP
              HEAD/GET checks. Domains that experience repeated failures are transitioned to
              Degraded or Down status.
            </p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
            <h3 className="text-sm font-bold text-foreground">
              Can I add more mirrors to my website?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Yes! Approved website owners can log in to the Website Owner Console at any time to
              add unlimited new domains, bulk-import links, and trigger manual verification scans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
