import React from 'react';
import type { Metadata } from 'next';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service | FindFunLinks',
  description: 'Terms and conditions governing the use of the FindFunLinks directory platform.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-border/60 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <FileText className="h-3.5 w-3.5" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Effective Date: November 2026</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the FindFunLinks platform (including{' '}
            <strong>findfunlinks.com</strong>, associated subdomains, and API services), you agree
            to be bound by these Terms of Service. If you do not agree to all terms, do not access
            or use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">2. Nature of the Service</h2>
          <p>
            FindFunLinks operates exclusively as an informational index and directory of third-party
            websites and their associated mirror domains. FindFunLinks does not own, produce, host,
            operate, or endorse the content found on any external websites linked through our
            directory.
          </p>
          <p>
            You acknowledge that visiting third-party links is at your sole risk and discretion. You
            are responsible for ensuring that your access to external sites complies with applicable
            local laws and regulations in your jurisdiction.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            3. Website Owner Obligations & Conduct
          </h2>
          <p>Website creators and operators who register a website on FindFunLinks agree that:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>
              All submitted information, domain names, and contact details are accurate and
              truthfully represent the property.
            </li>
            <li>
              No submitted domains will distribute malware, phishing attacks, ransomware, or
              deceptive payloads.
            </li>
            <li>
              Submitted domains must strictly comply with content rating guidelines (properly
              declaring 18+ content where applicable).
            </li>
            <li>
              FindFunLinks reserves the right to suspend, archive, or permanently remove any listing
              or mirror domain at its sole discretion without notice.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            4. Disclaimer of Warranties & Limitation of Liability
          </h2>
          <p>
            The service is provided &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; without
            warranties of any kind, whether express or implied, including warranties of
            merchantability, fitness for a particular purpose, non-infringement, or link
            availability.
          </p>
          <p>
            In no event shall FindFunLinks, its operators, or contributors be liable for any
            indirect, incidental, special, consequential, or punitive damages resulting from your
            use of or inability to use the service or any external links accessed through the
            directory.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">5. Changes to Terms</h2>
          <p>
            We may update these terms periodically. Continued use of FindFunLinks after any updates
            constitutes your acceptance of the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
}
