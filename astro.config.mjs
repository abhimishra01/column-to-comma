import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import site from './src/site.config.ts';

// PAGES_BASE and PAGES_SITE are set only for the GitHub Pages build (see .github/workflows/pages.yml).
// Contact and Terms are thin pages with noindex, so they stay out of the sitemap.
const noindexFilter = (page) => !/\/(contact|terms)\/$/.test(page);

export default defineConfig({
  site: site.bingemind ? 'https://bingemind.com' : (process.env.PAGES_SITE || 'https://bingemind.com'),
  base: site.bingemind ? '/column-to-comma/' : (process.env.PAGES_BASE || '/'),
  output: 'static',
  trailingSlash: 'always',
  compressHTML: true,
  integrations: [sitemap({ filter: noindexFilter })],
  vite: { plugins: [tailwindcss()] },
});
