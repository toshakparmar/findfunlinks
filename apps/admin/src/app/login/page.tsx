'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Logo } from '@findfunlinks/ui';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Shield, Lock, Mail, Loader2, ArrowRight, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fillDefaultCredentials = () => {
    setEmail('admin@findfunlinks.com');
    setPassword('SuperAdminSecretPass123!');
    setErrorMessage(null);
    toast.info('Filled default administrator credentials.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.auth.login({ email: email.trim(), password: password.trim() });
      if (res?.accessToken) {
        api.setToken(res.accessToken);
      }
      if (res?.user) {
        setUser(res.user);
      }
      toast.success('Authenticated successfully. Welcome back!');
      window.location.href = '/';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Access denied.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-br from-background via-brand-blue-50/10 to-background dark:via-brand-blue-950/20 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo variant="auto" className="h-10 w-auto" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" />
            <span>Super Admin Console</span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Operator Sign In</h1>
          <p className="text-xs text-muted-foreground">
            Enter your platform administrator credentials to manage FindFunLinks.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@findfunlinks.com"
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-foreground uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={fillDefaultCredentials}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                >
                  <KeyRound className="h-3 w-3" />
                  <span>Fill default credentials</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 text-muted-foreground absolute left-3.5 top-3" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-[11px] text-muted-foreground border-t border-border/40 pt-4">
            Protected by Argon2id cryptographic lockout & session rotation.
          </div>
        </div>
      </div>
    </div>
  );
}
