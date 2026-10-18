import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://wesleyvaders.nl',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // /beheer/ is alleen voor Wesley, /weg/ is de pagina achter
  // ErrorDocument 410 en hoort niet als vindbare pagina te bestaan.
  integrations: [sitemap({
    // Op het hele pad vergelijken en niet met includes: een verhaal dat
    // op -weg eindigt, zoals planten-weg, hoort er gewoon in te staan.
    filter: (pagina) => !['/beheer/', '/weg/'].includes(new URL(pagina).pathname)
  })],
  image: { service: { entrypoint: 'astro/assets/services/sharp' } }
});
