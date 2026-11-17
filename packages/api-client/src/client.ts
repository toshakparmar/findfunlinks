import type {
  ApiErrorEnvelope,
  LoginInput,
  AcceptInviteInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  UserProfile,
  SubmitRegistrationInput,
  WebsiteCard,
  PublicWebsitesQuery,
  DomainItem,
  CreateDomainInput,
  BulkCreateDomainsInput,
  Category,
  Tag,
  SubmitReportInput,
} from '@findfunlinks/contracts';

export interface ApiClientOptions {
  baseUrl: string;
  fetchFn?: typeof fetch;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown[],
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetch: typeof fetch;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.fetch = options.fetchFn || fetch.bind(globalThis);
  }

  private async request<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(init?.headers);

    if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await this.fetch(url, {
      ...init,
      headers,
      credentials: init?.credentials ?? 'include',
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      if (data && 'error' in data) {
        const err = data as ApiErrorEnvelope;
        throw new ApiError(
          response.status,
          err.error.code,
          err.error.message,
          err.error.details,
          err.requestId,
        );
      }
      throw new ApiError(
        response.status,
        'HTTP_ERROR',
        `Request failed with status ${response.status}`,
      );
    }

    return (data && 'data' in data ? data.data : data) as T;
  }

  // --- Auth Endpoints ---
  public auth = {
    login: (input: LoginInput) =>
      this.request<{ user: UserProfile }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    logout: () =>
      this.request<{ message: string }>('/api/v1/auth/logout', {
        method: 'POST',
      }),
    me: () => this.request<UserProfile>('/api/v1/auth/me'),
    forgotPassword: (input: ForgotPasswordInput) =>
      this.request<{ message: string }>('/api/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    resetPassword: (input: ResetPasswordInput) =>
      this.request<{ message: string }>('/api/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    acceptInvite: (input: AcceptInviteInput) =>
      this.request<{ user: UserProfile }>('/api/v1/auth/accept-invite', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    changePassword: (input: ChangePasswordInput) =>
      this.request<{ message: string }>('/api/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  };

  // --- Public Endpoints ---
  public public = {
    getWebsites: (query?: Partial<PublicWebsitesQuery>) => {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null) params.set(k, String(v));
        });
      }
      const qs = params.toString();
      return this.request<{ items: WebsiteCard[]; total: number }>(
        `/api/v1/public/websites${qs ? `?${qs}` : ''}`,
      );
    },
    getWebsiteBySlug: (slug: string) =>
      this.request<WebsiteCard & { domains: DomainItem[] }>(`/api/v1/public/websites/${slug}`),
    getCategories: () => this.request<Category[]>('/api/v1/public/categories'),
    getTags: () => this.request<Tag[]>('/api/v1/public/tags'),
    submitRegistration: (input: SubmitRegistrationInput) =>
      this.request<{ id: string; message: string }>('/api/v1/public/registrations', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    submitReport: (input: SubmitReportInput) =>
      this.request<{ id: string; message: string }>('/api/v1/public/reports', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    trackDomainClick: (domainId: string) =>
      this.request<{ recorded: boolean }>(`/api/v1/public/domains/${domainId}/click`, {
        method: 'POST',
      }),
  };

  // --- Owner Endpoints ---
  public owner = {
    getWebsite: () => this.request<WebsiteCard>('/api/v1/owner/website'),
    getDomains: () => this.request<DomainItem[]>('/api/v1/owner/website/domains'),
    createDomain: (input: CreateDomainInput) =>
      this.request<DomainItem>('/api/v1/owner/website/domains', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    bulkCreateDomains: (input: BulkCreateDomainsInput) =>
      this.request<{ added: number; failed: { domain: string; reason: string }[] }>(
        '/api/v1/owner/website/domains/bulk',
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      ),
    checkDomain: (domainId: string) =>
      this.request<DomainItem>(`/api/v1/owner/website/domains/${domainId}/check`, {
        method: 'POST',
      }),
  };
}
