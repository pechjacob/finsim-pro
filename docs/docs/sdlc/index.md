---
sidebar_position: 6
---


# Release Notes

## Unreleased

**Features:**
- Complete color sync between chart and timeline
- Sync series colors to items via callback
- Add chart color indicators to event bars
- Add settings panel with multi-series toggle (#4)

**Bug Fixes:**
- Remove spaces from tailwind classes in toggle
- Add null check for crosshair series ref
- Remove callback and memoize items to fix infinite loop
- Remove callback prop and memoize filtered items
- Remove auto color callback to break infinite loop
- Use stable items key to prevent simulation loop
- Remove stableitems workaround no longer needed
- Prevent infinite loop with eslint disable
- Prevent simulation rerun when only chart color changes
- Remove items from item series data memo deps
- Memoize color callback to prevent render loops
- Stop infinite loop in series creation
- Restore missing series data call
- Hide total balance series when showing individual series
- Initialize visible range on page load
- Move color indicator to far right edge of bar

## v1.5.0 (Current)
* **chart:** add individual event area series visualization ([#3](https://github.com/pechjacob/finsim-pro/issues/3)) ([ff5eed6](https://github.com/pechjacob/finsim-pro/commit/ff5eed68a49ae32e42e46c5a8c2232194918519c)), closes [#3d8bd9](https://github.com/pechjacob/finsim-pro/issues/3d8bd9)
* individual event series data layer + testing ([#2](https://github.com/pechjacob/finsim-pro/issues/2)) ([ad31271](https://github.com/pechjacob/finsim-pro/commit/ad3127122e558284d5f93215cea99d2450ba9cdc))
* **ci:** move tag after amending release commit to include docs ([f3b3da0](https://github.com/pechjacob/finsim-pro/commit/f3b3da0cc9a8b0c9a9642e66054bdab5a6c1ba76))

## v1.4.0
* **ci:** fix version sync and add dev server restart automation ([e293798](https://github.com/pechjacob/finsim-pro/commit/e2937981c75c36bfd18fe065f6c9dc47a21c193f))
* **ui:** add filter reset icon and improve header spacing ([89db777](https://github.com/pechjacob/finsim-pro/commit/89db7770c0e2c6b827a0e8f0d156ba2e31092875))
* **ui:** add gradient styling to add new button and event timeline text ([abe59f3](https://github.com/pechjacob/finsim-pro/commit/abe59f3bac654f8ac4325dfa5cdab1b3923f6319))
* **ui:** add scoped delete functionality for selected items ([7db6cab](https://github.com/pechjacob/finsim-pro/commit/7db6cab3624b340820d4342c9c7453804ec11a4a))
* **ui:** implement multi-selection and refined toggle logic ([a46ca17](https://github.com/pechjacob/finsim-pro/commit/a46ca1794a55fef7652263fac7acb355f2880fda))
* **ui:** refine timeline header layout and add new controls ([85685c8](https://github.com/pechjacob/finsim-pro/commit/85685c887049dc95d8fc984d7db50a9af0a0fdf9))
* **ui:** refine timeline search and filter ui ([67875cf](https://github.com/pechjacob/finsim-pro/commit/67875cf7bf0dfb25355805ab2f1601bb1a732a89))
* **ui:** replace add buttons with cascading dropdown menu ([49d761b](https://github.com/pechjacob/finsim-pro/commit/49d761b59aa85e3b34957efec4a604d0be6a135e))
* **ci:** fix vite 6 es module compatibility for version count ([8ba0703](https://github.com/pechjacob/finsim-pro/commit/8ba0703e1ce19476a46beceffc30844a0c654071))
* **docs:** remove legacy labels and fix header spacing ([4628cf7](https://github.com/pechjacob/finsim-pro/commit/4628cf7d44c9bd985a5a6e46028a7065487f4a62))
* **docs:** update next banner wording and sync app version to 1.3.0 ([c3d317e](https://github.com/pechjacob/finsim-pro/commit/c3d317eb6d6158928ac09516c9eba5e0409b2f09))
* **docs:** update release notes formatting and legacy labels ([cf98b62](https://github.com/pechjacob/finsim-pro/commit/cf98b62daed8dd3a57b948abb2f78eda0387bbde))
* **ui:** add timeline filter active state and search hover ([57d0835](https://github.com/pechjacob/finsim-pro/commit/57d08352b285d1f244003bf25f3562365ad7160b))
* **ui:** connect select toggle to filter dropdown with unified styling ([ac3b3e0](https://github.com/pechjacob/finsim-pro/commit/ac3b3e02dbfd285792b8c7650d7e69d3653aa1e1))
* **ui:** correct cascading menu arrow rotation and hover behavior ([25fa377](https://github.com/pechjacob/finsim-pro/commit/25fa3771851891784deabf920bf06f2d1059e49e))
* **ui:** correct formula view filter width and collapse behavior ([46648a0](https://github.com/pechjacob/finsim-pro/commit/46648a03392e8df3120ab1871f574d67b9be1c2c))
* **ui:** correct select toggle icon states and disable visibility toggle when nothing selected ([6918855](https://github.com/pechjacob/finsim-pro/commit/69188558a6f265c63178e210e724f4ec019b97a4))
* **ui:** implement persistent search bar active state ([4dabb65](https://github.com/pechjacob/finsim-pro/commit/4dabb650794891d35c90f5e0d54fc64f5a88ddfa))
* **ui:** increase submenu z-index and reduce gap between select and filter ([c20aae5](https://github.com/pechjacob/finsim-pro/commit/c20aae5e9dc575ab7566015f079f3675c3153309))
* **ui:** match select toggle height to filter and remove gap ([190a7ce](https://github.com/pechjacob/finsim-pro/commit/190a7ce1ffeb3ea363c0217668917e0b5b440ceb))
* **ui:** rearrange timeline header layout ([f095f2c](https://github.com/pechjacob/finsim-pro/commit/f095f2c410d4cbba0d8fe0981411a42cf3958ee2))
* **ui:** refine search bar width and hover highlights ([8e07c52](https://github.com/pechjacob/finsim-pro/commit/8e07c52f6b1dda74c867b105ea456d425c6656d1))
* **ui:** remove box from select toggle and fix cascading menu z-index ([7603e62](https://github.com/pechjacob/finsim-pro/commit/7603e625c3078823b21abb07ddba6fea68a6cd58))
* **ui:** remove gap completely and fix submenu overflow clipping ([6f60e2d](https://github.com/pechjacob/finsim-pro/commit/6f60e2d35dc0214934a7ddb0d18e743264c451fd))
* **ui:** resize select toggle icon to match filter height ([85bb587](https://github.com/pechjacob/finsim-pro/commit/85bb587c5b4a446dfdc14c6350cb1034e6d70358))
* **ui:** resolve submenu clipping and align toggle heights ([9bbdf92](https://github.com/pechjacob/finsim-pro/commit/9bbdf92792c17046018cec99c10f42ae797d81c9))
* **ui:** restore search bar border and fix icon focus state ([6103f70](https://github.com/pechjacob/finsim-pro/commit/6103f704ed1a22bbd73c7fde55f2709b95cccac3))
* **ui:** separate select toggle from filter and fix cascading menu submenu visibility ([27acd66](https://github.com/pechjacob/finsim-pro/commit/27acd66b394db3189eb624cecfb364a532a7da01))
* **ui:** standardize timeline filter width and add chevron ([7637b49](https://github.com/pechjacob/finsim-pro/commit/7637b49ab1ac870f406d343b551e469df0868e90))

## v1.3.0
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
