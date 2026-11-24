/**
 * Fractional indexing utilities for drag-and-drop ordering without mass database renumbering.
 * Generates lexicographically orderable string keys between any two given keys.
 * Base alphabet: a-z, 0-9 (base 36)
 */

const BASE_DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';

function getMidpointChar(low: string, high: string): string {
  const lowIdx = BASE_DIGITS.indexOf(low);
  const highIdx = BASE_DIGITS.indexOf(high);
  if (lowIdx === -1 || highIdx === -1 || highIdx - lowIdx <= 1) {
    return '';
  }
  const midIdx = Math.floor((lowIdx + highIdx) / 2);
  return BASE_DIGITS[midIdx] ?? '';
}

/**
 * Generate a fractional key that falls strictly between `prevKey` and `nextKey` lexicographically.
 *
 * @param prevKey - The key before the insert position (null if inserting at start)
 * @param nextKey - The key after the insert position (null if inserting at end)
 * @returns A string key such that (prevKey < result < nextKey)
 */
export function generateKeyBetween(prevKey: string | null, nextKey: string | null): string {
  const p = prevKey ? prevKey.trim() : '';
  const n = nextKey ? nextKey.trim() : '';

  if (!p && !n) {
    return 'a0';
  }

  // Prepending before first item
  if (!p && n) {
    const firstChar = n.charAt(0);
    const idx = BASE_DIGITS.indexOf(firstChar);
    if (idx > 0) {
      const mid = BASE_DIGITS[Math.floor(idx / 2)] ?? '0';
      return mid + '0';
    }
    return n.slice(0, 1) + '0' + (n.slice(1) || 'a');
  }

  // Appending after last item
  if (p && !n) {
    const lastChar = p.charAt(p.length - 1);
    const idx = BASE_DIGITS.indexOf(lastChar);
    if (idx >= 0 && idx < BASE_DIGITS.length - 1) {
      const nextChar = BASE_DIGITS[Math.min(idx + 1, BASE_DIGITS.length - 1)] ?? '9';
      return p.slice(0, -1) + nextChar;
    }
    return p + '5';
  }

  // Inserting between two keys
  let i = 0;
  while (i < p.length || i < n.length) {
    const pChar = p.charAt(i) || '0';
    const nChar = n.charAt(i) || 'z';

    if (pChar !== nChar) {
      const mid = getMidpointChar(pChar, nChar);
      if (mid) {
        return p.slice(0, i) + mid;
      }
      return p.slice(0, i + 1) + 'm';
    }
    i++;
  }

  return p + '5';
}

/**
 * Generate N initial evenly distributed keys.
 */
export function generateNKeys(n: number): string[] {
  if (n <= 0) return [];
  const keys: string[] = [];
  const step = Math.floor(BASE_DIGITS.length / (n + 1));
  for (let i = 1; i <= n; i++) {
    const char = BASE_DIGITS[Math.min(i * step, BASE_DIGITS.length - 1)] ?? '0';
    keys.push(`a${char}`);
  }
  return keys;
}
