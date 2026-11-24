import { ApiClient } from '@finallinks/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = new ApiClient({
  baseUrl: API_BASE_URL,
});

export function getLatencyBadge(ms: number | null | undefined): {
  label: string;
  className: string;
} {
  if (ms === null || ms === undefined) {
    return { label: 'Unknown', className: 'bg-muted text-muted-foreground' };
  }
  if (ms < 150) {
    return {
      label: `${ms}ms`,
      className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    };
  }
  if (ms < 400) {
    return {
      label: `${ms}ms`,
      className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    };
  }
  return {
    label: `${ms}ms`,
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };
}

export function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return 'Never checked';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}
