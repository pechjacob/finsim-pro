# Contributing

## Development Setup

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

## Workflow

> **IMPORTANT**: For the complete SDLC process, see [Complete Development Workflow](./complete-workflow.md)

### Quick Start

1. **Create feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes** using conventional commits:
   ```bash
   git add .
   git commit -m "feat(chart): add new visualization option"
   ```
   
   **Post-commit automation:**
   - Husky hook automatically updates "Unreleased" section in release notes
   - Changes visible in "Next" docs version

3. **Preview changelog** (optional):
   ```bash
   npm run changelog:preview
   ```

4. **Push and create PR**:
   ```bash
   git push origin feat/your-feature-name
   ```

5. **After merge**, preview and create release:
   ```bash
   git checkout main
   git pull
   npm run release:preview  # Preview first
   npm run release          # Standard release
   # OR
   npm run release:dev      # Release + Auto-restart dev servers
   
   git push --follow-tags origin main
   ```
   
   **What `npm run release` does automatically**:
   - Bumps version in all package.json files (root, app, docs)
   - Generates CHANGELOG.md
   - Versions documentation (creates snapshot)
   - Auto-syncs to release notes
   - Creates commit and git tag

## Changelog Automation

### Scripts

- `npm run changelog:preview` - View unreleased changes in CLI
- `npm run changelog:sync` - Manually sync to docs (auto on commit)
- `npm run release:preview` - Preview next version and changelog

### Post-Commit Hook

Every conventional commit automatically:
- Analyzes commits since last tag
- Updates `/docs/docs/sdlc/index.md` (Unreleased section)
- Shows changes in "Next" docs version

### Release Process

When you run `npm run release`:
- Bumps version based on commits
- Generates `CHANGELOG.md`
- Auto-syncs to release notes docs
- Creates commit and git tag

For details, see [Changelog Automation](./changelog-automation.md)
