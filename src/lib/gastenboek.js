// Het gastenboek leeft op de server, niet in de repo. Voor het aantal
// in de hero en het uitgelichte bericht op de homepage halen we het
// tijdens de build één keer op.
//
// Belangrijk: de build mag hier nooit op stuklopen. Is de API even niet
// bereikbaar, dan komt er null terug en laten de pagina's die stukjes
// gewoon weg.

import { site } from '../data/site.js';

let inGeheugen;

export async function haalGastenboek() {
  if (inGeheugen !== undefined) return inGeheugen;

  const bron = process.env.GB_API ?? `${site.domein}/api/gastenboek.php`;
  try {
    const r = await fetch(`${bron}?limiet=50`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const d = await r.json();
    if (!Array.isArray(d.berichten)) throw new Error('onverwacht antwoord');
    inGeheugen = { totaal: d.totaal ?? d.berichten.length, berichten: d.berichten };
  } catch (e) {
    console.warn(`  Gastenboek niet opgehaald (${e.message}); die stukjes blijven leeg.`);
    inGeheugen = null;
  }
  return inGeheugen;
}

// Het aantal berichten per bron, voor het aantal reacties bij elk verhaal
// in het archief. Eén verzoek voor de hele lijst. Kent de server ?tellen=1
// nog niet, dan komt er een leeg object terug en tonen we simpelweg niets.
let tellingen;

export async function haalAantallen() {
  if (tellingen !== undefined) return tellingen;

  const bron = process.env.GB_API ?? `${site.domein}/api/gastenboek.php`;
  try {
    const r = await fetch(`${bron}?tellen=1`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`status ${r.status}`);
    const d = await r.json();
    if (!d || typeof d.aantallen !== 'object' || d.aantallen === null) {
      throw new Error('server kent tellen=1 nog niet');
    }
    tellingen = d.aantallen;
  } catch (e) {
    console.warn(`  Aantallen niet opgehaald (${e.message}); er komt geen teller bij de verhalen.`);
    tellingen = {};
  }
  return tellingen;
}
