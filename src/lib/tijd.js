// Alles wat een aantal dagen of weken noemt rekent hiermee, zodat er
// nergens een getal wordt ingetypt dat later niet meer klopt.
// De browser rekent dezelfde waarden na via data-dagen en data-weken
// in Base.astro, dus tussen twee deploys verjaart het ook niet.

export function dagenTot(vertrek, nu = new Date()) {
  const vandaag = new Date(nu);
  vandaag.setHours(0, 0, 0, 0);
  return Math.round((new Date(vertrek + 'T00:00:00') - vandaag) / 86400000);
}

const WOORD = ['nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven',
  'acht', 'negen', 'tien', 'elf', 'twaalf', 'dertien', 'veertien'];

const woord = (n) => WOORD[n] ?? String(n);

// "Drie weken", "Nog vier dagen", "Vandaag", "Onderweg"
export function wekenZin(dagen) {
  if (dagen < 0) return 'Onderweg';
  if (dagen === 0) return 'Vandaag';
  if (dagen === 1) return 'Nog één dag';
  if (dagen < 14) return `Nog ${woord(dagen)} dagen`;
  const w = Math.round(dagen / 7);
  return `${woord(w).charAt(0).toUpperCase()}${woord(w).slice(1)} weken`;
}

// kleine letter, voor midden in een zin: "nog drie weken en dan..."
export const wekenKort = (dagen) => {
  const z = wekenZin(dagen);
  return z.charAt(0).toLowerCase() + z.slice(1);
};

// Zelfde waarde, maar zonder het woordje Nog ervoor: "Twaalf dagen".
// Voor plekken waar dat er al staat, zoals de logboekregel NOG. Anders
// leest die regel als "NOG · Nog twaalf dagen".
export function tijdZin(dagen) {
  const z = wekenZin(dagen);
  if (!z.startsWith('Nog ')) return z;
  const rest = z.slice(4);
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

// De teller in de cijferstrook en de eyebrow van het gastenboek. Vóór
// het vertrek telt hij af, daarna telt hij de dagen van de reis, en
// zodra aankomst is ingevuld de dagen in Spanje. De dag van vertrek is
// dag 1 en niet dag 0: het eerste verhaal onderweg is hoofdstuk 01 en
// het citaatplaatje van die dag zegt "Dag 1 · 700 km". Stond die teller
// op 0 terwijl er al zevenhonderd kilometer op zat.
export function dagenTeller(vertrek, aankomst, nu = new Date()) {
  const over = dagenTot(vertrek, nu);
  if (over > 0) {
    return {
      getal: over,
      label: 'Dagen tot vertrek',
      eyebrow: over === 1 ? 'Nog één dag' : `Nog ${over} dagen`
    };
  }
  const sinds = (datum) => 1 - dagenTot(datum, nu);
  if (aankomst && sinds(aankomst) >= 1) {
    const n = sinds(aankomst);
    return { getal: n, label: 'Dagen in Spanje', eyebrow: `Dag ${n} in Spanje` };
  }
  const n = sinds(vertrek);
  return { getal: n, label: 'Dagen onderweg', eyebrow: `Dag ${n} onderweg` };
}
