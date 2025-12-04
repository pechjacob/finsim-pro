# NPM Workflow

## Quick Commands

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

## Workspace Commands

### Installing Dependencies

```bash
# Install in specific workspace
npm install <package> --workspace=apps/finsim
npm install <package> --workspace=docs

# Install dev dependency
npm install -D <package> --workspace=apps/finsim
```

### Running Scripts

```bash
# Run in specific workspace
npm run dev --workspace=apps/finsim
npm run build --workspace=docs

# Run in all workspaces
npm run lint --workspaces --if-present
```
