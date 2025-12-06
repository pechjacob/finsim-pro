# Development Workflow

## Local Development

### 1. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 2. Start Development Servers

```bash
# Both app and docs
npm run dev:all

# App only (port 3000)
npm run app:dev

# Docs only (port 3001)  
npm run docs:dev
```

### 3. Make Changes

- Edit source files in `apps/finsim/src/`
- Edit docs in `docs/docs/`
- Hot reload is enabled for both

### 4. Test Changes

```bash
# Type checking
npm run lint

# Visual testing in browser
# App: http://localhost:3000/finsim-pro/
# Docs: http://localhost:3001/finsim-pro/docs/
```

## Building

```bash
# Build app only
npm run app:build

# Build docs only
npm run docs:build

# Build both
npm run build:all
```

## Maintenance

```bash
# Remove all node_modules
npm run clean

# Clean install
npm run fresh
```
