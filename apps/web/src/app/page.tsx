import React from 'react';
import { Logo, Badge, Button } from '@findfunlinks/ui';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
        <div className="flex justify-center mb-6">
          <Logo className="h-14 w-auto" />
        </div>
        <div className="inline-flex gap-2 mb-4">
          <Badge variant="default">Phase 1 Complete</Badge>
          <Badge variant="warning">Curated Directory</Badge>
          <Badge variant="success">Mirrors Active</Badge>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Find<span className="text-brand-blue-600">Fun</span>Links
        </h1>
        <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
          The curated directory of fun websites and all their working live mirrors. Never lose your
          favorite web destinations again.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button variant="primary">Explore Directory</Button>
          <Button variant="secondary">Submit Website</Button>
          <Button variant="outline">Owner Portal</Button>
        </div>
      </div>
    </main>
  );
}
