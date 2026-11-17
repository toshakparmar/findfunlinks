import { ApiClient } from '@findfunlinks/api-client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:4000');

export const api = new ApiClient({
  baseUrl: API_BASE_URL,
});

export type { RegistrationRequestDetails } from '@findfunlinks/api-client';
export type { WebsiteCard, DomainItem, Category, Tag, UserProfile } from '@findfunlinks/contracts';
