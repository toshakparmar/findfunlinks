import React from 'react';
import { Logo, Badge, Button } from '@findfunlinks/ui';

export default function AdminPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-950">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Logo className="h-10 w-auto" />
          <Badge variant="destructive">Super Admin</Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Platform Operations Console
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage website approvals, domain blocklists, users, system settings, and audit logs.
        </p>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button variant="outline">Docs</Button>
          <Button variant="primary">Admin Login</Button>
        </div>
      </div>
    </main>
  );
}
