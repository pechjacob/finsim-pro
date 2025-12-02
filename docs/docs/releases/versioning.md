# Versioning Semantics

FinSim Pro follows [Semantic Versioning 2.0.0](https://semver.org/) (`MAJOR.MINOR.PATCH`):

## Version Bump Rules

Given a version number `MAJOR.MINOR.PATCH`, increment the:

1. **MAJOR** version when you make incompatible API changes
2. **MINOR** version when you add functionality in a backward compatible manner
3. **PATCH** version when you make backward compatible bug fixes

## Automated Versioning

We use [`standard-version`](https://github.com/conventional-changelog/standard-version) to automate:
- Version bumping (based on conventional commits)
- `CHANGELOG.md` generation
- Git tagging

### How It Works

```bash
# Analyze commits since last tag
# Determine version bump automatically
npm run release

# Force specific bump
npm run release:patch   # 1.0.0 → 1.0.1
npm run release:minor   # 1.0.0 → 1.1.0
npm run release:major   # 1.0.0 → 2.0.0
```

### Release Process

1. **Standard Release** (Automated Version Detection):
   ```bash
   npm run release
   ```
   This will:
   - Analyze commits since last release
   - Determine version bump (major/minor/patch)
   - Update `CHANGELOG.md`
   - Commit changes: `chore(release): X.Y.Z`
   - Create git tag: `vX.Y.Z`

2. **Push to GitHub**:
   ```bash
   git push --follow-tags origin main
   ```
   This triggers:
   - GitHub Actions deployment workflow
   - Automated GitHub Release creation

## Changelog Structure

The changelog is auto-generated and grouped by commit type:

```markdown
## [1.1.0] (2024-12-01)

### ✨ Features
- **chart**: add zoom reset button ([abc1234](link))
- **timeline**: implement event filtering ([def5678](link))

### 🐛 Bug Fixes
- **simulation**: correct interest calculation ([ghi9012](link))

### 📚 Documentation
- **tutorial**: add event management guide ([jkl3456](link))
```
