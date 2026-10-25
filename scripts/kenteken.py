"""
DE SPAANSE DROOM · kenteken onleesbaar maken

De bus staat op heel veel foto's en het kenteken staat er vaak groot
op. Een Nederlands kenteken is via de RDW te herleiden tot het
voertuig, dus het gaat er niet herkenbaar op.

**Dit schrijft in het beeldbestand zelf.** Een laagje eroverheen in
CSS is geen afscherming: alles in public/fotos/ staat rechtstreeks op
/fotos/<naam>.webp en is te downloaden. Zie ook de regel in CLAUDE.md:
verkleinen geldt niet als het onleesbaar maken van gegevens.

**Geen blur maar een dichte vulling.** Een zwakke blur over een
kenteken is soms terug te rekenen, zeker met maar 36 mogelijke tekens
op vaste posities. Dezelfde redenering als bij de NIE-brief: wat weg
moet, wordt overschreven.

De vulling krijgt per kolom de mediaan van het geel dat er stond, dus
de plaat houdt zijn eigen licht-naar-donkerverloop en blijft op een
lege plaat lijken in plaats van op een sticker. Het blauwe NL-balkje
blijft staan; daar staat niets persoonlijks op.

Draaien vóór upload, net als grade.py, en daarna scripts/og.py,
anders houdt het deelplaatje het oude kenteken.

    python3 scripts/kenteken.py public/fotos/transporter.webp

Zonder --vak zoekt hij de plaat zelf op kleur. Vindt hij niets of het
verkeerde, geef het vak dan met de hand op:

    python3 scripts/kenteken.py public/fotos/bus.webp --vak 193 888 291 917
"""
import argparse, sys
from pathlib import Path
import numpy as np
from PIL import Image

WORTEL = Path(__file__).resolve().parents[1]


def geelmasker(a):
    """Kentekengeel: veel rood en groen, weinig blauw."""
    return ((a[..., 0] > 110) & (a[..., 1] > 80) &
            (a[..., 0] - a[..., 2] > 55) & (a[..., 1] - a[..., 2] > 35))


def zoek_plaat(a, marge=3):
    g = geelmasker(a)
    ys, xs = np.nonzero(g)
    if len(xs) < 200:
        return None
    return (max(0, xs.min() - marge), max(0, ys.min() - marge),
            min(a.shape[1] - 1, xs.max() + marge), min(a.shape[0] - 1, ys.max() + marge))


def vul(a, vak):
    """Per kolom de mediaan van het geel dat er stond, daarna glad
    gestreken over de breedte. Kolommen zonder geel (volledig bedekt
    door een teken) lenen van hun buren."""
    x0, y0, x1, y1 = vak
    deel = a[y0:y1 + 1, x0:x1 + 1]
    g = geelmasker(deel)

    kolommen = np.zeros((deel.shape[1], 3), np.float64)
    heeft = np.zeros(deel.shape[1], bool)
    for i in range(deel.shape[1]):
        pix = deel[:, i][g[:, i]]
        if len(pix) >= 3:
            kolommen[i] = np.median(pix, axis=0)
            heeft[i] = True
    if not heeft.any():
        sys.exit("Geen geel gevonden in het opgegeven vak.")

    # gaten opvullen door links en rechts te interpoleren
    idx = np.arange(deel.shape[1])
    for k in range(3):
        kolommen[:, k] = np.interp(idx, idx[heeft], kolommen[heeft, k])
    # gladstrijken, zodat er geen streepjes van losse kolommen ontstaan
    venster = max(3, deel.shape[1] // 12) | 1
    pad = venster // 2
    for k in range(3):
        uitgerekt = np.pad(kolommen[:, k], pad, mode="edge")
        kolommen[:, k] = np.convolve(uitgerekt, np.ones(venster) / venster, mode="valid")

    a[y0:y1 + 1, x0:x1 + 1] = np.repeat(kolommen[None, :, :], deel.shape[0], axis=0).round()
    return a


def controleer(a, vak, drempel=45):
    """Na afloop mag er in het vak geen donker teken meer staan. We
    kijken naar het verschil met de kolomwaarde eromheen; een letter
    is altijd fors donkerder dan de plaat."""
    x0, y0, x1, y1 = vak
    deel = a[y0:y1 + 1, x0:x1 + 1].astype(np.int16)
    helder = deel.mean(axis=2)
    spreiding = helder.max() - helder.min()
    donker = (helder < helder.mean() - drempel).sum()
    return spreiding, donker


if __name__ == "__main__":
    pa = argparse.ArgumentParser()
    pa.add_argument("bestand")
    pa.add_argument("--vak", nargs=4, type=int, metavar=("X0", "Y0", "X1", "Y1"))
    pa.add_argument("--kijk", action="store_true", help="schrijft een uitsnede weg om te bekijken")
    arg = pa.parse_args()

    pad = Path(arg.bestand)
    if not pad.is_absolute():
        pad = WORTEL / pad
    im = Image.open(pad).convert("RGB")
    a = np.asarray(im, np.int16).copy()

    vak = tuple(arg.vak) if arg.vak else zoek_plaat(a)
    if vak is None:
        sys.exit("Geen kentekenplaat gevonden. Geef het vak met --vak.")

    voor = controleer(a, vak)
    a = vul(a, vak)
    na = controleer(a, vak)

    uit = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    uit.save(pad, "WEBP", quality=64, method=6)

    x0, y0, x1, y1 = vak
    print(f"{pad.name}  vak {x0},{y0} tot {x1},{y1}  ({x1-x0+1}x{y1-y0+1} px)")
    print(f"  spreiding in het vak   voor {voor[0]:5.1f}   na {na[0]:5.1f}")
    print(f"  donkere pixels         voor {voor[1]:5d}   na {na[1]:5d}")
    print(f"  {pad.stat().st_size // 1024} KB")
    if na[1] > 0:
        sys.exit("Er staan nog donkere pixels in het vak. Niet goed.")
    if arg.kijk:
        k = uit.crop((max(0, x0-25), max(0, y0-12), min(uit.width, x1+25), min(uit.height, y1+12)))
        k.resize((k.width*8, k.height*8), Image.NEAREST).save(WORTEL / "kenteken-controle.png")
        print("  uitsnede: kenteken-controle.png (8x, harde pixels)")
