"""
DE SPAANSE DROOM · deelplaatjes
Maakt van gegradeerde foto's een og-afbeelding: 1200x630, JPG kwaliteit 82,
in public/og/. Het midden blijft staan, de randen gaan eraf.
Draaien vóór upload, niet tijdens de build. De bronnen zijn al gegradeerd,
dus hier komt geen grade meer overheen.
"""
import re
from pathlib import Path
from PIL import Image

WORTEL = Path(__file__).resolve().parents[1]
FOTOS = WORTEL / "public" / "fotos"
OG = WORTEL / "public" / "og"
DOEL = (1200, 630)

# vaste plaatjes: de standaard en de kandidaten voor losse pagina's
VAST = ["transporter", "hero", "mo-dozen", "gastenboek"]


def verhaalfotos():
    """hoofdfoto's uit de frontmatter van alle verhalen"""
    namen = []
    for md in sorted((WORTEL / "src" / "content" / "verhalen").glob("*.md")):
        m = re.search(r"^foto:\s*\S*/([\w-]+)\.webp\s*$", md.read_text(), re.M)
        if m:
            namen.append(m.group(1))
    return namen


def maak(naam):
    bron = FOTOS / f"{naam}.webp"
    if not bron.exists():
        print(f"{naam:24s} ontbreekt in public/fotos/")
        return
    im = Image.open(bron).convert("RGB")
    b, h = im.size
    ratio = DOEL[0] / DOEL[1]
    if b / h > ratio:
        nb = int(h * ratio)
        x = (b - nb) // 2
        im = im.crop((x, 0, x + nb, h))
    else:
        nh = int(b / ratio)
        y = (h - nh) // 2
        im = im.crop((0, y, b, y + nh))
    im = im.resize(DOEL, Image.LANCZOS)
    uit = OG / f"{naam}.jpg"
    im.save(uit, "JPEG", quality=82, optimize=True, progressive=True)
    print(f"{naam:24s} {uit.stat().st_size // 1024} KB")


if __name__ == "__main__":
    OG.mkdir(exist_ok=True)
    for naam in dict.fromkeys(VAST + verhaalfotos()):
        maak(naam)
