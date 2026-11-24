'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { api } from '../lib/api';
import {
  SubmitRegistrationSchema,
  SubmitRegistrationInput,
  ContentRating,
} from '@finallinks/contracts';
import { CategoryTab } from './DirectoryGrid';
import { CustomSelect } from './ui/CustomSelect';
import { Globe, User, Plus, X, Loader2, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import type { Resolver } from 'react-hook-form';

interface RegistrationFormProps {
  categories: CategoryTab[];
}

export function RegistrationForm({ categories }: RegistrationFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    websiteName: string;
    email: string;
  } | null>(null);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubmitRegistrationInput>({
    resolver: zodResolver(SubmitRegistrationSchema) as unknown as Resolver<SubmitRegistrationInput>,
    defaultValues: {
      applicantName: '',
      applicantEmail: '',
      applicantPhone: '',
      applicantCountry: 'Global',
      telegramOrDiscord: '',
      websiteName: '',
      primaryUrl: '',
      description: '',
      categoryId: categories[0]?.id || '',
      proposedTags: ['Free', 'Web'],
      language: 'en',
      contentRating: ContentRating.ALL,
      honeypot: '',
    },
  });

  const proposedTags = watch('proposedTags') || [];

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

  const onSubmit = async (data: SubmitRegistrationInput) => {
    // If honeypot is populated, drop silently
    if (data.honeypot && data.honeypot.length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.public.submitRegistration(data);
      setSubmittedData({
        id: res.id,
        websiteName: data.websiteName,
        email: data.applicantEmail,
      });
      toast.success('Registration submitted for review!');
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to submit registration. Please verify all fields and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedData) {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl border border-border/80 bg-card p-8 sm:p-12 text-center shadow-lg space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Application Submitted!
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your website <strong className="text-foreground">{submittedData.websiteName}</strong>{' '}
            has been submitted to the Super Admin queue for review.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-muted/50 border border-border/60 text-left text-xs space-y-2 max-w-lg mx-auto">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>Next Steps in the Verification Workflow:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground leading-relaxed pl-1">
            <li>
              Our moderation team conducts automated DNS, SSL, and safety checks on your primary
              URL.
            </li>
            <li>
              Upon approval, a <strong>single-use 24-hour setup link</strong> will be dispatched to{' '}
              <strong className="text-foreground">{submittedData.email}</strong>.
            </li>
            <li>
              You will set your password and gain instant access to the{' '}
              <strong>Website Owner Console</strong> to manage unlimited mirror domains.
            </li>
          </ol>
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
      {/* Honeypot for bot defense (invisible to human visitors) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="hp_field">Do not fill this</label>
        <input
          id="hp_field"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('honeypot')}
        />
      </div>

      {/* Section 1: Website Details */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60 text-foreground font-bold text-lg">
          <Globe className="h-5 w-5 text-primary" />
          <span>Website Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="reg-site-name"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Website Name *
            </label>
            <input
              id="reg-site-name"
              type="text"
              placeholder="e.g. Retro Arcade Galaxy"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('websiteName')}
            />
            {errors.websiteName && (
              <p className="text-xs text-rose-500 mt-1">{errors.websiteName.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-primary-url"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Primary Working URL *
            </label>
            <input
              id="reg-primary-url"
              type="url"
              placeholder="https://example.com"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('primaryUrl')}
            />
            {errors.primaryUrl && (
              <p className="text-xs text-rose-500 mt-1">{errors.primaryUrl.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="reg-category"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Primary Category *
            </label>
            <CustomSelect
              id="reg-category"
              value={watch('categoryId') || categories[0]?.id || ''}
              onChange={(val) => setValue('categoryId', val, { shouldValidate: true })}
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
            {errors.categoryId && (
              <p className="text-xs text-rose-500 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-content-rating"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Content Rating *
            </label>
            <CustomSelect
              id="reg-content-rating"
              value={watch('contentRating') || ContentRating.ALL}
              onChange={(val) => setValue('contentRating', val as any, { shouldValidate: true })}
              options={[
                { value: ContentRating.ALL, label: 'All Audiences (Family-Friendly)' },
                { value: ContentRating.MATURE, label: '18+ Mature (Age-Gated)' },
              ]}
            />
            {errors.contentRating && (
              <p className="text-xs text-rose-500 mt-1">{errors.contentRating.message}</p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="reg-description"
            className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
          >
            Website Description (Min 20 characters) *
          </label>
          <textarea
            id="reg-description"
            rows={4}
            placeholder="Describe what your website offers, key features, and why users love it..."
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-rose-500 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="reg-logo-url"
            className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
          >
            Logo URL (Optional HTTPS image)
          </label>
          <input
            id="reg-logo-url"
            type="url"
            placeholder="https://example.com/logo.png"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            {...register('logoUrl')}
          />
          {errors.logoUrl && <p className="text-xs text-rose-500 mt-1">{errors.logoUrl.message}</p>}
        </div>

        {/* Proposed Tags */}
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Proposed Tags (Up to 8 tags)
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g. Free, Emulator, Retro, PWA..."
              className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-muted text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
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

      {/* Section 2: Owner / Applicant Details */}
      <div className="space-y-5 pt-4 border-t border-border/60">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60 text-foreground font-bold text-lg">
          <User className="h-5 w-5 text-brand-orange-500" />
          <span>Owner & Applicant Credentials</span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          These credentials are used strictly for owner identity verification and to provision your
          Website Owner console account upon approval.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="reg-applicant-name"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Full Name *
            </label>
            <input
              id="reg-applicant-name"
              type="text"
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('applicantName')}
            />
            {errors.applicantName && (
              <p className="text-xs text-rose-500 mt-1">{errors.applicantName.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="reg-applicant-email"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Owner Email * (Invitation link recipient)
            </label>
            <input
              id="reg-applicant-email"
              type="email"
              placeholder="owner@example.com"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('applicantEmail')}
            />
            {errors.applicantEmail && (
              <p className="text-xs text-rose-500 mt-1">{errors.applicantEmail.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="reg-applicant-country"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Country
            </label>
            <input
              id="reg-applicant-country"
              type="text"
              placeholder="e.g. United States, Germany..."
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('applicantCountry')}
            />
          </div>

          <div>
            <label
              htmlFor="reg-applicant-phone"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Phone (Optional)
            </label>
            <input
              id="reg-applicant-phone"
              type="tel"
              placeholder="+1 555-0199"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('applicantPhone')}
            />
          </div>

          <div>
            <label
              htmlFor="reg-telegram-discord"
              className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
            >
              Telegram / Discord (Optional)
            </label>
            <input
              id="reg-telegram-discord"
              type="text"
              placeholder="@username"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              {...register('telegramOrDiscord')}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          By submitting, you confirm you are authorized to represent this website.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting Application...
            </>
          ) : (
            <>
              Submit for Review
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
