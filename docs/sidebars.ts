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
  ],

  // Releases sidebar
  releasesSidebar: [
    {
      type: 'doc',
      id: 'releases/index',
      label: 'Release Notes',
    },
    'releases/workflows',
    'releases/git-workflow',
    'releases/versioning',
    'releases/cicd',
    'releases/docusaurus',
    'releases/monorepo',
    'releases/contributing',
  ],
};

export default sidebars;
