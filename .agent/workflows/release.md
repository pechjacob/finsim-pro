---
description: How to create a new release
---

# Create Release

## 1. Ensure Clean State

```bash
git checkout main
git pull origin main
// turbo
git status
```

Status should show "working tree clean".

## 2. Review Commits

Check what will be included:

```bash
git log $(git describe --tags --abbrev=0)..HEAD --oneline
```

## 3. Preview Release (Optional)

Preview the release before creating it:

```bash
// turbo
npm run release:preview
```

This shows:
- What version will be created
- Changelog preview
- Docs impact

## 4. Run Release Command

### Automatic Version Detection

```bash
npm run release
```

This will:
- Analyze commits since last release
- Determine version bump (major/minor/patch)
- Update `package.json` versions
- Generate `CHANGELOG.md`
- **Auto-sync** to `/docs/docs/sdlc/index.md`
- Create commit: `chore(release): X.Y.Z`
- Create git tag: `vX.Y.Z`

### Manual Version Bump

```bash
# Patch: 1.0.0 → 1.0.1
npm run release:patch

# Minor: 1.0.0 → 1.1.0
npm run release:minor

# Major: 1.0.0 → 2.0.0
npm run release:major
```

## 5. Review Changes

```bash
git show HEAD
cat CHANGELOG.md
```

Verify:
- ✅ Version numbers correct
- ✅ Changelog entries accurate
- ✅ Commit message follows format

## 6. Push with Tags

```bash
git push --follow-tags origin main
```

This triggers:
- GitHub Actions deployment workflow
- GitHub Release creation workflow

## 7. Verify Deployment
## 6. Verify Deployment

Check these URLs:
- App: https://pechjacob.github.io/finsim-pro/
- Docs: https://pechjacob.github.io/finsim-pro/docs/
- Release: https://github.com/pechjacob/finsim-pro/releases

## 7. Push with Tags

```bash
git push --follow-tags origin main
```

This triggers:
- GitHub Actions deployment workflow
- GitHub Release creation workflow

**Note**: Documentation is automatically versioned during Step 4 (Release Command).

## 8. Push Release

For critical bugs in production:

```bash
# 1. Create hotfix branch
git checkout -b fix/critical-bug

# 2. Make fix
# ... edit files ...
git commit -m "fix(app): resolve critical bug"

# 3. Merge to main
git checkout main
git merge fix/critical-bug

# 4. Release patch
npm run release:patch

# 5. Push
git push --follow-tags origin main
```

## Rollback

If release has issues:

```bash
# Delete tag locally
git tag -d vX.Y.Z

# Delete tag remotely
git push origin :refs/tags/vX.Y.Z

# Revert commit
git revert HEAD
git push origin main
```
