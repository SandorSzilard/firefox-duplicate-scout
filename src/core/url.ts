import type { DuplicateConfig, ParsedUrlInfo } from './types';

function shouldIgnoreParam(name: string, config: DuplicateConfig): boolean {
  const lower = name.toLowerCase();
  if (config.ignoredParams.some((item) => item.toLowerCase() === lower)) return true;
  return config.ignoredParamPrefixes.some((prefix) => lower.startsWith(prefix.toLowerCase()));
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
}

function maybeCanonicalIdentity(url: URL): string | undefined {
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (host === 'youtu.be') {
    const videoId = url.pathname.split('/').filter(Boolean)[0];
    if (videoId) return `youtube:video:${videoId}`;
  }
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (url.pathname === '/watch') {
      const videoId = url.searchParams.get('v');
      if (videoId) return `youtube:video:${videoId}`;
    }
    const shortsMatch = url.pathname.match(/^\/shorts\/([^/]+)/);
    if (shortsMatch?.[1]) return `youtube:video:${shortsMatch[1]}`;
  }
  return undefined;
}

export function parseUrl(originalUrl: string, config: DuplicateConfig): ParsedUrlInfo | null {
  let url: URL;
  try {
    url = new URL(originalUrl);
  } catch {
    return null;
  }

  if (!['http:', 'https:'].includes(url.protocol)) return null;

  url.hostname = url.hostname.toLowerCase();
  if (config.stripWww) url.hostname = url.hostname.replace(/^www\./, '');
  if ((url.protocol === 'http:' && url.port === '80') || (url.protocol === 'https:' && url.port === '443')) {
    url.port = '';
  }
  url.pathname = normalizePath(url.pathname);
  if (config.ignoreHash) url.hash = '';

  const canonicalIdentity = maybeCanonicalIdentity(url);
  const keptParams: Array<{ name: string; value: string }> = [];
  for (const [name, value] of url.searchParams.entries()) {
    if (!shouldIgnoreParam(name, config)) keptParams.push({ name, value });
  }
  keptParams.sort((a, b) => a.name.localeCompare(b.name) || a.value.localeCompare(b.value));

  url.search = '';
  for (const param of keptParams) url.searchParams.append(param.name, param.value);

  const baseUrl = `${url.origin}${url.pathname}`;
  const identityParameter = config.identityParams
    .map((identityName) => keptParams.find((param) => param.name.toLowerCase() === identityName.toLowerCase()))
    .find(Boolean);

  const duplicateKey =
    canonicalIdentity ??
    (identityParameter
      ? `${baseUrl}?${identityParameter.name.toLowerCase()}=${identityParameter.value}`
      : url.toString());

  return {
    originalUrl,
    normalizedUrl: url.toString(),
    baseUrl,
    parameters: keptParams,
    ...(identityParameter ? { identityParameter } : {}),
    duplicateKey,
  };
}
