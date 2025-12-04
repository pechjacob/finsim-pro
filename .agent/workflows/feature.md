---
description: How to create and release a new feature
---

# Create New Feature

## 1. Create Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feat/feature-name
```

## 2. Implement Feature

### For App Features

Edit files in `apps/finsim/src/`:
- Components: `apps/finsim/src/components/`
- Services: `apps/finsim/src/services/`
- Types: `apps/finsim/src/types.ts`
- Utils: `apps/finsim/src/utils.ts`

### Test Locally

```bash
// turbo
npm run dev:all
```

Visit:
- App: http://localhost:3000/finsim-pro/
- Docs: http://localhost:3001/finsim-pro/docs/

## 3. Commit Changes

Use conventional commit format:

```bash
git add .
git commit -m "feat(scope): add feature description"
```

**Remember:**
- Lowercase type and scope
- Lowercase description
- No period at end

**Post-commit hook:**
- Automatically updates "Unreleased" section in release notes
- Visible in "Next" docs version

## 4. Add Documentation

If user-facing feature:

```bash
# Edit or create doc file
nano docs/docs/features/new-feature.md

# Add to sidebar if needed
nano docs/sidebars.ts

# Commit docs
git add docs/
git commit -m "docs(feature): document new feature"
```

## 5. Test Build

```bash
// turbo
npm run lint
// turbo
npm run build:all
```

## 6. Push and Create PR

```bash
git push origin feat/feature-name
```

Then create PR on GitHub.

## 7. After Merge

```bash
git checkout main
git pull origin main
git branch -d feat/feature-name
```

## 8. Release

See [release workflow](.agent/workflows/release.md)
