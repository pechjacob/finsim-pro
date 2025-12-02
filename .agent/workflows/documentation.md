---
description: How to add or update documentation
---

# Update Documentation

## 1. Start Docs Server

```bash
// turbo
npm run docs:dev
```

Visit: http://localhost:3001/finsim-pro/docs/

## 2. Choose Location

### New Tutorial

```bash
nano docs/docs/tutorials/my-tutorial.md
```

Add to sidebar:
```typescript
// docs/sidebars.ts
tutorialsSidebar: [
  // ...
  'tutorials/my-tutorial',
],
```

### Update Existing

```bash
nano docs/docs/path/to/existing.md
```

### New Feature Doc

```bash
nano docs/docs/features/my-feature.md
```

## 3. Write Content

Use GitHub-flavored Markdown:

```markdown
---
sidebar_position: 1
---

# Page Title

Brief introduction.

## Section

Content with **bold** and *italic*.

### Code Example

\`\`\`typescript
const example = "code";
\`\`\`

### Alert

> [!IMPORTANT]
> Critical information here
```

## 4. Add Screenshots (if needed)

```bash
# Take screenshot and save to:
cp ~/Desktop/screenshot.png docs/static/img/screenshots/

# Reference in docs:
![Description](/img/screenshots/screenshot.png)
```

## 5. Preview

Check localhost:3001 to verify:
- ✅ Formatting correct
- ✅ Code blocks render
- ✅ Images display
- ✅ Links work

## 6. Commit

```bash
git add docs/
git commit -m "docs(topic): add/update documentation"
```

Examples:
```bash
docs(tutorial): add event creation guide
docs(api): update simulation parameters
docs(feature): document chart zoom controls
```

## 7. Push

```bash
git push origin <branch-name>
```

## Update Architecture Docs

For code structure changes:

```bash
nano docs/docs/architecture/data-models.md
# or
nano docs/docs/architecture/repo-structure.md

git add docs/
git commit -m "docs(architecture): update data models"
```

## Update SDLC Docs

For workflow/process changes:

```bash
nano docs/docs/sdlc/workflows/git-workflow.md
# or other SDLC files

git add docs/
git commit -m "docs(sdlc): update git workflow"
```
