# Release checklist

1. Update version in `package.json`, `static/manifest.json`, and `CHANGELOG.md`.
2. Run `npm install` and `npm run check`.
3. Run `npm run package:xpi` to create the unsigned distributable ZIP in `artifacts/`.
4. Test the exact package in a clean Firefox profile.
5. Tag the Git commit (for example `v0.1.0`) and create a GitHub release.
6. Submit the extension source/package through the AMO Developer Hub for review/signing.
7. Keep the source archive reproducible and include build instructions from `README.md` for AMO reviewers.

Firefox Release/Beta requires Mozilla signing. A public AMO listing and unlisted/self-distributed signing both use Mozilla's signing infrastructure.
