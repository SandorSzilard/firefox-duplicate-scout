import type { ActionResult } from '../core/types';

const $ = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const status = $('#status');

async function currentWindowId(): Promise<number | undefined> {
  const current = await browser.windows.getCurrent();
  return current.id;
}

async function runAction(action: 'group-tabs' | 'close-tab-duplicates'): Promise<void> {
  status.textContent = 'Working…';
  try {
    const windowId = await currentWindowId();
    const result = (await browser.runtime.sendMessage({ action, windowId })) as ActionResult;
    status.textContent = result.message;
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error);
  }
}

$('#analyze').addEventListener('click', async () => {
  const windowId = await currentWindowId();
  await browser.runtime.sendMessage({ action: 'open-report', source: 'tabs', windowId });
  window.close();
});

$('#group').addEventListener('click', () => void runAction('group-tabs'));

$('#close').addEventListener('click', () => {
  if (confirm('Close every duplicate tab except the first occurrence in each duplicate set?')) {
    void runAction('close-tab-duplicates');
  }
});

$('#options').addEventListener('click', () => {
  void browser.runtime.openOptionsPage();
});
