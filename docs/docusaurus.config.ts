import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Determine the app URL based on the environment
// In dev, we want to point to the Vite dev server
// In prod, we want to point to the root of the domain
const isDev = process.env.NODE_ENV === 'development';
const appUrl = isDev ? 'http://localhost:3000/finsim-pro/' : 'https://pechjacob.github.io/finsim-pro/';

const config: Config = {
  title: 'FinSim Docs',
  tagline: 'Financial Simulation & Planning',
  favicon: 'img/FinSim-Logo.png',

  // Suppress the warning about baseUrl not being /
  baseUrlIssueBanner: false,

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true,
  },

  // Set the production url of your site here
  url: 'https://pechjacob.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/finsim-pro/docs/',

  // GitHub pages deployment config.
  organizationName: 'pechjacob',
  projectName: 'FinSim-Pro',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ["en"],
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: "/",
      }),
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],

          // Versioning configuration
          versions: {
            current: {
              label: 'Next 🚧',
              path: 'next',
              banner: 'unreleased',
            },
          },
        },
        blog: false, // Disable blog for now
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'FinSim Pro',
      logo: {
        alt: 'FinSim Pro Logo',
        src: 'img/FinSim-Logo.png',
        href: appUrl,
      },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Getting Started',
        },
        {
          type: 'doc',
          docId: 'tutorials/index',
          position: 'left',
          label: 'Tutorials',
        },
        {
          type: 'doc',
          docId: 'api',
          position: 'left',
          label: 'API Reference',
        },
        {
          type: 'doc',
          docId: 'architecture',
          position: 'left',
          label: 'Architecture',
        },
        {
          type: 'doc',
          docId: 'sdlc/index',
          position: 'left',
          label: 'SDLC',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/pechjacob/FinSim-Pro',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/',
            },
            {
              label: 'Tutorials',
              to: '/tutorials',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/pechjacob/FinSim-Pro',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} FinSim Pro. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
