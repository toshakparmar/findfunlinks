'use client';

import React from 'react';
import { useAuth } from '../lib/auth-context';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, UserCheck } from 'lucide-react';

export function AdminTopbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold text-foreground">Operations Console</h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-border/60">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-foreground truncate max-w-[140px]">
                  {user.name}
                </div>
                <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                  {user.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

