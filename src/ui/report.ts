import type { ActionResult, AnalysisResult, AnalyzedItem, BackgroundRequest, SourceKind } from '../core/types';

const params = new URLSearchParams(location.search);
const source = (params.get('source') ?? 'tabs') as SourceKind;
const windowId = params.get('windowId') ? Number(params.get('windowId')) : undefined;
const folderId = params.get('folderId') ?? undefined;

let result: AnalysisResult | null = null;
type SortKey = 'duplicate' | 'title' | 'url' | 'baseUrl' | 'bookmarkPath' | 'bookmarkDepth' | 'groupSize';

// Preserve Firefox's original tab order / bookmark traversal order by default.
// Sorting only starts after the user explicitly clicks a sortable column header.
let sortKey: SortKey | null = null;
let sortDirection: 1 | -1 = 1;

const $ = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
};

const rows = $('#rows');
const summary = $('#summary');
const status = $('#status');
const title = $('#title');
const filter = $<HTMLSelectElement>('#filter');
const search = $<HTMLInputElement>('#search');
const primaryAction = $<HTMLButtonElement>('#primary-action');
const destructiveAction = $<HTMLButtonElement>('#destructive-action');

function groupHue(groupId?: string): number {
  if (!groupId) return 0;
  let hash = 0;
  for (const char of groupId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 360;
}

function formatParams(item: AnalyzedItem): string {
  if (!item.parameters.length) return '—';
  return item.parameters.map((parameter) => `${parameter.name}=${parameter.value}`).join(' · ');
}

function bookmarkScope(item: AnalyzedItem): string {
  if (source !== 'bookmarks') return '—';
  if (item.directChild) return 'Selected folder';
  const depth = item.bookmarkDepth ?? 0;
  return `Nested (+${depth})`;
}

function visibleItems(): AnalyzedItem[] {
  if (!result) return [];
  const term = search.value.trim().toLowerCase();
  const filtered = result.items.filter((item) => {
    if (filter.value === 'duplicates' && !item.duplicate) return false;
    if (filter.value === 'unique' && item.duplicate) return false;
    if (term && !`${item.title} ${item.url} ${item.bookmarkPath ?? ''}`.toLowerCase().includes(term)) return false;
    return true;
  });

  if (sortKey === null) return filtered;

  const activeSortKey = sortKey;

  return [...filtered].sort((a, b) => {
    let comparison = 0;

    if (activeSortKey === 'duplicate') {
      comparison = Number(a.duplicate) - Number(b.duplicate);
    } else if (activeSortKey === 'groupSize') {
      comparison = a.groupSize - b.groupSize;
    } else if (activeSortKey === 'bookmarkDepth') {
      comparison = (a.bookmarkDepth ?? 0) - (b.bookmarkDepth ?? 0);
    } else if (activeSortKey === 'bookmarkPath') {
      comparison = (a.bookmarkPath ?? '').localeCompare(b.bookmarkPath ?? '');
    } else {
      comparison = a[activeSortKey].localeCompare(b[activeSortKey]);
    }

    return comparison * sortDirection;
  });
}

function cell(text: string): HTMLTableCellElement {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
}

function linkCell(item: AnalyzedItem): HTMLTableCellElement {
  const td = document.createElement('td');
  const link = document.createElement('a');
  link.href = item.url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = item.url;
  td.append(link);
  return td;
}

function render(): void {
  rows.replaceChildren();
  for (const item of visibleItems()) {
    const tr = document.createElement('tr');
    if (item.duplicate && item.groupId) {
      const hue = groupHue(item.groupId);
      tr.style.setProperty('--group-hue', String(hue));
      tr.classList.add('duplicate-row');
    }
    const marker = item.duplicate ? '✔' : '✗';
    const cells = [
      cell(marker),
      cell(item.title),
      linkCell(item),
      cell(item.baseUrl || '—'),
      cell(formatParams(item)),
    ];
    if (source === 'bookmarks') {
      cells.push(cell(item.bookmarkPath ?? '—'), cell(bookmarkScope(item)));
    }
    cells.push(cell(String(item.groupSize)));
    tr.append(...cells);
    rows.append(tr);
  }
}

async function analyze(): Promise<void> {
  status.textContent = 'Analyzing…';
  try {
    const request: BackgroundRequest = {
      action: 'analyze',
      source,
      ...(windowId !== undefined ? { windowId } : {}),
      ...(folderId ? { folderId } : {}),
    };
    result = (await browser.runtime.sendMessage(request)) as AnalysisResult;
    summary.textContent = `${result.items.length} entries · ${result.duplicateGroupCount} duplicate groups · ${result.duplicateItemCount} entries belong to duplicate groups`;
    status.textContent = result.invalidUrlCount ? `${result.invalidUrlCount} non-HTTP(S) or invalid URL entries were not compared.` : '';
    render();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error);
  }
}

async function action(request: BackgroundRequest, confirmation: string): Promise<void> {
  if (!confirm(confirmation)) return;
  status.textContent = 'Working…';
  try {
    const actionResult = (await browser.runtime.sendMessage(request)) as ActionResult;
    status.textContent = actionResult.message;
    await analyze();
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : String(error);
  }
}

if (source === 'tabs') {
  document.querySelectorAll<HTMLElement>('.bookmark-only').forEach((element) => { element.hidden = true; });
  title.textContent = 'Open tab duplicate report';
  primaryAction.hidden = false;
  primaryAction.textContent = 'Group / mark duplicates';
  primaryAction.addEventListener('click', () => {
    void action(
      { action: 'group-tabs', ...(windowId !== undefined ? { windowId } : {}) },
      'Group each duplicate tab set using Firefox tab groups?',
    );
  });
  destructiveAction.hidden = false;
  destructiveAction.textContent = 'Close duplicate tabs';
  destructiveAction.addEventListener('click', () => {
    void action(
      { action: 'close-tab-duplicates', ...(windowId !== undefined ? { windowId } : {}) },
      'Close every duplicate tab except the first occurrence of each set?',
    );
  });
} else {
  title.textContent = 'Bookmark folder duplicate report (recursive analysis)';
  primaryAction.hidden = false;
  primaryAction.textContent = 'Move direct duplicates to subfolder';
  primaryAction.addEventListener('click', () => {
    if (!folderId) return;
    void action(
      { action: 'move-bookmark-duplicates', folderId },
      'Create a Duplicates subfolder here and move only duplicate bookmarks directly inside the selected folder? Nested folders will not be changed.',
    );
  });
  destructiveAction.hidden = false;
  destructiveAction.textContent = 'Delete direct duplicates';
  destructiveAction.addEventListener('click', () => {
    if (!folderId) return;
    void action(
      { action: 'delete-bookmark-duplicates', folderId },
      'Permanently delete only duplicate bookmarks directly inside the selected folder? Nested folders will not be changed.',
    );
  });
}

$('#refresh').addEventListener('click', () => void analyze());
filter.addEventListener('change', render);
search.addEventListener('input', render);
document.querySelectorAll<HTMLTableCellElement>('th[data-sort]').forEach((header) => {
  header.addEventListener('click', () => {
    const next = header.dataset.sort as SortKey;
    if (sortKey === next) sortDirection = sortDirection === 1 ? -1 : 1;
    else {
      sortKey = next;
      sortDirection = 1;
    }
    render();
  });
});

void analyze();
