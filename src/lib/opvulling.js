import sharp from 'sharp';

// Een piepkleine versie van een foto als base64, om als achtergrond
// achter de echte foto te zetten.
//
// De hero liet tot de foto binnen was een egaal grijsblauw vlak zien.
// Op een snelle verbinding duurt dat een halve seconde, op traag 4G bijna
// twee. Dit is een site die het van foto's moet hebben, dus die twee
// seconden zijn het waard.
//
// 24 pixels breed is met opzet: genoeg voor de compositie, te weinig voor
// enig detail. Dat levert zo'n 250 tekens op, die in de HTML zelf staan
// en dus geen extra verzoek kosten. Wordt bij de build uit dezelfde foto
// gemaakt, dus hij kan er nooit naast gaan zitten.
const cache = new Map();

export async function opvulling(pad, breed = 24) {
  const sleutel = `${pad}@${breed}`;
  if (cache.has(sleutel)) return cache.get(sleutel);

  try {
    const buf = await sharp(pad).resize(breed).webp({ quality: 58 }).toBuffer();
    const uri = `data:image/webp;base64,${buf.toString('base64')}`;
    cache.set(sleutel, uri);
    return uri;
  } catch (e) {
    // Lukt het niet, dan valt de hero terug op de achtergrondkleur.
    // Dat is precies de oude situatie, dus niets kapot.
    console.warn(`  Geen opvulling voor ${pad}: ${e.message}`);
    cache.set(sleutel, null);
    return null;
  }
}
