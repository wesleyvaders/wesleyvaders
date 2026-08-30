# wesleyvaders.nl

Persoonlijke site en archief van Wesley Vaders, die zijn huis in Den Haag verkocht en naar Spanje vertrekt om daar een finca te kopen en te verbouwen. De site is de thuisbasis van het verhaal. YouTube, Instagram, TikTok en Facebook zijn distributie.

Astro 5, statisch, geen database, geen CMS. Bouwt naar `dist/` en gaat bij elke push naar `main` vanzelf via GitHub Actions naar de server. Alleen het gastenboek draait op een klein PHP-eindpunt.

## Voor je iets aanpast

Deze site praat over een vertrek dat steeds dichterbij komt. Daardoor
veroudert inhoud snel en spreken twee plekken elkaar zomaar tegen. Loop bij
elke inhoudelijke wijziging deze vier na:

1. **Het NU-blok** in `site.js`: klopt de kop nog met hoe het huis erbij staat, en het logboek met wat er af is?
2. **De tijdlijn** op de homepage (`route` in `site.js`): staat `nu` nog op de goede halte, of is die al `gehad`?
3. **De cijferstrook**: spreekt geen enkel cijfer een andere pagina tegen.
4. **De aftelling**: hero, gastenboek, menu en route horen hetzelfde te zeggen.

**Nooit een datum of een aantal intypen dat vanzelf verandert.** Alles wat
met de tijd meeloopt komt uit `vertrek` in `site.js` via `src/lib/tijd.js`,
en wordt in de browser bijgewerkt via `data-dagen`, `data-weken` en
`data-aftel` in `Base.astro`. Zo verjaart het niet tussen twee deploys.
Schrijf dus `{weken}` in de tekst, geen "drie weken".

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
| `src/components/` | Nav, Footer, Merkteken, Routelijn, Routekaart, Etappes, Gastenboek, Analytics, Cookiebanner. |
| `src/lib/gastenboek.js` | Haalt bij de build het aantal berichten op voor de hero. Faalt dat, dan blijft dat stukje leeg. |
| `public/fotos/` | Gegradeerde foto's. |
| `public/og/` | Deelplaatjes, 1200x630. |
| `public/fonts/` | De vier woff2-bestanden. Zelf gehost, latin-subset. |
| `public/api/` | Het gastenboek: `gastenboek.php` (lezen en plaatsen), `gastenboek-beheer.php` (wijzigen en weggooien), `gastenboek-pad.php` (waar de data staat). |
| `public/.htaccess` | 58 redirects van de oude site naar burovaders.nl, plus eigen URL's die veranderd zijn, caching en headers. |
| `scripts/grade.py` | Fotogrades. Draaien vóór upload, niet tijdens de build. |
| `scripts/og.py` | Deelplaatjes van de hoofdfoto's. Handmatig draaien. |
| `scripts/og-gastenboek.py` | Het deelplaatje van het gastenboek. Loopt mee bij elke build, zodat de aftelling klopt. |
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

Wil je een ander deelplaatje dan dat van de hoofdfoto, zet dan `deelplaatje: route.jpg` erbij (een bestandsnaam uit `public/og/`), eventueel met `deelplaatjeAlt`.

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

## Regels die niet gebroken worden

**Kleur.** Inkt `#141412`, papier `#F5F1E8`, terracotta `#B0573A`, bos `#2C4739`, zand `#D9C6A5`, goud `#DFAF4A`. Ongeveer 60% papier, 25% inkt, 8% terracotta, 5% zand, 2% goud. **Goud is uitsluitend het NU-punt.** Zie je het vaker dan één keer per scherm, dan is het fout.

**Typografie.** Instrument Serif voor koppen, regelafstand onder 1, altijd zinsvorm en nooit kapitalen. Instrument Sans voor lopende tekst, regelafstand 1.7, maximaal 44ch breed. JetBrains Mono voor alle data en labels, altijd kapitalen, `letter-spacing: .15em`, nooit groter dan 12px. Cursief is alleen voor quotes.

**Vorm.** Hoekradius 0 tot 4px, niets pil-vormig. Randen zijn haarlijnen, schaduwen bestaan niet. Geen enkele sectie krijgt twee even brede kolommen: gebruik de bestaande `.g-intro`, `.g-nu`, `.g-bus`, `.g-gb` verhoudingen of maak een nieuwe ongelijke. Wissel het verticale ritme af met `.sec`, `.sec-ruim` en `.sec-krap`. Diepte komt van fotografie, achtergrondtinten en witruimte, nooit van een verloop.

**Toon.** Nederlands, Haags, nuchter, droog. Woorden mogen wegvallen, het mag plat. Me en mijn wisselen af: terloops "me vader", op zware momenten "mijn vader". Niet gladstrijken en niet corrigeren.

Verboden woorden: ontdek, discover, learn more, get started, stap voor stap, steen voor steen, authentiek, transformatie, journey, mindset, reis als metafoor, en alles met een uitroepteken.

Wesley woont in Monster maar is een Hagenees, en zo communiceert hij ook. Den Haag gebruiken bij afkomst en identiteit: de hero, Mijn verhaal, de routelijn, de footer. Monster gebruiken bij feitelijke locaties bij een datum: korte berichten, verhalen, locatiebadges. Nooit Westland gebruiken.

**Over zijn ouders.** Zijn vader Leo en zijn moeder zijn overleden, zijn oude hond Bo ook. Daar wordt over geschreven zoals hij erover praat: gewoon, tussen de dagelijkse dingen door. Geen kader, geen zwart-witfilter, geen plechtige typografie, nooit als opener en nooit als verkoopargument. Dit gaat over vooruit kijken, niet over verdriet. Schrijf er nooit omheen, maar maak er ook nooit een verhaal op zich van.

**Geen verzonnen content.** Nooit volgersaantallen, kosten, aantallen bekeken finca's, testimonials of data verzinnen. Bestaat het nog niet, bouw het dan niet. Lege modules maken deze site kapot.

**Mowgli** heet Mowgli in koppen en Mo in bijschriften.

## Gastenboek en tips

Het enige dynamische deel van de site. De berichten staan **niet** in de repo maar op de server, in `domains/wesleyvaders.nl/gastenboek-data/` naast `public_html`. Dat pad wordt afgeleid van het eindpunt zelf, dus er staat nergens een accountnaam in. Buiten `public_html`, want de FTP-deploy gooit alles weg wat niet in `dist/` zit.

Drie bestanden horen daar: `berichten.json`, `token.txt` (jouw wachtwoord voor `/beheer/`, mag een zin zijn die je onthoudt) en `geheim.txt` (ondertekent het tijdstempel van het formulier).

Elk bericht heeft een **bron**: `gastenboek`, of `route:03-dune-du-pilat` voor een tip bij een etappe. Berichten zonder bron tellen als gastenboek. De filters zijn voor beide gelijk: honeypot, minstens vier seconden tussen laden en versturen, geen links, maximaal 1200 tekens. De rem per IP verschilt: drie gastenboekberichten per uur, tien tips.

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

`privacy-policy.astro` en `cookies.astro` zijn geschreven op de huidige situatie: GA4 met Consent Mode, hosting bij CloudMonsters, Bunny CDN, zelf gehoste lettertypen, geen embeds, en twee formulieren die naam en bericht openbaar op de site zetten (het gastenboek en de tips per etappe). **Verandert een van die dingen, dan moeten deze pagina's mee.** Vooral bij het insluiten van YouTube of TikTok, want dan komen er cookies van derden bij en moet de cookietabel worden aangevuld.

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
