import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wesleyvaders.nl',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (pagina) => !pagina.includes('/beheer/') })],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } }
});
