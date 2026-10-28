# Duplicate Scout for Firefox

Duplicate Scout is an open-source Firefox extension for finding and managing duplicate tabs and bookmarks.

Everything runs locally in Firefox. No browsing data, bookmark data, analytics, or telemetry is sent anywhere.

## Features

### Tabs

Duplicate Scout can:

- Analyze all tabs in the current Firefox window
- Detect duplicate URLs
- Show duplicates in a detailed report
- Preserve the original Firefox tab order in the report
- Highlight duplicate groups with matching colors
- Group duplicate tabs using Firefox tab groups
- Close duplicate tabs while keeping the first occurrence

### Bookmarks

Right-click a bookmark folder and choose **Find duplicates in bookmark folder**.

Duplicate Scout can:

- Analyze the selected folder recursively
- Detect duplicates across nested folders
- Show the folder path and nesting level for every bookmark
- Highlight duplicate groups in the report
- Move duplicate bookmarks into a `Duplicates` subfolder
- Delete duplicate bookmarks after confirmation

For safety, **move and delete actions only affect bookmarks directly inside the selected folder**.

Nested folders are analyzed, but they are never modified automatically.

## Duplicate detection

Duplicate Scout primarily compares URLs, not page titles.

The matcher can:

- Normalize URLs
- Ignore URL fragments
- Ignore common tracking parameters such as `utm_*`, `fbclid`, and `gclid`
- Compare important identity parameters such as `id` and `v`
- Normalize common YouTube video URLs
- Distinguish different resources even when their page titles are identical

For example:

```text
https://example.com/article?id=42&utm_source=google
https://example.com/article?id=42&utm_source=reddit
```

These are considered duplicates.

But:

```text
https://youtube.com/watch?v=AAA
https://youtube.com/watch?v=BBB
```

are different videos.

## Report

The analysis report can display:

- Duplicate status (`✔` / `✗`)
- Title
- Full URL
- Base URL
- URL parameters
- Duplicate group size
- Bookmark folder/path
- Bookmark nesting level

Duplicate groups receive matching row colors.

The default report order matches the original tab or bookmark order. Columns can also be sorted manually.

## Privacy

Duplicate Scout works entirely locally.

It does not:

- Send tabs or bookmarks to a server
- Upload browsing history
- Use analytics or telemetry
- Require an account
- Use advertising
- Use remote code
- Connect to a backend service

See [PRIVACY.md](PRIVACY.md) for more information.

## Installation for development

Requirements:

- Firefox 142+
- Node.js 24+
- npm

Clone the repository and install dependencies:

```bash
npm install
```

Run all validation checks:

```bash
npm run check
```

Launch a temporary Firefox instance with the extension:

```bash
npm run firefox
```

You can also build the extension manually:

```bash
npm run build
```

The built extension is written to:

```text
dist/
```

To load it manually:

```text
about:debugging
→ This Firefox
→ Load Temporary Add-on
→ select dist/manifest.json
```

## Testing

Run the unit tests:

```bash
npm test
```

Run the complete validation suite:

```bash
npm run check
```

This includes TypeScript checks, linting, tests, building, and Mozilla `web-ext` validation.

## Packaging

Create the Firefox extension package:

```bash
npm run package
```

The generated ZIP is written to:

```text
artifacts/
```

To rebuild and overwrite an existing package:

```bash
npm run package:overwrite
```

Create a source-code archive for Mozilla Add-ons review:

```bash
npm run source:zip
```

## Project structure

```text
src/
  background.ts
  browser/        Firefox API integration
  core/           URL normalization and duplicate detection
  ui/             Popup, report, and options logic

static/
  manifest.json
  popup.html
  report.html
  options.html
  ui.css
  icons/

tests/            Unit tests
scripts/          Build scripts
docs/             Release and AMO documentation
.github/          GitHub Actions workflows
```

## Mozilla Add-ons reviewer build instructions

Duplicate Scout is written in TypeScript and bundled using esbuild.

### Requirements

- Node.js 24
- npm

Install the exact dependencies from `package-lock.json`:

```bash
npm ci
```

Run the complete validation suite:

```bash
npm run check
```

Build the unpacked extension:

```bash
npm run build
```

The result is written to:

```text
dist/
```

Create the distributable extension package:

```bash
npm run package
```

The package is written to:

```text
artifacts/
```

Create the source-code archive:

```bash
npm run source:zip
```

No runtime network requests are made by Duplicate Scout.

All tab analysis, bookmark analysis, URL normalization, duplicate detection, grouping, reporting, and settings functionality runs locally inside Firefox.

## Contributing

Contributions and bug reports are welcome.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md) for security reporting information.

## License

Duplicate Scout is released under the [MIT License](LICENSE).