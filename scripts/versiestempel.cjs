/**
 * Schrijft dist/versie.txt: welke commit er in deze dist/ zit en wanneer
 * hij gebouwd is.
 *
 * Draait als `postbuild`, dus na elke `npm run build`, en hoort daar ook
 * thuis. Dit stempel hing eerder aan de uploadstap van GitHub Actions.
 * Toen die stap eruit ging (CloudMonsters laat een runner niet bij poort
 * 21, zie de kop van .github/workflows/deploy.yml) leverde de build
 * opeens een dist/ zonder versie.txt op, en omdat de deploy nooit
 * verwijdert bleef het oude bestand op de server staan: het meldde een
 * commit van dagen eerder terwijl er nieuwere HTML naast lag.
 *
 * Daarom staat het nu in de build en niet in scripts/deploy.cjs. Wie
 * `npm run build` draait heeft een complete dist/, en het maakt niet
 * meer uit wie hem daarna uploadt of hoe.
 *
 * VUILE WERKBOOM
 *
 * Bouw je met niet-gecommitte wijzigingen, dan zit er in dist/ iets dat
 * niet in die commit staat. Het stempel zou dan iets beweren wat niet
 * waar is. Dat blokkeren we niet, want soms zet je even snel iets recht,
 * maar het stempel zegt het er wel bij: er komt VUILE-WERKBOOM achter,
 * en tijdens de build staat er een waarschuwing in beeld. Je kunt dus
 * aan versie.txt zien dat de live site niet exact die commit is.
 *
 * public/og/gastenboek.jpg telt daarbij niet mee. Dat bestand wordt door
 * `prebuild` bij elke build opnieuw getekend met de aftelling van die
 * dag, dus het verschilt van de commit zodra je op een andere dag bouwt.
 * Zou dat meetellen, dan stond de markering er altijd en zei hij niets
 * meer.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const WORTEL = path.resolve(__dirname, '..');
const DIST = path.join(WORTEL, 'dist');

// Build-artefact dat ook in de repo staat; zie de kop.
const NEGEER = new Set(['public/og/gastenboek.jpg']);

// stderr dicht: zonder git komt er anders een "fatal:" voor onze eigen,
// duidelijkere melding te staan.
//
// trimEnd en niet trim: `git status --porcelain` begint elke regel met de
// twee statusletters, en bij een niet-ingediende wijziging is de eerste
// daarvan een spatie. Een trim aan de voorkant eet die van de eerste
// regel op, en dan schuift het pad een teken op. Dat is hier echt
// gebeurd: ".github/workflows/deploy.yml" werd "github/workflows/..." en
// public/og/gastenboek.jpg zou als eerste regel aan NEGEER ontsnappen.
function git(...args) {
  return execFileSync('git', args, {
    cwd: WORTEL, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore']
  }).trimEnd();
}

if (!fs.existsSync(DIST)) {
  console.error('versiestempel: dist/ bestaat niet. Eerst bouwen.');
  process.exit(1);
}

const tijd = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

let sha = process.env.GITHUB_SHA || '';
let vuil = [];
let geenGit = false;

try {
  if (!sha) sha = git('rev-parse', 'HEAD').trim();
  vuil = git('status', '--porcelain')
    .split('\n')
    .filter(Boolean)
    .map(r => ({ staat: r.slice(0, 2), pad: r.slice(3) }))
    .filter(r => !NEGEER.has(r.pad));
} catch {
  geenGit = true;
}

let regel;
if (geenGit) {
  // Geen git, dus niet vast te stellen wat er in zit. Dan liever niets
  // beweren dan een sha opschrijven die we niet kennen.
  regel = `onbekende-commit ${tijd} GEEN-GIT`;
  console.warn('\n  versiestempel: geen git beschikbaar, dus geen commit vast te stellen.');
  console.warn('  dist/versie.txt zegt nu "onbekende-commit".\n');
} else if (vuil.length) {
  regel = `${sha} ${tijd} VUILE-WERKBOOM (${vuil.length} ${vuil.length === 1 ? 'bestand' : 'bestanden'} niet gecommit)`;
  console.warn(`\n  LET OP: gebouwd met een vuile werkboom.`);
  console.warn(`  Er zit in dist/ iets dat niet in ${sha.slice(0, 7)} staat, dus dit`);
  console.warn('  is geen exacte kopie van die commit. Het stempel zegt dat erbij.');
  for (const r of vuil.slice(0, 10)) console.warn(`    ${r.pad}  [${r.staat.trim()}]`);
  if (vuil.length > 10) console.warn(`    en nog ${vuil.length - 10}`);
  console.warn('');
} else {
  regel = `${sha} ${tijd}`;
}

fs.writeFileSync(path.join(DIST, 'versie.txt'), regel + '\n');
console.log(`versie.txt  ${regel}`);
