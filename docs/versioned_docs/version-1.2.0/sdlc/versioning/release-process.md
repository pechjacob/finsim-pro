# Release Process

## Step-by-Step Guide

### 1. Ensure Clean State

```bash
git checkout main
git pull origin main
git status  # Should be clean
```

### 2. Run Release Command

```bash
# Automatic version detection
npm run release

# Or force specific bump
npm run release:minor
npm run release:major
npm run release:patch
```

### 3. Review Changes

Check `CHANGELOG.md` and version numbers:

```bash
git log -1 --oneline
git show HEAD
```

### 4. Push to GitHub

```bash
git push --follow-tags origin main
```

This triggers:
- GitHub Actions deployment
- GitHub Release creation

### 5. Verify Deployment

- App: https://pechjacob.github.io/finsim-pro/
- Docs: https://pechjacob.github.io/finsim-pro/docs/
- Releases: https://github.com/pechjacob/finsim-pro/releases

## Hotfix Process

For emergency fixes:

```bash
# 1. Create hotfix
git checkout -b fix/critical-bug
# ... make fixes ...
git commit -m "fix(app): resolve critical bug"

# 2. Merge to main
git checkout main
git merge fix/critical-bug

# 3. Release patch
npm run release:patch

# 4. Push
git push --follow-tags origin main
```

## Pre-release

For beta/alpha releases:

```bash
npm run release -- --prerelease alpha
# Creates: 1.1.0-alpha.0

npm run release -- --prerelease beta  
# Creates: 1.1.0-beta.0
```
