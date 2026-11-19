export const UserStatus = {
  INVITED: 'INVITED',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const RoleType = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  WEBSITE_OWNER: 'WEBSITE_OWNER',
  CUSTOM: 'CUSTOM',
} as const;
export type RoleType = (typeof RoleType)[keyof typeof RoleType];

export const RegistrationStatus = {
  PENDING: 'PENDING',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export const WebsiteStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type WebsiteStatus = (typeof WebsiteStatus)[keyof typeof WebsiteStatus];

export const ContentRating = {
  ALL: 'ALL',
  MATURE: 'MATURE',
} as const;
export type ContentRating = (typeof ContentRating)[keyof typeof ContentRating];

export const DomainType = {
  PRIMARY: 'PRIMARY',
  MIRROR: 'MIRROR',
  PROXY: 'PROXY',
  ALTERNATE: 'ALTERNATE',
} as const;
export type DomainType = (typeof DomainType)[keyof typeof DomainType];

export const DomainStatus = {
  ACTIVE: 'ACTIVE',
  DOWN: 'DOWN',
  PENDING: 'PENDING',
  BLOCKED: 'BLOCKED',
} as const;
export type DomainStatus = (typeof DomainStatus)[keyof typeof DomainStatus];

export const ReportStatus = {
  PENDING: 'PENDING',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const ApplicantRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  DEVELOPER: 'DEVELOPER',
  REPRESENTATIVE: 'REPRESENTATIVE',
} as const;
export type ApplicantRole = (typeof ApplicantRole)[keyof typeof ApplicantRole];

export const VerificationMethod = {
  DNS_TXT: 'DNS_TXT',
  META_TAG: 'META_TAG',
  DOMAIN_EMAIL: 'DOMAIN_EMAIL',
  SOCIAL_PROFILE: 'SOCIAL_PROFILE',
} as const;
export type VerificationMethod = (typeof VerificationMethod)[keyof typeof VerificationMethod];
