---
description: How to make documentation updates for FinSim Pro
---

# Documentation Workflow

Use this workflow when making ANY changes to the documentation.

1. **Context Loading**:
   - Before planning changes, read `docs/build/llms.txt` (or `llms-full.txt` if deep context is needed) to understand the current documentation structure and content.
   - Use the `read_file` or `view_file` tool on these files.
   - If they don't exist, run `npm run docs:build` first.

2. **Making Changes**:
   - Edit files in `docs/docs/`.
   - **DO NOT** edit `docs/versioned_docs/` directly.
   - Follow standard markdown guidelines.

3. **Verification**:
   - Run `npm run docs:build`.
   - Verify `llms.txt` is updated.
   - If verifying visual changes, use `npm run docs:dev` (port 3001).

4. **Commit**:
    - Use `docs(scope): description` format.
