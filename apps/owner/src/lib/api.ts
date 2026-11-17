import { ApiClient } from '@findfunlinks/api-client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'http://localhost:4000');

export const api = new ApiClient({
  baseUrl: API_BASE_URL,
});

export type {
  WebsiteCard,
  OwnerWebsiteDetails,
  DomainItem,
  Category,
  Tag,
  UserProfile,
  CreateDomainInput,
  BulkCreateDomainsInput,
  UpdateWebsiteInput,
} from '@findfunlinks/contracts';
