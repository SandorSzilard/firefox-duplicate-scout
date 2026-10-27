import { DEFAULT_CONFIG } from '../core/config';
import type { DuplicateConfig } from '../core/types';
import { getConfig, saveConfig } from '../browser/settings';

const $ = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const ignoredParams = $<HTMLTextAreaElement>('#ignored-params');
const ignoredPrefixes = $<HTMLTextAreaElement>('#ignored-prefixes');
const identityParams = $<HTMLTextAreaElement>('#identity-params');
const ignoreHash = $<HTMLInputElement>('#ignore-hash');
const stripWww = $<HTMLInputElement>('#strip-www');
const status = $('#status');

function lines(value: string): string[] {
  return [...new Set(value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))];
}

function render(config: DuplicateConfig): void {
  ignoredParams.value = config.ignoredParams.join('\n');
  ignoredPrefixes.value = config.ignoredParamPrefixes.join('\n');
  identityParams.value = config.identityParams.join('\n');
  ignoreHash.checked = config.ignoreHash;
  stripWww.checked = config.stripWww;
}

async function load(): Promise<void> {
  render(await getConfig());
}

$('#settings-form').addEventListener('submit', (event) => {
  event.preventDefault();
  void (async () => {
    await saveConfig({
      ignoredParams: lines(ignoredParams.value),
      ignoredParamPrefixes: lines(ignoredPrefixes.value),
      identityParams: lines(identityParams.value),
      ignoreHash: ignoreHash.checked,
      stripWww: stripWww.checked,
    });
    status.textContent = 'Settings saved.';
  })();
});

$('#reset').addEventListener('click', () => {
  void (async () => {
    render(DEFAULT_CONFIG);
    await saveConfig(DEFAULT_CONFIG);
    status.textContent = 'Defaults restored.';
  })();
});

void load();
