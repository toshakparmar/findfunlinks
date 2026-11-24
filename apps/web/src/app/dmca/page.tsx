import React from 'react';
import type { Metadata } from 'next';
import { ShieldAlert, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'DMCA & Copyright Takedown Policy | FinalLinks',
  description:
    'Digital Millennium Copyright Act compliance, copyright infringement notification procedure, and designated agent contact.',
};

export default function DmcaPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-border/60 pb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Copyright Compliance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
          Digital Millennium Copyright Act (DMCA) Policy
        </h1>
        <p className="text-sm text-muted-foreground">Last Updated: November 2026</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">1. Overview & Disclaimer</h2>
          <p>
            FinalLinks (<strong>finallinks.com</strong>) respects the intellectual property rights
            of creators and copyright holders. FinalLinks is a search directory and index of
            publicly available third-party websites. FinalLinks does <strong>not</strong> host,
            store, stream, or distribute any copyrighted files, multimedia, or proprietary software
            on its own servers.
          </p>
          <p>
            The directory merely indexes hyperlinks to external web destinations. Because we do not
            control the content hosted by third-party web operators, we strongly recommend directing
            takedown notices to the actual hosting provider or registrar of the destination website.
            However, if a directory listing on FinalLinks links to copyright-infringing content, we
            will expeditiously remove or disable access to that directory listing upon receipt of a
            compliant notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            2. Filing a DMCA Notice of Infringement
          </h2>
          <p>
            To file a notice of copyright infringement pursuant to 17 U.S.C. § 512(c)(3), the
            copyright holder or an authorized agent must provide our Designated DMCA Agent with a
            written communication containing the following:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li>
              A physical or electronic signature of a person authorized to act on behalf of the
              owner of an exclusive right that is allegedly infringed.
            </li>
            <li>
              Identification of the copyrighted work claimed to have been infringed, or, if multiple
              copyrighted works are covered by a single notification, a representative list of such
              works.
            </li>
            <li>
              Identification of the specific listing, URL, or domain on FinalLinks that is claimed
              to be infringing or to be the subject of infringing activity, and information
              reasonably sufficient to permit us to locate the material (e.g., direct URL to the
              listing on FinalLinks).
            </li>
            <li>
              Information reasonably sufficient to permit us to contact the complaining party, such
              as an address, telephone number, and email address.
            </li>
            <li>
              A statement that the complaining party has a good faith belief that use of the
              material in the manner complained of is not authorized by the copyright owner, its
              agent, or the law.
            </li>
            <li>
              A statement that the information in the notification is accurate, and under penalty of
              perjury, that the complaining party is authorized to act on behalf of the owner of an
              exclusive right that is allegedly infringed.
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-border/80 bg-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Mail className="h-4 w-4 text-primary" />
            <span>Designated Copyright Agent Contact</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Please transmit all notices to our Designated Agent:
          </p>
          <div className="text-xs font-mono bg-muted p-3 rounded-lg border border-border/60 text-foreground space-y-1">
            <p>
              <strong>Designated Agent:</strong> FinalLinks Legal & Compliance Officer
            </p>
            <p>
              <strong>Email:</strong> dmca@finallinks.com
            </p>
            <p>
              <strong>Subject Line:</strong> DMCA Copyright Takedown Request — [Website Name]
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Upon receipt of a valid and complete notification, FinalLinks will take appropriate
            action, which may include removing the listing or disabling the specified mirror links
            within 48 business hours.
          </p>
        </section>
      </div>
    </div>
  );
}
