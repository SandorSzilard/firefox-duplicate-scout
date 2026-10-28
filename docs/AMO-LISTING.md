# Duplicate Scout — AMO Listing

## Name

Duplicate Scout

## Summary

Find, review, group, and safely manage duplicate Firefox tabs and bookmarks.

## Description

Duplicate Scout helps you find duplicate tabs and bookmarks while keeping all analysis local inside Firefox.

### Tabs

Duplicate Scout can:

- Analyze all tabs in the current Firefox window
- Detect duplicate URLs
- Preserve the original tab order in the report
- Highlight duplicate groups with matching colors
- Group duplicate tabs using Firefox tab groups
- Close duplicate tabs while keeping the first occurrence

### Bookmarks

Duplicate Scout can:

- Analyze a selected bookmark folder recursively
- Detect duplicate bookmarks across nested folders
- Show each bookmark's folder path and nesting level
- Highlight duplicate groups in the report
- Move duplicate bookmarks into a `Duplicates` subfolder
- Delete duplicate bookmarks after confirmation

For safety, move and delete operations only affect duplicate bookmarks that are direct children of the selected folder.

Nested folders can be analyzed, but they are never modified automatically.

### Duplicate detection

Duplicate Scout primarily compares URLs rather than page titles.

It can normalize URLs, ignore common tracking parameters, recognize important identity parameters such as `id` and `v`, and normalize common YouTube video URLs.

### Privacy

Duplicate Scout works entirely locally in Firefox.

It does not:

- Send tabs or bookmarks to a server
- Upload browsing history
- Use analytics or telemetry
- Require an account
- Use advertising
- Use remote code
- Connect to a backend service

All duplicate detection and reporting happens locally in the browser.

## Suggested category

Tabs / Bookmarks / Productivity

## License

MIT

## Source code

The source code is publicly available on GitHub.

## Support

Bug reports and feature requests can be submitted through GitHub Issues.