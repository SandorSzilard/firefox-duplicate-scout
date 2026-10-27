import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG, normalizeConfig } from '../src/core/config';

describe('normalizeConfig', () => {
  it('fills missing values from defaults', () => {
    const config = normalizeConfig({ stripWww: true });
    expect(config.stripWww).toBe(true);
    expect(config.ignoreHash).toBe(DEFAULT_CONFIG.ignoreHash);
    expect(config.identityParams).toEqual(DEFAULT_CONFIG.identityParams);
  });
});
