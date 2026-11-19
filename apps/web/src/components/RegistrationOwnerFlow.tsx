'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  SubmitRegistrationSchema,
  SubmitRegistrationInput,
  ContentRating,
  ApplicantRole,
  VerificationMethod,
} from '@findfunlinks/contracts';
import { api } from '../lib/api';
import { CategoryTab } from './DirectoryGrid';
import { CustomSelect } from './ui/CustomSelect';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Shield,
  HelpCircle,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface RegistrationOwnerFlowProps {
  categories: CategoryTab[];
}

export function RegistrationOwnerFlow({ categories }: RegistrationOwnerFlowProps) {
  const [submitting, setSubmitting] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [mirrors, setMirrors] = useState<string[]>(['']);
  const [submittedData, setSubmittedData] = useState<{
    referenceId: string;
    websiteName: string;
    email: string;
    verificationToken?: string;
    verificationMethod: string;
    submittedAt: string;
  } | null>(null);

  // Default dynamic verification token for display before submission
  const [tempVerifyToken] = useState(() => {
    const chars = '0123456789abcdef';
    let result = 'ffl-verify-';
    for (let i = 0; i < 16; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SubmitRegistrationInput>({
    resolver: zodResolver(SubmitRegistrationSchema) as any,
    defaultValues: {
      applicantName: '',
      applicantEmail: '',
      applicantPhone: '',
      applicantRole: ApplicantRole.OWNER,
      websiteName: '',
      primaryUrl: '',
      additionalDomains: [],
      categoryId: categories[0]?.id || '',
      contentRating: ContentRating.ALL,
      description: '',
      logoUrl: '',
      proposedTags: [],
      verificationMethod: VerificationMethod.DNS_TXT,
      verificationProof: '',
      adminNote: '',
      termsAccepted: false,
      honeypot: '',
    },
  });

  const selectedMethod = watch('verificationMethod') || VerificationMethod.DNS_TXT;
  const descriptionValue = watch('description') || '';
  const contentRatingValue = watch('contentRating') || ContentRating.ALL;

  const handleAddMirror = () => {
    if (mirrors.length >= 10) {
      toast.error('Maximum 10 additional mirror domains allowed.');
      return;
    }
    setMirrors([...mirrors, '']);
  };

  const handleRemoveMirror = (index: number) => {
    const next = mirrors.filter((_, i) => i !== index);
    setMirrors(next);
    setValue('additionalDomains', next.filter((m) => m.trim().length > 0));
  };

  const handleMirrorChange = (index: number, val: string) => {
    const next = [...mirrors];
    next[index] = val;
    setMirrors(next);
    setValue('additionalDomains', next.filter((m) => m.trim().length > 0));
  };

  const handleCopy = (text: string, type: 'token' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
      toast.success('Verification token copied to clipboard');
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
      toast.success('Reference ID copied to clipboard');
    }
  };

  const onSubmit = async (data: SubmitRegistrationInput) => {
    try {
      setSubmitting(true);
      // Clean up mirror inputs
      const cleanMirrors = mirrors
        .map((m) => m.trim())
        .filter((m) => m.length > 0);

      const payload: SubmitRegistrationInput = {
        ...data,
        additionalDomains: cleanMirrors,
      };

      const res = await api.public.submitRegistration(payload);

      setSubmittedData({
        referenceId: res.referenceId || 'FFL-2026-PENDING',
        websiteName: data.websiteName,
        email: data.applicantEmail,
        verificationToken: res.verificationToken || tempVerifyToken,
        verificationMethod: data.verificationMethod,
        submittedAt: new Date().toISOString(),
      });

      toast.success('Registration submitted! Please save your Reference ID.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration submission failed. Please review your entries.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Success State View
  // ---------------------------------------------------------------------------
  if (submittedData) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-surface-1 border border-token/10 rounded-2xl p-6 sm:p-10 shadow-sm space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-token/10 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-status-online/10 border border-status-online/20 flex items-center justify-center text-status-online">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-1">
                  Application Under Review
                </span>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-token">
                  Application Received for {submittedData.websiteName}
                </h1>
              </div>
            </div>
            <Link
              href={`/register/status?ref=${submittedData.referenceId}&email=${encodeURIComponent(submittedData.email)}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-2 text-token border border-token/10 hover:bg-surface-2/80 transition-colors"
            >
              Track Live Status
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Reference ID Callout */}
          <div className="bg-surface-2 border border-token/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-token/60 uppercase tracking-wider">Your Reference ID</p>
              <p className="text-2xl font-mono font-bold text-primary tracking-wide mt-0.5">
                {submittedData.referenceId}
              </p>
              <p className="text-xs text-token/60 mt-1">
                Save this ID. You can check your review progress anytime at{' '}
                <Link href="/register/status" className="text-primary hover:underline">
                  /register/status
                </Link>
                .
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(submittedData.referenceId, 'ref')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-surface-1 hover:bg-surface-2 text-token border border-token/15 transition-colors self-start sm:self-center"
            >
              {copiedRef ? (
                <>
                  <Check className="w-4 h-4 text-status-online" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-token/60" />
                  <span>Copy Reference ID</span>
                </>
              )}
            </button>
          </div>

          {/* What Happens Next Steps */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold font-display text-token uppercase tracking-wider">
              What Happens Next
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface-2/50 border border-token/10 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <p className="text-xs font-semibold text-token">Confirmation Email</p>
                <p className="text-xs text-token/60 leading-relaxed">
                  We sent a confirmation to <strong className="text-token">{submittedData.email}</strong> with your reference details.
                </p>
              </div>

              <div className="bg-surface-2/50 border border-token/10 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <p className="text-xs font-semibold text-token">2–3 Days Review</p>
                <p className="text-xs text-token/60 leading-relaxed">
                  Our curation team verifies your domain ownership, link safety, and content rating.
                </p>
              </div>

              <div className="bg-surface-2/50 border border-token/10 rounded-xl p-4 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center">
                  3
                </div>
                <p className="text-xs font-semibold text-token">Owner Credentials</p>
                <p className="text-xs text-token/60 leading-relaxed">
                  Upon approval, you receive a secure 24h link by email to set your password and access your Owner Console.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Reminder */}
          {submittedData.verificationToken && (
            <div className="border border-token/10 rounded-xl p-5 bg-surface-2/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-token">
                <Shield className="w-4 h-4 text-accent" />
                <span>Verification Check Reminder</span>
              </div>
              <p className="text-xs text-token/60 leading-relaxed">
                If you selected <strong>DNS TXT</strong> or <strong>HTML Meta Tag</strong>, please make sure the token is in place so our reviewer can verify it:
              </p>
              <div className="flex items-center gap-2 bg-surface-1 border border-token/15 rounded-lg px-3 py-2 font-mono text-xs text-primary">
                <span className="flex-1 truncate">{submittedData.verificationToken}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(submittedData.verificationToken!, 'token')}
                  className="p-1 hover:text-token transition-colors"
                  title="Copy token"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-status-online" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-token/10">
            <Link
              href="/"
              className="text-xs font-medium text-token/60 hover:text-token transition-colors"
            >
              &larr; Return to Directory Home
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSubmittedData(null)}
                className="text-xs font-medium text-token/60 hover:text-token transition-colors"
              >
                Submit another website
              </button>
              <Link
                href={`/register/status?ref=${submittedData.referenceId}&email=${encodeURIComponent(submittedData.email)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-fg hover:bg-primary/90 transition-colors shadow-sm"
              >
                Check Application Status
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Main Form & Context Panel View
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-[1120px] w-full mx-auto py-6 space-y-6">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-token/10 pb-4">
        <nav className="flex items-center gap-1.5 text-xs text-token/60 font-medium">
          <Link href="/" className="hover:text-token transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-token/30" />
          <span className="text-token font-semibold">Register Website</span>
        </nav>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-token/60">Already approved?</span>
          <a
            href="http://localhost:3002/login"
            className="font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            Log in to Owner Console
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Main 2-Column Grid on Wide Screens, Single Column on Smaller Screens */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Context, Steps, Benefits, FAQ (4/12) */}
        <div className="xl:col-span-5 space-y-6 xl:sticky xl:top-20">
          {/* Main Context Card */}
          <div className="bg-surface-1 border border-token/10 rounded-2xl p-6 space-y-5">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-token tracking-tight">
                Register your website as an owner
              </h1>
              <p className="text-xs sm:text-sm text-token/60 mt-2 leading-relaxed">
                Submit your website for editorial review. Once verified, you get a dedicated owner account to manage your live links, add working mirrors, and monitor uptime.
              </p>
            </div>

            {/* How it works */}
            <div className="space-y-3 pt-3 border-t border-token/10">
              <h2 className="text-xs font-semibold font-display uppercase tracking-wider text-token/80">
                How it works
              </h2>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-surface-2 border border-token/10 font-mono text-xs font-bold text-primary flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-token">Submit this form</p>
                    <p className="text-xs text-token/60 mt-0.5">
                      Provide your official domain, mirrors, category, and ownership verification method.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-surface-2 border border-token/10 font-mono text-xs font-bold text-primary flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-token">Review & verification</p>
                    <p className="text-xs text-token/60 mt-0.5">
                      Our curators inspect your site and check ownership proof (usually within 2–3 business days).
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-surface-2 border border-token/10 font-mono text-xs font-bold text-primary flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-token">Receive credentials</p>
                    <p className="text-xs text-token/60 mt-0.5">
                      You receive an email invite to set your password and access the Website Owner Console.
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* What you get */}
            <div className="space-y-2.5 pt-3 border-t border-token/10">
              <h2 className="text-xs font-semibold font-display uppercase tracking-wider text-token/80">
                What you get
              </h2>
              <ul className="space-y-1.5 text-xs text-token/70">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-status-online shrink-0" />
                  <span>Dedicated Owner Console to update your listing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-status-online shrink-0" />
                  <span>Unlimited live domain links & alternative mirrors</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-status-online shrink-0" />
                  <span>Automated 24/7 uptime & latency health checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-status-online shrink-0" />
                  <span>Curated toplist placement & search discoverability</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-status-online shrink-0" />
                  <span>Exactly one website managed per owner account</span>
                </li>
              </ul>
            </div>

            {/* Before you apply */}
            <div className="bg-surface-2/60 border border-token/10 rounded-xl p-3.5 space-y-1.5 text-xs">
              <p className="font-semibold text-token flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-accent" />
                Before you apply
              </p>
              <ul className="list-disc list-inside space-y-1 text-token/60 text-[11px] leading-relaxed">
                <li>You must own or officially manage the submitted domain.</li>
                <li>Site must be public, operational over HTTPS, and accessible.</li>
                <li>No malware, phishing, scam landing pages, or illegal content.</li>
              </ul>
            </div>
          </div>

          {/* Small FAQ Card */}
          <div className="bg-surface-1 border border-token/10 rounded-2xl p-5 space-y-3">
            <h2 className="text-xs font-semibold font-display uppercase tracking-wider text-token/80 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3 text-xs divide-y divide-token/10">
              <div className="pt-2 first:pt-0">
                <p className="font-medium text-token">How long does the review take?</p>
                <p className="text-token/60 text-[11px] mt-0.5 leading-relaxed">
                  Most submissions are reviewed within 2–3 business days. You will receive an automated email as soon as a decision is made.
                </p>
              </div>
              <div className="pt-2">
                <p className="font-medium text-token">Can I add more mirrors later?</p>
                <p className="text-token/60 text-[11px] mt-0.5 leading-relaxed">
                  Yes! Once approved, you can add, remove, and reorder unlimited domain links directly inside your Owner Console.
                </p>
              </div>
              <div className="pt-2">
                <p className="font-medium text-token">How do I track my request?</p>
                <p className="text-token/60 text-[11px] mt-0.5 leading-relaxed">
                  You can track your application status at any time using your Reference ID and email address on our{' '}
                  <Link href="/register/status" className="text-primary hover:underline">
                    Status Check page
                  </Link>
                  .
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-token/10 text-[11px] text-token/50">
              Need assistance? Email{' '}
              <a href="mailto:support@findfunlinks.com" className="text-primary hover:underline">
                support@findfunlinks.com
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Section Form (8/12) */}
        <main className="xl:col-span-7">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-surface-1 border border-token/10 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm"
          >
            {/* Honeypot field for bot defense */}
            <input type="text" {...register('honeypot')} className="hidden" tabIndex={-1} autoComplete="off" />

            {/* SECTION 1: Your Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold font-display text-token">1. Your details</h2>
                <p className="text-xs text-token/60 mt-0.5">
                  Who is submitting this request and how can our curation team reach you?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-token">
                    Full name <span className="text-hot">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('applicantName')}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors"
                  />
                  {errors.applicantName && (
                    <p className="text-[11px] text-status-down">{errors.applicantName.message}</p>
                  )}
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-token">
                    Email address <span className="text-hot">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('applicantEmail')}
                    placeholder="alex@yourdomain.com"
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors"
                  />
                  {errors.applicantEmail ? (
                    <p className="text-[11px] text-status-down">{errors.applicantEmail.message}</p>
                  ) : (
                    <p className="text-[11px] text-token/40">We will email review decisions & your login link here.</p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-token">
                    Phone number <span className="text-token/40 font-normal">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    {...register('applicantPhone')}
                    placeholder="+1 555-0199"
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors"
                  />
                  {errors.applicantPhone && (
                    <p className="text-[11px] text-status-down">{errors.applicantPhone.message}</p>
                  )}
                </div>

                {/* Your Role */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-token">
                    Your role <span className="text-hot">*</span>
                  </label>
                  <CustomSelect
                    value={watch('applicantRole') || ApplicantRole.OWNER}
                    onChange={(val) => setValue('applicantRole', val as any, { shouldValidate: true })}
                    options={[
                      { value: ApplicantRole.OWNER, label: 'Owner / Founder' },
                      { value: ApplicantRole.ADMIN, label: 'Administrator' },
                      { value: ApplicantRole.DEVELOPER, label: 'Lead Developer / Engineer' },
                      { value: ApplicantRole.REPRESENTATIVE, label: 'Authorized Representative' },
                    ]}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-token/10" />

            {/* SECTION 2: Website Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold font-display text-token">2. Website details</h2>
                <p className="text-xs text-token/60 mt-0.5">
                  Information about your site that will be indexed and presented to directory visitors.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Website Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-token">
                      Website name <span className="text-hot">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('websiteName')}
                      placeholder="e.g. Retro Arcade Galaxy"
                      className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors"
                    />
                    {errors.websiteName && (
                      <p className="text-[11px] text-status-down">{errors.websiteName.message}</p>
                    )}
                  </div>

                  {/* Primary URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-token">
                      Primary working URL <span className="text-hot">*</span>
                    </label>
                    <input
                      type="url"
                      {...register('primaryUrl')}
                      placeholder="https://retroarcade.io"
                      className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors"
                    />
                    {errors.primaryUrl && (
                      <p className="text-[11px] text-status-down">{errors.primaryUrl.message}</p>
                    )}
                  </div>
                </div>

                {/* Additional Domains / Mirrors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-token">
                      Additional working domains / mirrors <span className="text-token/40 font-normal">(optional, max 10)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMirror}
                      className="text-xs font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add mirror
                    </button>
                  </div>
                  <p className="text-[11px] text-token/50">
                    If your website has mirror domains or alternative proxy URLs, list them here.
                  </p>

                  <div className="space-y-2">
                    {mirrors.map((mirror, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="url"
                          value={mirror}
                          onChange={(e) => handleMirrorChange(index, e.target.value)}
                          placeholder={`https://mirror-${index + 1}.yourdomain.com`}
                          className="flex-1 px-3.5 py-2 rounded-lg text-xs bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors"
                        />
                        {mirrors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMirror(index)}
                            className="p-2 text-token/40 hover:text-status-down transition-colors"
                            title="Remove mirror"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-token">
                      Primary category <span className="text-hot">*</span>
                    </label>
                    <CustomSelect
                      value={watch('categoryId') || categories[0]?.id || ''}
                      onChange={(val) => setValue('categoryId', val, { shouldValidate: true })}
                      options={categories.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                    />
                    {errors.categoryId && (
                      <p className="text-[11px] text-status-down">{errors.categoryId.message}</p>
                    )}
                  </div>

                  {/* Content Rating */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-token">
                      Content rating <span className="text-hot">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setValue('contentRating', ContentRating.ALL)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                          contentRatingValue === ContentRating.ALL
                            ? 'bg-[var(--primary,#2563EB)] border-[var(--primary,#2563EB)] text-white shadow-sm'
                            : 'bg-surface-2 border-token/10 text-token/60 hover:text-white hover:border-token/20'
                        }`}
                      >
                        All Audiences
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue('contentRating', ContentRating.MATURE)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                          contentRatingValue === ContentRating.MATURE
                            ? 'bg-[var(--hot,#EF4444)] border-[var(--hot,#EF4444)] text-white shadow-sm'
                            : 'bg-surface-2 border-token/10 text-token/60 hover:text-white hover:border-token/20'
                        }`}
                      >
                        Mature (18+)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-token">
                      Description <span className="text-hot">*</span>
                    </label>
                    <span className="text-[11px] text-token/40 font-mono">
                      {descriptionValue.length}/2000 (min 20)
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    {...register('description')}
                    placeholder="Briefly describe what makes your website fun, unique, or useful for directory explorers..."
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors leading-relaxed"
                  />
                  {errors.description && (
                    <p className="text-[11px] text-status-down">{errors.description.message}</p>
                  )}
                </div>

                {/* Logo URL (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-token">
                    Logo or Icon URL <span className="text-token/40 font-normal">(optional HTTPS URL)</span>
                  </label>
                  <input
                    type="url"
                    {...register('logoUrl')}
                    placeholder="https://retroarcade.io/favicon.svg"
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors"
                  />
                  {errors.logoUrl && (
                    <p className="text-[11px] text-status-down">{errors.logoUrl.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-token/10" />

            {/* SECTION 3: Ownership Verification */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold font-display text-token">3. Ownership verification</h2>
                <p className="text-xs text-token/60 mt-0.5">
                  To prevent unauthorized domain listings, choose how you will verify control of this website.
                </p>
              </div>

              {/* Method Selection Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: VerificationMethod.DNS_TXT, label: 'DNS TXT Record' },
                  { id: VerificationMethod.META_TAG, label: 'HTML Meta Tag' },
                  { id: VerificationMethod.DOMAIN_EMAIL, label: 'Domain Email' },
                  { id: VerificationMethod.SOCIAL_PROFILE, label: 'Social Profile' },
                ].map((item) => {
                  const active = selectedMethod === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setValue('verificationMethod', item.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? 'bg-primary/10 border-primary text-primary font-semibold shadow-xs'
                          : 'bg-surface-2 border-token/10 text-token/60 hover:text-token hover:border-token/20'
                      }`}
                    >
                      <p className="text-xs font-medium">{item.label}</p>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Instructions per Method */}
              <div className="bg-surface-2 border border-token/10 rounded-xl p-4 space-y-3">
                {selectedMethod === VerificationMethod.DNS_TXT && (
                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-token">DNS TXT Record Instructions:</p>
                    <p className="text-token/60 leading-relaxed text-[11px]">
                      Add the following TXT record to your root domain DNS settings. Our reviewer will query the record during inspection:
                    </p>
                    <div className="flex items-center gap-2 bg-surface-1 border border-token/15 rounded-lg px-3 py-2 font-mono text-xs text-primary">
                      <span className="flex-1 truncate">findfunlinks-verify={tempVerifyToken}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`findfunlinks-verify=${tempVerifyToken}`, 'token')}
                        className="p-1 hover:text-token transition-colors"
                        title="Copy DNS record"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5 text-status-online" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {selectedMethod === VerificationMethod.META_TAG && (
                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-token">HTML &lt;meta&gt; Tag Instructions:</p>
                    <p className="text-token/60 leading-relaxed text-[11px]">
                      Insert this tag into the <code>&lt;head&gt;</code> section of your homepage HTML:
                    </p>
                    <div className="flex items-center gap-2 bg-surface-1 border border-token/15 rounded-lg px-3 py-2 font-mono text-xs text-primary">
                      <span className="flex-1 truncate">
                        &lt;meta name="findfunlinks-verification" content="{tempVerifyToken}" /&gt;
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(`<meta name="findfunlinks-verification" content="${tempVerifyToken}" />`, 'token')
                        }
                        className="p-1 hover:text-token transition-colors"
                        title="Copy meta tag"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5 text-status-online" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {selectedMethod === VerificationMethod.DOMAIN_EMAIL && (
                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-token">Domain Email Verification:</p>
                    <p className="text-token/60 leading-relaxed text-[11px]">
                      Your applicant email should match your site's domain (e.g. <code>contact@yourdomain.com</code>). You can also provide an alternative official domain email below:
                    </p>
                  </div>
                )}

                {selectedMethod === VerificationMethod.SOCIAL_PROFILE && (
                  <div className="space-y-2 text-xs">
                    <p className="font-semibold text-token">Social / Public Repository Profile Link:</p>
                    <p className="text-token/60 leading-relaxed text-[11px]">
                      Provide a link to an official GitHub organization, Discord server, or Twitter/X profile that openly links to this website domain.
                    </p>
                  </div>
                )}

                {/* Proof / Handle Input */}
                <div className="space-y-1.5 pt-2 border-t border-token/10">
                  <label className="text-xs font-semibold text-token">
                    Verification proof details <span className="text-token/40 font-normal">(optional notes or link)</span>
                  </label>
                  <input
                    type="text"
                    {...register('verificationProof')}
                    placeholder={
                      selectedMethod === VerificationMethod.DNS_TXT
                        ? 'e.g. DNS TXT configured at Cloudflare'
                        : selectedMethod === VerificationMethod.SOCIAL_PROFILE
                        ? 'e.g. https://github.com/my-org or https://x.com/my_project'
                        : 'e.g. Verified via contact@domain.com'
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs bg-surface-1 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-token/10" />

            {/* SECTION 4: Admin Notes & Consent */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold font-display text-token">4. Reviewer note & consent</h2>
                <p className="text-xs text-token/60 mt-0.5">
                  Finalize your application and confirm your authorization.
                </p>
              </div>

              {/* Optional Admin Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-token">
                  Note to reviewers <span className="text-token/40 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  {...register('adminNote')}
                  placeholder="Any extra context for our review team (e.g. recent domain migration, expected traffic, release date)..."
                  className="w-full px-3.5 py-2 rounded-lg text-xs bg-surface-2 border border-token/10 focus:border-primary focus:outline-none text-token placeholder:text-token/30 transition-colors"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="space-y-1.5">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register('termsAccepted')}
                    className="mt-0.5 w-4 h-4 rounded border-token/20 text-primary focus:ring-primary/20 accent-primary"
                  />
                  <span className="text-xs text-token/70 leading-relaxed">
                    I confirm that I own or hold explicit operational authority to register this website on FindFunLinks, and I agree to the{' '}
                    <Link href="/terms" target="_blank" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and directory listing policies.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-[11px] text-status-down pl-7">{errors.termsAccepted.message}</p>
                )}
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold bg-primary text-primary-fg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application for Review...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Website for Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-token/40 mt-2.5">
                Reviewed by human curators within 2–3 business days &bull; 100% Free directory listing
              </p>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
