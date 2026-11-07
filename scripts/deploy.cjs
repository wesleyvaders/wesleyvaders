/**
 * Handmatige FTPS-deploy van wesleyvaders.nl.
 *
 * Normaal doet GitHub Actions dit bij elke push. Dit script is er voor
 * als dat niet kan, zoals in november 2026 toen CloudMonsters poort 21
 * dichtzette en per IP ging whitelisten: Wesley's eigen IP mag erin, dat
 * van een GitHub-runner wisselt en kan er dus niet op.
 *
 * Zelfde bibliotheek en instellingen als SamKirkland/FTP-Deploy-Action:
 * basic-ftp, expliciete FTPS op poort 21, dezelfde exclude-lijst.
 *
 * VERWIJDERT NIETS. Alleen toevoegen en overschrijven, want het
 * toestandsbestand van de action (.ftp-deploy-sync-state.json) blijft
 * zo ongemoeid en de automatische deploy pakt het vanzelf weer op.
 *
 * Inloggegevens in ~/.config/wesleyvaders/deploy.env, rechten 600,
 * buiten de repo. Drie regels: FTP_HOST, FTP_USER, FTP_PASSWORD.
 * Het wachtwoord gaat nooit over de opdrachtregel.
 *
 *   npm run build
 *   node scripts/deploy.cjs kijken     verbinden en controleren, schrijft niets
 *   node scripts/deploy.cjs uploaden   idem, en daarna pas uploaden
 *
 * Draai altijd eerst `kijken`. Die bewijst dat je in de goede map zit
 * door het versie.txt dat daar ligt te vergelijken met wat de site
 * teruggeeft; zie de uitleg in CLAUDE.md.
 *
 * Verbind op theems.cloudmonsters.nl en niet op ftp.wesleyvaders.nl:
 * het certificaat staat op die eerste naam, en dan kan de controle
 * erop aan blijven staan.
 */
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const https = require('https');


const REPO = path.join(__dirname, '..');
const LOKAAL = path.join(REPO, 'dist');
// Het FTP-account is gechroot in public_html van dit domein: zijn '/'
// IS /home/cm32678/domains/wesleyvaders.nl/public_html. Vandaar ook
// server-dir: ./ in de workflow. Het absolute pad bestaat over FTP niet.
const DOEL = '';   // de wortel van de FTP-login
const DOEL_ECHT = '/home/cm32678/domains/wesleyvaders.nl/public_html';
const ENV = path.join(process.env.HOME, '.config/wesleyvaders/deploy.env');

// Zelfde lijst als in deploy.yml
const OVERSLAAN = (rel) =>
  /(^|\/)\.git/.test(rel) || /(^|\/)node_modules(\/|$)/.test(rel) || /^\.well-known(\/|$)/.test(rel);

function lees(bestand) {
  const uit = {};
  for (const regel of fs.readFileSync(bestand, 'utf8').split('\n')) {
    const m = /^\s*([A-Z_]+)\s*=\s*(.*)$/.exec(regel);
    if (m) uit[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return uit;
}

const haal = (url) => new Promise((ok, fout) => {
  https.get(url, (r) => { let d = ''; r.on('data', c => d += c); r.on('end', () => ok(d)); }).on('error', fout);
});

function bestanden(map, voorvoegsel = '') {
  const uit = [];
  for (const item of fs.readdirSync(map, { withFileTypes: true })) {
    const rel = voorvoegsel + item.name;
    if (OVERSLAAN(rel)) continue;
    if (item.isDirectory()) uit.push(...bestanden(path.join(map, item.name), rel + '/'));
    else uit.push(rel);
  }
  return uit;
}

(async () => {
  const doen = process.argv[2];
  if (!['kijken', 'uploaden'].includes(doen)) {
    console.error('Gebruik: node deploy-handmatig.cjs kijken|uploaden'); process.exit(2);
  }
  const g = lees(ENV);
  // Een host uit de omgeving wint, om te kunnen proberen of het
  // certificaat wel klopt op de echte servernaam.
  if (process.env.FTP_HOST) g.FTP_HOST = process.env.FTP_HOST;
  for (const k of ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD']) {
    if (!g[k]) { console.error(`${k} is niet ingevuld in ${ENV}.`); process.exit(2); }
  }

  const c = new ftp.Client(30000);
  c.ftp.verbose = false;
  try {
    // expliciete FTPS op 21, net als protocol: ftps in de action
    await c.access({
      host: g.FTP_HOST, user: g.FTP_USER, password: g.FTP_PASSWORD,
      port: 21, secure: true,
      secureOptions: { rejectUnauthorized: process.env.STRIKT === '1' }
    });
    console.log('verbonden, TLS actief');

    const hier = await c.pwd();
    console.log('login komt uit in:', hier, ' (= ' + DOEL_ECHT + ')');
    if (hier !== '/') throw new Error(`Sta in ${hier}, verwachtte de wortel van de chroot. Gestopt.`);

    const lijst = await c.list();
    console.log(`\n${lijst.length} items in deze map. Eerste vijftien:`);
    for (const f of lijst.slice(0, 15)) {
      console.log(`  ${f.isDirectory ? 'd' : '-'} ${String(f.size).padStart(9)}  ${f.name}`);
    }

    // Is dit echt de map die wesleyvaders.nl uitserveert? Bewijs: het
    // versie.txt dat hier ligt moet gelijk zijn aan wat de site teruggeeft.
    const tmp = '/tmp/versie-server.txt';
    await c.downloadTo(tmp, 'versie.txt');
    const opServer = fs.readFileSync(tmp, 'utf8').trim();
    const opSite = (await haal('https://wesleyvaders.nl/versie.txt')).trim();
    console.log('\nversie.txt in deze map :', opServer);
    console.log('versie.txt op de site  :', opSite);
    if (opServer !== opSite) throw new Error('Die twee verschillen. Dit is niet de map achter wesleyvaders.nl. Gestopt.');
    console.log('gelijk, dus dit is de map achter wesleyvaders.nl');

    const namen = new Set(lijst.map(f => f.name));
    const missen = ['index.html', 'verhalen', 'og', 'api', 'fotos'].filter(n => !namen.has(n));
    if (missen.length) throw new Error(`Mis hier: ${missen.join(', ')}. Gestopt.`);
    console.log('index.html, verhalen, og, api en fotos staan er');

    if (doen === 'kijken') { console.log('\nAlleen gekeken, niets geschreven.'); return; }

    const alles = bestanden(LOKAAL);
    console.log(`\n${alles.length} bestanden uploaden uit dist/. Niets verwijderen.`);
    let n = 0, mislukt = [];
    for (const rel of alles) {
      try {
        const map = path.dirname(rel);
        if (map !== '.') await c.ensureDir('/' + map);
        else await c.cd('/');
        await c.uploadFrom(path.join(LOKAAL, rel), '/' + rel);
        if (++n % 50 === 0) console.log(`  ${n}/${alles.length}`);
      } catch (e) { mislukt.push(`${rel}: ${e.message}`); }
    }
    console.log(`\nklaar: ${n} van ${alles.length} geüpload`);
    if (mislukt.length) { console.log('mislukt:'); mislukt.forEach(r => console.log('  ' + r)); process.exitCode = 1; }
  } catch (e) {
    console.error('\nFOUT:', e.message);
    process.exitCode = 1;
  } finally {
    c.close();
  }
})();
