# wesleyvaders.nl

Statische site op Astro. Geen database, geen CMS, geen inlogscherm.

## Aan de slag

```bash
npm install
npm run dev
```

Open http://localhost:4321

## Live zetten

Met de hand, vanaf een machine waarvan het IP bij CloudMonsters op de
whitelist staat. De volgorde staat vast: eerst kijken, dan deployen.

```bash
npm run build
```

```bash
npm run deploy:kijken
```

```bash
npm run deploy
```

`npm run deploy:kijken` verbindt en doet de drie controles, maar schrijft
niets. `npm run deploy` doet die controles nog een keer en uploadt pas
daarna; verwijderen doet hij nooit.

De build zet zelf `dist/versie.txt` met de commit en het bouwtijdstip.
Bouw je met niet-gecommitte wijzigingen, dan komt er `VUILE-WERKBOOM`
achter en waarschuwt de build; de live site is dan niet exact die
commit.

De inloggegevens komen uit `~/.config/wesleyvaders/deploy.env`, buiten de
repo met rechten 600. Zie het kopje Handmatig deployen in `CLAUDE.md`.

GitHub Actions (`.github/workflows/deploy.yml`) bouwt bij elke push naar
`main`, maar publiceert niet: CloudMonsters laat een runner niet bij
poort 21. Die run is dus een bouwcontrole. Waarom de uploadstap eruit is
en wat er nodig is om hem terug te zetten staat in de kop van dat
bestand.

## Eerste keer nalopen

- [ ] De doel-URL's in `public/.htaccess` controleren. Nu zijn het aannames over burovaders.nl. Een 301 naar een 404 is erger dan geen 301.
- [ ] Node-versie in de buildomgeving checken.
- [ ] Na livegang de sitemap indienen in Search Console.

Zie `CLAUDE.md` voor hoe het project in elkaar zit en welke regels gelden.
