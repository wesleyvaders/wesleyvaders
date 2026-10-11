import { getCollection } from 'astro:content';
import { nu } from '../data/site.js';

// Waar het NU-blok op dit moment over gaat. Eén bron voor de homepage
// en voor het mobiele menu, die allebei dezelfde kop en datum tonen.
//
// De datumregel en de plaats komen uit het nieuwste verhaal, niet uit
// site.js: daar stonden ze ingetypt en bleven ze staan op 22 september
// terwijl er al een verhaal van 1 oktober was.
//
// Klopt nu.bij niet met dat nieuwste verhaal, dan valt de build om. Een
// stilstaand NU-blok zie je in de browser niet; een bouwfout wel.
export async function huidigeStand() {
  const verhalen = (await getCollection('verhalen', e => !e.data.concept))
    .sort((a, b) => b.data.datum - a.data.datum);
  const nieuwste = verhalen[0];
  if (!nieuwste) throw new Error('Geen verhalen, dus geen NU-blok.');

  const slug = nieuwste.id.replace(/\.md$/, '');
  if (nu.bij !== slug) {
    throw new Error(
      `Het NU-blok hoort bij "${nu.bij}" maar het nieuwste verhaal is "${slug}". ` +
      `Werk in site.js nu.bij, nu.kop, nu.tekst en nu.logboek bij, en de twee ` +
      `NU-foto's bovenin src/pages/index.astro.`
    );
  }

  return {
    verhaal: nieuwste,
    label: `Nu · ${new Intl.DateTimeFormat('nl-NL',
      { day: 'numeric', month: 'long', year: 'numeric' }).format(nieuwste.data.datum)}`,
    waar: nieuwste.data.locatie
  };
}
