## [Unreleased]

### Changed

- Preserve the original Firefox tab order in tab reports by default.
- Preserve recursive bookmark traversal order in bookmark reports by default.
- Column-header sorting remains available as an explicit user action.

# Changelog

## 0.1.0

- Initial development release.
- Analyze duplicate tabs in the current Firefox window.
- Analyze bookmarks in a selected bookmark folder.
- Group duplicate tabs with Firefox tab groups.
- Close duplicate tabs while keeping the first occurrence.
- Move duplicate bookmarks into a generated `Duplicates` subfolder.
- Optional direct duplicate-bookmark deletion with confirmation.
- Local HTML report with filters, sorting, URL details, and group highlighting.
- Configurable tracking/identity query parameters.
- Unit tests, GitHub Actions CI, and `web-ext` validation/package scripts.
