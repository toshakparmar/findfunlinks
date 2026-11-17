import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  PasswordSchema,
  SafeUrlRegex,
  HostnameRegex,
  SubmitRegistrationSchema,
  BulkCreateDomainsSchema,
  UserStatus,
  RoleType,
  DomainStatus,
  WebsiteStatus,
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
      assert.equal(SafeUrlRegex.test('https://findfunlinks.com'), true);
      assert.equal(SafeUrlRegex.test('http://mirror1.findfunlinks.com/path?q=1'), true);
      assert.equal(SafeUrlRegex.test('ftp://unsafe.com'), false);
      assert.equal(SafeUrlRegex.test('javascript:alert(1)'), false);
    });

    test('HostnameRegex validates proper hostnames', () => {
      assert.equal(HostnameRegex.test('findfunlinks.com'), true);
      assert.equal(HostnameRegex.test('sub.mirror.example.org'), true);
      assert.equal(HostnameRegex.test('invalid..hostname'), false);
    });
  });

  describe('Registration Form Schema', () => {
    test('validates complete registration submission', () => {
      const validSubmission = {
        applicantName: 'Alice Developer',
        applicantEmail: 'alice@example.com',
        applicantCountry: 'United States',
        websiteName: 'Awesome Portal',
        primaryUrl: 'https://awesomeportal.example.com',
        description: 'This is a detailed description of the awesome web portal for tests.',
        categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        proposedTags: ['fun', 'utility'],
        language: 'en',
      };
      const result = SubmitRegistrationSchema.safeParse(validSubmission);
      assert.equal(result.success, true);
    });

    test('rejects submission with honeypot filled (bot defense)', () => {
      const spamSubmission = {
        applicantName: 'Spam Bot',
        applicantEmail: 'spambot@example.com',
        applicantCountry: 'Nowhere',
        websiteName: 'Spam Website',
        primaryUrl: 'https://spam.example.com',
        description: 'Spam description that meets the minimum length requirement easily.',
        categoryId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        honeypot: 'gotcha',
      };
      const result = SubmitRegistrationSchema.safeParse(spamSubmission);
      assert.equal(result.success, false);
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
      assert.equal(WebsiteStatus.ACTIVE, 'ACTIVE');
    });
  });
});
