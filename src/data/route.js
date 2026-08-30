// De etappes van Monster naar Alfaz del Pi.
// Eén bron voor de kaart, de lijst en de tips. Coördinaten zijn echt,
// de kaart rekent ze zelf om. Geen aantal dagen: hoe lang ik erover doe
// staat niet vast.
// gehad: false zolang ik er nog niet ben geweest. Zodra er een foto bij
// komt, zet je die erbij en verdwijnt het statuslabel vanzelf.
export const etappes = [
  {
    nr: '01',
    gehad: false,
    foto: null,
    van: 'Monster',
    naar: 'Mont-Saint-Michel',
    km: 730,
    lat: 48.636, lng: -1.511,
    tekst: 'De langste etappe. Een eiland met een abdij erop, en daar wil je niet om twaalf uur ’s middags tussen de touringcars staan. Ik kom aan het eind van de middag aan.'
  },
  {
    nr: '02',
    gehad: false,
    foto: null,
    van: 'Mont-Saint-Michel',
    naar: 'Saumur',
    km: 330,
    lat: 47.260, lng: -0.077,
    tekst: 'De Loirevallei. Kastelen, wijngaarden en dorpen van oude steen. Eén kasteel bekijken en de rest niet volproppen.'
  },
  {
    nr: '03',
    gehad: false,
    foto: null,
    van: 'Saumur',
    naar: 'Dune du Pilat',
    km: 450,
    lat: 44.588, lng: -1.213,
    tekst: 'De grootste zandduin van Europa. Aan de ene kant de oceaan, aan de andere kant een dennenbos zonder eind. Ik wil daar boven staan als de zon laag staat.'
  },
  {
    nr: '04',
    gehad: false,
    foto: null,
    van: 'Dune du Pilat',
    naar: 'San Sebastián',
    km: 280,
    lat: 43.318, lng: -1.981,
    tekst: 'Langs de Atlantische kust naar Baskenland. Ergens onderweg rijd ik Spanje binnen, en dat is dan het eerste echte moment.'
  },
  {
    nr: '05',
    gehad: false,
    foto: null,
    van: 'San Sebastián',
    naar: 'Bardenas Reales',
    km: 280,
    lat: 42.187, lng: -1.500,
    tekst: '’s Ochtends nog groene bergen, daarna een woestijn. Zo’n landschap waarvan je denkt dat je verkeerd gereden bent.'
  },
  {
    nr: '06',
    gehad: false,
    foto: null,
    van: 'Bardenas Reales',
    naar: 'Albarracín',
    km: 380,
    lat: 40.408, lng: -1.444,
    tekst: 'Onderweg het Monasterio de Piedra: een groene kloof vol watervallen, midden in een droog stuk Spanje. Slapen in een middeleeuws dorp.'
  },
  {
    nr: '07',
    gehad: false,
    foto: null,
    van: 'Albarracín',
    naar: 'Alfaz del Pi',
    km: 320,
    lat: 38.583, lng: -0.103,
    tekst: 'De laatste kilometers. Droger, warmer, sinaasappelvelden, en dan de Middellandse Zee. Geen ingewikkelde route meer, gewoon aankomen.'
  }
];

// het vertrekpunt hoort op de kaart, maar is geen etappe
export const start = { naam: 'Monster', lat: 52.023, lng: 4.174 };

export const totaalKm = etappes.reduce((s, e) => s + e.km, 0);

// waar een tip bij hoort: route:03-dune-du-pilat
export const bronVan = (e) =>
  `route:${e.nr}-${e.naar.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
