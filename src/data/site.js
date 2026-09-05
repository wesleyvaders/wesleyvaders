// Alles wat op meerdere plekken terugkomt staat hier.
// Eén plek aanpassen is genoeg. Dit is het bestand dat je het vaakst opent.

export const site = {
  naam: 'Wesley Vaders',
  serie: 'De Spaanse Droom',
  domein: 'https://wesleyvaders.nl',
  omschrijving:
    'Ik vertrek naar Spanje en wil daar mijn droom uit laten komen. Hoe dat uitpakt, geen idee. Maar ik ga ervoor.',
  slotzin: ['Alles komt goed.', 'Alles is al goed.']
};

// Analytics.
// ga4      = Google Analytics 4. Zet cookies, dus de banner verschijnt.
// cloudflare / plausible / umami = cookieloos, dan blijft de banner weg.
export const analytics = {
  aan: true,
  provider: 'ga4',
  ga4Id: 'G-7Q2453G8J1',
  token: '',
  domein: 'wesleyvaders.nl',
  umamiUrl: '',
  umamiId: ''
};

// Zet op false als je ooit naar een cookieloze provider overstapt.
export const cookiebanner = {
  aan: true,
  tekst: 'Ik meet met Google Analytics hoeveel mensen hier komen en wat ze lezen. Meer niet.',
  ja: 'Prima',
  nee: 'Liever niet'
};

// klaar: false = de pagina bestaat nog niet en wordt niet getoond.
// Zet op true zodra je hem gebouwd hebt. Zo geen kapotte links in de nav.
//
// /route/, /hierennu/ en /beheer/ staan hier bewust niet in. De route
// staat vastgezet bovenaan de verhalenpagina, hier en nu hangt aan het
// Onderweg-blok, en beheer is alleen voor Wesley.
export const navAlles = [
  { titel: 'Mijn verhaal', href: '/mijn-verhaal/', klaar: true },
  { titel: 'Afleveringen', href: '/afleveringen/', klaar: false },
  { titel: 'Verhalen', href: '/verhalen/', klaar: true },
  { titel: 'Spanje', href: '/spanje/', klaar: false },
  { titel: 'Gastenboek', href: '/gastenboek/', klaar: true }
];
export const nav = navAlles.filter(i => i.klaar);

// Pagina's die er wel zijn maar niet in de hoofdnavigatie horen. Ze
// staan onderaan het mobiele menu en in de footer, zodat ze niet
// alleen via een link in de tekst te vinden zijn.
export const navExtra = [
  { titel: 'De route', href: '/route/' },
  { titel: 'Even in het hier en nu', href: '/hierennu/' }
];

export const contact = {
  email: 'info@wesleyvaders.nl',
  plaats: 'Den Haag'
};

export const socials = [
  { naam: 'YouTube', omschrijving: 'De volledige afleveringen', actie: 'Abonneer', href: 'https://www.youtube.com/@wesleyvaders9102' },
  { naam: 'Instagram', omschrijving: "Foto's en dagelijkse dingen", actie: 'Volgen', href: 'https://www.instagram.com/wesleyvaders/' },
  { naam: 'TikTok', omschrijving: 'De korte dingen. De aankondiging staat er al op', actie: 'Volgen', href: 'https://www.tiktok.com/@wesleyvaders' },
  { naam: 'Facebook', omschrijving: 'Voor iedereen die daar zit', actie: 'Volgen', href: 'https://www.facebook.com/wesleyvaders' }
];

// De vertrekdatum naar Spanje. De aftelling in de hero en het
// gastenboek rekenen hiermee. Losstaand van de sleuteloverdracht
// van het huis, die is op 17 september.
export const vertrek = '2026-09-20';

// De cijferstrook op de homepage. Het eerste cijfer (dagen tot
// vertrek) rekent de site zelf uit; deze twee zijn met de hand.
export const cijfers = [
  { waarde: '53', label: 'Verdiepingen op één dag' },
  { waarde: '2.750', label: 'Kilometer via de mooie weg' }
];

// Het NU-blok. Dit is het enige dat je echt vaak aanpast.
// {weken} wordt berekend uit vertrek, niet ingetypt. Zie src/lib/tijd.js.
export const nu = {
  label: 'Nu · 5 september 2026',
  kop: 'De laatste week wordt kamperen.',
  tekst:
    'Het slapen gaat op een matras op de grond, wassen kan niet meer. De laatste week hier wordt kamperen. Nog {weken} en dan rijd ik naar het zuiden.',
  logboek: [
    ['Huis', 'Verkocht, sleutel weg 17.09.2026'],
    ['Hier weg', '12.09.2026'],
    ['Nog', '{weken}'],
    ['Bus', 'Nagekeken, bijna 450.000 km'],
    ['Eerste stop', 'Bij een vriend in Spanje'],
    ['Mee', 'Mo, en zo min mogelijk spullen'],
    ['Plan', 'De route staat. De finca nog niet.']
  ]
};

// De route. Nieuwe halte toevoegen? Regel erbij en klaar.
// status: 'nu' geeft het gouden punt, 'komt' is een open cirkel, 'gehad' is gevuld.
// href is optioneel: staat er een pagina over die halte, dan wordt hij klikbaar.
export const route = [
  { wanneer: 'Monster', titel: 'Inpakken', tekst: 'Kasten gesloopt, drie ritten naar de stort, de rest weggegeven.', status: 'gehad' },
  { wanneer: 'September', titel: 'Prio 1', tekst: 'De eerste lading mee naar beneden.', status: 'nu', href: '/route/', link: 'Bekijk de route' },
  { wanneer: 'Oktober', titel: 'Prio 2', tekst: 'Even terug naar Nederland. Ik word oom.', status: 'komt' },
  { wanneer: '?', titel: 'De finca', tekst: 'Bestaat nog niet. Staat er wel ergens.', status: 'komt' }
];

export const stappen = [
  { n: '01 / Nu', titel: 'Vertrekken', tekst: 'Het huis uit, de bus vol, en richting het zuiden.', nu: true },
  { n: '02', titel: 'Zoeken', tekst: 'De juiste streek, de juiste plek, en uiteindelijk een finca.' },
  { n: '03', titel: 'Bouwen', tekst: 'Van een Spaans huis iets maken wat echt van mij is.' }
];

