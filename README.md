# wesleyvaders.nl

Statische site op Astro. Geen database, geen CMS, geen inlogscherm.

## Aan de slag

```bash
npm install
npm run dev
```

Open http://localhost:4321

## Live zetten

Push naar `main`. GitHub Actions bouwt de site en zet hem via FTPS op de server (`.github/workflows/deploy.yml`). Handmatig starten kan via het tabblad Actions.

De secrets `FTP_HOST`, `FTP_USER` en `FTP_PASSWORD` staan in GitHub onder Settings > Secrets and variables > Actions.

## Handmatig deployen

Werkt Actions niet, dan kan het handmatig vanaf een machine waarvan het IP
bij CloudMonsters op de whitelist staat. Dit is de manier, en de volgorde
staat vast: eerst kijken, dan deployen.

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

De inloggegevens komen uit `~/.config/wesleyvaders/deploy.env`, buiten de
repo met rechten 600. Zie het kopje Handmatig deployen in `CLAUDE.md`.

## Eerste keer nalopen

- [ ] De doel-URL's in `public/.htaccess` controleren. Nu zijn het aannames over burovaders.nl. Een 301 naar een 404 is erger dan geen 301.
- [ ] Node-versie in de buildomgeving checken.
- [ ] Na livegang de sitemap indienen in Search Console.

Zie `CLAUDE.md` voor hoe het project in elkaar zit en welke regels gelden.
