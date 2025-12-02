# Changelog Structure

The changelog is auto-generated and follows [Keep a Changelog](https://keepachangelog.com/) format.

## Format

```markdown
# Changelog

## [1.1.0] (2024-12-01)

### ✨ Features
- **chart**: add zoom reset button ([abc1234](link))
- **timeline**: implement event filtering ([def5678](link))

### 🐛 Bug Fixes
- **simulation**: correct interest calculation ([ghi9012](link))

### 📚 Documentation
- **tutorial**: add event management guide ([jkl3456](link))

### ♻️ Code Refactoring
- **app**: reorganize component structure ([jkl7890](link))

## [1.0.0] (2024-11-15)

### ✨ Features
- **app**: initial release
```

## Sections

| Section | Emoji | Commit Types |
|---------|-------|--------------|
| Features | ✨ | `feat:` |
| Bug Fixes | 🐛 | `fix:` |
| Documentation | 📚 | `docs:` |
| Styling | 💄 | `style:` |
| Code Refactoring | ♻️ | `refactor:` |
| Performance | ⚡ | `perf:` |
| Tests | ✅ | `test:` |
| Reverts | ⏪ | `revert:` |

## Hidden Types

These don't appear in changelog:
- `chore:` - Maintenance tasks
- `build:` - Build system changes
- `ci:` - CI configuration

## Links

Each entry includes:
- **Commit hash** link to GitHub commit
- **Scope** highlighted in bold
- **Description** from commit message

## Version Comparison

Footer includes version comparison links:

```markdown
[1.1.0]: https://github.com/.../compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/.../releases/tag/v1.0.0
```
