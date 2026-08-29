"""
DE SPAANSE DROOM · het gastenboek als PDF

Haalt alle berichten uit de API en zet ze in een A5-boekje met de
huisstijlletters uit public/fonts/. Voorblad, de berichten, achterblad.

Dit is voor Wesley zelf, niet voor de site: het bestand komt NIET in
public/ terecht maar in ~/Documenten of waar je het met --uit aanwijst.

    python3 scripts/gastenboek-pdf.py
    python3 scripts/gastenboek-pdf.py --uit ~/Bureaublad/gastenboek.pdf

Nodig: pillow niet, wel reportlab en fonttools (voor het uitpakken van
de woff2-bestanden, want reportlab leest die niet).
"""
import argparse
import datetime
import json
import re
import tempfile
import textwrap
import urllib.request
from pathlib import Path

from fontTools.ttLib import TTFont
from reportlab.lib.colors import Color
from reportlab.lib.pagesizes import A5
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont as RLFont
from reportlab.pdfgen import canvas

WORTEL = Path(__file__).resolve().parents[1]
FONTS = WORTEL / "public" / "fonts"

INKT = Color(20 / 255, 20 / 255, 18 / 255)
PAPIER = Color(245 / 255, 241 / 255, 232 / 255)
TERRA = Color(176 / 255, 87 / 255, 58 / 255)
GOUD = Color(223 / 255, 175 / 255, 74 / 255)
ZAND = Color(217 / 255, 198 / 255, 165 / 255)

B, H = A5
MARGE = 38

MAANDEN = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli',
           'augustus', 'september', 'oktober', 'november', 'december']


def domein():
    tekst = (WORTEL / "src" / "data" / "site.js").read_text()
    m = re.search(r"domein:\s*'([^']+)'", tekst)
    return m.group(1) if m else "https://wesleyvaders.nl"


def haal_berichten():
    url = f"{domein()}/api/gastenboek.php?limiet=50"
    alles, offset = [], 0
    while True:
        with urllib.request.urlopen(f"{url}&offset={offset}", timeout=15) as r:
            d = json.load(r)
        alles.extend(d["berichten"])
        if not d.get("meer"):
            return list(reversed(alles)), d.get("totaal", len(alles))
        offset += len(d["berichten"])


BEKEND = set()


def letters(tmp):
    """woff2 uitpakken naar ttf en bij reportlab aanmelden"""
    namen = {
        "Serif": "instrument-serif-latin",
        "SerifCursief": "instrument-serif-italic-latin",
        "Sans": "instrument-sans-latin",
        "Mono": "jetbrains-mono-latin",
    }
    for naam, bestand in namen.items():
        pad = Path(tmp) / f"{naam}.ttf"
        f = TTFont(FONTS / f"{bestand}.woff2")
        f.flavor = None
        f.save(pad)
        pdfmetrics.registerFont(RLFont(naam, str(pad)))
        if naam == "Sans":
            BEKEND.update(f.getBestCmap().keys())


def alleen_bekend(t):
    """Emoji zitten niet in de latin-subset en worden anders een blokje.
    We laten ze weg in plaats van ze als tofu af te drukken; de tekst
    zelf blijft heel."""
    if not BEKEND:
        return t
    uit = "".join(c for c in t if c == "\n" or ord(c) in BEKEND)
    return re.sub(r"[ \t]{2,}", " ", uit).strip()


def ontsnap(t):
    """de API levert HTML-escapes; hier willen we gewone tekens"""
    for van, naar in [("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
                      ("&quot;", '"'), ("&#039;", "'"), ("&#39;", "'")]:
        t = t.replace(van, naar)
    return alleen_bekend(t)


def datum_nl(iso):
    try:
        d = datetime.datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return f"{d.day} {MAANDEN[d.month - 1]} {d.year}"
    except Exception:
        return ""


def vlak(c):
    c.setFillColor(PAPIER)
    c.rect(0, 0, B, H, fill=1, stroke=0)


def spatie(c, x, y, tekst, font, grootte, kleur, sp=1.6):
    """mono met letterafstand; reportlab kan dat niet zelf"""
    c.setFont(font, grootte)
    c.setFillColor(kleur)
    for teken in tekst:
        c.drawString(x, y, teken)
        x += c.stringWidth(teken, font, grootte) + sp
    return x


def merkteken(c, x, y, s):
    c.setFillColor(GOUD)
    c.circle(x + s * 0.5, y + s * 0.72, s * 0.11, fill=1, stroke=0)
    punten = [(0.05, 0.24), (0.25, 0.43), (0.37, 0.33), (0.52, 0.57),
              (0.65, 0.40), (0.78, 0.50), (0.95, 0.29)]
    c.setStrokeColor(INKT)
    c.setLineWidth(max(1.2, s * 0.055))
    c.setLineJoin(1)
    c.setLineCap(1)
    pad = c.beginPath()
    pad.moveTo(x + punten[0][0] * s, y + punten[0][1] * s)
    for a, b in punten[1:]:
        pad.lineTo(x + a * s, y + b * s)
    c.drawPath(pad, stroke=1, fill=0)


def voorblad(c, aantal):
    vlak(c)
    merkteken(c, MARGE, H - MARGE - 34, 34)
    spatie(c, MARGE, H - MARGE - 56, "WESLEY VADERS", "Mono", 7, INKT, 2.2)

    c.setFillColor(INKT)
    c.setFont("Serif", 46)
    c.drawString(MARGE, H / 2 + 10, "Voordat ik ga")

    c.setStrokeColor(Color(20 / 255, 20 / 255, 18 / 255, alpha=0.18))
    c.setLineWidth(0.6)
    c.line(MARGE, H / 2 - 16, B - MARGE, H / 2 - 16)

    vandaag = datetime.date.today()
    spatie(c, MARGE, H / 2 - 40,
           f"{aantal} BERICHTEN", "Mono", 7.5, TERRA, 2.2)
    spatie(c, MARGE, H / 2 - 56,
           f"{vandaag.day} {MAANDEN[vandaag.month - 1].upper()} {vandaag.year}",
           "Mono", 7.5, Color(20 / 255, 20 / 255, 18 / 255, alpha=0.45), 2.2)

    spatie(c, MARGE, MARGE, "WESLEYVADERS.NL", "Mono", 7,
           Color(20 / 255, 20 / 255, 18 / 255, alpha=0.35), 2.2)
    c.showPage()


def achterblad(c):
    vlak(c)
    c.setFillColor(INKT)
    c.setFont("Serif", 22)
    c.drawString(MARGE, H / 2 + 8, "Alles komt goed.")
    c.setFont("SerifCursief", 22)
    c.drawString(MARGE, H / 2 - 20, "Alles is al goed.")
    merkteken(c, MARGE, MARGE, 26)
    c.showPage()


def bericht_hoogte(regels):
    return 16 + 13 + len(regels) * 12.5 + 26


def teken_bericht(c, b, y):
    naam = ontsnap(b["naam"])
    tekst = ontsnap(b["bericht"])
    breedte = B - 2 * MARGE

    c.setFillColor(INKT)
    c.setFont("Serif", 15)
    c.drawString(MARGE, y, naam)
    y -= 13

    spatie(c, MARGE, y, datum_nl(b["datum"]).upper(), "Mono", 6.5,
           Color(20 / 255, 20 / 255, 18 / 255, alpha=0.42), 1.6)
    y -= 16

    c.setFont("Sans", 9.5)
    c.setFillColor(Color(20 / 255, 20 / 255, 18 / 255, alpha=0.82))
    for regel in regels_van(tekst, breedte):
        c.drawString(MARGE, y, regel)
        y -= 12.5

    y -= 12
    c.setStrokeColor(Color(20 / 255, 20 / 255, 18 / 255, alpha=0.16))
    c.setLineWidth(0.5)
    c.line(MARGE, y, B - MARGE, y)
    return y - 20


def regels_van(tekst, breedte, font="Sans", grootte=9.5):
    from reportlab.pdfbase.pdfmetrics import stringWidth
    uit = []
    for alinea in tekst.split("\n"):
        if not alinea.strip():
            uit.append("")
            continue
        regel = ""
        for woord in alinea.split():
            proef = f"{regel} {woord}".strip()
            if stringWidth(proef, font, grootte) <= breedte:
                regel = proef
            else:
                if regel:
                    uit.append(regel)
                regel = woord
        if regel:
            uit.append(regel)
    return uit


def maak(uit_pad):
    berichten, totaal = haal_berichten()
    print(f"{len(berichten)} berichten opgehaald")

    with tempfile.TemporaryDirectory() as tmp:
        letters(tmp)
        c = canvas.Canvas(str(uit_pad), pagesize=A5)
        c.setTitle("Voordat ik ga · het gastenboek")
        c.setAuthor("Wesley Vaders")

        voorblad(c, totaal)

        vlak(c)
        y = H - MARGE - 10
        for b in berichten:
            regels = regels_van(ontsnap(b["bericht"]), B - 2 * MARGE)
            if y - bericht_hoogte(regels) < MARGE + 10:
                c.showPage()
                vlak(c)
                y = H - MARGE - 10
            y = teken_bericht(c, b, y)
        c.showPage()

        achterblad(c)
        c.save()

    kb = uit_pad.stat().st_size // 1024
    print(f"{uit_pad}  ({kb} KB)")


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Het gastenboek als PDF")
    p.add_argument("--uit", type=Path,
                   default=Path.home() / "Documents" / "gastenboek.pdf",
                   help="waar de PDF heen moet (standaard ~/Documents/gastenboek.pdf)")
    a = p.parse_args()
    a.uit.parent.mkdir(parents=True, exist_ok=True)
    maak(a.uit)
