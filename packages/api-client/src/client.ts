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
  WebsitePreview,
  WebsiteDetail,
  Engagement,
} from '@finallinks/contracts';

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
  referenceId?: string | null;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string | null;
  applicantRole?: string | null;
  applicantCountry?: string | null;
  telegramOrDiscord?: string | null;
  websiteName: string;
  primaryUrl: string;
  additionalDomains?: string[];
  description: string;
  categoryId: string;
  proposedTags: string[];
  logoUrl?: string | null;
  language: string;
  contentRating: string;
  verificationMethod?: string | null;
  verificationToken?: string | null;
  verificationProof?: string | null;
  adminNote?: string | null;
  status: string;
  reviewNote?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetch: typeof fetch;
  private token: string | null = null;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.fetch = options.fetchFn || fetch.bind(globalThis);
  }

  public setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          localStorage.setItem('fl_access_token', token);
        } else {
          localStorage.removeItem('fl_access_token');
        }
      } catch {
        // Ignore localStorage errors (e.g. Incognito private mode quota)
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      try {
        this.token = localStorage.getItem('fl_access_token');
      } catch {
        // Ignore localStorage errors
      }
    }
    return this.token;
  }

  private async request<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = new Headers(init?.headers);

    if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
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
    login: async (input: LoginInput) => {
      const res = await this.request<{ user: UserProfile; accessToken: string }>(
        '/api/v1/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      );
      if (res?.accessToken) {
        this.setToken(res.accessToken);
      }
      return res;
    },
    logout: async () => {
      try {
        return await this.request<{ message: string }>('/api/v1/auth/logout', {
          method: 'POST',
        });
      } finally {
        this.setToken(null);
      }
    },
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
    acceptInvite: async (input: AcceptInviteInput) => {
      const res = await this.request<{ user: UserProfile; accessToken?: string }>(
        '/api/v1/auth/accept-invite',
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      );
      if (res?.accessToken) {
        this.setToken(res.accessToken);
      }
      return res;
    },
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
    getWebsitePreview: (slug: string) =>
      this.request<WebsitePreview>(`/api/v1/websites/${slug}/preview`),
    getWebsiteDetail: (slug: string) =>
      this.request<WebsiteDetail>(`/api/v1/websites/${slug}/detail`),
    getWebsiteEngagement: (slug: string) =>
      this.request<Engagement>(`/api/v1/websites/${slug}/engagement`),
    toggleStarWebsite: (slug: string, star: boolean) =>
      this.request<Engagement>(`/api/v1/websites/${slug}/star`, {
        method: star ? 'PUT' : 'DELETE',
      }),
    getCategories: () => this.request<Category[]>('/api/v1/categories'),
    getCategoryBySlug: (slug: string, page = 1, limit = 1000) =>
      this.request<CategoryWithWebsites>(`/api/v1/categories/${slug}?page=${page}&limit=${limit}`),
    getTags: () => this.request<Tag[]>('/api/v1/tags'),
    submitRegistration: (input: SubmitRegistrationInput) =>
      this.request<{
        id: string;
        referenceId: string;
        status: string;
        websiteName: string;
        verificationToken?: string;
        verificationMethod?: string;
        submittedAt: string;
        success?: boolean;
      }>('/api/v1/registrations', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    getRegistrationStatus: (ref: string, email: string) =>
      this.request<RegistrationRequestDetails>(
        `/api/v1/registrations/status?ref=${encodeURIComponent(ref)}&email=${encodeURIComponent(email)}`,
      ),
    resubmitRegistration: (input: ResubmitRegistrationInput) =>
      this.request<{ success: boolean; message: string; referenceId: string; status: string }>(
        '/api/v1/registrations/resubmit',
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      ),
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
    starWebsite: (websiteId: string) =>
      this.request<{ success: boolean; stars: number }>(`/api/v1/websites/${websiteId}/star`, {
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
    updateDomain: (id: string, input: Partial<CreateDomainInput>) =>
      this.request<DomainItem>(`/api/v1/domains/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      }),
    deleteDomain: (id: string) =>
      this.request<{ message: string }>(`/api/v1/domains/${id}`, {
        method: 'DELETE',
      }),
    checkDomain: (domainId: string) =>
      this.request<DomainItem>(`/api/v1/health-check/domain/${domainId}`, {
        method: 'POST',
      }),
    getAnalytics: (range = '30d') =>
      this.request<{
        websiteName: string;
        websiteSlug: string;
        range: string;
        totalClicks: number;
        totalDomains: number;
        onlineDomains: number;
        uptimePercentage: number;
        views: number;
        domains: Array<{
          id: string;
          hostname: string;
          label: string | null;
          type: string;
          status: string;
          clickCount: number;
          lastResponseMs?: number | null;
          sharePercentage: number;
        }>;
      }>(`/api/v1/websites/my-website/analytics?range=${range}`),
    getMyReports: () =>
      this.request<
        Array<{
          id: string;
          reason: string;
          details: string;
          status: string;
          reporterEmail?: string | null;
          createdAt: string;
          website?: { id: string; name: string; slug: string } | null;
          domain?: { id: string; hostname: string; url: string } | null;
          handledBy?: { id: string; name: string; email: string } | null;
        }>
      >('/api/v1/reports/my-reports'),
    createSupportTicket: (input: { reason: string; details: string; domainId?: string }) =>
      this.request<{ id: string; status: string }>('/api/v1/reports/owner-ticket', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  };

  // --- Super Admin Endpoints ---
  public admin = {
    // Registrations
    getPendingRegistrationsCount: () =>
      this.request<{ count: number }>('/api/v1/registrations/pending-count'),
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
    getWebsites: (query?: {
      page?: number;
      limit?: number;
      status?: string;
      search?: string;
      categoryId?: string;
    }) => {
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
    createWebsite: (data: {
      name: string;
      primaryUrl: string;
      categoryId: string;
      tagline?: string;
      description?: string;
      contentRating?: 'ALL' | 'MATURE';
      ownerId?: string;
      ownerName?: string;
      ownerEmail?: string;
    }) =>
      this.request<{
        success: boolean;
        website: WebsiteCard;
        domain?: any;
        tempPassword?: string;
      }>('/api/v1/websites/admin', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    reorderWebsites: (categoryId: string, items: Array<{ id: string; sortOrder: number }>) =>
      this.request<{ success: boolean; count: number }>(
        `/api/v1/websites/admin/categories/${categoryId}/reorder`,
        {
          method: 'PUT',
          body: JSON.stringify({ items }),
        },
      ),
    updateWebsiteStars: (id: string, stars: number) =>
      this.request<{ success: boolean; stars: number }>(`/api/v1/websites/admin/${id}/stars`, {
        method: 'PUT',
        body: JSON.stringify({ stars }),
      }),
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
      homeLimit?: number;
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
    createTag: (name: string, slug?: string) =>
      this.request<Tag>('/api/v1/tags', {
        method: 'POST',
        body: JSON.stringify({
          name,
          slug:
            slug ||
            name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, ''),
        }),
      }),
    deleteTag: (id: string) =>
      this.request<{ deleted: boolean }>(`/api/v1/tags/${id}`, {
        method: 'DELETE',
      }),

    // Reports
    getReports: (query?: { page?: number; limit?: number; status?: string; search?: string }) => {
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
    replyReport: (id: string, message: string) =>
      this.request<{ success: boolean }>(`/api/v1/reports/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message }),
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
    createUser: (data: {
      name: string;
      email: string;
      websiteName?: string;
      websiteUrl?: string;
      categoryId?: string;
      tagline?: string;
      description?: string;
    }) =>
      this.request<{
        success: boolean;
        user: any;
        website?: any;
        domain?: any;
        tempPassword?: string;
      }>('/api/v1/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    setUserStatus: (id: string, status: string) =>
      this.request<{ updated: boolean }>(`/api/v1/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    deleteUser: (id: string) =>
      this.request<{ id: string; email: string }>(`/api/v1/admin/users/${id}`, {
        method: 'DELETE',
      }),

    // Roles & Permissions
    getRoles: () => this.request<any[]>('/api/v1/admin/roles'),
    getPermissions: () => this.request<any[]>('/api/v1/admin/roles/permissions'),
  };

  storage = {
    upload: async (file: File | Blob, filename: string, folder = 'uploads') => {
      const formData = new FormData();
      formData.append('file', file, filename);
      const res = await this.request<{
        success: boolean;
        data: { url: string; path: string; size: number; mimeType: string };
      }>(`/api/v1/storage/upload?folder=${encodeURIComponent(folder)}`, {
        method: 'POST',
        body: formData,
      });
      return res.data;
    },
    uploadPublic: async (file: File | Blob, filename: string) => {
      const formData = new FormData();
      formData.append('file', file, filename);
      const res = await this.request<{
        success: boolean;
        data: { url: string; path: string; size: number; mimeType: string };
      }>('/api/v1/storage/upload-public', {
        method: 'POST',
        body: formData,
      });
      return res.data;
    },
    delete: (path: string) =>
      this.request<{ success: boolean }>('/api/v1/storage', {
        method: 'DELETE',
        body: JSON.stringify({ path }),
      }),
  };
}
