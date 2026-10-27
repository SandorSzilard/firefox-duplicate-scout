import type { DuplicateConfig } from './types';

export const DEFAULT_CONFIG: DuplicateConfig = {
  ignoredParams: [
    'fbclid',
    'gclid',
    'dclid',
    'msclkid',
    'mc_cid',
    'mc_eid',
    'igshid',
    'vero_conv',
    'vero_id',
  ],
  ignoredParamPrefixes: ['utm_'],
  identityParams: [
    'id',
    'v',
    'video',
    'video_id',
    'item',
    'item_id',
    'post',
    'post_id',
    'article',
    'article_id',
    'page_id',
    'story_fbid',
  ],
  ignoreHash: true,
  stripWww: false,
};

export function normalizeConfig(input?: Partial<DuplicateConfig>): DuplicateConfig {
  if (!input) return structuredClone(DEFAULT_CONFIG);
  return {
    ignoredParams: input.ignoredParams ?? [...DEFAULT_CONFIG.ignoredParams],
    ignoredParamPrefixes: input.ignoredParamPrefixes ?? [...DEFAULT_CONFIG.ignoredParamPrefixes],
    identityParams: input.identityParams ?? [...DEFAULT_CONFIG.identityParams],
    ignoreHash: input.ignoreHash ?? DEFAULT_CONFIG.ignoreHash,
    stripWww: input.stripWww ?? DEFAULT_CONFIG.stripWww,
  };
}
