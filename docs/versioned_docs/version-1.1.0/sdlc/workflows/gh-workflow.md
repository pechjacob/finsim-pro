# GitHub Workflows

## Deployment Workflow

**File**: `.github/workflows/deploy.yml`

**Trigger**: Push to `main` branch

**Steps**:
1. Checkout code
2. Install dependencies (`npm ci`)
3. Build app: `npm run app:build`
4. Build docs: `npm run docs:build`
5. Prepare deployment:
   - `apps/finsim/dist/*` → `deploy/finsim-pro/`
   - `docs/build/*` → `deploy/finsim-pro/docs/`
6. Deploy to GitHub Pages (`gh-pages` branch)

**Live URLs**:
- App: https://pechjacob.github.io/finsim-pro/
- Docs: https://pechjacob.github.io/finsim-pro/docs/

## Release Workflow

**File**: `.github/workflows/release.yml`

**Trigger**: Push tag matching `v*.*.*`

**Steps**:
1. Extract version from tag
2. Extract changelog for this version
3. Create GitHub Release with notes

## Manual Deployment

```bash
# Build everything
npm run build:all

# Auto-deploys on push to main
git push origin main
```
