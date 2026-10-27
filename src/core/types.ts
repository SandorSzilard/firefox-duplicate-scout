export type SourceKind = 'tabs' | 'bookmarks';

export interface DuplicateConfig {
  ignoredParams: string[];
  ignoredParamPrefixes: string[];
  identityParams: string[];
  ignoreHash: boolean;
  stripWww: boolean;
}

export interface ParsedUrlInfo {
  originalUrl: string;
  normalizedUrl: string;
  baseUrl: string;
  parameters: Array<{ name: string; value: string }>;
  identityParameter?: { name: string; value: string };
  duplicateKey: string;
}

export interface CandidateItem {
  source: SourceKind;
  id: string;
  title: string;
  url: string;
  parentId?: string;
  windowId?: number;
  index?: number;
  bookmarkPath?: string;
  bookmarkDepth?: number;
  directChild?: boolean;
}

export interface AnalyzedItem extends CandidateItem, ParsedUrlInfo {
  duplicate: boolean;
  groupId?: string;
  groupSize: number;
  occurrence: number;
  keep: boolean;
}

export interface AnalysisResult {
  source: SourceKind;
  items: AnalyzedItem[];
  duplicateGroupCount: number;
  duplicateItemCount: number;
  uniqueItemCount: number;
  invalidUrlCount: number;
}

export interface ReportRequest {
  action: 'analyze';
  source: SourceKind;
  windowId?: number;
  folderId?: string;
}

export type BackgroundRequest =
  | ReportRequest
  | { action: 'group-tabs'; windowId?: number }
  | { action: 'close-tab-duplicates'; windowId?: number }
  | { action: 'move-bookmark-duplicates'; folderId: string }
  | { action: 'delete-bookmark-duplicates'; folderId: string }
  | { action: 'open-report'; source: SourceKind; windowId?: number; folderId?: string };

export interface ActionResult {
  ok: boolean;
  affected: number;
  message: string;
}
