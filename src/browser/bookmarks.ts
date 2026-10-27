import { analyzeCandidates } from '../core/duplicate-engine';
import type { ActionResult, AnalysisResult, CandidateItem } from '../core/types';
import { getConfig } from './settings';

async function getFolder(folderId: string): Promise<browser.bookmarks.BookmarkTreeNode> {
  const [node] = await browser.bookmarks.get(folderId);
  if (!node) throw new Error('Bookmark folder not found.');
  if (node.url) throw new Error('The selected bookmark is not a folder.');
  return node;
}

async function collectBookmarkCandidates(
  folderId: string,
  folderPath: string,
  depth: number,
  recursive: boolean,
): Promise<CandidateItem[]> {
  const children = await browser.bookmarks.getChildren(folderId);
  const candidates: CandidateItem[] = [];

  for (const node of children) {
    if (node.url) {
      candidates.push({
        source: 'bookmarks',
        id: node.id,
        title: node.title || '(untitled bookmark)',
        url: node.url,
        parentId: node.parentId ?? folderId,
        index: node.index ?? 0,
        bookmarkPath: folderPath,
        bookmarkDepth: depth,
        directChild: depth === 0,
      });
      continue;
    }

    if (recursive) {
      const nestedPath = folderPath ? `${folderPath} / ${node.title || '(untitled folder)'}` : node.title;
      candidates.push(...(await collectBookmarkCandidates(node.id, nestedPath, depth + 1, true)));
    }
  }

  return candidates;
}

/**
 * Analyze bookmarks in a folder. Reports recurse by default; mutating actions use recursive=false
 * so they can never move/delete bookmarks from nested folders.
 */
export async function analyzeBookmarkFolder(folderId: string, recursive = true): Promise<AnalysisResult> {
  const folder = await getFolder(folderId);
  const rootPath = folder.title || '(selected folder)';
  const candidates = await collectBookmarkCandidates(folderId, rootPath, 0, recursive);
  return analyzeCandidates(candidates, await getConfig());
}

async function uniqueDuplicatesFolderName(folderId: string): Promise<string> {
  const children = await browser.bookmarks.getChildren(folderId);
  const titles = new Set(children.filter((child) => !child.url).map((child) => child.title));
  if (!titles.has('Duplicates')) return 'Duplicates';
  let index = 2;
  while (titles.has(`Duplicates (${index})`)) index += 1;
  return `Duplicates (${index})`;
}

export async function moveBookmarkDuplicates(folderId: string): Promise<ActionResult> {
  // Deliberately non-recursive: only direct children of the folder the user selected can move.
  const analysis = await analyzeBookmarkFolder(folderId, false);
  const duplicates = analysis.items.filter((item) => item.duplicate && !item.keep && item.directChild);
  if (!duplicates.length) return { ok: true, affected: 0, message: 'No duplicate bookmarks found directly in the selected folder.' };

  const folder = await browser.bookmarks.create({
    parentId: folderId,
    title: await uniqueDuplicatesFolderName(folderId),
  });

  for (const item of duplicates) {
    await browser.bookmarks.move(item.id, { parentId: folder.id });
  }

  return {
    ok: true,
    affected: duplicates.length,
    message: `Moved ${duplicates.length} direct duplicate bookmark${duplicates.length === 1 ? '' : 's'} into “${folder.title}”. Nested folders were not modified.`,
  };
}

export async function deleteBookmarkDuplicates(folderId: string): Promise<ActionResult> {
  // Deliberately non-recursive for the same safety reason as moving.
  const analysis = await analyzeBookmarkFolder(folderId, false);
  const duplicates = analysis.items.filter((item) => item.duplicate && !item.keep && item.directChild);
  for (const item of duplicates) await browser.bookmarks.remove(item.id);

  return {
    ok: true,
    affected: duplicates.length,
    message: duplicates.length
      ? `Deleted ${duplicates.length} direct duplicate bookmark${duplicates.length === 1 ? '' : 's'} and kept the first occurrence of each. Nested folders were not modified.`
      : 'No duplicate bookmarks found directly in the selected folder.',
  };
}
