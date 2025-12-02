---
sidebar_position: 6
---

# Release Notes

## v1.0.0 (Current)
*   **Initial Release**
*   Interactive Financial Chart
*   Event Timeline with Drag-and-Drop
*   Multiple Accounts Support
*   Custom Formulas & Interest Effects
*   Dark Mode UI

## v0.9.0 (Beta)
*   Beta testing release
*   Basic chart functionality
*   Simple income/expense tracking

---

## Development Workflows

### Quick Commands Reference

```bash
# Development
npm run app:dev          # App only (port 3000)
npm run docs:dev         # Docs only (port 3001)
npm run dev:all          # Both together

# Building
npm run app:build        # App only
npm run docs:build       # Docs only
npm run build:all        # Both together

# Testing & Linting
npm run test             # All workspaces
npm run lint             # All workspaces

# Releases
npm run release          # Auto version bump
npm run release:minor    # Force minor bump
npm run release:major    # Force major bump
npm run release:patch    # Force patch bump

# Maintenance
npm run clean            # Remove all node_modules
npm run fresh            # Clean + reinstall
```

---

## Git Workflow

### Conventional Commits

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Commit Types

| Type | Description | Changelog Section |
|------|-------------|-------------------|
| `feat` | New feature | ✨ Features |
| `fix` | Bug fix | 🐛 Bug Fixes |
| `docs` | Documentation only | 📚 Documentation |
| `style` | Formatting, no code change | 💄 Styling |
| `refactor` | Code refactoring | ♻️ Code Refactoring |
| `perf` | Performance improvement | ⚡ Performance |
| `test` | Adding tests | ✅ Tests |
| `chore` | Maintenance (hidden from changelog) | - |
| `revert` | Revert previous commit | ⏪ Reverts |

#### Scopes

| Scope | Description |
|-------|-------------|
| `app` | Main application |
| `docs` | Documentation site |
| `chart` | Chart component/feature |
| `timeline` | Timeline component |
| `simulation` | Simulation engine |
| `formula` | Formula calculations |
| `ui` | UI components |
| `config` | Configuration |
| `deps` | Dependencies |
| `ci` | CI/CD |
| `release` | Release-related |

#### Examples

```bash
# Good commits ✅
feat(chart): add zoom reset button
fix(simulation): correct rounding in interest calculation
docs(tutorial): update getting started guide
refactor(app): move app.tsx to src directory
chore(deps): upgrade react to v18.3.1

# Bad commits ❌
Added new feature          # Missing type and scope
Fix bug                    # Missing scope
Update documentation       # Using past tense instead of imperative
feat(Chart): Add Feature   # Capitalized (should be lowercase)
```

> [!IMPORTANT]
> **Commitlint** is enforced via Husky git hooks. Invalid commits will be **rejected**.

---

## Versioning Semantics

FinSim Pro follows [Semantic Versioning 2.0.0](https://semver.org/) (`MAJOR.MINOR.PATCH`):

### Version Bump Rules

Given a version number `MAJOR.MINOR.PATCH`, increment the:

1. **MAJOR** version when you make incompatible API changes
2. **MINOR** version when you add functionality in a backward compatible manner
3. **PATCH** version when you make backward compatible bug fixes

### Automated Versioning

We use [`standard-version`](https://github.com/conventional-changelog/standard-version) to automate:
- Version bumping (based on conventional commits)
- `CHANGELOG.md` generation
- Git tagging

#### How It Works

```bash
# Analyze commits since last tag
# Determine version bump automatically
npm run release

# Force specific bump
npm run release:patch   # 1.0.0 → 1.0.1
npm run release:minor   # 1.0.0 → 1.1.0
npm run release:major   # 1.0.0 → 2.0.0
```

#### Release Process

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

### Changelog Structure

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

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### 1. **Deployment Workflow** (`.github/workflows/deploy.yml`)

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

#### 2. **Release Workflow** (`.github/workflows/release.yml`)

**Trigger**: Push tag matching `v*.*.*`

**Steps**:
1. Extract version from tag
2. Extract changelog for this version from `CHANGELOG.md`
3. Create GitHub Release with changelog notes

### Manual Deployment

If you need to deploy manually:

```bash
# Build everything
npm run build:all

# The deployment workflow will auto-deploy on push to main
git push origin main
```

---

## Docusaurus Versioning

### Creating New Version

When you're ready to snapshot the current docs as a new version:

```bash
cd docs
npm run docusaurus docs:version 1.1.0
```

This creates:
- `versioned_docs/version-1.1.0/` (snapshot of current docs)
- `versioned_sidebars/version-1.1.0-sidebars.json` (sidebar snapshot)
- Updates `versions.json`

### Version Structure

- **"Next 🚧"** (`/`) - Current development docs (unreleased features)
- **"1.0.0"** (`/1.0.0`) - Stable release docs

The version dropdown in the navbar allows users to switch between versions.

---

## Monorepo Structure

```
finsim-pro/
├── apps/
│   └── finsim/              # Main application
│       ├── src/             # Source code
│       ├── public/          # Static assets
│       ├── package.json     # App dependencies
│       └── vite.config.ts   # Vite configuration
├── docs/                    # Docusaurus documentation
│   ├── docs/                # Current docs
│   ├── versioned_docs/      # Versioned snapshots
│   ├── versioned_sidebars/  # Sidebar snapshots
│   └── versions.json        # Version list
├── .github/
│   └── workflows/           # GitHub Actions
├── .husky/                  # Git hooks
├── commitlint.config.js     # Commit validation
├── .versionrc               # Release configuration
└── package.json             # Workspace root
```

### Workspace Commands

All scripts are workspace-aware:

```bash
# Install dependencies for specific workspace
npm install <package> --workspace=apps/finsim
npm install <package> --workspace=docs

# Run script in specific workspace
npm run dev --workspace=apps/finsim
npm run build --workspace=docs

# Run script in all workspaces
npm run lint --workspaces --if-present
```

---

## Contributing

### Development Setup

1. **Clone repository**:
   ```bash
   git clone https://github.com/pechjacob/finsim-pro.git
   cd finsim-pro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development servers**:
   ```bash
   npm run dev:all
   ```
   - App: http://localhost:3000/finsim-pro/
   - Docs: http://localhost:3001/finsim-pro/docs/

### Workflow

1. **Create feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes** using conventional commits:
   ```bash
   git add .
   git commit -m "feat(chart): add new visualization option"
   ```

3. **Push and create PR**:
   ```bash
   git push origin feat/your-feature-name
   ```

4. **After merge**, create release:
   ```bash
   git checkout main
   git pull
   npm run release
   git push --follow-tags origin main
   ```
