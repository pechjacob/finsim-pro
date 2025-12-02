# Documentation Versioning

## Creating New Version

When you're ready to snapshot the current docs as a new version:

```bash
cd docs
npm run docusaurus docs:version 1.1.0
```

This creates:
- `versioned_docs/version-1.1.0/` (snapshot of current docs)
- `versioned_sidebars/version-1.1.0-sidebars.json` (sidebar snapshot)
- Updates `versions.json`

## Version Structure

- **"Next 🚧"** (`/`) - Current development docs (unreleased features)
- **"1.0.0"** (`/1.0.0`) - Stable release docs

The version dropdown in the navbar allows users to switch between versions.
