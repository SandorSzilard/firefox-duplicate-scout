# Manual test plan

Use a fresh Firefox profile when possible.

## Tab report

1. Open A, B, C, A, D, A, E, B URLs in that order.
2. Analyze tabs.
3. Confirm every A row shows `✔`, every B row shows `✔`, and C/D/E show `✗`.
4. Confirm all A rows share a report highlight and all B rows share another.
5. Confirm filtering/search/sorting work.

## Tracking parameters

Open:
- `https://example.com/path?id=42&utm_source=a`
- `https://example.com/path?id=42&utm_source=b`

They should be duplicates with default settings.

## YouTube identity

Open different URL forms for the same video (watch + `youtu.be` + Shorts when applicable). They should resolve to the same duplicate set when the video ID is identical.

## Group / mark tabs

1. Create at least two duplicate sets.
2. Click **Group / mark duplicates**.
3. Confirm each set becomes its own Firefox tab group.
4. Confirm groups have labels and colors.

## Close duplicate tabs

1. Create duplicate sets.
2. Click **Close duplicate tabs**.
3. Confirm the prompt appears.
4. Confirm only later occurrences close and the first remains.

## Bookmark folder report — recursive analysis

1. Create a test bookmark folder with duplicate and unique bookmarks.
2. Add at least one nested subfolder containing another copy of a URL from the selected folder, plus another duplicate pair entirely inside the nested folder.
3. Right-click the top-level test folder and choose the Duplicate Scout menu item.
4. Confirm bookmarks from the selected folder **and nested subfolders** appear in the report.
5. Confirm each bookmark row shows its folder/path and `Selected folder` or `Nested (+N)` scope.
6. Confirm duplicate groups can span folder boundaries in the report.
7. Confirm filtering/search/sorting work with folder/path values.

## Bookmark move safety — selected folder only

1. In the selected folder, create at least one direct duplicate pair. Also keep duplicate bookmarks inside a nested subfolder.
2. Choose **Move direct duplicates to subfolder**.
3. Confirm only extra duplicate occurrences that are direct children of the selected folder move into the generated `Duplicates` folder.
4. Confirm bookmarks in nested folders remain exactly where they were.
5. Repeat to confirm a second generated folder is named `Duplicates (2)` when needed.

## Destructive bookmark deletion

Use only disposable test bookmarks. Confirm the delete action asks for confirmation, leaves the first direct occurrence, and does not delete or move anything from nested folders.

## Settings

1. Add/remove ignored parameters and identity parameters.
2. Confirm matching changes after refreshing the report.
3. Test `strip www` and hash handling.

## Privacy/network

Open Firefox developer tools for the extension and verify no network requests are made by Duplicate Scout during analysis.
