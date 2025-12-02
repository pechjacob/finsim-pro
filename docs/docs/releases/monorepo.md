# Monorepo Structure

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

## Workspace Commands

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
