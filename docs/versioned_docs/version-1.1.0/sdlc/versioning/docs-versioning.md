# Documentation Versioning

## Creating New Version

Snapshot current docs as a versioned release:

```bash
cd docs
npm run docusaurus docs:version 1.1.0
```

## What Gets Created

```
docs/
├── versions.json                    # ["1.1.0", "1.0.0"]
├── versioned_docs/
│   ├── version-1.1.0/              # Snapshot of docs
│   └── version-1.0.0/
└── versioned_sidebars/
    ├── version-1.1.0-sidebars.json # Sidebar snapshot
    └── version-1.0.0-sidebars.json
```

## Version URLs

- **Next** (development): `/` 
- **1.1.0** (latest): `/1.1.0`
- **1.0.0** (previous): `/1.0.0`

## Version Dropdown

Automatically appears in navbar:

```typescript
// docusaurus.config.ts
docs: {
  lastVersion: 'current',
  versions: {
    current: {
      label: 'Next 🚧',
      banner: 'unreleased',
    },
    '1.1.0': {
      label: '1.1.0',
    },
  },
}
```

## Best Practices

### When to Version

- ✅ Major releases (1.0.0, 2.0.0)
- ✅ Minor releases with significant changes (1.1.0)
- ❌ Patch releases (1.0.1, 1.0.2)

### Editing Versions

- **Current docs** (`docs/`): Always edit here first
- **Versioned docs**: Only for critical fixes

### Deleting Versions

```bash
# Remove from versions.json
# Delete folder from versioned_docs/
# Delete file from versioned_sidebars/
```
