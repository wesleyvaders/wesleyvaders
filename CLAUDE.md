# wesleyvaders.nl

Persoonlijke site en archief van Wesley Vaders, die zijn huis in Den Haag verkocht en naar Spanje vertrekt om daar een finca te kopen en te verbouwen. De site is de thuisbasis van het verhaal. YouTube, Instagram, TikTok en Facebook zijn distributie.

Astro 5, statisch, geen database, geen CMS. Bouwt naar `dist/` en gaat bij elke push naar `main` vanzelf via GitHub Actions naar de server. Alleen het gastenboek draait op een klein PHP-eindpunt.

## Voor je iets aanpast

Deze site praat over een vertrek dat steeds dichterbij komt. Daardoor
veroudert inhoud snel en spreken twee plekken elkaar zomaar tegen. Loop bij
elke inhoudelijke wijziging deze zes na:

1. **Het NU-blok** in `site.js` hoort bij het nieuwste verhaal. Het veld
   `nu.bij` is de bestandsnaam van dat verhaal; klopt die niet meer, dan
   **valt de build om** met de naam die er had moeten staan. Werk dan
   `bij`, `kop`, `tekst`, `logboek` en de twee NU-foto's bovenin
   `index.astro` bij. De datumregel en de logboekregel NU hoef je niet te
   typen, die komen uit `datum` en `locatie` van dat verhaal.
2. **De tijdlijn** op de homepage (`route` in `site.js`): staat `nu` nog op de goede halte, of is die al `gehad`?
3. **De cijferstrook**: spreekt geen enkel cijfer een andere pagina tegen.
   De eerste twee kolommen rekent de site zelf uit, uit `vertrek` en
   `afstand` in `site.js`. Wat er met de hand bij staat zet je in
   `cijfers`; dat mag ook leeg zijn, dan toont de strook alleen die twee.
   Het aantal kolommen volgt vanzelf.
4. **`afstand.gereden` en `afstand.waar`** in `site.js`: die bepalen waar
   het gouden punt op de routelijn in de hero staat en welke plaats
   eronder. Werk ze bij na elke etappe, anders blijft de reis stilstaan.
5. **De aftelling**: hero, gastenboek, menu en route horen hetzelfde te zeggen.
   Na de vertrekdatum telt de site de dagen **onderweg**. Zodra hij in
   Alfaz del Pi aankomt vul je `aankomst` in `site.js` in; vanaf dan telt
   hij de dagen **in Spanje**. Laat je dat leeg, dan blijft er "onderweg"
   staan terwijl hij er allang is.

   Die teller staat in `dagenTeller()` in `src/lib/tijd.js` en voedt de
   eerste kolom van de cijferstrook, de eyebrow van `/gastenboek/` en de
   aftelregel in de hero. Twee verschillende starts, met opzet:

   - **Onderweg telt de vertrekdag mee.** Je rijdt die dag. Het eerste
     verhaal onderweg is hoofdstuk 01 en het citaatplaatje van die dag
     zegt "Dag 1 · 700 km"; een teller op nul spreekt die allebei tegen.
   - **In Spanje begint de telling de ochtend ná de aankomst.** Hij kwam
     maandagavond uitgeblust binnen; die avond is geen dag in Spanje. De
     eerste dag is de eerste keer wakker worden, precies zoals het
     verhaal het zegt.

   Let op het verschil met `data-dagen`: dat is het aantal dagen tót het vertrek en
   dat blijft daarna op nul staan. De teller zelf hangt aan
   `data-reisteller`, met `-l` voor het label en `-e` voor de eyebrow.
   Niet `data-teller` gebruiken, dat is de tekenteller van de formulieren.
6. **Bij een nieuw verhaal: bestaat de og:image echt?** De verhaalpagina
   leidt hem af van de hoofdfoto, dus een nieuwe foto betekent een nieuw
   bestand in `public/og/`. Staat het er niet, draai dan `scripts/og.py`.
   Controleer de URL uit de `og:image`-tag met een 200 en `image/jpeg`.
   Dit valt niet op in de browser: je ziet het pas als iemand de link al
   gedeeld heeft, en dan hangt het lege plaatje ook nog in hun cache.

**Alles wat de huidige stand beschrijft moet berekend zijn en niet
ingetypt:** de aftelling, het NU-blok, de cijferstrook, de tijdlijn. Dat
komt uit `vertrek` in `site.js` via `src/lib/tijd.js` en wordt in de
browser bijgewerkt via `data-dagen`, `data-weken`, `data-tijd` en `data-aftel` in
`Base.astro`. Schrijf dus `{weken}` in de tekst, geen "drie weken".

**Zet geen "Nog" vóór `{weken}`.** Onder de veertien dagen levert de
plaatshouder zelf al "nog acht dagen" op, en dan staat er "Nog nog acht
dagen". Boven de veertien dagen valt dat niet op, want dan komt er
"drie weken" uit. Schrijf de zin dus zo dat de plaatshouder het woordje
zelf meebrengt, bijvoorbeeld "het is {weken} tot ik vertrek".

In het NU-blok kun je `{weken}` schrijven voor "Nog twaalf dagen" en
`{tijd}` voor "Twaalf dagen", dat laatste voor de logboekregel waar het
woordje Nog al in de kop staat. Beide mogen in de kop, de tekst en het
logboek, en boven de veertien dagen slaan ze vanzelf om naar weken.

**Tekst die vóór, tijdens en ná de reis anders moet luiden kiest zijn
stand met `fase()`.** Die staat in `src/lib/tijd.js` en is de enige bron
voor "waar is hij nu": `aftellen`, `onderweg` of `aangekomen`, gerekend
uit `vertrek` en `aankomst`. `dagenTeller()` gebruikt dezelfde grens, dus
de teller en de tekst kunnen niet uiteenlopen.

Schrijf zo'n tekst met `kies()` en zet alle drie de standen erin:

```js
const kop = kies(fase(vertrek, aankomst), {
  aftellen: 'Voordat ik ga',
  onderweg: 'Onderweg',
  aangekomen: 'Nu ik hier zit'
});
```

Ontbreekt er een stand, dan valt de build om. Dat is met opzet: hiervoor
had elke plek zijn eigen `dagen > 0`-schakelaar met maar twee standen, en
toen de derde kwam bleef op zes plekken de tekst van onderweg staan. Het
gastenboek zei zichtbaar "ik ben onderweg naar het zuiden" terwijl de
meta-omschrijving van diezelfde pagina al "nu ik in Spanje zit" zei.

**Soms is de betere oplossing geen derde stand maar een zin zonder
houdbaarheidsdatum.** "De aankondiging staat er al op" bij TikTok en
"Volg onderweg mee" boven de socials sloegen op één moment in de tijd;
die zijn herschreven naar iets dat blijft kloppen. Een schakelaar die je
moet onderhouden is alleen de moeite waard als het verschil er echt toe
doet.

**Vergeet de `<head>` niet.** De meta-omschrijving en `og:description`
zijn twee weken blijven zeggen "ik vertrek naar Spanje" terwijl de pagina
er zelf al "1 dag in Spanje" boven had staan. Die tags worden nooit door
het browserscript bijgewerkt, dus daar valt niets vanzelf recht. Ze
komen nu uit dezelfde drietrap, bovenin `Base.astro`.

**Verhalen en korte berichten zijn momentopnamen en bevriezen.** Daarin mag
"nog 22 dagen" blijven staan, ook als dat er inmiddels 18 zijn. Dat was wat
er op die datum gold en het hoort bij het bericht.

## Commando's

```bash
npm run dev      # lokaal op http://localhost:4321
npm run build    # naar dist/
npm run preview  # dist/ lokaal bekijken
npm run controle # de controles over dist/; zie hieronder
```

**`npm run controle`** loopt elke pagina in `dist/` na. Hij wil een
server op poort 8899:

```bash
npm run build
npx serve dist -l 8899     # in een ander venster
npm run controle
```

Zonder server kan ook, dan blijven de browsercontroles achter:
`npm run controle -- --alleen-bestanden`.

Wat hij nakijkt:

- **de apostrof** in Nederlandse samentrekkingen, zie hieronder;
- per pagina op 1440 en 390 px: afbeeldingen zonder `alt`, lege `alt`
  buiten `aria-hidden`, aanraakvlakken onder 44 px, precies één `h1`, en
  interne links die nergens heen gaan.

Hij eindigt met exitcode 1 als er iets mis is. De grens voor
aanraakvlakken ligt op 43,5 en niet op 44: een knop die precies 44 px is
komt er op subpixels soms net onder, en dat kostte een keer een halve
avond zoeken naar een fout die er niet was.

## Waar staat wat

| Pad | Wat |
|---|---|
| `src/data/site.js` | Alle terugkerende content: NU-blok, route, stappen, cijfers, socials, navigatie, vertrekdatum. Dit bestand pas je het vaakst aan. |
| `src/content/verhalen/` | Losse verhalen. Eén markdown per verhaal. |
| `src/content.config.js` | De velden die een verhaal of bericht mag hebben. |
| `src/styles/global.css` | Alle styling en alle merktokens. Ook de stijlen van dingen die JavaScript aanmaakt, want scoped CSS pakt die niet. |
| `src/components/` | Nav, Footer, Merkteken, Routelijn, Gastenboek, Reacties, Video, Analytics, Cookiebanner. |
| `bewaard/` | Tekst die van de site af is maar bewaard blijft. Staat buiten de build en wordt niet gepubliceerd. |
| `src/lib/gastenboek.js` | Haalt bij de build het aantal berichten op voor de hero, en het aantal per bron voor de verhalenpagina. Faalt dat, dan blijven die stukjes leeg. |
| `public/fotos/` | Gegradeerde foto's. |
| `public/og/` | Deelplaatjes, 1200x630. |
| `public/fonts/` | De vier woff2-bestanden. Zelf gehost, latin-subset. |
| `public/api/` | Het gastenboek: `gastenboek.php` (lezen en plaatsen), `gastenboek-beheer.php` (wijzigen en weggooien), `gastenboek-pad.php` (waar de data staat). |
| `public/.htaccess` | 58 redirects van de oude site naar burovaders.nl, plus eigen URL's die veranderd zijn, caching en headers. |
| `src/lib/opvulling.js` | Maakt bij de build een piepkleine vervaagde versie van een foto als base64, voor achter de hero. Zo staat er niet eerst een egaal vlak. |
| `scripts/controle.cjs` | De controles over `dist/`: apostrof, alt-teksten, aanraakvlakken, h1, kapotte links. Draaien met `npm run controle`. |
| `src/lib/apostrof.mjs` | Zet de Nederlandse apostrof in samentrekkingen terug die smartypants kapot maakt. |
| `scripts/grade.py` | Fotogrades. Draaien vóór upload, niet tijdens de build. |
| `scripts/og.py` | Deelplaatjes van de hoofdfoto's. Handmatig draaien. |
| `scripts/og-gastenboek.py` | Het deelplaatje van het gastenboek. Loopt mee bij elke build, zodat de aftelling klopt. |
| `scripts/citaatplaatje.py` | Citaatplaatjes voor Instagram, 1080x1350. Instellingen staan in één blok bovenin. Schrijft naar `~/Downloads/citaat/`, niet naar de site. |
| `scripts/contrast.py` | Meet het contrast van het citaatplaatje dat op dat moment in `citaatplaatje.py` staat ingesteld. Tekent zelf geen enkele letter en schrijft de meetgebieden weg als losse uitsnedes om te bekijken. |
| `scripts/gastenboek-pdf.py` | De berichten als A5-boekje. Voor Wesley zelf, schrijft niet naar de site. |

## Een verhaal toevoegen

Nieuw bestand in `src/content/verhalen/`, naam wordt de URL:

```markdown
---
titel: Prio 1
datum: 2026-09-18
locatie: Ergens in Frankrijk
hoofdstuk: "01"
categorie: De reis
klimaat: ES
kort: Bus doet raar geluid. Negeren voelt goed.
foto: ../../../public/fotos/bus-vol.webp
fotoAlt: De bus volgeladen op een Franse parkeerplaats
---

De tekst.
```

`concept: true` houdt hem uit de build. Datum, locatie, hoofdstuk en categorie sturen automatisch de route, de tijdlijn en de filters. Nooit dezelfde informatie op twee plekken invoeren.

**De hoofdfoto moet liggend zijn, ongeveer 4:3.** De hero snijdt af op
70svh, dus van een liggende foto blijft ruim de helft over en van een
staande maar een derde. Bij een staande foto zie je daardoor een strook
uit het midden: de onder- en bovenkant vallen weg en wat er toevallig
naast het onderwerp staat gaat het beeld bepalen. Staande foto's horen in
de lopende tekst, daar worden ze helemaal getoond.

Wil je een ander deelplaatje dan dat van de hoofdfoto, zet dan `deelplaatje: route.jpg` erbij (een bestandsnaam uit `public/og/`), eventueel met `deelplaatjeAlt`.

## Video bij een verhaal

Hoort er een eigen video bij het verhaal, zet dan de links in de
frontmatter:

```yaml
video:
  youtube: https://www.youtube.com/watch?v=4uw5UkVBWxU
  tiktok: https://www.tiktok.com/@wesleyvaders/video/7687691087204420886
```

De knoppen komen automatisch op een vaste plek: na de tekst en vóór het
reactieblok. **De knopteksten staan in `src/components/Video.astro`, niet
in de frontmatter**, want ze hangen af van de volgorde. De eerste knop
nodigt uit ("Bekijk de video op YouTube"), de rest verwijst terug ("Of op
TikTok"). Staat TikTok alleen, dan wordt het vanzelf "Bekijk de video op
TikTok". YouTube staat altijd voorop; dat is het kanaal voor de volledige
afleveringen.

Zet je een verkeerd domein in een sleutel, dan valt de build om met
"Dit is geen YouTube-URL". Dat is opzet: liever een bouwfout dan een knop
die naar het verkeerde platform wijst.

**Nooit insluiten, altijd linken.** Een YouTube- of TikTok-speler zet
cookies van derden, en dan moet de cookietabel op de privacypagina worden
uitgebreid.

### `video:` of een losse knop in de tekst

Die twee zijn niet hetzelfde en bestaan naast elkaar.

- **`video:` in de frontmatter** is de video *van* dit verhaal. Vaste
  plek onderaan, vaste tekst.
- **Een `knop-los` midden in de tekst** is een link die bij díe alinea
  hoort. Bijvoorbeeld "Zie de rupsen aan het werk" bij de mislukte
  bloemkool in *Wat een pech, planten weg*, en "Het bewijs staat op
  TikTok" bij het nerfpistool in *Yamas*. Dat zijn oude filmpjes die een
  zin bewijzen, geen video van het verhaal.

Zo'n losse knop schrijf je als HTML in de markdown:

```html
<p class="knop-los"><a class="deel-knop mono" href="..." target="_blank" rel="noopener">Zie de rupsen aan het werk</a></p>
```

Optionele velden die nu al bestaan en later gebruikt worden: `coordinaten` ([lat, lng] voor de kaart), `aflevering`, `onderdeel` (De Finca), `budget`, `voorNa`, `galerij`, `tags`. **Vul `coordinaten` altijd in.** Later terugkomen op vijftig verhalen om er coördinaten bij te zoeken is een middag werk, nu is het tien seconden.

## Foto's

**Verkleinen geldt niet als het onleesbaar maken van gegevens.** Staat er
op een foto iets dat niet gedeeld mag worden, dan gaat die foto er niet
op, of hij wordt opnieuw gemaakt. Niet vertrouwen op de uitleverbreedte.

Dat die breedte nu op 1300 en 1600 ligt is een ontwerpkeuze, geen slot:
het bestand in `public/fotos/` staat rechtstreeks op `/fotos/<naam>.webp`
en is te downloaden, niet alleen te bekijken. Wil je weten wat er echt
uitgeleverd wordt, kijk dan naar wat `grade.py` wegschrijft en niet naar
de `widths` in een `<Image>`-tag: Astro schaalt nooit op, dus het
bronbestand is altijd het plafond.

Alle beelden gaan eerst door `scripts/grade.py`. Twee profielen:

- **NL** koel, grijs, ontladen. Voor Nederland.
- **ES** warm, stoffig, goud. Voor Spanje.

Dat is opzet: het merk warmt op naarmate het verhaal naar het zuiden gaat. Nooit een ongegradeerde foto in `public/fotos/` zetten, en nooit een extra filter over de grade heen.

Astro maakt zelf de responsive varianten. Gebruik altijd `<Image>` uit `astro:assets`, nooit een kale `<img>` voor content.

## Deelplaatjes

Posts voor Instagram, WhatsApp en Facebook zijn **altijd 1080x1350**. Nooit liggend: Instagram snijdt dan de zijkanten weg en de tekst valt eraf.

De enige uitzondering is de **og:image**, het plaatje dat automatisch bij een gedeelde link verschijnt. Die is 1200x630. `scripts/og.py` maakt ze van de hoofdfoto van een verhaal; `scripts/og-gastenboek.py` maakt die van het gastenboek bij elke build opnieuw, zodat de aftelling erop klopt.

Tekst blijft altijd binnen **13,5% marge boven en onder**. Dan blijft een vierkante uitsnede ook leesbaar.

**Beide deelplaatjes komen uit de scripts in deze repo**, ook als er al
een kant-en-klaar bestand klaarstaat: `scripts/og.py` voor de og:image en
`scripts/citaatplaatje.py` voor het socialbeeld. Buiten de repo om gemaakte
plaatjes wijken af van de huisstijl.

Wil een verhaal een andere og:image dan die van de hoofdfoto, zet dan
`deelplaatje: spaanse-grens.jpg` in de frontmatter. Staat er een
gegradeerde foto met die naam in `public/fotos/`, dan maakt `og.py` hem
er vanzelf bij; staat die er niet, dan laat het script het bestand met
rust, want dan is het met de hand gemaakt.

`scripts/citaatplaatje.py` maakt de citaatplaatjes. Alle instellingen
staan in één blok bovenin: foto, label, titel, URL en bestandsnaam. Het
merkteken en de onderste regel worden vastgezet op een deel van de
hoogte, dus je stuurt zelf wat er in de vierkante uitsnede overeind
blijft. De aftelling wordt berekend uit `vertrek`, nooit ingetypt.

**Een foto die al los op social media is geplaatst wordt geen deelplaatje
meer.** Hij is als deelbeeld op: wie hem daar zonder link voorbij zag
scrollen herkent hem, en dan doet het plaatje bij de gedeelde link geen
werk meer. In het verhaal zelf mag hij gewoon staan.

**Contrast meet je nooit op een beeld waar tekst op staat.** Dat gebeurde
twee keer met een verkeerde conclusie: één keer door te meten op het
opgeslagen plaatje, één keer door te meten op een "lege" achtergrond
waarin het merkteken, de onderregel en de URL nog werden getekend.

Werkwijze: draai `scripts/contrast.py` na `citaatplaatje.py`. Die tekent
zelf geen enkele letter en kan de fout dus niet maken. Hij zet de drie
meetgebieden als losse uitsnedes in `~/Downloads/citaat/`: bekijk die met
eigen ogen voordat je een cijfer gelooft. Zie je een letter, dan is de
meting ongeldig. Hij meet het zwakste stukje van een regel en niet het
gemiddelde, want een enkel woord boven een fel raam verdwijnt terwijl de
rest donker genoeg is.

Als een meting je tot de conclusie brengt dat een foto onbruikbaar is,
controleer dan eerst de meting. Twee keer bleek de meting fout en de
foto goed.

**Het deelplaatje is vanaf Spanje licht en zonnig:** de foto op volle
kleur bovenaan, de tekst gecentreerd op crème eronder. Dat de feed er
anders uitziet dan vóór september is geen fout, dat is het nieuwe
hoofdstuk. `SJABLOON` bovenin `citaatplaatje.py` staat op `licht`;
`donker` is het oude ontwerp met de tekst over de foto.

**Tekst nooit links uitlijnen en nooit over de foto.** Het raster van
Instagram snijdt vierkant, en dan valt er tekst af: bij links uitlijnen
viel de D van *Donde* eraf. Gecentreerd verliest links en rechts evenveel
en blijft heel. **Houd de tekst binnen 90% van de hoogte**, want daar
eindigt de midden-uitsnede.

**Kies een foto met kleur, niet met een donkere helft.** Het sjabloon
hoeft hem niet meer te verduisteren, want de tekst raakt hem niet.

Maatvoering van het lichte sjabloon:

| | |
|---|---|
| foto | 744 px van 1350, tot 55,1% |
| tekst | gecentreerd, eindigt op 88,7% |
| merkteken | inkt `#17140F` — niet terracotta, anders plakt het aan de datum |
| datum | terracotta `#A4441F` |
| kop | inkt `#17140F` |
| onderregel | zacht `#4A4135` |
| url | diep `#8C3A1B` |

Gemeten: 15,62 · 5,22 · 15,62 · 8,51 · 6,53.

**Het is krap.** Tussen de foto en het merkteken zit 10 px. De vijf
regels vullen de 453 px die er tussen 744 en 88,7% overblijft bijna
helemaal, dus de tussenruimtes zijn kleiner dan op het donkere sjabloon.
Komt er een derde titelregel bij, dan valt de build om met de melding dat
de foto korter moet. Verschuif liever de foto dan de ondergrens van 90%.

**Goud kan niet op crème**, 1,72:1. Het accent is daar terracotta
`#A4441F`; de gewone `#B0573A` haalt 4,18 en is te krap voor kleine
tekst. `contrast.py` zet die twee als waarschuwing onder de meting.

**Het label staat altijd in zand, niet in terracotta.** Terracotta is de
eyebrow-kleur op papier, maar op een foto zakt hij weg zodra er iets
lichts achter zit. Gemeten over vier plaatjes, zwakste stukje:

| Plaatje | terracotta | zand |
|---|---|---|
| De laatste keer | 2,41 | 7,09 |
| Yamas | 1,73 | 5,10 |
| Wat een pech | 2,86 | 8,41 |
| De laatste loodjes | 2,05 | 6,02 |

Terracotta blijft overal onder de 3:1, zand haalt overal ruim de 5. Zand
past bovendien bij de URL-regel onderin. Meet bij een nieuwe foto opnieuw
en houd het label boven de 4:1.

**Het verloop krijgt geen extra demping in de middenband.** Dat is
overwogen omdat de kop daar in het lichtste deel van het verloop staat,
maar de kop haalt over dezelfde vier plaatjes 6,63 · 5,42 · 5,88 · 5,39,
allemaal ruim boven de 4:1. Een demping van 95 tilde dat naar 8,60 · 7,75
· 9,29 · 7,71 en maakte alle vier de foto's zichtbaar vlakker, vooral de
groenen. Niet doen dus, tenzij een nieuwe foto de kop wel onder de 4
drukt; meet dat eerst.

## Regels die niet gebroken worden

**Kleur.** Inkt `#141412`, papier `#F5F1E8`, terracotta `#B0573A`, bos `#2C4739`, zand `#D9C6A5`, goud `#DFAF4A`. Ongeveer 60% papier, 25% inkt, 8% terracotta, 5% zand, 2% goud. **Goud is uitsluitend het NU-punt.** Zie je het vaker dan één keer per scherm, dan is het fout.

**De apostrof in samentrekkingen.** Smartypants ziet de apostrof aan het
begin van `'s avonds` en denkt dat er een citaat opent: het maakt er
U+2018 van, het openende enkele aanhalingsteken. Binnen een woord gaat
het wel goed, vandaar dat `zo'n` klopt en `'s avonds` niet. Het stond op
elf plekken in zeven verhalen fout.

Niet met de hand corrigeren in de markdown, want dan is het de volgende
zondag terug. `src/lib/apostrof.mjs` draait als rehype-plugin ná
smartypants en zet alleen dit geval om: **U+2018 gevolgd door s, t, n, k
of m en daarna een spatie of koppelteken.** Een echt openend
aanhalingsteken wordt nooit zo gevolgd, dus `hij zei 'dat is mooi'`
blijft heel. Getest, inclusief dat laatste.

Smartypants blijft dus gewoon aan; de rest van de typografie klopt.
`npm run controle` bewaakt het.

**Typografie.** Instrument Serif voor koppen, regelafstand onder 1, altijd zinsvorm en nooit kapitalen. Instrument Sans voor lopende tekst, regelafstand 1.7, maximaal 44ch breed. JetBrains Mono voor alle data en labels, altijd kapitalen, `letter-spacing: .15em`, nooit groter dan 12px. Cursief is alleen voor quotes.

**Vorm.** Hoekradius 0 tot 4px, niets pil-vormig. Randen zijn haarlijnen, schaduwen bestaan niet. Geen enkele sectie krijgt twee even brede kolommen: gebruik de bestaande `.g-intro`, `.g-nu`, `.g-bus`, `.g-gb` verhoudingen of maak een nieuwe ongelijke. Wissel het verticale ritme af met `.sec`, `.sec-ruim` en `.sec-krap`. Diepte komt van fotografie, achtergrondtinten en witruimte, nooit van een verloop.

**Toon.** Nederlands, Haags, nuchter, droog. Woorden mogen wegvallen, het mag plat. Me en mijn wisselen af: terloops "me vader", op zware momenten "mijn vader". Niet gladstrijken en niet corrigeren.

**Getallen blijven cijfers.** Schrijf 100 km/u en niet honderd kilometer
per uur, 200 km en niet tweehonderd kilometer, 1250 km en niet
twaalfhonderdvijftig. Alleen uitschrijven als het echt beter leest in een
lopende zin.

**"Vroegah" is de Haagse schrijfwijze van vroeger en blijft staan, net als "rustaghhh".** Dit soort klankschrijfwijzen zijn geen typefouten en worden nooit gecorrigeerd. Twijfel je of iets een verschrijving is of de spreektaal: laat het staan en vraag het.

Verboden woorden: ontdek, discover, learn more, get started, stap voor stap, steen voor steen, authentiek, transformatie, journey, mindset, reis als metafoor, en alles met een uitroepteken.

Wesley is een Hagenees en communiceert zo. **Den Haag gebruiken bij afkomst en identiteit**: de hero, Mijn verhaal, de routelijn, de footer. Dat verandert nooit, waar hij ook woont.

**De feitelijke locatie verhuist mee.** Die staat bij een datum: korte berichten, verhalen, locatiebadges, het NU-blok. Monster tot 12 september 2026, Hoeven tot de 20e, Tournus op de 20e, en sinds 21 september 2026 **Alfaz del Pi**. Daar woont hij nu. Werk bij elke verhuizing de locatie in het NU-blok bij.

Verhalen van vóór een verhuizing houden hun eigen locatie; die bevriezen, net als de rest van een verhaal. Alleen wat de huidige stand beschrijft gaat mee. Nooit Westland gebruiken.

**Over zijn ouders.** Zijn vader Leo en zijn moeder zijn overleden, zijn oude hond Bo ook. Daar wordt over geschreven zoals hij erover praat: gewoon, tussen de dagelijkse dingen door. Geen kader, geen zwart-witfilter, geen plechtige typografie, nooit als opener en nooit als verkoopargument. Dit gaat over vooruit kijken, niet over verdriet. Schrijf er nooit omheen, maar maak er ook nooit een verhaal op zich van.

**Geen verzonnen content.** Nooit volgersaantallen, kosten, aantallen bekeken finca's, testimonials of data verzinnen. Bestaat het nog niet, bouw het dan niet. Lege modules maken deze site kapot.

**Mowgli** heet Mowgli in koppen en Mo in bijschriften.

## Gastenboek en tips

Het enige dynamische deel van de site. De berichten staan **niet** in de repo maar op de server, in `domains/wesleyvaders.nl/gastenboek-data/` naast `public_html`. Dat pad wordt afgeleid van het eindpunt zelf, dus er staat nergens een accountnaam in. Buiten `public_html`, want de FTP-deploy gooit alles weg wat niet in `dist/` zit.

Drie bestanden horen daar: `berichten.json`, `token.txt` (jouw wachtwoord voor `/beheer/`, mag een zin zijn die je onthoudt) en `geheim.txt` (ondertekent het tijdstempel van het formulier).

Elk bericht heeft een **bron**: `gastenboek`, `route:03-dune-du-pilat` voor een tip bij een etappe, of `verhaal:2026-09-05-de-laatste-zaterdagnacht` voor een reactie onder een verhaal. Berichten zonder bron tellen als gastenboek. De filters zijn voor alle drie gelijk: honeypot, minstens vier seconden tussen laden en versturen, geen links, maximaal 3000 tekens. Dat was 1200, maar dit is een
afscheidsgastenboek en daar hoort een lange brief bij: het eerste echt
lange bericht liep vast op 2334 tekens en de schrijver kon er niets mee.
Wie vastloopt schrijft je dat meestal niet, die klikt weg. De rem per IP verschilt en elk soort heeft een eigen teller: drie gastenboekberichten per uur, tien tips en tien reacties. Zo eet een reactie onder een verhaal je tips voor de route niet op.

`?tellen=1` op het eindpunt geeft het aantal per bron. Dat gebruikt de verhalenpagina bij de build om bij elk verhaal het aantal reacties te tonen. Lukt dat niet, dan komt er simpelweg geen teller.

Beheren gaat via **`/beheer/`**: inloggen met het token, dan lezen, aanpassen en weggooien, met een filter per bron. Nooit handmatig in `berichten.json` rommelen als het via die pagina kan.

**Het dubbele bericht van Nel onder `2026-09-09-planten-weg` blijft
bewust staan. Geen openstaand punt.**

**Op de homepage staan alleen de zes nieuwste berichten**, via
`<Gastenboek toon={6} />`. Op `/gastenboek/` staan ze allemaal, in
stappen van tien met een knop eronder. Zonder die grens werd dat blok
het zwaartepunt van de homepage: 46 berichten in hun geheel, waarvan
eentje van tien alinea's, en dan scrol je minutenlang langs
afscheidsberichten voordat je bij de verhalen bent. De homepage gaat
over de reis, het gastenboek blijft het gastenboek.

Op de homepage staat onder die zes geen "Laat meer zien" maar de link
naar `/gastenboek/`. Het getal daarin is het **totaal**, niet zes;
`zetAantal()` vult alle `[data-uit-aantal]` met wat de server teruggeeft.

De lijst staat daar in `columns: 2` en niet in een raster. In een raster
bepaalt het langste bericht de hoogte van zijn hele rij, en met zes
berichten die enorm in lengte verschillen stond er naast elke lange
brief een gat. De versprongen even-berichten horen bij dat raster en
staan in de kolommen uit, anders schuift een kader tegen zijn buurman.

**Op de homepage worden lange berichten afgekapt op twaalf regels**, met
`-webkit-line-clamp`. Minder berichten tonen lost dit niet op: dan hangt
de hoogte van de pagina ervan af wie er toevallig als laatste schreef.
Eén brief van tien alinea's bepaalt anders het hele blok.

Geen `max-height` met een verloop eroverheen: line-clamp kapt af op een
regelgrens met een beletselteken, in plaats van halverwege een woord of
achter een waas. Dat scheelt ook contrast meten over leesbare tekst.

**De link "Lees verder" staat standaard bij elk bericht; het script
haalt hem weg waar niets is afgekapt.** Of er echt afgekapt is weet
alleen de browser, dus `haalWegWaarHeel()` vergelijkt `scrollHeight` met
`clientHeight`. De link wijst naar `/gastenboek/`, waar het hele bericht
staat; er is geen uitklapper in de pagina.

**Dat is met opzet die kant op.** *Als een scriptje iets toevoegt dat
nodig is om de inhoud te kunnen lezen, hoort het er standaard te staan en
moet het script het juist weghalen. Niet andersom.* Zette het scriptje de
link erbij en faalde het, dan stond de tekst wél afgekapt maar kon niemand
verder lezen. Nu is de slechtste uitkomst een overbodige link onder een
kort bericht.

Gemeten na invoering, met 46 berichten in het gastenboek:

| | berichten | afgekapt | de lijst |
|---|---|---|---|
| homepage 1440 | 6 | 2 | 1.057px |
| homepage 390 | 6 | 3 | 2.012px |
| /gastenboek/ | 10 | 0 | ongewijzigd |

## Vindbaarheid op zijn eigen naam

Op "wesley vaders" hoort hij bovenaan te staan, en daar concurreert hij
met anderen met een vergelijkbare naam. Twee dingen dragen dat:

**De Person-schema in `Base.astro`, op elke pagina.** `sameAs` bevat de
vier socialprofielen; dat is het sterkste signaal om een persoon te
onderscheiden. Haal daar niets uit.

burovaders.nl staat in `worksFor` en **niet** in `sameAs`. Dat laatste is
voor andere profielen van dezelfde persoon, niet voor een bedrijf.

**Zijn volledige naam staat in de lopende tekst van `/mijn-verhaal/`**,
in de eerste zin van hoofdstuk 01. Daarvoor stond hij alleen in de
`<title>` en in het merkteken in de nav en de footer, en dat telt niet
als tekst op de pagina. De h1 daar heet "Waarom ik dit doe" en dat blijft
zo; de naam hoort in de zin eronder.

## Analytics

Staat aan, GA4 met meet-id `G-7Q2453G8J1`. Ingesteld in `src/data/site.js`.

GA4 zet cookies, dus draait het via **Consent Mode v2**: alles staat standaard op `denied` en gaat pas naar `granted` als de bezoeker in de balk op Prima klikt. De keuze staat in `localStorage` onder `wv-consent`. Zonder toestemming stuurt GA4 alleen geanonimiseerde pings zonder cookies.

De cookiebalk (`src/components/Cookiebanner.astro`) verschijnt pas na 1,2 seconde, is een smalle balk onderin en nooit een popup over de hero. Tekst en knoplabels staan in `site.js`.

Stap je ooit over naar `cloudflare`, `plausible` of `umami`, dan verdwijnt de balk automatisch, want die zijn cookieloos.

## Nav en kapotte links

`src/data/site.js` heeft `navAlles` met een `klaar`-vlag per item. Alleen items met `klaar: true` verschijnen in de navigatie en de footer. **Bouw je een nieuwe pagina, zet dan pas daarna de vlag om.** Zo staan er nooit links naar pagina's die nog niet bestaan.

Nu klaar: Mijn verhaal, Het avontuur, Verhalen, Gastenboek, Privacy, Cookies, Contact.
Nog niet: Afleveringen, Spanje.

`/beheer/` staat bewust niet in de navigatie; die is alleen voor Wesley en staat op noindex.

**`/hierennu/` bestaat niet meer, sinds 18 oktober 2026.** De losse korte
berichten kwamen er niet meer van en de wekelijkse verhalen doen dat werk
nu. De pagina's, de collectie en het schema zijn weg; de zeven berichten
staan in `bewaard/hierennu-zeven-berichten.md` en de URL gaat met een 301
naar `/verhalen/`, ook de genummerde pagina's.

Daarmee is `navExtra` leeg. Dat is geen fout: Nav en Footer slaan de
lijst dan gewoon over. Komt er ooit weer een pagina bij die niet in de
hoofdnavigatie hoort, dan zet je hem daar terug.

**`/route/` bestaat niet meer, sinds 1 oktober 2026.** Die pagina
beschreef de mooie weg langs Mont-Saint-Michel en de Bardenas, en die is
er niet van gekomen: de bus ging over de snelweg. De pagina, de kaart,
de etappelijst en `src/data/route.js` zijn weg; de tekst staat in
`bewaard/route-zeven-etappes.md` en de URL gaat met een 301 naar
`/verhalen/`, want hij stond in de sitemap en is gedeeld.

De gastenboekberichten met bron `route:<etappe>` zijn blijven staan. Dat
kan veilig: `/beheer/` zet een bron om in leesbare tekst en bouwt er geen
link van, en `geldige_bron()` in `gastenboek.php` toetst met een regex en
niet tegen een lijst etappes. Ze blijven dus te lezen en te filteren.

**De routelijn in de hero is iets anders en blijft.** Die loopt van
Monster via Hoeven naar Alfaz del Pi en komt uit `afstand` in `site.js`.

## Juridische pagina's

`privacy-policy.astro` en `cookies.astro` zijn geschreven op de huidige situatie: GA4 met Consent Mode, hosting bij CloudMonsters, Bunny CDN, zelf gehoste lettertypen, geen embeds, en drie formulieren die naam en bericht openbaar op de site zetten (het gastenboek, de tips per etappe en de reacties onder een verhaal). **Verandert een van die dingen, dan moeten deze pagina's mee.** Vooral bij het insluiten van YouTube of TikTok, want dan komen er cookies van derden bij en moet de cookietabel worden aangevuld.

Het e-mailadres staat in `site.js` onder `contact.email`.

## Caching

`public/.htaccess` zet beeld, CSS en JS op een jaar: die hebben een hash
in hun naam, dus een nieuwe versie is een nieuwe URL.

**HTML en `versie.txt` staan op `no-cache`.** Dat betekent niet "niet
bewaren" maar "altijd even navragen": de browser houdt de kopie en krijgt
een 304 terug als er niets veranderd is. Geen verouderde pagina's, en
nauwelijks trager, want bij een 304 komt er geen inhoud overheen.

Dat is er niet voor niets. HTML stond op tien minuten, en `versie.txt`
had helemaal geen regel — en zonder regel mag een cache zelf een
houdbaarheid verzinnen. Gevolg: na een deploy stond de oude homepage er
nog, en één keer beweerde `versie.txt` een oudere commit dan er
daadwerkelijk live stond. Juist dat bestand is de snelle waarheid over
wat er draait, dus dat mag nooit.

**Controleer na een wijziging hieraan de headers echt**, want er zit een
nginx-laag voor Apache (zichtbaar aan `x-accel-version`):

```bash
curl -sI https://wesleyvaders.nl/ | grep -i cache-control
```

## Redirects

De oude therapeutencontent van wesleyvaders.nl is verwijderd. Er is geen inhoudelijke tegenhanger, dus alle 58 oude URL's gaan met een 301 naar `https://burovaders.nl/`.

**Vier paden staan er bewust niet tussen: `/`, `/contact/`, `/cookies/` en `/privacy-policy/`.** Die bestonden op de oude site én bestaan op de nieuwe. Zou je ze doorsturen, dan worden de nieuwe pagina's onbereikbaar.

Voeg nooit een redirect toe voor een pad dat op deze site bestaat of gaat bestaan. Controleer bij twijfel tegen de pagina's in `src/pages/` en tegen `navAlles` in `site.js`.

## Wat er nog niet is

De finca, de verbouwing, before-after, het budget, de plattegrond, de afleveringen en het Spanje-dossier bestaan nog niet. De architectuur is erop voorbereid, maar bouw ze pas als er echte inhoud is.

## Deploy

Elke push naar `main` deployt vanzelf. GitHub Actions (`.github/workflows/deploy.yml`) bouwt de site en zet `dist/` via FTPS op de server. De inloggegevens staan in GitHub onder Settings > Secrets and variables > Actions: `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`.

**Er loopt ook elke nacht een build, om 04:00 UTC.** Niet omdat er dan
iets verandert in de repo, maar omdat de site datums uitrekent. De
teller, de cijferstrook en het label op `og/gastenboek.jpg` worden bij de
build vastgelegd; in de browser worden ze daarna bijgewerkt, maar het
deelplaatje niet, want dat is een afbeelding. Zonder die nachtelijke
build staat er in de uitgeleverde HTML en op dat plaatje de stand van de
laatste push. Zie `schedule` in `deploy.yml`.

**Gebruik de Git Deploy plugin in DirectAdmin niet meer.** Die schrijft naar dezelfde map en overschrijft dan wat Actions net heeft neergezet.

Handmatig kan nog steeds: `npm run build` en dan de inhoud van `dist/` naar `public_html/`. Zie `deploy.sh`.
