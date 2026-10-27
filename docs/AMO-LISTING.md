# Suggested AMO listing copy

## Name
Duplicate Scout

## Summary
Find duplicate tabs and bookmarks locally, review them in a detailed report, then group, close, move, or delete duplicates safely.

## Description
Duplicate Scout helps clean up crowded Firefox sessions and bookmark folders without sending browsing data anywhere.

Features:
- Analyze all tabs in the current Firefox window.
- Right-click a bookmark or bookmark folder and open a recursive duplicate report for that folder, including nested subfolders and their paths.
- Move/delete actions remain intentionally limited to duplicate bookmarks directly inside the selected folder; nested folders are never modified.
- Group duplicate tab sets using Firefox tab groups and distinct group colors.
- Close extra duplicate tabs while keeping the first occurrence.
- Move extra duplicate bookmarks into a generated `Duplicates` subfolder for easy review/removal.
- Generate a sortable/filterable report showing duplicate status, title, URL, base URL, parameters, and group size.
- Normalize common tracking parameters and recognize common identity parameters such as `id` and `v`.
- Configurable matching rules.
- No analytics, telemetry, remote scripts, or network services.

## Permissions explanation
- `tabs`: read tab titles/URLs and close/group duplicate tabs.
- `bookmarks`: inspect and optionally move/delete duplicate bookmarks.
- `menus`: add bookmark/tab/tools context-menu entries.
- `storage`: save matching preferences locally.
- `tabGroups`: color/name Firefox tab groups created for duplicates.

## Privacy
All analysis happens locally in Firefox. See `PRIVACY.md` in the source repository.
