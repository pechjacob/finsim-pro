---
description: Project rules and conventions for FinSim Pro
---

# FinSim Pro - Project Rules

## Project Structure

### Monorepo Organization

```
finsim-pro/
├── apps/finsim/          # Main React application
├── docs/                 # Docusaurus documentation
├── .github/workflows/    # CI/CD pipelines
├── .husky/              # Git hooks
└── .agent/              # Antigravity IDE config
```

**Critical Rules:**
- ✅ **NEVER** modify versioned docs (`docs/versioned_docs/`) directly
- ✅ **ALWAYS** edit current docs in `docs/docs/`, then version when ready
- ✅ **NEVER** commit directly to `main` (except hotfixes)
- ✅ **ALWAYS** use feature branches

### File Placement

| File Type | Location |
|-----------|----------|
| React components | `apps/finsim/src/components/` |
| Services/Business logic | `apps/finsim/src/services/` |
| Types | `apps/finsim/src/types.ts` |
| Utilities | `apps/finsim/src/utils.ts` |
| Documentation | `docs/docs/` |
| Configuration | Root or workspace root |

## Commit Conventions

### Mandatory Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Rules
- ✅ Type and scope MUST be lowercase
- ✅ Description MUST start with lowercase
- ✅ Description MUST NOT end with period
- ✅ Max header length: 100 characters
- ❌ NO capitalized words in subject
- ❌ NO past tense ("added" → use "add")

### Valid Types

| Type | When to Use | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | None |
| `style` | Code formatting | None |
| `refactor` | Code restructuring | PATCH |
| `perf` | Performance improvement | PATCH |
| `test` | Adding tests | None |
| `chore` | Maintenance | None |
| `revert` | Reverting changes | None |

### Valid Scopes

`app`, `docs`, `chart`, `timeline`, `simulation`, `formula`, `ui`, `config`, `deps`, `ci`, `release`

### Examples

✅ **Good:**
```bash
feat(chart): add zoom reset button
fix(simulation): correct compound interest calculation
docs(tutorial): update getting started guide
chore(deps): upgrade react to v18.3.1
```

❌ **Bad:**
```bash
Added new feature           # Missing type/scope, capitalized
fix: Bug fix                # Missing scope
Update docs                 # Wrong tense, no type
feat(Chart): Add Feature    # Capitalized
```

## Versioning

### Semantic Versioning

`MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Version Bumping

Automatically determined by commits:
- `feat:` → MINOR bump
- `fix:`, `perf:`, `refactor:` → PATCH bump
- `BREAKING CHANGE:` in footer → MAJOR bump

### Breaking Changes

Include in commit footer:

```
feat(api): change data structure

BREAKING CHANGE: Response format changed from {result} to {data}
```

## Code Style

### TypeScript

- Use TypeScript for all new code
- Define types explicitly (avoid `any`)
- Use interfaces for object shapes
- Use types for unions/intersections

### React

- Functional components only
- Use hooks (useState, useEffect, useMemo, useCallback)
- Props destructuring in function signature
- Explicit return types for components

### Imports

Organize imports:
1. React imports
2. Third-party libraries
3. Local components
4. Local utilities/types
5. Styles

```typescript
import React, { useState } from 'react';
import { createChart } from 'lightweight-charts';
import { Sidebar } from './components/Sidebar';
import { formatDate } from './utils';
import './index.css';
```

## Testing

### Before Committing

```bash
npm run lint              # Type check all workspaces
npm run app:build         # Verify app builds
npm run docs:build        # Verify docs build
```

### Local Development

```bash
npm run dev:all           # Run both app and docs
```

## Documentation

### When to Document

- ✅ New features → Tutorial or guide
- ✅ API changes → API reference
- ✅ Architecture changes → Architecture docs
- ✅ Breaking changes → Migration guide

### Documentation Format

- Use GitHub-flavored Markdown
- Include code examples
- Use alerts for important info (`> [!IMPORTANT]`)
- Add screenshots for UI features

### AI Assistant Guidelines

- ✅ **ALWAYS** check `docs/build/llms.txt` before planning documentation changes to understand the structure.
- ✅ **ALWAYS** run `npm run docs:build` after editing docs to verify `llms.txt` generation.
- 💡 Use the `/docs` workflow for step-by-step guidance.

## Dependencies

### Installing

```bash
# App dependencies
npm install <package> --workspace=apps/finsim

# Docs dependencies  
npm install <package> --workspace=docs

# Dev dependencies (root)
npm install -D <package>
```

### Updating

- Review CHANGELOG before upgrading major versions
- Test thoroughly after dependency updates
- Commit dependency updates separately

## Workflow

### Feature Development

1. Create branch: `feat/feature-name`
2. Make changes with conventional commits
3. Test locally (`npm run lint`, `npm run build:all`)
4. Push and create PR
5. After merge → delete branch

### Release Process

1. Ensure on `main` with clean state
2. Run `npm run release` (auto-detects version)
3. Review `CHANGELOG.md` changes
4. Push with tags: `git push --follow-tags origin main`
5. GitHub Actions handles deployment

### Hotfix Process

1. Create branch: `fix/critical-bug`
2. Make fix with `fix:` commit
3. Merge to main
4. Run `npm run release:patch`
5. Push with tags

## CI/CD

### Automatic Deployment

- **Trigger**: Push to `main`
- **Builds**: App + Docs
- **Deploys**: GitHub Pages
- **URLs**: 
  - App: https://pechjacob.github.io/finsim-pro/
  - Docs: https://pechjacob.github.io/finsim-pro/docs/

### Automatic Releases

- **Trigger**: Push tag `v*.*.*`
- **Creates**: GitHub Release with changelog

## Git Hooks

### commit-msg (Husky)

Validates commit messages against commitlint rules.

**Enforced automatically** - invalid commits are rejected.

## Build Tools

### App (Vite)

- Dev: `npm run app:dev` (port 3000)
- Build: `npm run app:build`
- Output: `apps/finsim/dist/`

### Docs (Docusaurus)

- Dev: `npm run docs:dev` (port 3001)
- Build: `npm run docs:build`  
- Output: `docs/build/`

## Environment Variables

Located in project root (`.env` - NOT committed):

```bash
GEMINI_API_KEY=your_key_here
```

Access in Vite:
```typescript
import.meta.env.GEMINI_API_KEY
```

## Common Mistakes to Avoid

❌ Editing versioned docs directly  
❌ Committing without running lint  
❌ Capitalizing commit messages  
❌ Installing deps in wrong workspace  
❌ Breaking changes without BREAKING CHANGE footer  
❌ Pushing to main without PR  
❌ Forgetting to push tags after release
