import type {
  ApiErrorEnvelope,
  LoginInput,
  AcceptInviteInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  UserProfile,
  SubmitRegistrationInput,
  ResubmitRegistrationInput,
  WebsiteCard,
  OwnerWebsiteDetails,
  WebsiteFilterParams,
  DomainItem,
  CreateDomainInput,
  BulkCreateDomainsInput,
  Category,
  Tag,
  SubmitReportInput,
  UpdateWebsiteInput,
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

export interface GroupedCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  websites: Array<
    WebsiteCard & {
      domains: DomainItem[];
    }
  >;
}

export interface CategoryWithWebsites extends Category {
  websites: WebsiteCard[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RegistrationRequestDetails {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string | null;
  applicantCountry?: string | null;
  telegramOrDiscord?: string | null;
  websiteName: string;
  primaryUrl: string;
  description: string;
  categoryId: string;
  proposedTags: string[];
  logoUrl?: string | null;
  language: string;
  contentRating: string;
  status: string;
  reviewNote?: string | null;
  submittedAt: string;
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
    getMe: () => this.request<UserProfile>('/api/v1/auth/me'),
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
    getWebsites: (query?: WebsiteFilterParams) => {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
        });
      }
      const qs = params.toString();
      return this.request<{
        items: WebsiteCard[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/api/v1/websites${qs ? `?${qs}` : ''}`);
    },
    getWebsitesGrouped: () => this.request<GroupedCategory[]>('/api/v1/websites/grouped'),
    getWebsiteBySlug: (slug: string) =>
      this.request<WebsiteCard & { domains: DomainItem[] }>(`/api/v1/websites/${slug}`),
    getCategories: () => this.request<Category[]>('/api/v1/categories'),
    getCategoryBySlug: (slug: string, page = 1, limit = 20) =>
      this.request<CategoryWithWebsites>(`/api/v1/categories/${slug}?page=${page}&limit=${limit}`),
    getTags: () => this.request<Tag[]>('/api/v1/tags'),
    submitRegistration: (input: SubmitRegistrationInput) =>
      this.request<{ id: string; status: string; message: string }>('/api/v1/registrations', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    getRegistrationByToken: (token: string) =>
      this.request<RegistrationRequestDetails>(
        `/api/v1/registrations/by-token?token=${encodeURIComponent(token)}`,
      ),
    updateRegistrationByToken: (token: string, input: ResubmitRegistrationInput) =>
      this.request<{ id: string; status: string; message: string }>(
        `/api/v1/registrations/by-token?token=${encodeURIComponent(token)}`,
        {
          method: 'PUT',
          body: JSON.stringify(input),
        },
      ),
    submitReport: (input: SubmitReportInput) =>
      this.request<{ id: string; message: string }>('/api/v1/reports', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    trackDomainClick: (domainId: string) =>
      this.request<{ success: boolean; clickCount: number }>(`/api/v1/domains/${domainId}/click`, {
        method: 'POST',
      }),
    getSettings: () => this.request<Record<string, unknown>>('/api/v1/settings/public'),
  };

  // --- Owner Endpoints ---
  public owner = {
    getWebsite: () => this.request<OwnerWebsiteDetails>('/api/v1/websites/my-website'),
    updateWebsite: (input: UpdateWebsiteInput) =>
      this.request<OwnerWebsiteDetails>('/api/v1/websites/my-website', {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    getDomains: () => this.request<DomainItem[]>('/api/v1/domains/my-domains'),
    createDomain: (input: CreateDomainInput) =>
      this.request<DomainItem>('/api/v1/domains/my-domains', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    bulkCreateDomains: (input: BulkCreateDomainsInput) =>
      this.request<{
        added: number;
        skipped: number;
        reasons: Array<{ line: string; reason: string }>;
      }>('/api/v1/domains/my-domains/bulk', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    reorderDomains: (items: Array<{ id: string; sortOrder: number }>) =>
      this.request<{ message: string }>('/api/v1/domains/my-domains/reorder', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      }),
    checkDomain: (domainId: string) =>
      this.request<DomainItem>(`/api/v1/health-check/domain/${domainId}`, {
        method: 'POST',
      }),
  };

  // --- Super Admin Endpoints ---
  public admin = {
    // Registrations
    getRegistrations: (query?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
    }) => {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
        });
      }
      const qs = params.toString();
      return this.request<{
        items: RegistrationRequestDetails[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/api/v1/registrations${qs ? `?${qs}` : ''}`);
    },
    getRegistration: (id: string) =>
      this.request<RegistrationRequestDetails>(`/api/v1/registrations/${id}`),
    approveRegistration: (id: string) =>
      this.request<{ message: string; userId: string; websiteId: string }>(
        `/api/v1/registrations/${id}/approve`,
        { method: 'POST' },
      ),
    rejectRegistration: (id: string, reason: string) =>
      this.request<{ message: string }>(`/api/v1/registrations/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ action: 'REJECT', reviewNote: reason }),
      }),
    requestChangesRegistration: (id: string, note: string) =>
      this.request<{ message: string }>(`/api/v1/registrations/${id}/request-changes`, {
        method: 'POST',
        body: JSON.stringify({ action: 'REQUEST_CHANGES', reviewNote: note }),
      }),

    // Websites
    getWebsites: (query?: { page?: number; limit?: number; status?: string; search?: string }) => {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
        });
      }
      const qs = params.toString();
      return this.request<{
        items: WebsiteCard[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/api/v1/websites/admin/all${qs ? `?${qs}` : ''}`);
    },
    updateWebsite: (id: string, input: UpdateWebsiteInput) =>
      this.request<WebsiteCard>(`/api/v1/websites/admin/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    updateWebsiteStatus: (id: string, status: string) =>
      this.request<{ updated: boolean }>(`/api/v1/websites/admin/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    deleteWebsite: (id: string) =>
      this.request<{ deleted: boolean }>(`/api/v1/websites/admin/${id}`, {
        method: 'DELETE',
      }),

    // Categories
    getCategories: () => this.request<Category[]>('/api/v1/categories/admin/all'),
    createCategory: (data: {
      name: string;
      slug: string;
      description?: string;
      icon?: string;
      sortOrder?: number;
      isActive?: boolean;
    }) =>
      this.request<Category>('/api/v1/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateCategory: (id: string, data: Partial<Category>) =>
      this.request<Category>(`/api/v1/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteCategory: (id: string) =>
      this.request<{ deleted: boolean }>(`/api/v1/categories/${id}`, {
        method: 'DELETE',
      }),
    reorderCategories: (items: Array<{ id: string; sortOrder: number }>) =>
      this.request<{ updated: number }>('/api/v1/categories/reorder', {
        method: 'PUT',
        body: JSON.stringify({ items }),
      }),

    // Tags
    getTags: () => this.request<Tag[]>('/api/v1/tags'),
    createTag: (name: string) =>
      this.request<Tag>('/api/v1/tags', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    deleteTag: (id: string) =>
      this.request<{ deleted: boolean }>(`/api/v1/tags/${id}`, {
        method: 'DELETE',
      }),

    // Reports
    getReports: (query?: { page?: number; limit?: number; status?: string }) => {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
        });
      }
      const qs = params.toString();
      return this.request<{ items: any[]; total: number; page: number; totalPages: number }>(
        `/api/v1/reports${qs ? `?${qs}` : ''}`,
      );
    },
    updateReportStatus: (id: string, status: string) =>
      this.request<{ updated: boolean }>(`/api/v1/reports/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),

    // Audit Logs
    getAuditLogs: (query?: {
      page?: number;
      limit?: number;
      entityType?: string;
      actorId?: string;
    }) => {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
        });
      }
      const qs = params.toString();
      return this.request<{ items: any[]; total: number; page: number; totalPages: number }>(
        `/api/v1/audit-logs${qs ? `?${qs}` : ''}`,
      );
    },

    // Settings
    getSettings: () => this.request<Record<string, unknown>>('/api/v1/settings'),
    updateSettings: (data: Record<string, unknown>) =>
      this.request<{ updated: boolean }>('/api/v1/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    // Users
    getUsers: (query?: { page?: number; limit?: number; search?: string }) => {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
        });
      }
      const qs = params.toString();
      return this.request<{ items: any[]; total: number; page: number; totalPages: number }>(
        `/api/v1/admin/users${qs ? `?${qs}` : ''}`,
      );
    },
    setUserStatus: (id: string, status: string) =>
      this.request<{ updated: boolean }>(`/api/v1/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    // Roles & Permissions
    getRoles: () => this.request<any[]>('/api/v1/admin/roles'),
    getPermissions: () => this.request<any[]>('/api/v1/admin/roles/permissions'),
  };
}
