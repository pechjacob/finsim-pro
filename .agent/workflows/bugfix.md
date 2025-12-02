---
description: How to fix a bug
---

# Fix Bug

## 1. Create Fix Branch

```bash
git checkout main
git pull origin main
git checkout -b fix/bug-description
```

## 2. Reproduce Bug

Start dev servers:

```bash
// turbo
npm run dev:all
```

Document:
- Steps to reproduce
- Expected behavior
- Actual behavior

## 3. Implement Fix

Edit relevant files in `apps/finsim/src/`:

```bash
# Example: fixing timeline bug
nano apps/finsim/src/components/TimelineEvents.tsx
```

## 4. Test Fix

Verify the bug is resolved:

```bash
# Check in browser
# App: http://localhost:3000/finsim-pro/
```

## 5. Commit Fix

```bash
git add .
git commit -m "fix(scope): resolve bug description"
```

Examples:
```bash
fix(chart): correct zoom calculation at edge cases
fix(simulation): handle negative balances correctly
fix(timeline): prevent event overlap in compact view
```

## 6. Test Build

```bash
// turbo
npm run lint
// turbo
npm run build:all
```

## 7. Push and Create PR

```bash
git push origin fix/bug-description
```

Create PR with:
- Description of bug
- Description of fix
- Steps to verify

## 8. After Merge

```bash
git checkout main
git pull origin main
git branch -d fix/bug-description
```

## Critical Bug (Hotfix)

If bug is in production and critical:

```bash
# 1. Create fix
git checkout -b fix/critical-bug
# ... make fix ...
git commit -m "fix(app): resolve critical security bug"

# 2. Merge immediately
git checkout main
git merge fix/critical-bug

# 3. Patch release
npm run release:patch

# 4. Push with tags
git push --follow-tags origin main
```
