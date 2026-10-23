import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { nederlandseApostrof } from './src/lib/apostrof.mjs';

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
  // Smartypants blijft aan, maar maakt van de apostrof in "'s avonds"
  // een openend aanhalingsteken. Deze plugin draait erna en zet alleen
  // dat geval terug; zie src/lib/apostrof.mjs.
  markdown: { rehypePlugins: [nederlandseApostrof] },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } }
});
