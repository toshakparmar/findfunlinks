'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { Search, Sparkles, Shield, Zap } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalWebsites?: number;
  totalMirrors?: number;
}

export function HeroSection({
  searchQuery,
  onSearchChange,
  totalWebsites = 120,
  totalMirrors = 340,
}: HeroSectionProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-pill',
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      );
      gsap.fromTo(
        '.hero-headline-word',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          delay: 0.1,
        },
      );
      gsap.fromTo(
        '.hero-subtext',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 },
      );
      gsap.fromTo(
        '.hero-search',
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.5)', delay: 0.4 },
      );
    }, heroRef);

    return () => ctx.revert();
  }, [shouldReduceMotion]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/40 bg-gradient-to-b from-background via-brand-blue-50/20 to-background dark:via-brand-blue-950/10"
    >
      {/* Background glow effects */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-brand-blue-500/15 via-brand-orange-500/10 to-transparent blur-3xl rounded-full"
        aria-hidden="true"
      />

      <div className="container mx-auto max-w-5xl px-4 text-center relative z-10">
        {/* Animated Badge */}
        <div className="hero-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-orange-500/30 bg-brand-orange-500/10 text-brand-orange-700 dark:text-brand-orange-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-brand-orange-500 animate-pulse" />
          <span>Curated Fun Websites & Verified Mirrors</span>
        </div>

        {/* Main Headline */}
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.15] mb-6"
        >
          <span className="hero-headline-word inline-block">Never</span>{' '}
          <span className="hero-headline-word inline-block">Get</span>{' '}
          <span className="hero-headline-word inline-block">Stuck</span>{' '}
          <span className="hero-headline-word inline-block">Behind</span>{' '}
          <span className="hero-headline-word inline-block">a</span>{' '}
          <span className="hero-headline-word inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-flame-500 to-rose-500 line-through decoration-rose-500/40">
            Dead
          </span>{' '}
          <span className="hero-headline-word inline-block text-transparent bg-clip-text bg-gradient-to-r from-brand-blue-600 via-primary to-brand-orange-500">
            Link.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtext mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed mb-10">
          FinalLinks tracks your favorite entertainment destinations and monitors all their live
          working domains in real-time. If one domain goes down, jump straight to the mirror.
        </p>

        {/* Search Bar with Instant Filter */}
        <div className="hero-search mx-auto max-w-2xl">
          <div className="relative flex items-center shadow-lg rounded-2xl border-2 border-border/80 bg-card focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 transition-all">
            <Search className="h-5 w-5 text-muted-foreground ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search websites by name, topic, or tag (e.g. Games, Manga, Retro, Tools)..."
              className="w-full bg-transparent px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              aria-label="Search directory"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="mr-3 text-xs font-semibold px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Fast Value Pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span>{totalMirrors} Verified Live Mirrors</span>
          </div>
          <span className="hidden sm:inline text-border">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <Zap className="h-4 w-4 text-brand-orange-500" />
            <span>{totalWebsites} Curated Destinations</span>
          </div>
          <span className="hidden sm:inline text-border">•</span>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span className="text-foreground font-semibold">100% Free & Open</span>
          </div>
        </div>
      </div>
    </section>
  );
}
