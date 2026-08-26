"""
DE SPAANSE DROOM · deelplaatje voor het gastenboek
Maakt public/og/gastenboek.jpg (1200x630) uit public/fotos/mo-dozen.webp,
in de huisstijl en met de aftelling naar de vertrekdatum uit site.js.
Loopt mee als prebuild-stap, zodat het aantal dagen bij elke deploy klopt.
"""
import datetime
import re
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

INK = (20, 20, 18)
PAPER = (245, 241, 232)
SAND = (217, 198, 165)
GOLD = (223, 175, 74)

WORTEL = Path(__file__).resolve().parents[1]
FOTO = WORTEL / "public" / "fotos" / "mo-dozen.webp"
UIT = WORTEL / "public" / "og" / "gastenboek.jpg"
FONTS = WORTEL / "public" / "fonts"

B, H = 1200, 630


def vertrekdatum():
    """de datum staat in site.js, niet hier; anders lopen ze uiteen"""
    tekst = (WORTEL / "src" / "data" / "site.js").read_text()
    m = re.search(r"export const vertrek = '(\d{4})-(\d{2})-(\d{2})'", tekst)
    if not m:
        raise SystemExit("vertrek staat niet in site.js")
    return datetime.date(*map(int, m.groups()))


def ttf(naam, tmp):
    """PIL leest geen woff2, dus even uitpakken naar een tijdelijke ttf"""
    pad = Path(tmp) / f"{naam}.ttf"
    if not pad.exists():
        f = TTFont(FONTS / f"{naam}.woff2")
        f.flavor = None
        f.save(pad)
    return str(pad)


def spatie(d, xy, tekst, font, kleur, sp):
    """mono met letterafstand, want PIL kan dat niet zelf"""
    x, y = xy
    for teken in tekst:
        d.text((x, y), teken, font=font, fill=kleur)
        x += d.textlength(teken, font=font) + sp
    return x


def merkteken(d, x, y, s, lijn, zon):
    d.ellipse([x + s * 0.39, y + s * 0.17, x + s * 0.61, y + s * 0.39], fill=zon)
    punten = [(0.05, 0.76), (0.25, 0.57), (0.37, 0.67), (0.52, 0.43),
              (0.65, 0.60), (0.78, 0.50), (0.95, 0.71)]
    d.line([(x + a * s, y + b * s) for a, b in punten],
           fill=lijn, width=max(2, int(s * 0.055)), joint="curve")


def foto_vlak(pad, breedte, hoogte, donker):
    im = Image.open(pad).convert("RGB")
    verh = max(breedte / im.width, hoogte / im.height)
    im = im.resize((int(im.width * verh) + 1, int(im.height * verh) + 1), Image.LANCZOS)
    links = (im.width - breedte) // 2
    boven = int((im.height - hoogte) * 0.35)
    im = im.crop((links, boven, links + breedte, boven + hoogte))
    return Image.blend(im, Image.new("RGB", (breedte, hoogte), INK), donker)


def maak():
    if not FOTO.exists():
        raise SystemExit(f"{FOTO} ontbreekt")

    dagen = (vertrekdatum() - datetime.date.today()).days
    label = f"NOG {dagen} DAGEN" if dagen > 0 else "ONDERWEG"

    with tempfile.TemporaryDirectory() as tmp:
        serif = ImageFont.truetype(ttf("instrument-serif-latin", tmp), 96)
        sans = ImageFont.truetype(ttf("instrument-sans-latin", tmp), int(B * 0.032))
        mono_klein = ImageFont.truetype(ttf("jetbrains-mono-latin", tmp), int(B * 0.019))
        mono_merk = ImageFont.truetype(ttf("jetbrains-mono-latin", tmp), int(B * 0.021))

        kaart = foto_vlak(FOTO, B, H, 0.62)
        d = ImageDraw.Draw(kaart, "RGBA")

        # doorlopend verloop over de volle hoogte, geen naad
        for y in range(H):
            t = y / (H - 1)
            boven = 140 * max(0.0, 1 - t / 0.24) ** 1.5
            onder = 225 * max(0.0, (t - 0.34) / 0.66) ** 1.8
            a = int(min(238, boven + onder))
            if a > 0:
                d.line([(0, y), (B, y)], fill=INK + (a,))

        m = int(B * 0.075)

        merkteken(d, m, m, B * 0.052, PAPER, GOLD)
        spatie(d, (m + B * 0.075, m + B * 0.008), "WESLEY VADERS", mono_merk, PAPER, B * 0.0028)

        y = H - m
        knop_h = int(B * 0.062)
        spatie(d, (m, y - knop_h - B * 0.055), "WESLEYVADERS.NL", mono_klein, SAND, B * 0.0035)
        d.text((m, y - knop_h - B * 0.115), "Laat iets voor me achter", font=sans, fill=(232, 226, 214))
        d.text((m, y - knop_h - B * 0.16 - 96 * 0.86), "Voordat ik ga", font=serif, fill=PAPER)

        br = sum(d.textlength(c, font=mono_klein) + B * 0.0035 for c in label)
        spatie(d, (B - m - br, m + B * 0.012), label, mono_klein, GOLD, B * 0.0035)

        UIT.parent.mkdir(exist_ok=True)
        kaart.save(UIT, quality=90, subsampling=0)
        print(f"gastenboek.jpg  {kaart.size}  {label}  {UIT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    maak()
