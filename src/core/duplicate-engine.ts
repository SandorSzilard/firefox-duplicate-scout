import { normalizeConfig } from './config';
import type { AnalysisResult, AnalyzedItem, CandidateItem, DuplicateConfig } from './types';
import { parseUrl } from './url';

function makeGroupId(key: string): string {
  let hash = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `g-${(hash >>> 0).toString(16)}`;
}

export function analyzeCandidates(
  candidates: CandidateItem[],
  inputConfig?: Partial<DuplicateConfig>,
): AnalysisResult {
  const config = normalizeConfig(inputConfig);
  const parsed = candidates.map((candidate) => ({ candidate, urlInfo: parseUrl(candidate.url, config) }));
  const groups = new Map<string, number[]>();

  parsed.forEach((entry, index) => {
    if (!entry.urlInfo) return;
    const list = groups.get(entry.urlInfo.duplicateKey) ?? [];
    list.push(index);
    groups.set(entry.urlInfo.duplicateKey, list);
  });

  const occurrenceByKey = new Map<string, number>();
  const items: AnalyzedItem[] = parsed.map(({ candidate, urlInfo }) => {
    if (!urlInfo) {
      return {
        ...candidate,
        originalUrl: candidate.url,
        normalizedUrl: candidate.url,
        baseUrl: '',
        parameters: [],
        duplicateKey: `invalid:${candidate.id}`,
        duplicate: false,
        groupSize: 1,
        occurrence: 1,
        keep: true,
      };
    }

    const group = groups.get(urlInfo.duplicateKey) ?? [];
    const occurrence = (occurrenceByKey.get(urlInfo.duplicateKey) ?? 0) + 1;
    occurrenceByKey.set(urlInfo.duplicateKey, occurrence);
    const duplicate = group.length > 1;

    return {
      ...candidate,
      ...urlInfo,
      duplicate,
      ...(duplicate ? { groupId: makeGroupId(urlInfo.duplicateKey) } : {}),
      groupSize: group.length || 1,
      occurrence,
      keep: occurrence === 1,
    };
  });

  const duplicateGroups = [...groups.values()].filter((group) => group.length > 1);
  const duplicateItemCount = items.filter((item) => item.duplicate).length;

  return {
    source: candidates[0]?.source ?? 'tabs',
    items,
    duplicateGroupCount: duplicateGroups.length,
    duplicateItemCount,
    uniqueItemCount: items.length - duplicateItemCount,
    invalidUrlCount: parsed.filter((entry) => !entry.urlInfo).length,
  };
}
