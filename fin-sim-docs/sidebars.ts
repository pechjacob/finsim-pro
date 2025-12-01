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
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Getting Started',
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/first-simulation',
        'tutorials/creating-events',
        'tutorials/interest-effects',
        'tutorials/analyzing-results',
      ],
    },
    {
      type: 'doc',
      id: 'api',
      label: 'API Reference',
    },
    {
      type: 'doc',
      id: 'architecture',
      label: 'Architecture',
    },
    {
      type: 'doc',
      id: 'releases',
      label: 'Release Notes',
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
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/data-models',
      ],
    },
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Welcome',
    },
    {
      type: 'doc',
      id: 'getting-started',
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
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/first-simulation',
        'tutorials/creating-events',
        'tutorials/interest-effects',
        'tutorials/analyzing-results',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/architecture',
        'advanced/data-models',
      ],
    },
  ],
   */
};

export default sidebars;
