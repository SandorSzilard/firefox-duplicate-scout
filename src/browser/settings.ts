import { DEFAULT_CONFIG, normalizeConfig } from '../core/config';
import type { DuplicateConfig } from '../core/types';

const STORAGE_KEY = 'duplicateScoutConfig';

export async function getConfig(): Promise<DuplicateConfig> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return normalizeConfig(stored[STORAGE_KEY] as Partial<DuplicateConfig> | undefined);
}

export async function saveConfig(config: DuplicateConfig): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: normalizeConfig(config) });
}

export async function resetConfig(): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: structuredClone(DEFAULT_CONFIG) });
}
