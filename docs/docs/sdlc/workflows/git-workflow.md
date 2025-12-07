# Git Workflow

## Conventional Commits

All commits **must** follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

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

### Scopes

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

### Examples

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

## Branch Strategy

### Main Branch

- `main` - Production-ready code
- **No direct commits** (even for hotfixes)
- All changes merged via pull requests

### Feature Branches

```bash
# Naming convention
feat/feature-name
fix/bug-description
docs/documentation-update
```

### Workflow

1. Create branch from `main`
2. Make changes with conventional commits
3. Push and create PR
4. After merge, delete branch
