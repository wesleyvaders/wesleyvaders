import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { nederlandseApostrof } from './src/lib/apostrof.mjs';

export default defineConfig({
  site: 'https://wesleyvaders.nl',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // MDX staat er alleen voor verhalen die een component in de lopende
  // tekst nodig hebben, zoals de videoknop in si-ves-una-cruz. Gewone
  // verhalen blijven .md. extendMarkdownConfig staat standaard aan, dus
  // smartypants en de apostrof-plugin hieronder gelden er net zo goed.
  //
  // In de sitemap: /beheer/ is alleen voor Wesley, /weg/ is de pagina
  // achter ErrorDocument 410 en hoort niet vindbaar te zijn.
  integrations: [mdx(), sitemap({
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
