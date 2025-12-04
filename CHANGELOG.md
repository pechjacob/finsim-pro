# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/pechjacob/finsim-pro/compare/v1.1.0...v1.2.0) (2025-12-04)


### ✨ Features

* **app:** implement dynamic versioning with git describe ([95d26c5](https://github.com/pechjacob/finsim-pro/commit/95d26c55db8b56c020b8ffd61ac1245f2ed2199c))
* **ci:** add changelog automation and preview scripts ([3f07f88](https://github.com/pechjacob/finsim-pro/commit/3f07f88f6183c57933f18b8f8e3d840b3337b2cc))
* **ui:** enhance debug panel with slider toggle and version info ([aa8b05c](https://github.com/pechjacob/finsim-pro/commit/aa8b05ce264f0cffd24e9cfc5e4e61424ce3f37e))


### 📚 Documentation

* **ci:** add master sdlc workflow and update contributing guide ([369409e](https://github.com/pechjacob/finsim-pro/commit/369409e943db88e1c6d31581c0370cc770d1f82a))
* **ci:** update workflows for changelog automation ([0b15611](https://github.com/pechjacob/finsim-pro/commit/0b15611c5bdfd627e5ea90c6c1a8dc5bce53095f))
* **docs:** update workflow guide and release notes ([dc67ff3](https://github.com/pechjacob/finsim-pro/commit/dc67ff3735a2fa8b662ce3eff5fb249b5f834169))

## [1.1.0](https://github.com/pechjacob/finsim-pro/compare/v1.0.0...v1.1.0) (2025-12-03)


### 🐛 Bug Fixes

* **app:** disable strict unused checks temporarily for ci build to pass ([e436979](https://github.com/pechjacob/finsim-pro/commit/e43697993e81a7a915dd864081fc4bc36e158a53))
* **app:** resolve type narrowing issue in aggregate data function ([5c5d898](https://github.com/pechjacob/finsim-pro/commit/5c5d8986f32a0d591c177362d9154cbe6ec257e6))
* **app:** resolve typescript build errors for ci deployment ([54c4f30](https://github.com/pechjacob/finsim-pro/commit/54c4f30497c461caee68e3e37319df3d91474c74))
* **ci:** correct deployment artifact path to resolve 404 ([48b7e03](https://github.com/pechjacob/finsim-pro/commit/48b7e03e4d3866d98a896e8ded60350679471ac2))


### ✨ Features

* **app:** add landing page, routing, and glass navbar ([6bdc545](https://github.com/pechjacob/finsim-pro/commit/6bdc54517442bfae559728c2136d87942f36b794))

## 1.0.0 (2025-12-02)


### ✨ Features

* add timeline zoom tracking toggle and fix crosshair alignment ([855408c](https://github.com/pechjacob/finsim-pro/commit/855408c6dc2d348772e2c567c2064e28cc038898))
* **docs:** add version dropdown to navbar ([a91370e](https://github.com/pechjacob/finsim-pro/commit/a91370eb94ee36c99f10659c5bbef0ba9ab09813))
* **docs:** add versioning ui with dropdown and version 1.0.0 placeholder ([b24c40c](https://github.com/pechjacob/finsim-pro/commit/b24c40c8bc38fb41c6a2e3150d46faceb832d77e))
* implement smart tab switching with named windows ([15d053e](https://github.com/pechjacob/finsim-pro/commit/15d053ed2fcec01f5982b9a34007dc28701cd9d8))
* improve Docusaurus navigation and theming ([e960e5b](https://github.com/pechjacob/finsim-pro/commit/e960e5b40a411f7ac8654936b82655645bcda7d5))
* Initialize FinSim Pro project structure ([f8a82db](https://github.com/pechjacob/finsim-pro/commit/f8a82db7e1ac9606b8dd9a9f58feca768e2fb61b))


### 🐛 Bug Fixes

* **app:** move index.html to apps/finsim directory ([0041196](https://github.com/pechjacob/finsim-pro/commit/0041196748af22394847ab108bb3f7a503f346e4))
* **app:** update import paths after moving to src directory ([9373ae1](https://github.com/pechjacob/finsim-pro/commit/9373ae141b6642aad21a4a5379123ca14a74b1c5))
* **chart:** update lightweight-charts implementation for v4 compatibility ([f89018c](https://github.com/pechjacob/finsim-pro/commit/f89018c91b8c22645bcac04f4ce4591395b009f2))
* correct logo href to use pathname protocol ([c8cd504](https://github.com/pechjacob/finsim-pro/commit/c8cd504bdb94f29c4202a81977c9763e09acfd27))
* **deps:** add missing tailwind and dnd-kit dependencies ([c3af232](https://github.com/pechjacob/finsim-pro/commit/c3af2327ff8faee063d910a974969d134aaf1b8a))
* resolve broken links in footer and 404 page ([88e7585](https://github.com/pechjacob/finsim-pro/commit/88e7585d2229c0ff949b2434c70bc0b6517c0663))
* strip pathname:// protocol from logo link for correct prod navigation ([f3668dd](https://github.com/pechjacob/finsim-pro/commit/f3668dd89279355ce7d15bcfcebd4ee48585fbf7))
* swizzle Docusaurus Logo for correct main app navigation ([7addcff](https://github.com/pechjacob/finsim-pro/commit/7addcff2cde0d0da03a67cde4b6005ff4c3165c4))


### ♻️ Code Refactoring

* **app:** move app.tsx, main.tsx, and index.css to src directory ([97edb99](https://github.com/pechjacob/finsim-pro/commit/97edb99d17b6f5e2bcb70a0febcb12efc4640b9e))
* **docs:** restructure releases documentation into separate pages ([91c52fc](https://github.com/pechjacob/finsim-pro/commit/91c52fce96b54ced68ce8225877dd911b1b0492b))
* **docs:** restructure to sdlc with granular workflow and versioning pages ([ae53b5f](https://github.com/pechjacob/finsim-pro/commit/ae53b5fa7387b309ccfa8891f483012e2b1fbf86))
* **docs:** simplify releases sidebar structure to match features pattern ([5f6139f](https://github.com/pechjacob/finsim-pro/commit/5f6139f17dda692b8b4a8450d714e679b1821814))
* revert smart tab switching, use absolute URLs for reliable navigation ([760a48e](https://github.com/pechjacob/finsim-pro/commit/760a48e2a5c1f07df5298b3b7e6dd55a4a97a1fe))

# Changelog

All notable changes to FinSim Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Added
- Financial simulation application with compound interest
- Interactive chart visualization with lightweight-charts
- Event timeline with drag-and-drop
- Formula support for recurring and lump-sum events
- Interest effects (compound and simple)
- Account management with transfers
- Export/import simulation data (JSON)
- Docusaurus documentation site
- GitHub Pages deployment

### 🐛 Fixed
- Navigation between app and docs
- Logo linking to correct base path
- Dark mode default theme
- Sidebar hierarchies

### ♻️ Refactored
- Monorepo structure with workspaces (apps/finsim, docs/)
- Cleaned up navigation implementation
- Simplified URL handling between app and docs
