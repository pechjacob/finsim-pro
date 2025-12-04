# Automated Versioning

We use [`standard-version`](https://github.com/conventional-changelog/standard-version) to automate:

- ✅ Version bumping (based on commits)
- ✅ CHANGELOG.md generation
- ✅ Git tagging
- ✅ Commit creation

## How It Works

```bash
npm run release
```

**Process**:

1. **Analyze commits** since last tag
2. **Determine version bump** (major/minor/patch)
3. **Update version** in `package.json` and `package-lock.json`
4. **Generate CHANGELOG.md** with grouped changes
5. **Create commit**: `chore(release): X.Y.Z`
6. **Create git tag**: `vX.Y.Z`

## Configuration

File: `.versionrc`

```json
{
  "types": [
    {"type": "feat", "section": "✨ Features"},
    {"type": "fix", "section": "🐛 Bug Fixes"},
    {"type": "docs", "section": "📚 Documentation"},
    {"type": "chore", "hidden": true}
  ]
}
```

## Skip Steps

```bash
# Skip changelog
npm run release -- --skip.changelog

# Skip commit
npm run release -- --skip.commit

# Skip tag
npm run release -- --skip.tag

# Dry run (no changes)
npm run release -- --dry-run
```
