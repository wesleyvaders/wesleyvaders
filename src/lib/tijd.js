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
