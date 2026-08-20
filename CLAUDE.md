# wesleyvaders.nl

Persoonlijke site en archief van Wesley Vaders, die zijn huis in Den Haag verkocht en naar Spanje vertrekt om daar een finca te kopen en te verbouwen. De site is de thuisbasis van het verhaal. YouTube, Instagram, TikTok en Facebook zijn distributie.

Astro 5, statisch, geen database, geen CMS. Bouwt naar `dist/`, gaat via GitHub naar de Git Deploy plugin van CloudMonsters.

## Commando's

```bash
npm run dev      # lokaal op http://localhost:4321
npm run build    # naar dist/
npm run preview  # dist/ lokaal bekijken
```

## Waar staat wat

| Pad | Wat |
|---|---|
| `src/data/site.js` | Alle terugkerende content: NU-blok, route, stappen, socials, Mowgli. Dit bestand pas je het vaakst aan. |
| `src/content/verhalen/` | Losse verhalen. Eén markdown per verhaal. |
| `src/content/hierennu/` | Korte berichten. Verschijnen op de homepage. |
| `src/content.config.js` | De velden die een verhaal of bericht mag hebben. |
| `src/styles/global.css` | Alle styling en alle merktokens. |
| `src/components/` | Nav, Footer, Merkteken, Routelijn. |
| `public/fotos/` | Gegradeerde foto's. |
| `public/.htaccess` | 58 redirects van de oude site naar de homepage van burovaders.nl, plus caching en headers. |
| `scripts/grade.py` | Fotogrades. Draaien vóór upload, niet tijdens de build. |

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

Optionele velden die nu al bestaan en later gebruikt worden: `coordinaten` ([lat, lng] voor de kaart), `aflevering`, `onderdeel` (De Finca), `budget`, `voorNa`, `galerij`, `tags`. **Vul `coordinaten` altijd in.** Later terugkomen op vijftig verhalen om er coördinaten bij te zoeken is een middag werk, nu is het tien seconden.

## Foto's

Alle beelden gaan eerst door `scripts/grade.py`. Twee profielen:

- **NL** koel, grijs, ontladen. Voor Nederland.
- **ES** warm, stoffig, goud. Voor Spanje.

Dat is opzet: het merk warmt op naarmate het verhaal naar het zuiden gaat. Nooit een ongegradeerde foto in `public/fotos/` zetten, en nooit een extra filter over de grade heen.

Astro maakt zelf de responsive varianten. Gebruik altijd `<Image>` uit `astro:assets`, nooit een kale `<img>` voor content.

## Regels die niet gebroken worden

**Kleur.** Inkt `#141412`, papier `#F5F1E8`, terracotta `#B0573A`, bos `#2C4739`, zand `#D9C6A5`, goud `#DFAF4A`. Ongeveer 60% papier, 25% inkt, 8% terracotta, 5% zand, 2% goud. **Goud is uitsluitend het NU-punt.** Zie je het vaker dan één keer per scherm, dan is het fout.

**Typografie.** Instrument Serif voor koppen, regelafstand onder 1, altijd zinsvorm en nooit kapitalen. Instrument Sans voor lopende tekst, regelafstand 1.7, maximaal 44ch breed. JetBrains Mono voor alle data en labels, altijd kapitalen, `letter-spacing: .15em`, nooit groter dan 12px. Cursief is alleen voor quotes.

**Vorm.** Hoekradius 0 tot 4px, niets pil-vormig. Randen zijn haarlijnen, schaduwen bestaan niet. Geen enkele sectie krijgt twee even brede kolommen: gebruik de bestaande `.g-intro`, `.g-nu`, `.g-bus`, `.g-mow` verhoudingen of maak een nieuwe ongelijke. Wissel het verticale ritme af met `.sec`, `.sec-ruim` en `.sec-krap`. Diepte komt van fotografie, achtergrondtinten en witruimte, nooit van een verloop.

**Toon.** Nederlands, Haags, nuchter, droog. Woorden mogen wegvallen, het mag plat. Me en mijn wisselen af: terloops "me vader", op zware momenten "mijn vader". Niet gladstrijken en niet corrigeren.

Verboden woorden: ontdek, discover, learn more, get started, stap voor stap, steen voor steen, authentiek, transformatie, journey, mindset, reis als metafoor, en alles met een uitroepteken.

**Over zijn ouders.** Zijn vader Leo en zijn moeder zijn overleden, zijn oude hond Bo ook. Daar wordt over geschreven zoals hij erover praat: gewoon, tussen de dagelijkse dingen door. Geen kader, geen zwart-witfilter, geen plechtige typografie, nooit als opener en nooit als verkoopargument. Het verlies is de reden dat dit project bestaat, niet het onderwerp ervan.

**Geen verzonnen content.** Nooit volgersaantallen, kosten, aantallen bekeken finca's, testimonials of data verzinnen. Bestaat het nog niet, bouw het dan niet. Lege modules maken deze site kapot.

**Mowgli** heet Mowgli in koppen en Mo in bijschriften.

## Analytics

Staat aan, GA4 met meet-id `G-7Q2453G8J1`. Ingesteld in `src/data/site.js`.

GA4 zet cookies, dus draait het via **Consent Mode v2**: alles staat standaard op `denied` en gaat pas naar `granted` als de bezoeker in de balk op Prima klikt. De keuze staat in `localStorage` onder `wv-consent`. Zonder toestemming stuurt GA4 alleen geanonimiseerde pings zonder cookies.

De cookiebalk (`src/components/Cookiebanner.astro`) verschijnt pas na 1,2 seconde, is een smalle balk onderin en nooit een popup over de hero. Tekst en knoplabels staan in `site.js`.

Stap je ooit over naar `cloudflare`, `plausible` of `umami`, dan verdwijnt de balk automatisch, want die zijn cookieloos.

## Nav en kapotte links

`src/data/site.js` heeft `navAlles` met een `klaar`-vlag per item. Alleen items met `klaar: true` verschijnen in de navigatie en de footer. **Bouw je een nieuwe pagina, zet dan pas daarna de vlag om.** Zo staan er nooit links naar pagina's die nog niet bestaan.

Nu klaar: Het avontuur, Verhalen, Privacy, Cookies, Contact.
Nog niet: Mijn verhaal, Afleveringen, Spanje.

## Juridische pagina's

`privacy-policy.astro` en `cookies.astro` zijn geschreven op de huidige situatie: GA4 met Consent Mode, hosting bij CloudMonsters, Bunny CDN, Google Fonts, geen formulieren en geen embeds. **Verandert een van die dingen, dan moeten deze pagina's mee.** Vooral bij het insluiten van YouTube of TikTok, want dan komen er cookies van derden bij en moet de cookietabel worden aangevuld.

Het e-mailadres staat in `site.js` onder `contact.email`.

## Redirects

De oude therapeutencontent van wesleyvaders.nl is verwijderd. Er is geen inhoudelijke tegenhanger, dus alle 58 oude URL's gaan met een 301 naar `https://burovaders.nl/`.

**Vier paden staan er bewust niet tussen: `/`, `/contact/`, `/cookies/` en `/privacy-policy/`.** Die bestonden op de oude site én bestaan op de nieuwe. Zou je ze doorsturen, dan worden de nieuwe pagina's onbereikbaar.

Voeg nooit een redirect toe voor een pad dat op deze site bestaat of gaat bestaan. Controleer bij twijfel tegen de pagina's in `src/pages/` en tegen `navAlles` in `site.js`.

## Wat er nog niet is

De finca, de verbouwing, before-after, het budget, de plattegrond, de afleveringen en het Spanje-dossier bestaan nog niet. De architectuur is erop voorbereid, maar bouw ze pas als er echte inhoud is.

## Deploy

Push naar `main`. De Git Deploy plugin in DirectAdmin bouwt en zet live. Rollback zit in dezelfde plugin.

Handmatig kan ook: `npm run build` en dan de inhoud van `dist/` naar `public_html/`. Zie `deploy.sh`.
