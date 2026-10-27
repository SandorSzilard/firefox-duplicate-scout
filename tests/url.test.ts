import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../src/core/config';
import { parseUrl } from '../src/core/url';

describe('parseUrl', () => {
  it('removes tracking parameters and sorts the remaining parameters', () => {
    const parsed = parseUrl('https://example.com/a/?b=2&utm_source=x&a=1#section', DEFAULT_CONFIG);
    expect(parsed?.normalizedUrl).toBe('https://example.com/a?a=1&b=2');
    expect(parsed?.baseUrl).toBe('https://example.com/a');
  });

  it('uses an identity parameter as the duplicate key', () => {
    const first = parseUrl('https://example.com/item?id=42&view=compact', DEFAULT_CONFIG);
    const second = parseUrl('https://example.com/item?id=42&view=full', DEFAULT_CONFIG);
    expect(first?.duplicateKey).toBe(second?.duplicateKey);
  });

  it('does not merge different identity values', () => {
    const first = parseUrl('https://example.com/item?id=42', DEFAULT_CONFIG);
    const second = parseUrl('https://example.com/item?id=43', DEFAULT_CONFIG);
    expect(first?.duplicateKey).not.toBe(second?.duplicateKey);
  });

  it('canonicalizes common YouTube video URLs', () => {
    const watch = parseUrl('https://www.youtube.com/watch?v=abc123&t=90', DEFAULT_CONFIG);
    const short = parseUrl('https://youtu.be/abc123?si=whatever', DEFAULT_CONFIG);
    const shorts = parseUrl('https://youtube.com/shorts/abc123', DEFAULT_CONFIG);
    expect(watch?.duplicateKey).toBe('youtube:video:abc123');
    expect(short?.duplicateKey).toBe(watch?.duplicateKey);
    expect(shorts?.duplicateKey).toBe(watch?.duplicateKey);
  });

  it('rejects non-http URLs from duplicate comparison', () => {
    expect(parseUrl('about:config', DEFAULT_CONFIG)).toBeNull();
  });
});
