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
  loader: glob({ pattern: '**/*.md', base: './src/content/verhalen' }),
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
    klimaat: z.enum(['NL', 'ES']).default('NL'),
    galerij: z.array(z.object({ src: image(), alt: z.string() })).default([]),

    aflevering: z.number().optional(),
    onderdeel: z.enum(onderdelen).optional(),
    budget: z.number().optional(),
    voorNa: z.object({ voor: image(), na: image(), alt: z.string() }).optional(),

    concept: z.boolean().default(false)
  })
});

const hierennu = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/hierennu' }),
  schema: z.object({
    datum: z.date(),
    nummer: z.number(),
    titel: z.string().optional(),
    locatie: z.string().optional(),
    coordinaten: z.tuple([z.number(), z.number()]).optional(),
    concept: z.boolean().default(false)
  })
});

const afleveringen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/afleveringen' }),
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

export const collections = { verhalen, hierennu, afleveringen };
export { categorieen, onderdelen };
