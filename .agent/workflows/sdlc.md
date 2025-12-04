---
description: Complete SDLC process - follow this for ALL development work
---

# SDLC Process

> **CRITICAL**: Use this workflow for ALL development changes, no matter how small.
> Direct commits to `main` are NOT allowed (except hotfixes).

## Step 1: Understand the Request

What are you trying to accomplish?
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Dependency update
- [ ] Configuration change

## Step 2: Create Feature Branch

```bash
git checkout main
git pull origin main

# Choose appropriate prefix:
git checkout -b feat/description    # New features
git checkout -b fix/description     # Bug fixes
git checkout -b docs/description    # Documentation
git checkout -b chore/description   # Maintenance
```

## Step 3: Make Changes

Edit the necessary files in the appropriate locations:

| Type | Location |
|------|----------|
| React components | `apps/finsim/src/components/` |
| Business logic | `apps/finsim/src/services/` |
| Types | `apps/finsim/src/types.ts` |
| Utilities | `apps/finsim/src/utils.ts` |
| Docs | `docs/docs/` |
| Scripts | `scripts/` |

## Step 4: Test Locally

```bash
// turbo
npm run dev:all
```

Visit:
- App: http://localhost:3000/finsim-pro/
- Docs: http://localhost:3001/finsim-pro/docs/

Test your changes thoroughly.

## Step 5: Verify Build

```bash
// turbo
npm run lint
// turbo
npm run build:all
```

## Step 6: Commit Changes

Use conventional commit format:

```bash
git add .
git commit -m "<type>(<scope>): <description>"
```

**Rules:**
- Type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Scope: `app`, `docs`, `chart`, `timeline`, `simulation`, `formula`, `ui`, `config`, `deps`, `ci`
- Description: lowercase, no period at end

**Auto-magic:**
- Post-commit hook updates "Unreleased" in release notes
- Visible in "Next" docs version

## Step 7: Preview Changes (Optional)

```bash
// turbo
npm run changelog:preview
```

See what will be in the next release.

## Step 8: Push Branch

```bash
git push origin <branch-name>
```

## Step 9: Create PR (If Required)

If working with a team or for review:
1. Go to GitHub
2. Create Pull Request
3. Request review
4. Address feedback

Otherwise, proceed to merge:

```bash
git checkout main
git merge <branch-name>
```

## Step 10: Clean Up

```bash
git branch -d <branch-name>
```

## Step 11: Release (When Ready)

Preview first:
```bash
// turbo
npm run release:preview
```

Then release:
```bash
npm run release
git push --follow-tags origin main
```

## Exception: Hotfixes

For critical production bugs ONLY:
1. Create `fix/critical-description` branch
2. Make minimal fix
3. Merge to main immediately
4. `npm run release:patch`
5. Push with tags

---

## Quick Reference

```bash
# Complete flow
git checkout main && git pull
git checkout -b feat/my-feature
# ... make changes ...
npm run lint && npm run build:all
git add . && git commit -m "feat(scope): description"
npm run changelog:preview
git push origin feat/my-feature
git checkout main && git merge feat/my-feature
git branch -d feat/my-feature
```
