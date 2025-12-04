# Documentation Workflow

## Creating New Version

When ready to snapshot current docs:

```bash
cd docs
npm run docusaurus docs:version 1.1.0
```

This creates:
- `versioned_docs/version-1.1.0/` - Snapshot
- `versioned_sidebars/version-1.1.0-sidebars.json` - Sidebar snapshot
- Updates `versions.json`

## Version Structure

- **"Next 🚧"** (`/`) - Development docs (unreleased)
- **"1.0.0"** (`/1.0.0`) - Stable release

## Writing Documentation

### Adding New Pages

1. Create `.md` file in `docs/docs/`
2. Add frontmatter:
   ```markdown
   ---
   sidebar_position: 1
   ---
   ```
3. Update `sidebars.ts` if needed

### Formatting

- Use GitHub-flavored Markdown
- Add code blocks with language hints
- Use alerts for important information:
  ```markdown
  > [!NOTE]
  > Helpful information
  
  > [!TIP]
  > Best practice
  
  > [!IMPORTANT]
  > Critical requirement
  
  > [!WARNING]
  > Breaking change
  ```
