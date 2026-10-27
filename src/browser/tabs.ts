import { analyzeCandidates } from '../core/duplicate-engine';
import type { ActionResult, AnalysisResult, CandidateItem } from '../core/types';
import { getConfig } from './settings';

const GROUP_COLORS = [
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'yellow',
  'grey',
] as const;

async function resolveWindowId(windowId?: number): Promise<number> {
  if (typeof windowId === 'number') return windowId;
  const window = await browser.windows.getLastFocused();
  if (window.id === undefined) throw new Error('No active Firefox window was found.');
  return window.id;
}

export async function analyzeTabs(windowId?: number): Promise<AnalysisResult> {
  const resolvedWindowId = await resolveWindowId(windowId);
  const tabs = await browser.tabs.query({ windowId: resolvedWindowId });
  const candidates: CandidateItem[] = tabs
    .filter((tab): tab is browser.tabs.Tab & { id: number; url: string } => Boolean(tab.id && tab.url))
    .map((tab) => ({
      source: 'tabs',
      id: String(tab.id),
      title: tab.title ?? '(untitled tab)',
      url: tab.url,
      windowId: resolvedWindowId,
      index: tab.index,
    }));

  return analyzeCandidates(candidates, await getConfig());
}

export async function groupDuplicateTabs(windowId?: number): Promise<ActionResult> {
  const analysis = await analyzeTabs(windowId);
  const groups = new Map<string, number[]>();
  for (const item of analysis.items) {
    if (!item.duplicate || !item.groupId) continue;
    const tabId = Number(item.id);
    if (!Number.isInteger(tabId)) continue;
    const ids = groups.get(item.groupId) ?? [];
    ids.push(tabId);
    groups.set(item.groupId, ids);
  }

  let affected = 0;
  let colorIndex = 0;
  for (const tabIds of groups.values()) {
    if (tabIds.length < 2) continue;
    if (!browser.tabs.group || !browser.tabGroups?.update) {
      throw new Error('Tab grouping requires Firefox 139 or newer.');
    }
    const groupId = await browser.tabs.group({ tabIds });
    await browser.tabGroups.update(groupId, {
      title: `Duplicates (${tabIds.length})`,
      color: GROUP_COLORS[colorIndex % GROUP_COLORS.length] ?? 'blue',
      collapsed: false,
    });
    colorIndex += 1;
    affected += tabIds.length;
  }

  return {
    ok: true,
    affected,
    message: affected ? `Grouped ${affected} tabs into ${groups.size} duplicate sets.` : 'No duplicate tabs found.',
  };
}

export async function closeDuplicateTabs(windowId?: number): Promise<ActionResult> {
  const analysis = await analyzeTabs(windowId);
  const idsToClose = analysis.items
    .filter((item) => item.duplicate && !item.keep)
    .map((item) => Number(item.id))
    .filter(Number.isInteger);

  if (idsToClose.length) await browser.tabs.remove(idsToClose);
  return {
    ok: true,
    affected: idsToClose.length,
    message: idsToClose.length
      ? `Closed ${idsToClose.length} duplicate tab${idsToClose.length === 1 ? '' : 's'} and kept the first occurrence of each.`
      : 'No duplicate tabs found.',
  };
}
