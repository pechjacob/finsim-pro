# CI/CD Pipeline

## GitHub Actions Workflows

### 1. Deployment Workflow

**File**: `.github/workflows/deploy.yml`

**Trigger**: Push to `main` branch

**Steps**:
1. Checkout code
2. Install dependencies (`npm ci`)
3. Build app workspace: `npm run app:build`
4. Build docs workspace: `npm run docs:build`
5. Prepare deployment directory:
   - Copy `apps/finsim/dist/*` → `deploy/finsim-pro/`
   - Copy `docs/build/*` → `deploy/finsim-pro/docs/`
6. Deploy to GitHub Pages (`gh-pages` branch)

**Live URLs**:
- App: https://pechjacob.github.io/finsim-pro/
- Docs: https://pechjacob.github.io/finsim-pro/docs/

### 2. Release Workflow

**File**: `.github/workflows/release.yml`

**Trigger**: Push tag matching `v*.*.*`

**Steps**:
1. Extract version from tag
2. Extract changelog for this version from `CHANGELOG.md`
3. Create GitHub Release with changelog notes

## Manual Deployment

If you need to deploy manually:

```bash
# Build everything
npm run build:all

# The deployment workflow will auto-deploy on push to main
git push origin main
```
