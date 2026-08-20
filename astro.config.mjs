import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wesleyvaders.nl',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } }
});
