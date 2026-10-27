import { describe, expect, it } from 'vitest';
import { analyzeCandidates } from '../src/core/duplicate-engine';
import type { CandidateItem } from '../src/core/types';

const candidate = (id: string, url: string, title = id): CandidateItem => ({
  source: 'tabs',
  id,
  title,
  url,
});

describe('analyzeCandidates', () => {
  it('marks every member of a duplicate group and keeps only its first occurrence', () => {
    const result = analyzeCandidates([
      candidate('1', 'https://example.com/a'),
      candidate('2', 'https://example.com/b'),
      candidate('3', 'https://example.com/a?utm_source=newsletter'),
      candidate('4', 'https://example.com/a#top'),
    ]);

    expect(result.duplicateGroupCount).toBe(1);
    expect(result.duplicateItemCount).toBe(3);
    expect(result.items.map((item) => [item.id, item.duplicate, item.keep])).toEqual([
      ['1', true, true],
      ['2', false, true],
      ['3', true, false],
      ['4', true, false],
    ]);
  });



  it('preserves the original candidate order even when duplicate groups are interleaved', () => {
    const result = analyzeCandidates([
      candidate('tab-1', 'https://example.com/a'),
      candidate('tab-2', 'https://example.com/b'),
      candidate('tab-3', 'https://example.com/a?utm_source=test'),
      candidate('tab-4', 'https://example.com/c'),
      candidate('tab-5', 'https://example.com/b#section'),
    ]);

    expect(result.items.map((item) => item.id)).toEqual(['tab-1', 'tab-2', 'tab-3', 'tab-4', 'tab-5']);
  });

  it('does not use title alone to decide duplicates', () => {
    const result = analyzeCandidates([
      candidate('1', 'https://example.com/a', 'Same title'),
      candidate('2', 'https://example.com/b', 'Same title'),
    ]);
    expect(result.duplicateItemCount).toBe(0);
  });

  it('groups same base URL + identity parameter while ignoring unrelated query differences', () => {
    const result = analyzeCandidates([
      candidate('1', 'https://shop.example.com/product?id=7&color=red'),
      candidate('2', 'https://shop.example.com/product?id=7&color=blue'),
      candidate('3', 'https://shop.example.com/product?id=8&color=red'),
    ]);
    expect(result.items[0]?.duplicate).toBe(true);
    expect(result.items[1]?.duplicate).toBe(true);
    expect(result.items[2]?.duplicate).toBe(false);
  });
});

it('preserves bookmark path/depth metadata for recursive bookmark reports', () => {
  const result = analyzeCandidates([
    {
      source: 'bookmarks',
      id: 'a',
      title: 'Top',
      url: 'https://example.com/a',
      bookmarkPath: 'Root',
      bookmarkDepth: 0,
      directChild: true,
    },
    {
      source: 'bookmarks',
      id: 'b',
      title: 'Nested',
      url: 'https://example.com/a',
      bookmarkPath: 'Root / Child',
      bookmarkDepth: 1,
      directChild: false,
    },
  ]);

  expect(result.items[0]).toMatchObject({ bookmarkPath: 'Root', bookmarkDepth: 0, directChild: true });
  expect(result.items[1]).toMatchObject({ bookmarkPath: 'Root / Child', bookmarkDepth: 1, directChild: false });
});
