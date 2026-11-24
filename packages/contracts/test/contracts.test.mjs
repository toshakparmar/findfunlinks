import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  PasswordSchema,
  SafeUrlRegex,
  HostnameRegex,
  SubmitRegistrationSchema,
  RegistrationStatusCheckSchema,
  isSafePublicUrl,
  isNonDisposableEmail,
  BulkCreateDomainsSchema,
  UserStatus,
  RoleType,
  DomainStatus,
  WebsiteStatus,
  ApplicantRole,
  VerificationMethod,
} from '../dist/index.js';

describe('Contracts & Validation Unit Tests', () => {
  describe('Password Security Policy', () => {
    test('accepts compliant passwords (>= 12 chars, upper, lower, digit, special)', () => {
      const valid = 'SuperStr0ng!P@ssword2026';
      const result = PasswordSchema.safeParse(valid);
      assert.equal(result.success, true);
    });

    test('rejects short passwords (< 12 chars)', () => {
      const short = 'Weak1!aA';
      const result = PasswordSchema.safeParse(short);
      assert.equal(result.success, false);
    });

    test('rejects passwords missing numbers or special characters', () => {
      const noSpecial = 'NoSpecialCharacterHere123';
      assert.equal(PasswordSchema.safeParse(noSpecial).success, false);
      const noDigit = 'NoDigitsInThisPassphrase!';
      assert.equal(PasswordSchema.safeParse(noDigit).success, false);
    });
  });

  describe('URL & Hostname Sanitization Patterns', () => {
    test('SafeUrlRegex validates standard HTTP and HTTPS URLs', () => {
      assert.equal(SafeUrlRegex.test('https://finallinks.com'), true);
      assert.equal(SafeUrlRegex.test('http://mirror1.finallinks.com/path?q=1'), true);
      assert.equal(SafeUrlRegex.test('ftp://unsafe.com'), false);
      assert.equal(SafeUrlRegex.test('javascript:alert(1)'), false);
    });

    test('HostnameRegex validates proper hostnames', () => {
      assert.equal(HostnameRegex.test('finallinks.com'), true);
      assert.equal(HostnameRegex.test('sub.mirror.example.org'), true);
      assert.equal(HostnameRegex.test('invalid..hostname'), false);
    });

    test('isSafePublicUrl blocks private networks & SSRF vectors', () => {
      assert.equal(isSafePublicUrl('https://finallinks.com'), true);
      assert.equal(isSafePublicUrl('https://mygame.io/play'), true);
      assert.equal(isSafePublicUrl('http://localhost:3000'), false);
      assert.equal(isSafePublicUrl('http://127.0.0.1:8080'), false);
      assert.equal(isSafePublicUrl('http://0.0.0.0'), false);
      assert.equal(isSafePublicUrl('http://10.0.0.5'), false);
      assert.equal(isSafePublicUrl('http://192.168.1.100'), false);
      assert.equal(isSafePublicUrl('http://172.16.0.1'), false);
      assert.equal(isSafePublicUrl('http://user:pass@finallinks.com'), false);
    });

    test('isNonDisposableEmail rejects throwaway mail services', () => {
      assert.equal(isNonDisposableEmail('webmaster@coolgame.com'), true);
      assert.equal(isNonDisposableEmail('spammer@mailinator.com'), false);
      assert.equal(isNonDisposableEmail('bot@tempmail.com'), false);
      assert.equal(isNonDisposableEmail('trash@10minutemail.com'), false);
    });
  });

  describe('Registration Form Schema', () => {
    test('validates complete registration submission', () => {
      const validSubmission = {
        applicantName: 'Alice Developer',
        applicantEmail: 'alice@example.com',
        applicantRole: 'OWNER',
        websiteName: 'Awesome Portal',
        primaryUrl: 'https://awesomeportal.example.com',
        additionalDomains: ['https://mirror1.awesomeportal.example.com'],
        description: 'This is a detailed description of the awesome web portal for tests.',
        categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        verificationMethod: 'DNS_TXT',
        verificationProof: 'Configured at Cloudflare',
        termsAccepted: true,
      };
      const result = SubmitRegistrationSchema.safeParse(validSubmission);
      assert.equal(result.success, true);
    });

    test('rejects submission with honeypot filled (bot defense)', () => {
      const spamSubmission = {
        applicantName: 'Spam Bot',
        applicantEmail: 'spambot@example.com',
        websiteName: 'Spam Website',
        primaryUrl: 'https://spam.example.com',
        description: 'Spam description that meets the minimum length requirement easily.',
        categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        termsAccepted: true,
        honeypot: 'gotcha',
      };
      const result = SubmitRegistrationSchema.safeParse(spamSubmission);
      assert.equal(result.success, false);
    });

    test('rejects submission without terms agreement', () => {
      const missingTerms = {
        applicantName: 'Bob Builder',
        applicantEmail: 'bob@example.com',
        websiteName: 'Bob World',
        primaryUrl: 'https://bobworld.example.com',
        description: 'A website for building cool web components and games online.',
        categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        termsAccepted: false,
      };
      const result = SubmitRegistrationSchema.safeParse(missingTerms);
      assert.equal(result.success, false);
    });

    test('validates status check input schema', () => {
      const valid = { ref: 'FL-2026-000123', email: 'owner@site.com' };
      assert.equal(RegistrationStatusCheckSchema.safeParse(valid).success, true);

      const invalid = { ref: '', email: 'not-an-email' };
      assert.equal(RegistrationStatusCheckSchema.safeParse(invalid).success, false);
    });
  });

  describe('Bulk Domain Import Schema', () => {
    test('accepts multiple lines of domains/URLs', () => {
      const input = {
        rawLines: 'https://mirror1.example.com\nhttps://mirror2.example.com\nhttps://mirror3.example.com',
      };
      const result = BulkCreateDomainsSchema.safeParse(input);
      assert.equal(result.success, true);
    });
  });

  describe('Enums Integrity', () => {
    test('enums have expected system values', () => {
      assert.equal(UserStatus.ACTIVE, 'ACTIVE');
      assert.equal(RoleType.SUPER_ADMIN, 'SUPER_ADMIN');
      assert.equal(RoleType.WEBSITE_OWNER, 'WEBSITE_OWNER');
      assert.equal(DomainStatus.ACTIVE, 'ACTIVE');
      assert.equal(ApplicantRole.OWNER, 'OWNER');
      assert.equal(VerificationMethod.DNS_TXT, 'DNS_TXT');
    });
  });
});
