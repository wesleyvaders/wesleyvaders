// Alles wat op meerdere plekken terugkomt staat hier.
// Eén plek aanpassen is genoeg. Dit is het bestand dat je het vaakst opent.

export const site = {
  naam: 'Wesley Vaders',
  serie: 'De Spaanse Droom',
  domein: 'https://wesleyvaders.nl',
  // Drie varianten: tot het vertrek, onderweg, en aangekomen. Welke
  // er staat rekent index.astro uit uit vertrek en aankomst; nooit met
  // de hand omzetten.
  omschrijving:
    'Ik vertrek naar Spanje en wil daar mijn droom uit laten komen. Hoe dat uitpakt, geen idee. Maar ik ga ervoor.',
  omschrijvingOnderweg:
    'Ik ben onderweg naar Spanje om daar mijn droom uit te laten komen. Hoe dat uitpakt, geen idee. Maar ik ga ervoor.',
  omschrijvingAangekomen:
    'Ik ben in Spanje om hier mijn droom uit te laten komen. Hoe dat uitpakt, geen idee. Maar ik ga ervoor.',
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
// /hierennu/ en /beheer/ staan hier bewust niet in: hier en nu hangt
// aan het Onderweg-blok en beheer is alleen voor Wesley.
//
// /route/ bestaat niet meer. Die pagina beschreef de mooie weg langs
// Mont-Saint-Michel en de Bardenas, en die is er niet van gekomen; de
// bus is over de snelweg gegaan. De tekst staat in
// bewaard/route-zeven-etappes.md en de URL gaat met een 301 naar
// /verhalen/, want hij is gedeeld. De routelijn in de hero is iets
// anders en blijft.
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

// De dag dat hij in Alfaz del Pi aankomt. Zolang die leeg is telt de
// site de dagen ónderweg; staat hij ingevuld, dan telt hij de dagen in
// Spanje. Zonder dit veld zou de hero vanaf 21 september beweren dat hij
// al een dag in Spanje is terwijl hij dan in Frankrijk staat.
export const aankomst = '2026-09-21';

// Hoeveel kilometer er gereden is en hoeveel de hele rit telt. Voedt de
// stand van het gouden punt op de routelijn in de hero en de tweede
// cijferkolom. Werk gereden bij na elke etappe; bij aankomst zet je hem
// op totaal en staat het punt vanzelf op 100%.
export const afstand = {
  gereden: 1950,
  totaal: 1950,
  waar: 'Alfaz del Pi'   // het punt van nu, als label onder de lijn
};

// De cijferstrook op de homepage. Het eerste cijfer (dagen tot
// vertrek) rekent de site zelf uit; deze twee zijn met de hand.
// De cijferstrook. De eerste twee kolommen rekent index.astro zelf uit
// (de teller en de gereden kilometers); deze staat er met de hand bij.
export const cijfers = [
  { waarde: '53', label: 'Verdiepingen op één dag' }
];

// Het NU-blok. Dit is het enige dat je echt vaak aanpast.
// {weken} wordt berekend uit vertrek, niet ingetypt. Zie src/lib/tijd.js.
// Let op: onder de veertien dagen levert {weken} zelf al "nog acht dagen".
// Schrijf er dus geen tweede "Nog" voor, anders staat er "Nog nog acht
// dagen" zodra de teller onder de veertien zakt.
export const nu = {
  label: 'Nu · 22 september 2026',
  kop: 'Aangekomen.',
  tekst:
    'Maandag in één ruk van Tournus naar Alfaz del Pi gereden, 1250 km, 12 uur. De klim naar de Spaanse grens was het zwaarste stuk. Sinds maandagavond ben ik hier, en vanochtend werd ik voor het eerst in Spanje wakker.',
  logboek: [
    ['Nu', 'Alfaz del Pi, Spanje'],
    ['Maandag', '1250 km in één ruk'],
    ['Totaal', '1950 km vanaf Monster'],
    ['Bus', 'Heeft het gehaald. Zonder vermogen'],
    ['Mee', 'Mo, en zo min mogelijk spullen']
  ]
};

// De route. Nieuwe halte toevoegen? Regel erbij en klaar.
// status: 'nu' geeft het gouden punt, 'komt' is een open cirkel, 'gehad' is gevuld.
// href is optioneel: staat er een pagina over die halte, dan wordt hij klikbaar.
export const route = [
  { wanneer: 'Monster', titel: 'Inpakken', tekst: 'Kasten gesloopt, drie ritten naar de stort, de rest weggegeven.', status: 'gehad' },
  { wanneer: 'Hoeven', titel: 'Tussenstop', tekst: 'Huis overgedragen, bus vol. Hier wachtte ik zondag af.', status: 'gehad' },
  { wanneer: '20 september', titel: 'Prio 1', tekst: 'In één rechte lijn naar Spanje, over de snelweg. De mooie route is er niet van gekomen.', status: 'gehad' },
  { wanneer: '21 september', titel: 'Alfaz del Pi', tekst: 'Aangekomen bij Pat en Sori. Tijdelijk onderdak, en van hieruit zoeken.', status: 'nu' },
  { wanneer: 'Oktober', titel: 'Prio 2', tekst: 'Even terug naar Nederland. Ik word oom.', status: 'komt' },
  { wanneer: '?', titel: 'De finca', tekst: 'Bestaat nog niet. Staat er wel ergens.', status: 'komt' }
];

// De drie stappen. Het gouden puntje hangt aan nu: true, dus die vlag
// schuift mee. Vertrekken is gehad sinds 20 september 2026.
export const stappen = [
  { n: '01 / Gehad', titel: 'Vertrekken', tekst: 'Het huis uit, de bus vol, en in twee dagen naar het zuiden.', gehad: true },
  { n: '02 / Nu', titel: 'Zoeken', tekst: 'De juiste streek, de juiste plek, en uiteindelijk een finca.', nu: true },
  { n: '03', titel: 'Bouwen', tekst: 'Van een Spaans huis iets maken wat echt van mij is.' }
];

