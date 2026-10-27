# Duplicate Scout for Firefox

Duplicate Scout is a local-first Firefox WebExtension for finding and reviewing duplicate open tabs and duplicate bookmarks.

It is written in TypeScript, built with esbuild, unit-tested with Vitest, validated with Mozilla `web-ext`, and structured for GitHub/CI plus eventual publication on addons.mozilla.org (AMO).

## What it does

### Open tabs

Use the toolbar popup, tab context menu, or Firefox Tools menu to:

- **Analyze tabs**: open a report tab with every tab listed.
- **Group / mark duplicates**: create one Firefox tab group per duplicate set and assign Firefox group colors.
- **Close duplicate tabs**: keep the first occurrence and close later occurrences after confirmation.

### Bookmark folders

Right-click a bookmark folder (or a bookmark inside the folder) and choose **Find duplicates in bookmark folder**.

The report can:

- recursively analyze bookmarks in the selected folder and its nested subfolders;
- highlight each duplicate set with a consistent report color;
- show the bookmark folder/path and whether each result is in the selected folder or a nested folder;
- move extra occurrences that are **direct children of the selected folder only** into a new `Duplicates` subfolder (or `Duplicates (2)`, etc.);
- permanently delete extra occurrences after explicit confirmation.

The move action is intentionally safer than immediate deletion: the first occurrence stays in place and the extra bookmarks are collected in a review folder that can be deleted manually later.

## Duplicate matching

Titles are displayed in the report but are **not** used as the main duplicate criterion.

For HTTP(S) URLs the matcher:

1. normalizes host/path formatting;
2. removes configured tracking parameters (`utm_*`, `fbclid`, `gclid`, etc. by default);
3. ignores fragments by default;
4. sorts remaining query parameters;
5. if a configured identity parameter exists (`id`, `v`, `post_id`, etc.), compares the base URL + that identity value;
6. otherwise compares the normalized full URL;
7. canonicalizes common YouTube watch, Shorts, and `youtu.be` video URLs by video ID.

Example:

```text
https://example.com/article?id=42&utm_source=a
https://example.com/article?id=42&utm_source=b
```

These are considered duplicates.

```text
https://youtube.com/watch?v=AAA
https://youtube.com/watch?v=BBB
```

These are not duplicates even if their titles happen to match.

## Report columns

The report shows:

- Duplicate (`✔` / `✗`)
- Name/title
- URL
- Base URL
- URL parameters
- Bookmark folder/path and scope (bookmark reports only)
- Duplicate group size

Rows belonging to the same duplicate set receive the same generated report highlight. The report can be filtered to all/duplicate/unique entries and searched by title, URL, or bookmark folder path.

## Privacy

Everything happens locally in Firefox. The extension contains no network requests, analytics, telemetry, advertising SDKs, remote code, or backend service. See [PRIVACY.md](PRIVACY.md).

## Requirements

- Firefox **139+** (the extension uses the stable `tabGroups` WebExtension API)
- Node.js 22+ for development

## Development setup

```bash
npm install
npm run check
```

After the first successful install, commit the generated `package-lock.json` and you can switch CI from `npm install` to `npm ci` for fully locked/reproducible dependency installs.

Build the extension:

```bash
npm run build
```

The loadable extension is produced in `dist/`.

### Run in a temporary Firefox profile

```bash
npm run firefox
```

This builds the extension and launches it through Mozilla `web-ext`.

You can also load `dist/manifest.json` manually from:

```text
about:debugging
→ This Firefox
→ Load Temporary Add-on
```

### Watch TypeScript

In one terminal:

```bash
npm run build:watch
```

In another, after an initial build:

```bash
npm run firefox:dev
```

If you edit HTML/CSS/manifest files under `static/`, rerun the build because the simple watch script watches bundled TypeScript only.

## Testing

```bash
npm test
```

The URL normalization and duplicate engine are browser-independent and covered by unit tests.

Other validation commands:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run webext:lint
```

Run the primary validation suite:

```bash
npm run check
```

## Packaging

Create an unsigned distributable ZIP:

```bash
npm run package:xpi
```

`web-ext` writes the package to `artifacts/`. Firefox Release/Beta requires Mozilla signing before permanent installation.

## Repository structure

```text
src/
  background.ts          Firefox event/background entrypoint
  browser/               Firefox API adapters (tabs, bookmarks, settings)
  core/                  Pure duplicate detection / URL normalization
  ui/                    Popup, report, and options TypeScript
static/
  manifest.json
  popup.html
  report.html
  options.html
  ui.css
  icons/
tests/                    Vitest unit tests
scripts/                  Build/clean scripts
docs/                     AMO listing and release notes
.github/workflows/        GitHub Actions CI
```

## Important behavior notes

- Bookmark **analysis is recursive** and includes nested subfolders in the report. Each bookmark row shows its folder/path and whether it is directly in the selected folder or nested.
- Bookmark **move/delete actions are intentionally non-recursive**. They only affect duplicate bookmarks that are direct children of the folder the user selected; nested folders are never modified by these actions.
- The first occurrence is determined by the order returned by Firefox (tab order for tabs, bookmark order for a folder).
- Non-HTTP(S) entries such as `about:` URLs are shown but are not duplicate-compared.
- Firefox exposes a fixed set of tab-group colors, so colors are reused when there are more duplicate sets than available Firefox colors.

## GitHub / AMO

The repository includes:

- MIT license
- privacy policy
- security policy
- contribution instructions
- changelog
- GitHub Actions validation/package workflow
- suggested AMO listing copy and permission explanations
- release checklist

Before first public AMO submission, replace the placeholder extension ID (`duplicate-scout@local`) in `static/manifest.json` with the permanent ID you intend to keep, and update project/repository contact details as desired.

## License

MIT
