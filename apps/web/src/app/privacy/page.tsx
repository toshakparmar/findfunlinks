import React from 'react';
import type { Metadata } from 'next';
import { Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | FinalLinks',
  description:
    'How FinalLinks collects, uses, and safeguards personal data and respects user privacy.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-border/60 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <Lock className="h-3.5 w-3.5" />
          <span>User Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last Updated: November 2026</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">1. Our Commitment to Privacy</h2>
          <p>
            FinalLinks is designed with privacy-first principles. We do not engage in third-party
            behavioral tracking, cross-site fingerprinting, or user surveillance. We believe
            discovery should be open, private, and frictionless.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">2. Information We Collect</h2>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">A. Public Visitors:</h3>
            <p>
              When you browse the public directory, we collect anonymous aggregate metrics (such as
              domain click counts and page view counters) to determine mirror health and directory
              popularity. We do not sell or share visitor IP addresses.
            </p>
            <h3 className="text-sm font-semibold text-foreground pt-2">
              B. Website Owners & Applicants:
            </h3>
            <p>When you submit a website registration application, we collect:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Full Name and Email Address (for verification and authentication).</li>
              <li>Country of residence and optional communications handle (Telegram / Discord).</li>
              <li>Website details, descriptions, tags, and domain links.</li>
            </ul>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">3. Cookie Usage</h2>
          <p>We use strictly necessary first-party cookies for security and authentication:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              <strong>Authentication Tokens:</strong> Stored in <code>httpOnly</code>,{' '}
              <code>Secure</code>, <code>SameSite=Lax</code> cookies for logged-in website owners
              and administrators.
            </li>
            <li>
              <strong>Theme Preference:</strong> Stored locally in your browser to remember your
              light or dark mode choice.
            </li>
          </ul>
          <p>We do not use advertising, marketing, or third-party behavioral cookies.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">4. Data Security</h2>
          <p>
            All communications are encrypted in transit via Transport Layer Security (TLS 1.3).
            Passwords are never stored in plaintext and are hashed using modern, memory-hard
            Argon2id cryptography.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">5. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to request data deletion,
            contact our privacy officer at <strong>privacy@finallinks.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}
