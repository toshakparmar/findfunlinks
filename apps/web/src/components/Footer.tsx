import React from 'react';
import Link from 'next/link';
import { Logo } from '@findfunlinks/ui';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40 text-muted-foreground transition-colors mt-20">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="inline-block" aria-label="FindFunLinks Home">
              <Logo variant="auto" className="h-7 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              FindFunLinks is a curated directory for discovering fun, creative, and entertaining
              websites alongside their active, verified working mirrors.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 w-fit px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Continuous Mirror Health Checks
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  All Websites
                </Link>
              </li>
              <li>
                <Link href="/category/games" className="hover:text-primary transition-colors">
                  Games & Arcade
                </Link>
              </li>
              <li>
                <Link href="/category/creative" className="hover:text-primary transition-colors">
                  Creative & Tools
                </Link>
              </li>
              <li>
                <Link href="/category/media" className="hover:text-primary transition-colors">
                  Media & Reading
                </Link>
              </li>
            </ul>
          </div>

          {/* Website Owners */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-3">
              Website Owners
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  Submit Website
                </Link>
              </li>
              <li>
                <Link href="/about#verification" className="hover:text-primary transition-colors">
                  Verification Guidelines
                </Link>
              </li>
              <li>
                <a
                  href="http://localhost:3002"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Owner Portal
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase mb-3">
              Trust & Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About FindFunLinks
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-primary transition-colors">
                  DMCA & Takedowns
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/40 text-xs text-muted-foreground/80 space-y-4">
          <p className="leading-relaxed">
            <strong>Disclaimer:</strong> FindFunLinks is a curated directory index. FindFunLinks
            does not host, stream, or store any third-party files or content. All links, trademarks,
            and logos belong to their respective owners. Users are solely responsible for compliance
            with local regulations when navigating external links.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} FindFunLinks. All rights reserved.</p>
            <p className="flex items-center gap-1 text-muted-foreground">
              Built with precision for web explorers{' '}
              <Heart className="h-3 w-3 text-brand-flame-500 fill-brand-flame-500" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
