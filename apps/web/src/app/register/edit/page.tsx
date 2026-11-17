import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { api } from '../../../lib/api';
import { RegistrationEditForm } from '../../../components/RegistrationEditForm';
import { FALLBACK_CATEGORIES } from '../../../lib/directory-data';
import { CategoryTab } from '../../../components/DirectoryGrid';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Edit Registration Submission | FindFunLinks',
  description: 'Update your submitted website registration based on administrator feedback.',
};

export default async function RegistrationEditPage() {
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
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Update Website Submission
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The moderation team requested changes to your registration. Review the admin notes below
          and submit your revisions.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <RegistrationEditForm categories={categories} />
      </Suspense>
    </div>
  );
}
