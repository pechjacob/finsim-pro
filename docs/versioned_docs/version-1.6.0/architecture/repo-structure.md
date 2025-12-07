# Repository Structure

```
finsim-pro/
├── .git/
├── .gitignore
├── .github/
│   └── workflows/
│       ├── deploy.yml           # GitHub Pages deployment
│       └── release.yml           # Automated releases
├── .husky/
│   └── commit-msg               # Commitlint hook
├── CHANGELOG.md
├── README.md
├── commitlint.config.js
├── package.json                 # Workspace root
├── package-lock.json
├── .versionrc                   # standard-version config
│
├── apps/
│   └── finsim/                  # Main application
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       ├── postcss.config.js
│       ├── vite-env.d.ts
│       ├── public/
│       │   └── FinSim-Logo.png
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── index.css
│           ├── types.ts
│           ├── utils.ts
│           ├── components/
│           │   ├── FinancialChart.tsx
│           │   ├── LightweightFinancialChart.tsx
│           │   ├── Sidebar.tsx
│           │   ├── TimelineEvents.tsx
│           │   ├── TimelineSyncChart.tsx
│           │   └── FormulaDisplay.tsx
│           └── services/
│               └── simulation.ts
│
└── docs/                        # Docusaurus documentation
    ├── package.json
    ├── docusaurus.config.ts
    ├── sidebars.ts
    ├── versions.json
    ├── docs/                    # Next version
    │   ├── intro.md
    │   ├── api.md
    │   ├── features/
    │   │   ├── chart.md
    │   │   ├── timeline.md
    │   │   ├── accounts.md
    │   │   └── formulas.md
    │   ├── tutorials/
    │   │   ├── index.md
    │   │   ├── first-simulation.md
    │   │   ├── creating-events.md
    │   │   ├── interest-effects.md
    │   │   └── analyzing-results.md
    │   ├── architecture/
    │   │   ├── data-models.md
    │   │   └── repo-structure.md
    │   └── sdlc/
    │       ├── index.md
    │       ├── workflows/
    │       │   ├── git-workflow.md
    │       │   ├── dev-workflow.md
    │       │   ├── gh-workflow.md
    │       │   ├── docs-workflow.md
    │       │   └── npm-workflow.md
    │       ├── versioning/
    │       │   ├── semantics.md
    │       │   ├── version-bump-rules.md
    │       │   ├── automated-versioning.md
    │       │   ├── release-process.md
    │       │   ├── changelog-structure.md
    │       │   └── docs-versioning.md
    │       └── contributing.md
    ├── versioned_docs/          # Released versions
    │   └── version-1.0.0/
    ├── versioned_sidebars/
    │   └── version-1.0.0-sidebars.json
    ├── blog/
    ├── src/
    │   ├── css/
    │   │   └── custom.css
    │   └── pages/
    │       └── 404.md
    └── static/
        └── img/
            └── FinSim-Logo.png
```

## Key Directories

### `/apps/finsim/`
Main React application with Vite build system.

### `/docs/`
Docusaurus documentation site with versioning support.

### `/.github/workflows/`
GitHub Actions CI/CD pipelines.

### `/.husky/`
Git hooks for commit message validation.

## Workspace Commands

```bash
# Install in specific workspace
npm install <package> --workspace=apps/finsim
npm install <package> --workspace=docs

# Run script in specific workspace
npm run dev --workspace=apps/finsim
npm run build --workspace=docs

# Run in all workspaces
npm run lint --workspaces --if-present
```
