'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { api } from '../lib/api';
import {
  ResubmitRegistrationSchema,
  ResubmitRegistrationInput,
  ContentRating,
} from '@findfunlinks/contracts';
import { CategoryTab } from './DirectoryGrid';
import { CustomSelect } from './ui/CustomSelect';
import { Globe, User, AlertCircle, Plus, X, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

interface RegistrationEditFormProps {
  categories: CategoryTab[];
}

export function RegistrationEditForm({ categories }: RegistrationEditFormProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewNote, setReviewNote] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(ResubmitRegistrationSchema) as any,
  });

  const proposedTags: string[] = (watch('proposedTags') as string[]) || [];

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const details = await api.public.getRegistrationByToken(token);
        setReviewNote(details.reviewNote || null);
        reset({
          applicantName: details.applicantName,
          applicantEmail: details.applicantEmail,
          applicantPhone: details.applicantPhone || '',
          applicantCountry: details.applicantCountry || 'Global',
          telegramOrDiscord: details.telegramOrDiscord || '',
          websiteName: details.websiteName,
          primaryUrl: details.primaryUrl,
          description: details.description,
          categoryId: details.categoryId,
          proposedTags: details.proposedTags || [],
          logoUrl: details.logoUrl || '',
          language: details.language || 'en',
          contentRating: (details.contentRating as ContentRating) || ContentRating.ALL,
        });
      } catch (err: unknown) {
        toast.error(
          err instanceof Error
            ? err.message
            : 'Invalid or expired edit link. Please check your email or contact support.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [token, reset]);

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();

    const tag = tagInput.trim().replace(/^#/, '');
    if (!tag) return;
    if (proposedTags.includes(tag)) {
      toast.info('Tag already added.');
      return;
    }
    if (proposedTags.length >= 8) {
      toast.error('Maximum 8 tags allowed.');
      return;
    }

    setValue('proposedTags', [...proposedTags, tag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'proposedTags',
      proposedTags.filter((t) => t !== tagToRemove),
    );
  };

  const onSubmit = async (data: ResubmitRegistrationInput) => {
    if (!token) {
      toast.error('Missing token.');
      return;
    }

    try {
      setSubmitting(true);
      await api.public.updateRegistrationByToken(token, data);
      setSubmitted(true);
      toast.success('Changes submitted successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update registration.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Loading your submission details...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-6 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Missing Resubmission Token</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Please click the direct link provided in the email you received regarding requested
          changes.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-lg space-y-6 animate-in fade-in duration-300">
        <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Changes Resubmitted!
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your updated submission has been sent back to the moderation queue. You will receive an
            email as soon as the review is complete.
          </p>
        </div>

        <div className="pt-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span>Return to Directory</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl mx-auto rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-sm space-y-8"
    >
      {/* Review Note Alert Banner */}
      {reviewNote && (
        <div className="rounded-2xl border border-brand-orange-500/30 bg-brand-orange-500/10 p-5 space-y-2">
          <div className="flex items-center gap-2 text-brand-orange-700 dark:text-brand-orange-300 font-bold text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Admin Review Feedback</span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed font-medium">
            &ldquo;{reviewNote}&rdquo;
          </p>
        </div>
      )}

      {/* Website Details */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60 text-foreground font-bold text-lg">
          <Globe className="h-5 w-5 text-primary" />
          <span>Update Website Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="edit-site-name"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Website Name *
            </label>
            <input
              id="edit-site-name"
              type="text"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('websiteName')}
            />
            {errors.websiteName && (
              <p className="text-xs text-rose-500 mt-1">
                {String(errors.websiteName?.message || '')}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="edit-primary-url"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Primary Working URL *
            </label>
            <input
              id="edit-primary-url"
              type="url"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('primaryUrl')}
            />
            {errors.primaryUrl && (
              <p className="text-xs text-rose-500 mt-1">
                {String(errors.primaryUrl?.message || '')}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="edit-category"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Primary Category *
            </label>
            <CustomSelect
              id="edit-category"
              value={watch('categoryId') || categories[0]?.id || ''}
              onChange={(val) => setValue('categoryId', val, { shouldValidate: true })}
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </div>

          <div>
            <label
              htmlFor="edit-content-rating"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Content Rating *
            </label>
            <CustomSelect
              id="edit-content-rating"
              value={watch('contentRating') || ContentRating.ALL}
              onChange={(val) => setValue('contentRating', val as any, { shouldValidate: true })}
              options={[
                { value: ContentRating.ALL, label: 'All Audiences (Family-Friendly)' },
                { value: ContentRating.MATURE, label: '18+ Mature (Age-Gated)' },
              ]}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
          >
            Website Description *
          </label>
          <textarea
            id="edit-description"
            rows={4}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1">
              {String(errors.description?.message || '')}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="edit-logo-url"
            className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
          >
            Logo URL (Optional)
          </label>
          <input
            id="edit-logo-url"
            type="url"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('logoUrl')}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Proposed Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add tag..."
              className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 inline mr-1" />
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {proposedTags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Applicant Details */}
      <div className="space-y-5 pt-4 border-t border-border/60">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60 text-foreground font-bold text-lg">
          <User className="h-5 w-5 text-brand-orange-500" />
          <span>Applicant Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="edit-applicant-name"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Full Name *
            </label>
            <input
              id="edit-applicant-name"
              type="text"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('applicantName')}
            />
          </div>

          <div>
            <label
              htmlFor="edit-applicant-email"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Email *
            </label>
            <input
              id="edit-applicant-email"
              type="email"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('applicantEmail')}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-border/60 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Changes...
            </>
          ) : (
            <>
              Resubmit Changes for Review
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
