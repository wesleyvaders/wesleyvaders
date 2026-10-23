/**
 * Herstelt de Nederlandse apostrof in samentrekkingen als 's avonds.
 *
 * Astro's smartypants ziet een apostrof aan het begin van een woord en
 * denkt dat er een citaat opent: het maakt er U+2018 van, het openende
 * enkele aanhalingsteken. Binnen een woord gaat het wel goed, vandaar
 * dat "zo'n" klopt en "'s avonds" niet.
 *
 * Smartypants helemaal uitzetten is geen optie, want de rest van de
 * typografie klopt. Daarom alleen dit geval terugdraaien: U+2018 gevolgd
 * door s, t, n, k of m en daarna een spatie of koppelteken. Een echt
 * openend aanhalingsteken wordt in de praktijk nooit zo gevolgd — daar
 * staat een woord achter, geen losse letter plus spatie.
 *
 * Draait als rehype-plugin, dus ná smartypants, op de tekstknopen van de
 * gerenderde boom. Code en pre blijven buiten schot.
 */
const SAMENTREKKING = /‘([stnkm])(?=[\s -])/g;
const OVERSLAAN = new Set(['code', 'pre']);

export function nederlandseApostrof() {
  return (tree) => {
    const loop = (knoop) => {
      if (knoop.type === 'element' && OVERSLAAN.has(knoop.tagName)) return;
      if (knoop.type === 'text' && typeof knoop.value === 'string') {
        knoop.value = knoop.value.replace(SAMENTREKKING, '’$1');
      }
      if (knoop.children) knoop.children.forEach(loop);
    };
    loop(tree);
  };
}
