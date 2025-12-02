import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Home page (Getting Started) sidebar
  homeSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Getting Started',
    },
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/chart',
        'features/timeline',
        'features/accounts',
        'features/formulas',
      ],
    },
  ],

  // Tutorials sidebar
  tutorialsSidebar: [
    {
      type: 'doc',
      id: 'tutorials/index',
      label: 'Overview',
    },
    'tutorials/first-simulation',
    'tutorials/creating-events',
    'tutorials/interest-effects',
    'tutorials/analyzing-results',
  ],

  // API Reference sidebar
  apiSidebar: [
    {
      type: 'doc',
      id: 'api',
      label: 'API Reference',
    },
  ],

  // Architecture sidebar
  architectureSidebar: [
    {
      type: 'doc',
      id: 'architecture',
      label: 'Overview',
    },
    'architecture/data-models',
    'architecture/repo-structure',
  ],

  // SDLC sidebar
  sdlcSidebar: [
    {
      type: 'doc',
      id: 'sdlc/index',
      label: 'Release Notes',
    },
    {
      type: 'category',
      label: 'Workflows',
      items: [
        'sdlc/workflows/git-workflow',
        'sdlc/workflows/dev-workflow',
        'sdlc/workflows/gh-workflow',
        'sdlc/workflows/docs-workflow',
        'sdlc/workflows/npm-workflow',
      ],
    },
    {
      type: 'category',
      label: 'Versioning',
      items: [
        'sdlc/versioning/semantics',
        'sdlc/versioning/version-bump-rules',
        'sdlc/versioning/automated-versioning',
        'sdlc/versioning/release-process',
        'sdlc/versioning/changelog-structure',
        'sdlc/versioning/docs-versioning',
      ],
    },
    'sdlc/contributing',
  ],
};

export default sidebars;
