---
sidebar_position: 6
---


# Release Notes

## Unreleased

**Features:**
- Replace add buttons with cascading dropdown menu
- Implement multi-selection and refined toggle logic
- Refine timeline header layout and add new controls
- Refine timeline search and filter ui
- Fix version sync and add dev server restart automation

**Bug Fixes:**
- Separate select toggle from filter and fix cascading menu submenu visibility
- Connect select toggle to filter dropdown with unified styling
- Correct cascading menu arrow rotation and hover behavior
- Correct select toggle icon states and disable visibility toggle when nothing selected
- Fix vite 6 es module compatibility for version count
- Remove legacy labels and fix header spacing
- Update release notes formatting and legacy labels
- Update next banner wording and sync app version to 1.3.0

## v1.3.0 (Current)
**Documentation:**
* **ci:** add master sdlc workflow and update contributing guide ([369409e](https://github.com/pechjacob/finsim-pro/commit/369409e943db88e1c6d31581c0370cc770d1f82a))
* **ci:** make docs versioning mandatory for all releases ([78eb59c](https://github.com/pechjacob/finsim-pro/commit/78eb59ce887224a243cbfce527d58a4a412e8414))
* **ci:** update workflows for changelog automation ([0b15611](https://github.com/pechjacob/finsim-pro/commit/0b15611c5bdfd627e5ea90c6c1a8dc5bce53095f))
* **docs:** update workflow guide and release notes ([dc67ff3](https://github.com/pechjacob/finsim-pro/commit/dc67ff3735a2fa8b662ce3eff5fb249b5f834169))

**Features:**
* **app:** implement dynamic versioning with git describe ([95d26c5](https://github.com/pechjacob/finsim-pro/commit/95d26c55db8b56c020b8ffd61ac1245f2ed2199c))
* **ci:** add changelog automation and preview scripts ([3f07f88](https://github.com/pechjacob/finsim-pro/commit/3f07f88f6183c57933f18b8f8e3d840b3337b2cc))
* **ci:** automate docs versioning and enhance release preview ([eb5b5e4](https://github.com/pechjacob/finsim-pro/commit/eb5b5e42af7a0a43b1e75fb0162b11299c95eb12))
* **ui:** enhance debug panel with slider toggle and version info ([aa8b05c](https://github.com/pechjacob/finsim-pro/commit/aa8b05ce264f0cffd24e9cfc5e4e61424ce3f37e))

**Bug Fixes:**
* **ci:** sync monorepo versions and add spa routing support ([b3fca7d](https://github.com/pechjacob/finsim-pro/commit/b3fca7d1005bacc11b56248cd392700e54ae7892))
* **docs:** restructure release notes with unreleased at top ([1bdd3aa](https://github.com/pechjacob/finsim-pro/commit/1bdd3aaeb2d647183bdd6b0e6086c2a3d54270f5))

## v1.2.0
**Features:**
* **app:** implement dynamic versioning with git describe ([95d26c5](https://github.com/pechjacob/finsim-pro/commit/95d26c55db8b56c020b8ffd61ac1245f2ed2199c))
* **ci:** add changelog automation and preview scripts ([3f07f88](https://github.com/pechjacob/finsim-pro/commit/3f07f88f6183c57933f18b8f8e3d840b3337b2cc))
* **ui:** enhance debug panel with slider toggle and version info ([aa8b05c](https://github.com/pechjacob/finsim-pro/commit/aa8b05ce264f0cffd24e9cfc5e4e61424ce3f37e))
* **ci:** add master sdlc workflow and update contributing guide ([369409e](https://github.com/pechjacob/finsim-pro/commit/369409e943db88e1c6d31581c0370cc770d1f82a))
* **ci:** update workflows for changelog automation ([0b15611](https://github.com/pechjacob/finsim-pro/commit/0b15611c5bdfd627e5ea90c6c1a8dc5bce53095f))
* **docs:** update workflow guide and release notes ([dc67ff3](https://github.com/pechjacob/finsim-pro/commit/dc67ff3735a2fa8b662ce3eff5fb249b5f834169))

## v1.1.0
*   **Landing Page**: New landing page with modern glass-morphism navbar
*   **Routing**: React Router integration with `/finsim-pro` and `/finsim-pro/app` routes
*   **Bug Fixes**: Resolved TypeScript build errors and CI deployment issues

## v1.0.0
*   **Initial Release**
*   Interactive Financial Chart
*   Event Timeline with Drag-and-Drop
*   Multiple Accounts Support
*   Custom Formulas & Interest Effects
*   Dark Mode UI

## v0.9.0 (Beta)
*   Beta testing release
*   Basic chart functionality
*   Simple income/expense tracking
