# wesleyvaders.nl

Persoonlijke site en archief van Wesley Vaders, die zijn huis in Den Haag verkocht en naar Spanje vertrekt om daar een finca te kopen en te verbouwen. De site is de thuisbasis van het verhaal. YouTube, Instagram, TikTok en Facebook zijn distributie.

Astro 5, statisch, geen database, geen CMS. Bouwt naar `dist/` en gaat bij elke push naar `main` vanzelf via GitHub Actions naar de server. Alleen het gastenboek draait op een klein PHP-eindpunt.

## Voor je iets aanpast

Deze site praat over een vertrek dat steeds dichterbij komt. Daardoor
veroudert inhoud snel en spreken twee plekken elkaar zomaar tegen. Loop bij
elke inhoudelijke wijziging deze zes na:

1. **Het NU-blok** in `site.js`: klopt de kop nog met hoe het huis erbij staat, en het logboek met wat er af is?
2. **De tijdlijn** op de homepage (`route` in `site.js`): staat `nu` nog op de goede halte, of is die al `gehad`?
3. **De cijferstrook**: spreekt geen enkel cijfer een andere pagina tegen.
   De eerste twee kolommen rekent de site zelf uit, uit `vertrek` en
   `afstand` in `site.js`. Alleen de derde staat er met de hand bij.
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

**Tekst die vóór en ná het vertrek anders moet luiden staat dubbel in de
bron en wordt gekozen op de datum.** Zo is het met `site.omschrijving` en
`site.omschrijvingOnderweg` voor de herotekst, en met de kop en de intro
van het gastenboek. Nooit met de hand omzetten: dan staat er op de dag
zelf "Nog 0 dagen tot ik vertrek".

**Verhalen en korte berichten zijn momentopnamen en bevriezen.** Daarin mag
"nog 22 dagen" blijven staan, ook als dat er inmiddels 18 zijn. Dat was wat
er op die datum gold en het hoort bij het bericht.

## Commando's

```bash
npm run dev      # lokaal op http://localhost:4321
npm run build    # naar dist/
npm run preview  # dist/ lokaal bekijken
```

## Waar staat wat

| Pad | Wat |
|---|---|
| `src/data/site.js` | Alle terugkerende content: NU-blok, route, stappen, cijfers, socials, navigatie, vertrekdatum. Dit bestand pas je het vaakst aan. |
| `src/data/route.js` | De zeven etappes naar Alfaz del Pi: coördinaten, kilometers, status en foto. Voedt de kaart, de lijst en de tips. |
| `src/content/verhalen/` | Losse verhalen. Eén markdown per verhaal. |
| `src/content/hierennu/` | Korte berichten. Verschijnen op de homepage en op `/hierennu/`. |
| `src/content.config.js` | De velden die een verhaal of bericht mag hebben. |
| `src/styles/global.css` | Alle styling en alle merktokens. Ook de stijlen van dingen die JavaScript aanmaakt, want scoped CSS pakt die niet. |
| `src/components/` | Nav, Footer, Merkteken, Routelijn, Routekaart, Etappes, Gastenboek, Reacties, Video, Analytics, Cookiebanner. |
| `src/lib/gastenboek.js` | Haalt bij de build het aantal berichten op voor de hero, en het aantal per bron voor de verhalenpagina. Faalt dat, dan blijven die stukjes leeg. |
| `public/fotos/` | Gegradeerde foto's. |
| `public/og/` | Deelplaatjes, 1200x630. |
| `public/fonts/` | De vier woff2-bestanden. Zelf gehost, latin-subset. |
| `public/api/` | Het gastenboek: `gastenboek.php` (lezen en plaatsen), `gastenboek-beheer.php` (wijzigen en weggooien), `gastenboek-pad.php` (waar de data staat). |
| `public/.htaccess` | 58 redirects van de oude site naar burovaders.nl, plus eigen URL's die veranderd zijn, caching en headers. |
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

## Analytics

Staat aan, GA4 met meet-id `G-7Q2453G8J1`. Ingesteld in `src/data/site.js`.

GA4 zet cookies, dus draait het via **Consent Mode v2**: alles staat standaard op `denied` en gaat pas naar `granted` als de bezoeker in de balk op Prima klikt. De keuze staat in `localStorage` onder `wv-consent`. Zonder toestemming stuurt GA4 alleen geanonimiseerde pings zonder cookies.

De cookiebalk (`src/components/Cookiebanner.astro`) verschijnt pas na 1,2 seconde, is een smalle balk onderin en nooit een popup over de hero. Tekst en knoplabels staan in `site.js`.

Stap je ooit over naar `cloudflare`, `plausible` of `umami`, dan verdwijnt de balk automatisch, want die zijn cookieloos.

## Nav en kapotte links

`src/data/site.js` heeft `navAlles` met een `klaar`-vlag per item. Alleen items met `klaar: true` verschijnen in de navigatie en de footer. **Bouw je een nieuwe pagina, zet dan pas daarna de vlag om.** Zo staan er nooit links naar pagina's die nog niet bestaan.

Nu klaar: Mijn verhaal, De route, Het avontuur, Verhalen, Gastenboek, Privacy, Cookies, Contact.
Nog niet: Afleveringen, Spanje.

`/hierennu/` en `/beheer/` staan bewust niet in de navigatie. De eerste is bereikbaar via het Onderweg-blok op de homepage, de tweede is alleen voor Wesley en staat op noindex.

## Juridische pagina's

`privacy-policy.astro` en `cookies.astro` zijn geschreven op de huidige situatie: GA4 met Consent Mode, hosting bij CloudMonsters, Bunny CDN, zelf gehoste lettertypen, geen embeds, en drie formulieren die naam en bericht openbaar op de site zetten (het gastenboek, de tips per etappe en de reacties onder een verhaal). **Verandert een van die dingen, dan moeten deze pagina's mee.** Vooral bij het insluiten van YouTube of TikTok, want dan komen er cookies van derden bij en moet de cookietabel worden aangevuld.

Het e-mailadres staat in `site.js` onder `contact.email`.

## Redirects

De oude therapeutencontent van wesleyvaders.nl is verwijderd. Er is geen inhoudelijke tegenhanger, dus alle 58 oude URL's gaan met een 301 naar `https://burovaders.nl/`.

**Vier paden staan er bewust niet tussen: `/`, `/contact/`, `/cookies/` en `/privacy-policy/`.** Die bestonden op de oude site én bestaan op de nieuwe. Zou je ze doorsturen, dan worden de nieuwe pagina's onbereikbaar.

Voeg nooit een redirect toe voor een pad dat op deze site bestaat of gaat bestaan. Controleer bij twijfel tegen de pagina's in `src/pages/` en tegen `navAlles` in `site.js`.

## Wat er nog niet is

De finca, de verbouwing, before-after, het budget, de plattegrond, de afleveringen en het Spanje-dossier bestaan nog niet. De architectuur is erop voorbereid, maar bouw ze pas als er echte inhoud is.

## Deploy

Elke push naar `main` deployt vanzelf. GitHub Actions (`.github/workflows/deploy.yml`) bouwt de site en zet `dist/` via FTPS op de server. De inloggegevens staan in GitHub onder Settings > Secrets and variables > Actions: `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`.

**Gebruik de Git Deploy plugin in DirectAdmin niet meer.** Die schrijft naar dezelfde map en overschrijft dan wat Actions net heeft neergezet.

Handmatig kan nog steeds: `npm run build` en dan de inhoud van `dist/` naar `public_html/`. Zie `deploy.sh`.
