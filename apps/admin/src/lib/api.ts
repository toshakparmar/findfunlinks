import { ApiClient } from '@finallinks/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const api = new ApiClient({
  baseUrl: API_BASE_URL,
});

export type { RegistrationRequestDetails } from '@finallinks/api-client';
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
  ChangePasswordInput,
} from '@finallinks/contracts';
