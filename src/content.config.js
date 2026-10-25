import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* --------------------------------------------------------------
   Velden zijn nu gratis en later duur.
   Zodra er vijftig verhalen staan is een veld toevoegen werk voor
   vijftig bestanden. Daarom staan coordinaten, projectonderdeel en
   budgetcategorie er nu al in, ook al gebruiken we ze pas als de
   kaart en het budget bestaan. Alles optioneel, dus je hoeft niks
   in te vullen.
   -------------------------------------------------------------- */

const categorieen = [
  'De reis', 'Finca zoeken', 'Verbouwen', 'Spanje', 'Off-grid',
  'Geld & kosten', 'Ondernemen vanuit Spanje', 'Mowgli', 'Persoonlijk',
  'Krijg het er spaansbenauwd van'
];

const onderdelen = [
  'aankoop', 'elektriciteit', 'water', 'dak', 'keuken', 'badkamer',
  'slaapkamers', 'buitenruimte', 'zwembad', 'zonnepanelen', 'werkplaats',
  'tuin', 'olijfbomen'
];

const verhalen = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/verhalen' }),
  schema: ({ image }) => z.object({
    titel: z.string(),
    datum: z.date(),
    kort: z.string().optional(),
    categorie: z.enum(categorieen).default('De reis'),
    tags: z.array(z.string()).default([]),

    locatie: z.string().optional(),
    coordinaten: z.tuple([z.number(), z.number()]).optional(),
    hoofdstuk: z.string().optional(),

    foto: image().optional(),
    fotoAlt: z.string().optional(),
    // standaard maakt scripts/og.py een deelplaatje van de hoofdfoto.
    // Wil je er een eigen bij, zet dan de bestandsnaam uit public/og/
    // hier neer, bijvoorbeeld: deelplaatje: route.jpg
    deelplaatje: z.string().optional(),
    deelplaatjeAlt: z.string().optional(),
    klimaat: z.enum(['NL', 'ES']).default('NL'),
    galerij: z.array(z.object({ src: image(), alt: z.string() })).default([]),

    // De video die bij dit verhaal hoort. Vaste sleutels en geen vrije
    // lijst URL's: zo documenteert het schema zelf welke platforms er
    // zijn, en valt de build om bij een verkeerd domein in plaats van
    // stilletjes een fout label te tonen. De knopteksten staan in
    // src/components/Video.astro, niet hier.
    video: z.object({
      youtube: z.string().url().refine(u => /(?:youtube\.com|youtu\.be)\//.test(u),
        { message: 'Dit is geen YouTube-URL' }).optional(),
      tiktok: z.string().url().refine(u => /tiktok\.com\//.test(u),
        { message: 'Dit is geen TikTok-URL' }).optional(),
      instagram: z.string().url().refine(u => /instagram\.com\//.test(u),
        { message: 'Dit is geen Instagram-URL' }).optional()
    }).optional(),

    // De video die in de lopende tekst van dit verhaal staat, als
    // eigen poster met een afspeelknop. Eén bron voor twee dingen: de
    // knop in de tekst (src/components/VideoInsluiten.astro) en de
    // VideoObject-structuurdata op de verhaalpagina. Zo kunnen de titel,
    // de duur en de datum op de pagina niet uiteenlopen met wat er in
    // de structuurdata staat.
    //
    // Alleen in een .mdx-verhaal te gebruiken, want de knop is een
    // component en geen markdown. De poster staat in public/video/ en
    // wordt zelf uitgeserveerd, niet van i.ytimg.com gehaald.
    insluiting: z.object({
      youtubeId: z.string(),
      titel: z.string(),
      omschrijving: z.string(),
      // ISO 8601, zoals schema.org het wil: PT8M59S
      duur: z.string().regex(/^PT(\d+H)?(\d+M)?(\d+S)?$/, 'Duur moet ISO 8601 zijn, bijvoorbeeld PT8M59S'),
      uploadDatum: z.date(),
      poster: image()
    }).optional(),

    aflevering: z.number().optional(),
    onderdeel: z.enum(onderdelen).optional(),
    budget: z.number().optional(),
    voorNa: z.object({ voor: image(), na: image(), alt: z.string() }).optional(),

    concept: z.boolean().default(false)
  })
});


const afleveringen = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/afleveringen' }),
  schema: ({ image }) => z.object({
    nummer: z.number(),
    titel: z.string(),
    datum: z.date(),
    youtubeId: z.string(),
    kort: z.string().optional(),
    locatie: z.string().optional(),
    coordinaten: z.tuple([z.number(), z.number()]).optional(),
    thumbnail: image().optional(),
    thumbnailAlt: z.string().optional(),
    filter: z.enum(['Emigreren', 'Finca zoeken', 'Verbouwen', 'Dagelijks leven', 'Mowgli']).default('Emigreren'),
    duur: z.string().optional(),
    concept: z.boolean().default(false)
  })
});

export const collections = { verhalen, afleveringen };
export { categorieen, onderdelen };
