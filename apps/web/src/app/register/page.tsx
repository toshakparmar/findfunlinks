import React from 'react';
import type { Metadata } from 'next';
import { api } from '../../lib/api';
import { RegistrationOwnerFlow } from '../../components/RegistrationOwnerFlow';
import { FALLBACK_CATEGORIES } from '../../lib/directory-data';
import { CategoryTab } from '../../components/DirectoryGrid';

export const metadata: Metadata = {
  title: 'Register Your Website as an Owner — FinalLinks',
  description:
    'Submit your website for review. After approval, you receive a dedicated owner account to manage your live links, working mirrors, and monitor uptime.',
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
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <RegistrationOwnerFlow categories={categories} />
    </div>
  );
}
