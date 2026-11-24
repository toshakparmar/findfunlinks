import { describe, it, expect } from 'vitest';
import * as argon2 from 'argon2';

function generateTempPassword(length = 14): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowercase = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*';
  const allChars = uppercase + lowercase + numbers + symbols;

  const chars = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  for (let i = 4; i < length; i++) {
    chars.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  return chars.sort(() => 0.5 - Math.random()).join('');
}

describe('Temporary Password Delivery & Security', () => {
  it('generates a 14-character temporary password with required entropy', () => {
    const password = generateTempPassword(14);
    expect(password).toHaveLength(14);
    expect(/[A-Z]/.test(password)).toBe(true);
    expect(/[a-z]/.test(password)).toBe(true);
    expect(/[0-9]/.test(password)).toBe(true);
    expect(/[!@#$%&*]/.test(password)).toBe(true);
  });

  it('correctly hashes and verifies with argon2id', async () => {
    const password = generateTempPassword(14);
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    const isValid = await argon2.verify(hash, password);
    expect(isValid).toBe(true);

    const isWrongValid = await argon2.verify(hash, 'wrongPassword123!');
    expect(isWrongValid).toBe(false);
  });

  it('validates 72-hour expiration window calculation', () => {
    const TEMP_PASSWORD_TTL_MS = 72 * 60 * 60 * 1000;
    const now = Date.now();

    // 24 hours ago -> valid
    const withinWindow = new Date(now - 24 * 60 * 60 * 1000);
    expect(now - withinWindow.getTime() > TEMP_PASSWORD_TTL_MS).toBe(false);

    // 73 hours ago -> expired
    const expired = new Date(now - 73 * 60 * 60 * 1000);
    expect(now - expired.getTime() > TEMP_PASSWORD_TTL_MS).toBe(true);
  });
});
