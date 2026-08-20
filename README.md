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

Werkt dat niet, gebruik dan `./deploy.sh` (rsync, gegevens bovenin invullen).

## Eerste keer nalopen

- [ ] De doel-URL's in `public/.htaccess` controleren. Nu zijn het aannames over burovaders.nl. Een 301 naar een 404 is erger dan geen 301.
- [ ] Node-versie in de buildomgeving checken.
- [ ] Na livegang de sitemap indienen in Search Console.

Zie `CLAUDE.md` voor hoe het project in elkaar zit en welke regels gelden.
