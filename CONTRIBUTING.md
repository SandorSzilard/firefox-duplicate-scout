# Contributing

Contributions are welcome. Please keep the extension local-first: tab/bookmark content must not be transmitted to external services.

## Development

1. Install Node.js 22+.
2. Run `npm install`.
3. Run `npm run check` before opening a pull request.
4. Use `npm run firefox` to launch a temporary Firefox profile with the built extension.

For matching changes, add or update unit tests in `tests/`. The duplicate engine is intentionally browser-independent so URL behavior can be tested without Firefox.
