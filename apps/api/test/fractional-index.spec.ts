import { describe, it, expect } from 'vitest';
import { generateKeyBetween, generateNKeys } from '@finallinks/config';

describe('Fractional Indexing Algorithm', () => {
  it('generates a default middle key when both bounds are null', () => {
    const key = generateKeyBetween(null, null);
    expect(key).toBe('a0');
  });

  it('prepends a key strictly before the first item', () => {
    const nextKey = 'a5';
    const key = generateKeyBetween(null, nextKey);
    expect(key < nextKey).toBe(true);
  });

  it('appends a key strictly after the last item', () => {
    const prevKey = 'a5';
    const key = generateKeyBetween(prevKey, null);
    expect(key > prevKey).toBe(true);
  });

  it('inserts a key strictly between two adjacent keys', () => {
    const prevKey = 'a0';
    const nextKey = 'a9';
    const key = generateKeyBetween(prevKey, nextKey);
    expect(key > prevKey).toBe(true);
    expect(key < nextKey).toBe(true);
  });

  it('generates N evenly spaced keys in strictly ascending lexicographical order', () => {
    const keys = generateNKeys(5);
    expect(keys).toHaveLength(5);
    for (let i = 0; i < keys.length - 1; i++) {
      expect(keys[i] < keys[i + 1]).toBe(true);
    }
  });
});
