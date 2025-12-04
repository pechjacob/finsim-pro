# Version Bump Rules

## Automatic Detection

`standard-version` analyzes conventional commits since the last release:

| Commit Type | Version Bump |
|-------------|--------------|
| `feat:` | MINOR (1.0.0 → 1.1.0) |
| `fix:` | PATCH (1.0.0 → 1.0.1) |
| `BREAKING CHANGE:` | MAJOR (1.0.0 → 2.0.0) |
| `perf:`, `refactor:` | PATCH (1.0.0 → 1.0.1) |
| `docs:`, `chore:`, `style:` | No bump |

## Breaking Changes

### In Commit Message

```bash
feat(api): change response format

BREAKING CHANGE: API now returns data property instead of result
```

### In Footer

```bash
fix(auth): update authentication flow

This introduces breaking changes to the login process.
```

## Manual Override

Force specific bump:

```bash
npm run release:patch   # 1.0.0 → 1.0.1
npm run release:minor   # 1.0.0 → 1.1.0
npm run release:major   # 1.0.0 → 2.0.0
```

## First Release

For initial `1.0.0` release:

```bash
npm run release -- --first-release
```
