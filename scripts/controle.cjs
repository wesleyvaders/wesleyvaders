/**
 * Controle over de gebouwde site in dist/.
 *
 * Draaien:
 *   npm run build
 *   npx serve dist -l 8899        (in een ander venster)
 *   npm run controle
 *
 * Zonder server draaien kan ook, dan blijven de browsercontroles achter:
 *   npm run controle -- --alleen-bestanden
 *
 * Twee soorten controles. De bestandscontroles lezen dist/ rechtstreeks
 * en hebben geen browser nodig. De browsercontroles openen elke pagina
 * op 1440 en 390 px, want aanraakvlakken en zichtbare afbeeldingen kun
 * je niet uit de HTML aflezen.
 *
 * Deze lijst stond maandenlang in een tijdelijke map en werd daar steeds
 * opgeruimd, waarna hij opnieuw getypt moest worden. Vandaar hier.
 */
const fs = require('fs');
const path = require('path');

const WORTEL = path.join(__dirname, '..');
const DIST = path.join(WORTEL, 'dist');
const BASIS = process.env.CONTROLE_URL || 'http://localhost:8899';
const ALLEEN_BESTANDEN = process.argv.includes('--alleen-bestanden');
const BREEDTES = [1440, 390];

if (!fs.existsSync(DIST)) {
  console.error('dist/ bestaat niet. Draai eerst npm run build.');
  process.exit(1);
}

const paginas = [];
(function loop(map, voorvoegsel) {
  for (const item of fs.readdirSync(map, { withFileTypes: true })) {
    if (item.isDirectory() && item.name !== '_astro' && !item.name.startsWith('.')) {
      loop(path.join(map, item.name), voorvoegsel + item.name + '/');
    } else if (item.name === 'index.html') {
      paginas.push(voorvoegsel);
    }
  }
})(DIST, '/');
paginas.sort();

const fouten = [];
const meld = (pagina, wat) => fouten.push(`${pagina}  ${wat}`);

/* ---------- 1 · bestandscontroles ---------- */

// Het openende enkele aanhalingsteken hoort hier niet in een
// samentrekking te staan. Smartypants maakte van de apostrof in
// "'s avonds" een U+2018; src/lib/apostrof.mjs zet dat terug. Deze
// controle vangt het als die plugin ooit stukgaat of wegvalt.
function apostrofcontrole() {
  const fout = /‘([stnkm])(?=[\s -])/g;
  let totaal2018 = 0, totaal2019 = 0, raak = 0;
  for (const pagina of paginas) {
    const html = fs.readFileSync(path.join(DIST, pagina, 'index.html'), 'utf8');
    totaal2018 += (html.match(/‘/g) || []).length;
    totaal2019 += (html.match(/’/g) || []).length;
    const treffers = html.match(fout) || [];
    if (treffers.length) {
      raak += treffers.length;
      meld(pagina, `${treffers.length}x verkeerde apostrof in een samentrekking (U+2018 i.p.v. U+2019)`);
    }
  }
  console.log(`apostrof   U+2018 ${totaal2018}, U+2019 ${totaal2019}` +
    (raak ? `  ${raak} fout` : '  geen samentrekking met U+2018'));
}

/* ---------- 2 · browsercontroles ---------- */

async function browsercontroles() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer-core');
  } catch {
    console.error('puppeteer-core ontbreekt. Draai npm install, of gebruik --alleen-bestanden.');
    process.exit(1);
  }
  const chrome = process.env.CHROME_PAD ||
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (!fs.existsSync(chrome)) {
    console.error(`Chrome niet gevonden op ${chrome}. Zet CHROME_PAD, of gebruik --alleen-bestanden.`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox'] });
  const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

  for (const breedte of BREEDTES) {
    console.log(`\n--- ${breedte}px ---`);
    for (const pagina of paginas) {
      const tab = await browser.newPage();
      await tab.setViewport({ width: breedte, height: 900 });
      try {
        await tab.goto(BASIS + pagina, { waitUntil: 'networkidle0', timeout: 20000 });
      } catch {
        console.error(`\nKan ${BASIS + pagina} niet openen. Draait er een server op ${BASIS}?`);
        await browser.close();
        process.exit(1);
      }
      await wacht(380);
      // alles openklappen wat achter een knop zit, anders meet je het niet
      await tab.evaluate(() => {
        document.querySelector('[data-menu]')?.click();
        document.querySelectorAll('[data-meer],[data-opnieuw],[data-deel],[data-reageer]')
          .forEach((e) => { e.hidden = false; });
      });
      await wacht(280);

      const r = await tab.evaluate(() => {
        const zichtbaar = (e) => {
          const b = e.getBoundingClientRect();
          return b.width > 0 && b.height > 0;
        };
        const imgs = [...document.querySelectorAll('img')].filter(zichtbaar);
        return {
          zonderAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
          legeAlt: imgs.filter((i) => i.getAttribute('alt') === '' && !i.closest('[aria-hidden="true"]')).length,
          // 43.5 en niet 44: een knop die precies 44px is komt er op
          // subpixels soms net onder en dat is geen echte fout
          klein: [...document.querySelectorAll('button,a,input:not([type=hidden]),textarea')]
            .filter((e) => {
              if (e.closest('.gb-honing')) return false;
              const b = e.getBoundingClientRect();
              if (b.width === 0 || b.height === 0 || b.height >= 43.5) return false;
              return !(e.tagName === 'A' && e.closest('p,li') && !e.closest('nav,footer,.deel,.pagina'));
            })
            .map((e) => `${e.tagName}.${(e.className || '-').toString().split(' ')[0]}`),
          h1: document.querySelectorAll('h1').length,
          links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href'))
        };
      });

      // interne links die nergens heen gaan; eenmaal controleren is genoeg
      const kapot = breedte === BREEDTES[0]
        ? [...new Set(r.links)].filter((href) => {
            const pad = href.split('#')[0].split('?')[0];
            if (pad === '/' || pad === '') return false;
            const met = pad.endsWith('/') ? pad : pad + '/';
            return !paginas.includes(met) && !fs.existsSync(path.join(DIST, pad));
          })
        : [];

      const goed = r.zonderAlt === 0 && r.legeAlt === 0 && r.klein.length === 0 &&
        r.h1 === 1 && kapot.length === 0;
      if (!goed) {
        const wat = [];
        if (r.zonderAlt) wat.push(`${r.zonderAlt} img zonder alt`);
        if (r.legeAlt) wat.push(`${r.legeAlt} lege alt buiten aria-hidden`);
        if (r.klein.length) wat.push(`te klein aanraakvlak: ${r.klein.join(', ')}`);
        if (r.h1 !== 1) wat.push(`${r.h1} h1`);
        if (kapot.length) wat.push(`kapotte link: ${kapot.join(', ')}`);
        meld(`${breedte}px ${pagina}`, wat.join(' · '));
      }
      console.log(`${goed ? 'ok    ' : 'LET OP'} ${pagina}`);
      await tab.close();
    }
  }
  await browser.close();
}

/* ---------- uitvoeren ---------- */

(async () => {
  console.log(`${paginas.length} pagina's in dist/\n`);
  apostrofcontrole();
  if (!ALLEEN_BESTANDEN) await browsercontroles();

  if (fouten.length) {
    console.log(`\n${fouten.length} ${fouten.length === 1 ? 'probleem' : 'problemen'}:`);
    fouten.forEach((f) => console.log('  ' + f));
    process.exit(1);
  }
  console.log('\nAlles schoon.');
})();
