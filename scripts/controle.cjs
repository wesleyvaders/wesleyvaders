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
  return browser;
}

/* ---------- 3 · contrast van tekst op een foto ----------
 *
 * Staat er tekst over een foto, dan hangt het contrast af van wat er
 * toevallig achter die regel zit. Dat meten we hier, en wel op het
 * zwakste stukje van de regel en niet op het gemiddelde: een enkel
 * woord boven een licht plekje verdwijnt terwijl de rest donker genoeg
 * is.
 *
 * DE EERSTE STAP IS VERPLICHT EN WORDT GECONTROLEERD. Drie keer op rij
 * wees een meting een foto af die prima was, en elke keer stond er iets
 * in het meetvak dat er niet hoorde: de PRIMA-knop van de cookiebalk,
 * en een reveal-animatie die halverwege was blijven staan. Daarom haalt
 * maakMeetbaar() die twee eerst weg en gooit hij een fout als dat niet
 * gelukt is. Een waarschuwing in CLAUDE.md bleek niet genoeg.
 *
 * De tekst zelf gaat op onzichtbaar voordat er een plaatje wordt
 * gemaakt: contrast meet je nooit op een beeld waar letters op staan.
 */
const VAKKEN = [
  { pagina: '/', kies: '.quote', zonder: 'span', naam: 'citaat op de foto' },
  { pagina: '/', kies: '.quote span', naam: 'naamregel onder het citaat' }
];

async function maakMeetbaar(tab) {
  const weg = await tab.evaluate(() => {
    document.querySelectorAll('[class*=cookie],[data-cookie],[id*=cookie]')
      .forEach((e) => e.remove());
    // de reveal-animaties bevriezen op hun eindstand
    document.querySelectorAll('.rv').forEach((e) => {
      e.style.setProperty('opacity', '1', 'important');
      e.style.setProperty('transform', 'none', 'important');
      e.style.setProperty('transition', 'none', 'important');
    });
    return true;
  });
  await new Promise((r) => setTimeout(r, 250));

  const schoon = await tab.evaluate(() => ({
    balk: document.querySelectorAll('[class*=cookie],[data-cookie],[id*=cookie]').length,
    halfzichtbaar: [...document.querySelectorAll('.rv')]
      .filter((e) => Number(getComputedStyle(e).opacity) < 1).length
  }));
  if (!weg || schoon.balk || schoon.halfzichtbaar) {
    throw new Error(`Meetvak niet schoon: ${schoon.balk} cookie-element(en), ` +
      `${schoon.halfzichtbaar} halfzichtbare .rv. Niet meten.`);
  }
}

function contrast(a, b) {
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = (p) => 0.2126 * lin(p[0]) + 0.7152 * lin(p[1]) + 0.0722 * lin(p[2]);
  const [la, lb] = [lum(a), lum(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

async function contrastcontrole(browser) {
  const sharp = require('sharp');
  console.log('\n--- contrast van tekst op een foto ---');

  for (const breedte of BREEDTES) {
    for (const vak of VAKKEN) {
      const tab = await browser.newPage();
      await tab.setViewport({ width: breedte, height: 900, deviceScaleFactor: 1 });
      await tab.goto(BASIS + vak.pagina, { waitUntil: 'networkidle0', timeout: 20000 });
      await maakMeetbaar(tab);

      // Eerst scrollen en wachten. scrollIntoView werkt niet meteen, en
      // een clip buiten het venster levert een plaatje van de kale
      // achtergrond op in plaats van van de foto. Dat gaf 16,36:1,
      // precies het contrast van papier op inkt, en dus een meting die
      // nergens over ging.
      const staater = await tab.evaluate((kies) => {
        const el = document.querySelector(kies);
        if (!el) return false;
        // behavior:'instant' moet erbij: global.css zet scroll-behavior
        // op smooth, en dan meet je halverwege de animatie.
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
        return true;
      }, vak.kies);
      if (!staater) { meld('contrast', `${vak.kies} bestaat niet op ${vak.pagina}`); await tab.close(); continue; }
      // even laten zakken: boven het citaat staan luie afbeeldingen die
      // bij het binnenkomen nog een paar pixels verschuiven
      await new Promise((r) => setTimeout(r, 900));

      const meta = await tab.evaluate((kies, zonder) => {
        const el = document.querySelector(kies);
        if (!el) return null;
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        let hoogte = r.height;
        if (zonder) {
          const kind = el.querySelector(zonder);
          if (kind) hoogte = kind.getBoundingClientRect().top - r.top - 8;
        }
        // de dekking van het element zelf en van alles erboven
        let dekking = 1, n = el;
        while (n && n !== document.documentElement) {
          dekking *= Number(getComputedStyle(n).opacity);
          n = n.parentElement;
        }
        const kleur = s.color.match(/[\d.]+/g).slice(0, 3).map(Number);
        const grootte = parseFloat(s.fontSize);
        const vet = Number(s.fontWeight) >= 700;
        // De clip van tab.screenshot rekent vanaf de linkerbovenhoek van
        // het DOCUMENT, niet van het venster. Met venstercoördinaten
        // maakte hij een plaatje van de hero bovenaan de pagina, en dan
        // staat er bij elke build hetzelfde cijfer, wat de foto ook is.
        // Daar zijn drie builds aan opgegaan.
        return { x: r.x + window.scrollX, y: r.y + window.scrollY,
          w: r.width, h: hoogte, kleur, dekking, grootte, vet,
          inBeeld: r.top >= 0 && r.top + hoogte <= window.innerHeight };
      }, vak.kies, vak.zonder);

      if (!meta) { meld('contrast', `${vak.kies} bestaat niet op ${vak.pagina}`); await tab.close(); continue; }
      if (!meta.inBeeld) throw new Error(`${vak.naam} staat niet volledig in beeld; niet meten.`);

      await tab.evaluate((kies) => { document.querySelector(kies).style.visibility = 'hidden'; }, vak.kies);
      await new Promise((r) => setTimeout(r, 200));

      const clip = { x: Math.round(meta.x), y: Math.round(meta.y),
        width: Math.max(1, Math.round(meta.w)), height: Math.max(1, Math.round(meta.h)) };
      // captureBeyondViewport expliciet: met false knipt hij de clip
      // tegen het zichtbare deel en krijg je een plaatje van 0 hoog.
      const png = await tab.screenshot({ clip, captureBeyondViewport: true });
      const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });

      // schuivend venster over de regel; het lichtste stukje is het
      // zwakste voor lichte tekst, het donkerste voor donkere tekst
      const kanaal = info.channels;
      const venster = Math.min(40, info.width);
      let ergste = null;
      for (let vx = 0; vx + venster <= info.width; vx += 8) {
        let r = 0, g = 0, b = 0, n = 0;
        for (let y = 0; y < info.height; y++) {
          for (let x = vx; x < vx + venster; x++) {
            const i = (y * info.width + x) * kanaal;
            r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
          }
        }
        const grond = [r / n, g / n, b / n];
        // de kleur zoals hij er echt uit komt: met zijn dekking over de grond
        const voor = meta.kleur.map((c, k) => c * meta.dekking + grond[k] * (1 - meta.dekking));
        const c = contrast(grond, voor);
        if (ergste === null || c < ergste.c) ergste = { c, grond };
      }

      const groot = meta.grootte >= 24 || (meta.grootte >= 18.66 && meta.vet);
      const eis = groot ? 3.0 : 4.5;
      const goed = ergste && ergste.c >= eis;
      const regel = `${String(breedte).padStart(4)}px  ${vak.naam.padEnd(30)} ` +
        `${ergste ? ergste.c.toFixed(2) : '?'}:1  eis ${eis.toFixed(1)}  ` +
        `(${Math.round(meta.grootte)}px, dekking ${meta.dekking.toFixed(2)})`;
      console.log(`${goed ? 'ok    ' : 'LET OP'} ${regel}`);
      if (!goed) meld(`${breedte}px contrast`, `${vak.naam}: ${ergste.c.toFixed(2)}:1, moet ${eis}:1 zijn`);
      await tab.close();
    }
  }
}

/* ---------- uitvoeren ---------- */

(async () => {
  console.log(`${paginas.length} pagina's in dist/\n`);
  apostrofcontrole();
  if (!ALLEEN_BESTANDEN) {
    const browser = await browsercontroles();
    await contrastcontrole(browser);
    await browser.close();
  }

  if (fouten.length) {
    console.log(`\n${fouten.length} ${fouten.length === 1 ? 'probleem' : 'problemen'}:`);
    fouten.forEach((f) => console.log('  ' + f));
    process.exit(1);
  }
  console.log('\nAlles schoon.');
})();
