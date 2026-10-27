import type { BackgroundRequest } from './core/types';
import { analyzeBookmarkFolder, deleteBookmarkDuplicates, moveBookmarkDuplicates } from './browser/bookmarks';
import { analyzeTabs, closeDuplicateTabs, groupDuplicateTabs } from './browser/tabs';

const BOOKMARK_MENU_ID = 'duplicate-scout-bookmark-folder';
const TAB_MENU_ID = 'duplicate-scout-tab';
const TOOLS_MENU_ID = 'duplicate-scout-tools';

function reportUrl(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) search.set(key, String(value));
  });
  return browser.runtime.getURL(`report.html?${search.toString()}`);
}

async function openReport(request: Extract<BackgroundRequest, { action: 'open-report' }>): Promise<void> {
  await browser.tabs.create({
    url: reportUrl({ source: request.source, windowId: request.windowId, folderId: request.folderId }),
  });
}

async function createMenus(): Promise<void> {
  await browser.menus.removeAll();
  browser.menus.create({
    id: BOOKMARK_MENU_ID,
    title: 'Find duplicates in bookmark folder',
    contexts: ['bookmark'],
  });
  browser.menus.create({
    id: TAB_MENU_ID,
    title: 'Find duplicates in this window',
    contexts: ['tab'],
  });
  browser.menus.create({
    id: TOOLS_MENU_ID,
    title: 'Duplicate Scout: analyze tabs',
    contexts: ['tools_menu'],
  });
}

browser.runtime.onInstalled.addListener(() => {
  void createMenus();
});

browser.runtime.onStartup.addListener(() => {
  void createMenus();
});

browser.menus.onClicked.addListener((info, tab) => {
  void (async () => {
    if (info.menuItemId === TAB_MENU_ID || info.menuItemId === TOOLS_MENU_ID) {
      const windowId = tab?.windowId;
      await openReport({ action: 'open-report', source: 'tabs', ...(windowId !== undefined ? { windowId } : {}) });
      return;
    }

    if (info.menuItemId === BOOKMARK_MENU_ID && info.bookmarkId) {
      const [node] = await browser.bookmarks.get(String(info.bookmarkId));
      if (!node) return;
      const folderId = node.url ? node.parentId : node.id;
      if (!folderId) return;
      await openReport({ action: 'open-report', source: 'bookmarks', folderId });
    }
  })();
});

browser.runtime.onMessage.addListener((message: BackgroundRequest) => {
  switch (message.action) {
    case 'analyze':
      return message.source === 'tabs'
        ? analyzeTabs(message.windowId)
        : message.folderId
          ? analyzeBookmarkFolder(message.folderId)
          : Promise.reject(new Error('Missing bookmark folder ID.'));
    case 'group-tabs':
      return groupDuplicateTabs(message.windowId);
    case 'close-tab-duplicates':
      return closeDuplicateTabs(message.windowId);
    case 'move-bookmark-duplicates':
      return moveBookmarkDuplicates(message.folderId);
    case 'delete-bookmark-duplicates':
      return deleteBookmarkDuplicates(message.folderId);
    case 'open-report':
      return openReport(message).then(() => ({ ok: true, affected: 0, message: 'Report opened.' }));
    default:
      return Promise.reject(new Error('Unknown Duplicate Scout request.'));
  }
});
