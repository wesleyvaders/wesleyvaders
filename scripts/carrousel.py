"""
DE SPAANSE DROOM · losse slides van een carrousel

De eerste slide van een carrousel maakt `citaatplaatje.py`: foto boven,
tekst op crème eronder. De slides daarna zijn kale foto's zonder tekst,
en die maakt dit script.

Instagram houdt een hele carrousel op de verhouding van de eerste
slide. Die is 1080x1350, dus elke volgende slide moet dat ook zijn,
anders snijdt Instagram hem er alsnog naar toe en bepaalt hij zelf wat
eraf valt.

**Daarom snijdt dit script nooit strakker dan nodig.** Past het
onderwerp niet in een uitsnede van 4:5, dan vullen we aan met hetzelfde
crème als het tekstblok van slide 1. Een logo, een gezicht of tekst
aansnijden om een verhouding te halen doen we niet.

Dat is geen theorie: bij het Kruidvat-tasje van 25 oktober houdt een
rechtstreekse 4:5-uitsnede maar 60% van de breedte over, terwijl de
logobalk er 75% van beslaat. De eerste poging hakte de t van Kruidvat
eraf, precies het woord waar die slide om draait.

De bron is de ongegradeerde originele foto, niet het bestand uit
public/fotos/: die is al teruggeschaald naar 1300 px en dat is te krap
voor 1080 px uit een uitsnede. Hier gaat dus wél een grade overheen,
met hetzelfde profiel als de foto in het verhaal.
"""
import importlib.util, os
from pathlib import Path
from PIL import Image, ImageOps
import pillow_heif
pillow_heif.register_heif_opener()

WORTEL = Path(__file__).resolve().parents[1]
UIT = Path(os.path.expanduser("~/Downloads/citaat/"))

# 1080x1350, gelijk aan citaatplaatje.py. Nooit liggend op Instagram.
DOEK = (1080, 1350)
# #F3ECDE, gelijk aan CREME in citaatplaatje.py. Eén kleur voor de hele
# carrousel, zodat slide 1 en slide 2 in de feed op dezelfde ondergrond
# staan en het geen losse plaatjes worden.
CREME = (243, 236, 222)

# grade.py levert de twee profielen; we lenen ze in plaats van ze over
# te typen, anders lopen de grades uit elkaar zodra er één wordt bijgesteld.
_spec = importlib.util.spec_from_file_location("grade", WORTEL / "scripts" / "grade.py")
grade = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(grade)


def uitsnede_breedte(breedte, hoogte, keuze):
    """Hoeveel pixels breed we uit de bron pakken, gecentreerd.

    Er wordt alleen van de breedte af gehaald, nooit van de hoogte: een
    staande foto past al smaller dan het doek en daar valt dus niets te
    winnen met snijden, alleen te verliezen.

    De ondergrens is de breedte waarop de foto het doek precies vult.
    Daaronder snijd je én inhoud weg én hou je crème over, en dat is
    altijd fout. Dat is precies de uitsnede die de t van Kruidvat
    opat; zie de kop van dit bestand."""
    vloer = min(breedte, round(hoogte * DOEK[0] / DOEK[1]))
    if keuze == "heel":
        gevraagd = breedte
    elif keuze == "vierkant":
        gevraagd = min(breedte, hoogte)
    else:
        gevraagd = round(breedte * float(keuze))
    return max(vloer, min(breedte, gevraagd))


def maak(bron, profiel, naam, keuze="vierkant"):
    im = ImageOps.exif_transpose(Image.open(bron))
    b, h = im.size

    nb = uitsnede_breedte(b, h, keuze)
    x = (b - nb) // 2
    im = im.crop((x, 0, x + nb, h))

    foto = grade.grade(im, grade.PROFILES[profiel])

    # Passend maken binnen het doek, nooit eroverheen: de foto wordt zo
    # groot als hij kan zonder dat er iets afvalt, en wat overblijft is
    # crème. Bij een staande foto raakt hij boven en onder, bij een
    # liggende links en rechts.
    schaal = min(DOEK[0] / foto.width, DOEK[1] / foto.height)
    fb, fh = round(foto.width * schaal), round(foto.height * schaal)
    foto = foto.resize((fb, fh), Image.LANCZOS)

    doek = Image.new("RGB", DOEK, CREME)
    doek.paste(foto, ((DOEK[0] - fb) // 2, (DOEK[1] - fh) // 2))

    UIT.mkdir(parents=True, exist_ok=True)
    pad = UIT / naam
    doek.save(pad, quality=92, subsampling=0)

    rand_x, rand_y = (DOEK[0] - fb) // 2, (DOEK[1] - fh) // 2
    hoe = f"{keuze}, {nb} van {b} px breed" if nb < b else f"{keuze}, niets afgesneden"
    print(f"{naam}  {DOEK[0]}x{DOEK[1]}  profiel {profiel}  uitsnede: {hoe}")
    print(f"  foto {fb}x{fh}, crème {rand_y} px boven en onder, {rand_x} px links en rechts")
    print(f"  {pad.stat().st_size // 1024} KB")
    return pad


# ---------------------------------------------------------------
# Instellingen. Alleen dit blok pas je aan.
#
# BRON is het originele bestand uit de map van het verhaal, niet de
# webp uit public/fotos/. PROFIEL is hetzelfde als waarmee die foto in
# het verhaal is gegradeerd: NL voor Nederland, ES voor Spanje.
#
# UITSNEDE bepaalt hoeveel van de breedte we houden voordat we
# aanvullen met crème:
#   "vierkant"  het onderwerp blijft groot en er valt niets af. Begin hier.
#   "heel"      de hele foto, met meer crème eromheen.
#   0.88        een getal tussen 0 en 1, als je ertussenin wilt zitten.
# Snijd nooit strakker om een verhouding te halen; dan gaat er iets af
# wat er hoort te staan. Zie de kop van dit bestand.
# ---------------------------------------------------------------
BRON     = Path(os.path.expanduser("~/Downloads/verhaal-25-oktober/kruidvat-tasje.HEIC"))
PROFIEL  = "ES"
UITSNEDE = "vierkant"
NAAM     = "si-ves-una-cruz-instagram-2.jpg"


if __name__ == "__main__":
    maak(BRON, PROFIEL, NAAM, UITSNEDE)
