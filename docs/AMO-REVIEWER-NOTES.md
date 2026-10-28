# AMO Reviewer Notes

Duplicate Scout operates entirely locally inside Firefox.

No account, API key, external service, backend, or test credentials are required.

## Build environment

- Node.js 24
- npm

## Build steps

Install dependencies:

```bash
npm ci
```

Run validation:

```bash
npm run check
```

Build the extension:

```bash
npm run build
```

Create the distributable extension package:

```bash
npm run package
```

The generated package is written to:

```text
artifacts/
```

## Suggested functional test

### Tabs

1. Open two tabs with the same URL.
2. Open one unrelated tab.
3. Open Duplicate Scout.
4. Choose **Analyze tabs**.
5. Verify that the matching tabs are marked as duplicates.
6. Choose **Group / mark duplicates**.
7. Verify that the duplicate tabs are grouped.
8. Choose **Close duplicate tabs**.
9. Verify that the first occurrence remains open.

### Bookmarks

1. Create a bookmark folder with at least two identical bookmark URLs.
2. Add a nested bookmark folder with another matching URL.
3. Right-click the parent bookmark folder.
4. Choose **Find duplicates in bookmark folder**.
5. Verify that the report includes both direct and nested bookmarks.
6. Verify that nested bookmarks show their folder path and nesting level.
7. Use the move action.
8. Verify that only duplicate bookmarks directly inside the selected folder are moved.
9. Verify that nested folders are not modified.

## Privacy

The extension performs no runtime network requests.

All tab analysis, bookmark analysis, URL normalization, duplicate detection, grouping, reporting, and settings logic runs locally inside Firefox.

The extension does not use:

- analytics
- telemetry
- advertising
- remote code
- external APIs
- a backend service
- user accounts

## Source code

The extension is written in TypeScript and bundled using esbuild.

The original TypeScript source is included in the source archive and is reproducibly buildable using the commands above.