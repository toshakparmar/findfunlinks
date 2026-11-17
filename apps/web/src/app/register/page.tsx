import React from 'react';
import type { Metadata } from 'next';
import { api } from '../../lib/api';
import { RegistrationForm } from '../../components/RegistrationForm';
import { FALLBACK_CATEGORIES } from '../../lib/directory-data';
import { CategoryTab } from '../../components/DirectoryGrid';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Submit Website & Claim Your Mirrors | FindFunLinks',
  description:
    'Register your entertainment website, list verified mirrors, and ensure visitors never lose access.',
};

export default async function RegisterPage() {
  let categories: CategoryTab[] = FALLBACK_CATEGORIES;

  try {
    const res = await api.public.getCategories().catch(() => null);
    if (res && Array.isArray(res) && res.length > 0) {
      categories = res.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }));
    }
  } catch {
    categories = FALLBACK_CATEGORIES;
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange-500/10 text-brand-orange-700 dark:text-brand-orange-300 border border-brand-orange-500/30 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Website Owner Onboarding</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Register Your Website on FindFunLinks
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Join our curated directory. Once approved, you gain access to the dedicated Website Owner
          Console to manage unlimited live mirrors, monitor uptime, and connect with explorers.
        </p>
      </div>

      <RegistrationForm categories={categories} />
    </div>
  );
}
