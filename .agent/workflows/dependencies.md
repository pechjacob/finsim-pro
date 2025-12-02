---
description: How to install or update dependencies
---

# Manage Dependencies

## Install New Dependency

### App Dependency

```bash
// turbo
npm install <package> --workspace=apps/finsim
```

Examples:
```bash
npm install recharts --workspace=apps/finsim
npm install lucide-react --workspace=apps/finsim
```

### Docs Dependency

```bash
// turbo
npm install <package> --workspace=docs
```

Examples:
```bash
npm install @docusaurus/plugin-google-analytics --workspace=docs
```

### Dev Dependency

```bash
// turbo
npm install -D <package> --workspace=apps/finsim
```

Examples:
```bash
npm install -D @types/node --workspace=apps/finsim
npm install -D prettier --workspace=apps/finsim
```

### Root Dev Dependency

For tools used across all workspaces:

```bash
// turbo
npm install -D <package>
```

Examples:
```bash
npm install -D eslint
npm install -D typescript
```

## Update Dependency

### Single Package

```bash
// turbo
npm update <package> --workspace=apps/finsim
```

### All Packages

```bash
// turbo
npm update --workspace=apps/finsim
// turbo
npm update --workspace=docs
```

## Remove Dependency

```bash
// turbo
npm uninstall <package> --workspace=apps/finsim
```

## After Installing

### 1. Test

```bash
// turbo
npm run dev:all
```

Verify app still works.

### 2. Build Test

```bash
// turbo
npm run build:all
```

### 3. Commit

```bash
git add package.json package-lock.json apps/finsim/package.json
git commit -m "chore(deps): add/update <package>"
```

Examples:
```bash
chore(deps): add recharts for alternative charting
chore(deps): upgrade react to v18.3.1  
chore(deps): remove unused lodash dependency
```

## Check Outdated

```bash
npm outdated --workspace=apps/finsim
npm outdated --workspace=docs
```

## Clean Install

If having dependency issues:

```bash
// turbo
npm run fresh
```

This runs:
1. Remove all `node_modules/`
2. `npm install`

## Security Updates

```bash
npm audit --workspace=apps/finsim
npm audit fix --workspace=apps/finsim
```

If manual fixes needed:
```bash
npm audit
# Review vulnerabilities
npm install <package>@<version> --workspace=apps/finsim
```
