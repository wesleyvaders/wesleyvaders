# wesleyvaders.nl

Statische site op Astro. Geen database, geen CMS, geen inlogscherm.

## Aan de slag

```bash
npm install
npm run dev
```

Open http://localhost:4321

## Live zetten

Push naar `main`. CloudMonsters bouwt en deployt via de Git Deploy plugin in DirectAdmin.

Instellen in DirectAdmin:

- Repository: deze repo, branch `main`
- Projecttype: **statisch**
- Buildcommando: `npm run build`
- Output-map: `dist`
- Node: 20 of hoger

Werkt dat niet, gebruik dan `./deploy.sh` (rsync, gegevens bovenin invullen).

## Eerste keer nalopen

- [ ] De doel-URL's in `public/.htaccess` controleren. Nu zijn het aannames over burovaders.nl. Een 301 naar een 404 is erger dan geen 301.
- [ ] Node-versie in de buildomgeving checken.
- [ ] Na livegang de sitemap indienen in Search Console.

Zie `CLAUDE.md` voor hoe het project in elkaar zit en welke regels gelden.
