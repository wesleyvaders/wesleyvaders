"""
Instagram-veilige deelplaatjes.

De regel: alles wordt 1080x1350 (4:5). Dat is het formaat dat Instagram
in de feed EN in het grid ongesneden toont. Alle tekst blijft binnen een
veilige zone, zodat een vierkante uitsnede ook nog klopt.

NOOIT een liggend plaatje op Instagram zetten. Dan snijdt hij de zijkanten
weg en valt je tekst eraf.
"""
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from pathlib import Path
import datetime, os, math, tempfile

INK   = (20, 20, 18)
PAPER = (245, 241, 232)
TERRA = (176, 87, 58)
SAND  = (217, 198, 165)
GOLD  = (223, 175, 74)

# Twee sjablonen. Donker voor foto's die zelf donker of gedempt zijn,
# licht voor felle Spaanse foto's met zee, lucht en witte gevels: daar
# werkt een donkere laag tegen het beeld in.
#
# Goud kan NIET op de lichte ondergrond, dat haalt 1,97:1. En de gewone
# terracotta #B0573A zakt daar door de ondergrens voor kleine tekst.
# Vandaar de diepere varianten hieronder.
CREME  = (243, 236, 222)   # #F3ECDE
INKT_D = ( 23,  20,  15)   # #17140F
TERRA_D = (164, 68, 31)    # #A4441F
ZACHT  = ( 74,  65,  53)   # #4A4135
DIEP   = (140,  58,  27)   # #8C3A1B
ONDERK = (216, 210, 198)

# Het zijn twee ontwerpen, niet alleen twee kleurenzetten:
#
#   donker  tekst óver de foto, gecentreerd, met een verloop eronder.
#   licht   de foto bovenaan met zijn eigen kleur, de tekst daaronder op
#           een vlak crèmeblok, links uitgelijnd. De tekst raakt de foto
#           niet, dus er hoeft geen waas overheen en de foto houdt zijn
#           kleur. Links uitgelijnd omdat de site dat overal is.
SJABLONEN = {
    "donker": dict(ontwerp="over-foto", grond=INK, demping=0.46,
                   merk=PAPER, accent=GOLD, label=SAND,
                   titel=PAPER, onder=ONDERK, url=SAND, aanhaling=SAND + (110,)),
    # Het merkteken staat in inkt en niet in terracotta: anders plakt
    # het visueel aan de datum eronder, die wél terracotta is.
    "licht":  dict(ontwerp="blok-onder", grond=CREME, demping=0.0,
                   merk=INKT_D, accent=INKT_D, label=TERRA_D,
                   titel=INKT_D, onder=ZACHT, url=DIEP, aanhaling=TERRA_D + (90,)),
}

# bij blok-onder: waar de foto ophoudt en het crèmeblok begint
FOTO_HOOGTE = 744 / 1350        # 55,1%
# Alles staat gecentreerd, ook hier. Links uitgelijnd leek rustiger maar
# werd door de vierkante uitsnede in het Instagram-raster afgesneden: de
# D van Donde viel eraf. Gecentreerd verliest links en rechts evenveel en
# blijft dus heel.
#
# De midden-uitsnede loopt tot (H+B)/2, oftewel 90% van de hoogte. De
# tekst houdt daar iets onder op.
TEKST_TOT = 0.887

WORTEL = Path(__file__).resolve().parents[1]
FONTS = WORTEL / "public" / "fonts"
TMP = tempfile.mkdtemp()


def ttf(naam):
    """PIL leest geen woff2, dus even uitpakken naar een tijdelijke ttf"""
    pad = Path(TMP) / f"{naam}.ttf"
    if not pad.exists():
        f = TTFont(FONTS / f"{naam}.woff2")
        f.flavor = None
        f.save(pad)
    return str(pad)


serif = lambda s: ImageFont.truetype(ttf("instrument-serif-latin"), s)
sans  = lambda s: ImageFont.truetype(ttf("instrument-sans-latin"), s)
mono  = lambda s: ImageFont.truetype(ttf("jetbrains-mono-latin"), s)

UIT = os.path.expanduser("~/Downloads/citaat/")

VERTREK  = datetime.date(2026, 9, 20)
# De aankomst in Alfaz del Pi. Leeg laten zolang hij onderweg is.
AANKOMST = datetime.date(2026, 9, 21)
DAGEN = (VERTREK - datetime.date.today()).days

B, H = 1080, 1350
# veilige zone: alles wat leesbaar moet blijven bij een vierkante uitsnede
VEILIG_BOVEN = int(H * 0.16)
VEILIG_ONDER = int(H * 0.84)
MARGE = int(B * 0.19)   # ruim, want Instagram snijdt ook de zijkanten

STOPS = [
    ("Monster",           52.020,  4.170),
    ("Mont-Saint-Michel", 48.636, -1.511),
    ("Saumur",            47.260, -0.077),
    ("Dune du Pilat",     44.588, -1.210),
    ("San Sebastián",     43.320, -1.980),
    ("Bardenas Reales",   42.190, -1.500),
    ("Albarracín",        40.410, -1.440),
    ("Alfaz del Pi",      38.580, -0.100),
]


def spatie(d, xy, tekst, font, kleur, sp):
    x, y = xy
    for t in tekst:
        d.text((x, y), t, font=font, fill=kleur)
        x += d.textlength(t, font=font) + sp
    return x


def breed(d, tekst, font, sp):
    return sum(d.textlength(t, font=font) + sp for t in tekst)


def merkteken(d, x, y, s, lijn, zon):
    d.ellipse([x + s*0.39, y + s*0.17, x + s*0.61, y + s*0.39], fill=zon)
    p = [(0.05, 0.76), (0.25, 0.57), (0.37, 0.67), (0.52, 0.43),
         (0.65, 0.60), (0.78, 0.50), (0.95, 0.71)]
    d.line([(x + a*s, y + b*s) for a, b in p],
           fill=lijn, width=max(2, int(s*0.055)), joint="curve")


def merc(lat):
    return math.log(math.tan(math.pi/4 + math.radians(lat)/2))


def routekaart(d, links, boven, breedte, hoogte):
    ys = [merc(s[1]) for s in STOPS]
    xs = [s[2] for s in STOPS]
    ymin, ymax = min(ys), max(ys)
    xmin, xmax = min(xs), max(xs)
    P = [(links + (xs[i]-xmin)/(xmax-xmin) * breedte,
          boven + (ymax-ys[i])/(ymax-ymin) * hoogte) for i in range(len(STOPS))]

    for i in range(len(P)-1):
        d.line([P[i], P[i+1]], fill=TERRA, width=4)

    for i, (naam, _, _) in enumerate(STOPS):
        x, y = P[i]
        eind = i in (0, len(P)-1)
        kleur = GOLD if i == len(P)-1 else (PAPER if i == 0 else SAND)
        r = 11 if eind else 7
        d.ellipse([x-r, y-r, x+r, y+r], fill=kleur)
        if eind:
            d.ellipse([x-r-8, y-r-8, x+r+8, y+r+8], outline=kleur, width=2)

        fn = serif(27)
        rechts = i not in (0,)
        if rechts:
            d.text((x + 20, y - 17), naam, font=fn, fill=PAPER)
        else:
            w = d.textlength(naam, font=fn)
            d.text((x - 20 - w, y - 17), naam, font=fn, fill=PAPER)
    return P


def maak(naam):
    kaart = Image.new("RGB", (B, H), INK)
    d = ImageDraw.Draw(kaart, "RGBA")

    # zachte gloed linksonder, zoals op de site
    for i in range(420):
        a = int(46 * (1 - i/420) ** 2)
        if a:
            d.ellipse([-260 - i, H - 120 - i, 520 + i, H + 460 + i],
                      outline=TERRA + (a,), width=3)

    mid = B // 2

    def cen(y_, tekst, font, kleur):
        w = d.textlength(tekst, font=font)
        d.text((mid - w/2, y_), tekst, font=font, fill=kleur)

    def cenm(y_, tekst, font, kleur, sp):
        w = breed(d, tekst, font, sp) - sp
        spatie(d, (mid - w/2, y_), tekst, font, kleur, sp)

    # merk bovenin, gecentreerd
    fmerk = mono(21)
    wm = breed(d, "WESLEY VADERS", fmerk, 3) - 3
    merkteken(d, mid - wm/2 - 66, VEILIG_BOVEN - 82, 50, PAPER, GOLD)
    spatie(d, (mid - wm/2, VEILIG_BOVEN - 74), "WESLEY VADERS", fmerk, PAPER, 3)

    y = VEILIG_BOVEN + 4
    cenm(y, "ONDERWEG NAAR SPANJE", mono(19), TERRA, 3.4)
    y += 50
    ft = serif(92)
    for r in ["Niet de", "snelste weg"]:
        cen(y, r, ft, PAPER)
        y += 84

    # de kaart, gecentreerd binnen de veilige breedte
    kb = B - 2*MARGE - 250
    routekaart(d, MARGE + 150, y + 70, kb, VEILIG_ONDER - y - 260)

    # onderin, gecentreerd
    yb = VEILIG_ONDER - 132
    d.line([(MARGE + 40, yb), (B - MARGE - 40, yb)], fill=SAND + (70,), width=1)
    yb += 28
    cen(yb, "Zeven etappes, 2.750 km", serif(46), PAPER)
    yb += 62
    cen(yb, "Ben je hier geweest?", sans(28), (214, 208, 196))
    yb += 48
    cenm(yb, f"WESLEYVADERS.NL/ROUTE   \u00b7   NOG {DAGEN} DAGEN", mono(18), SAND, 3.0)

    uit = UIT
    os.makedirs(uit, exist_ok=True)
    kaart.save(uit + naam, quality=92, subsampling=0)

    # controle: alle uitsnedes die Instagram kan maken
    controles = {
        "controle-vierkant-midden.jpg": (0, (H-B)//2, B, (H-B)//2 + B),
        "controle-vierkant-boven.jpg":  (0, 0, B, B),
        "controle-vierkant-onder.jpg":  (0, H-B, B, H),
    }
    strook = Image.new("RGB", (B*3 + 40, B), (60, 60, 58))
    for i, (bestand, box) in enumerate(controles.items()):
        c = kaart.crop(box)
        c.save(uit + bestand, quality=86)
        strook.paste(c, (i*(B+20), 0))
    strook.save(uit + "controle-alles.jpg", quality=80)
    print(naam, kaart.size, "| drie uitsnedes gecontroleerd")



# ---------------------------------------------------------------
# Instellingen van het citaatplaatje. Alleen dit blok pas je aan.
# De foto komt uit public/fotos/ en is daar al door grade.py gehaald;
# er gaat hier dus geen tweede grade overheen.
# ---------------------------------------------------------------
SJABLOON = "licht"   # "donker" of "licht"; zie SJABLONEN bovenin
FOTO   = str(WORTEL / "public" / "fotos" / "uitzicht-calpe.webp")
LABEL  = "18 OKTOBER 2026"
TITEL  = ["No pasa nada"]
URL    = "WESLEYVADERS.NL"
NAAM   = "no-pasa-nada-instagram.jpg"

# De aftelling wordt niet ingetypt maar berekend, net als op de site.
WOORD = ["nul", "één", "twee", "drie", "vier", "vijf", "zes", "zeven",
         "acht", "negen", "tien", "elf", "twaalf", "dertien", "veertien"]

def aftelzin(dagen):
    if dagen == 0: return "Vandaag."
    if dagen == 1: return "Nog één dag."
    if dagen < 14 and dagen > 0: return f"Nog {WOORD[dagen]} dagen."
    if dagen > 0:  return f"Nog {WOORD[round(dagen/7)]} weken."
    # na het vertrek: dezelfde telling als dagenTeller() in src/lib/tijd.js.
    # Onderweg telt de vertrekdag mee, in Spanje begint het de ochtend
    # ná de aankomst.
    na = (datetime.date.today() - AANKOMST).days if AANKOMST else -1
    return f"Dag {na} in Spanje." if na >= 1 else f"Dag {1 - dagen} onderweg."

# Meestal de berekende aftelling, aftelzin(DAGEN). Staat hier een vaste
# zin, dan is dat omdat het plaatje iets anders wil zeggen dan waar hij
# staat in de tijd; het label zegt dat hier al.
ONDER = "Oom geworden op 1900 kilometer afstand"

# Waar de tekst begint en eindigt, als deel van de hoogte. Instagram
# toont in het grid een vierkante uitsnede; hierbinnen valt niets weg.
MERK_BOVEN  = 0.13   # bovenkant van het merkteken
TEKST_ONDER = 0.82   # onderkant van de laatste regel

def foto_vlak(pad, breedte, hoogte, demping=None, grond=None):
    """De foto bijgesneden en naar de ondergrond toe gedempt. Op het
    donkere sjabloon is dat inkt, op het lichte crème."""
    P = SJABLONEN[SJABLOON]
    if demping is None: demping = P["demping"]
    if grond is None: grond = P["grond"]
    im = Image.open(pad).convert("RGB")
    v = max(breedte/im.width, hoogte/im.height)
    im = im.resize((int(im.width*v)+1, int(im.height*v)+1), Image.LANCZOS)
    l = (im.width-breedte)//2
    b = int((im.height-hoogte)*0.42)
    im = im.crop((l, b, l+breedte, b+hoogte))
    return Image.blend(im, Image.new("RGB", (breedte, hoogte), grond), demping)


def verloop(d, hoogte=None):
    """Het verloop dat de tekst leesbaar houdt, in de kleur van de
    ondergrond. Boven tot 40%, want daar staan het merkteken en het
    label en die vallen weg zodra er een lichte lucht achter zit."""
    hoogte = hoogte or H
    grond = SJABLONEN[SJABLOON]["grond"]
    for y_ in range(hoogte):
        t = y_/(hoogte-1)
        a = int(min(244, 205*max(0.0, 1-t/0.40)**1.25
                       + 150*max(0.0, (t-0.30)/0.70)**1.35))
        if a:
            d.line([(0, y_), (B, y_)], fill=grond+(a,))


def blok_grond():
    """De ondergrond van het lichte sjabloon zonder één letter: de foto
    bovenaan en het crèmeblok eronder. contrast.py meet hierop."""
    P = SJABLONEN[SJABLOON]
    fh = int(H * FOTO_HOOGTE)
    kaart = Image.new("RGB", (B, H), P["grond"])
    kaart.paste(foto_vlak(FOTO, B, fh, demping=0.0), (0, 0))
    return kaart, fh


def blok_posities(d):
    """Waar elke regel komt te staan. Eén berekening, gebruikt om te
    tekenen én om te meten, zodat die twee niet uiteen kunnen lopen.

    Alles gecentreerd, en het blok eindigt op TEKST_TOT zodat de hele
    tekst binnen de vierkante midden-uitsnede valt."""
    fh = int(H * FOTO_HOOGTE)
    ok = lambda t, f: d.textbbox((0, 0), t, font=f)[3]
    fmerk, flabel = mono(21), mono(19)
    ft, fonder, furl = serif(88), sans(28), mono(18)
    regelhoogte = 82
    # Krap afgesteld. Met de foto op 744 px en de tekst tot 88,7% is er
    # 453 px over, en dat is precies wat deze vijf regels nodig hebben.
    # De tussenruimtes zijn daarom kleiner dan op het donkere sjabloon;
    # de foto en de ondergrens liggen vast, dus hier was de ruimte te
    # halen. Komt er een derde titelregel bij, dan valt de build om op de
    # controle hieronder en moet de foto korter.
    gat_label, gat_titel, gat_onder, gat_url = 56, 48, 30, 34

    h_merk, h_label = ok("WESLEY VADERS", fmerk), ok(LABEL, flabel)
    h_titel = len(TITEL) * regelhoogte
    h_onder, h_url = ok(ONDER, fonder), ok(URL, furl)
    staart = gat_onder - regelhoogte + ok(TITEL[-1], ft)
    totaal = (h_merk + gat_label + h_label + gat_titel + h_titel
              + staart + h_onder + gat_url + h_url)

    # Onderaan vastzetten op TEKST_TOT en van daaruit terugrekenen; wat
    # er boven overblijft is de lucht tussen de foto en het merkteken.
    y = int(H * TEKST_TOT) - totaal
    ruimte_boven = y - fh
    if ruimte_boven < 12:
        raise SystemExit(
            f"Te weinig ruimte onder de foto ({ruimte_boven} px). "
            f"Maak FOTO_HOOGTE kleiner of de titel korter.")

    p = {"merk": (y, fmerk), "merk_y": y - 8}
    y += h_merk + gat_label
    p["label"] = (y, flabel)
    y += h_label + gat_titel
    p["titel"] = [(y + i*regelhoogte, ft) for i in range(len(TITEL))]
    y += h_titel + staart
    p["onder"] = (y, fonder)
    y += h_onder + gat_url
    p["url"] = (y, furl)
    return p


def citaat_blok(naam):
    """De foto bovenaan op volle kleur, de tekst eronder gecentreerd op
    een vlak crèmeblok."""
    P = SJABLONEN[SJABLOON]
    kaart, fh = blok_grond()
    d = ImageDraw.Draw(kaart, "RGBA")
    p = blok_posities(d)
    mid = B//2

    def cen(y_, tekst, font, kleur):
        d.text((mid - d.textlength(tekst, font=font)/2, y_), tekst, font=font, fill=kleur)
    def cenm(y_, tekst, font, kleur, sp):
        w = breed(d, tekst, font, sp) - sp
        spatie(d, (mid - w/2, y_), tekst, font, kleur, sp)

    # het merkteken staat links van de naam; samen gecentreerd
    wm = breed(d, "WESLEY VADERS", p["merk"][1], 3) - 3
    merkteken(d, mid - wm/2 - 66, p["merk_y"], 50, P["merk"], P["accent"])
    spatie(d, (mid - wm/2, p["merk"][0]), "WESLEY VADERS", p["merk"][1], P["merk"], 3)

    cenm(p["label"][0], LABEL, p["label"][1], P["label"], 3.4)
    for (y_, f), r in zip(p["titel"], TITEL):
        cen(y_, r, f, P["titel"])
    cen(p["onder"][0], ONDER, p["onder"][1], P["onder"])
    cenm(p["url"][0], URL, p["url"][1], P["url"], 3.0)
    return kaart, p["merk_y"], p["url"][0], p["url"][1]


def citaat_over_foto(naam):
    P = SJABLONEN[SJABLOON]
    kaart = foto_vlak(FOTO, B, H)
    d = ImageDraw.Draw(kaart, "RGBA")
    verloop(d)

    mid = B//2
    def cen(y_, tekst, font, kleur):
        w = d.textlength(tekst, font=font)
        d.text((mid-w/2, y_), tekst, font=font, fill=kleur)
    def cenm(y_, tekst, font, kleur, sp):
        w = breed(d, tekst, font, sp)-sp
        spatie(d, (mid-w/2, y_), tekst, font, kleur, sp)
    def onderkant(tekst, font):
        """hoe ver de tekst onder zijn eigen y uitkomt"""
        return d.textbbox((0, 0), tekst, font=font)[3]

    # --- bovenin: merkteken en label, vastgezet op MERK_BOVEN ---
    merk_y = int(H*MERK_BOVEN)
    fmerk = mono(21)
    wm = breed(d, "WESLEY VADERS", fmerk, 3)-3
    merkteken(d, mid-wm/2-66, merk_y, 50, P["merk"], P["accent"])
    spatie(d, (mid-wm/2, merk_y+8), "WESLEY VADERS", fmerk, P["merk"], 3)

    flabel = mono(19)
    y_label = merk_y + 76
    # Op donker is dit zand en niet terracotta: op een foto met een lichte
    # plek haalt terracotta maar 1,4:1 en dan valt het label weg. Op licht
    # is het de diepe terracotta; zie SJABLONEN bovenin.
    cenm(y_label, LABEL, flabel, P["label"], 3.4)
    onderkant_label = y_label + onderkant(LABEL, flabel)

    # --- onderin: terugrekenen vanaf TEKST_ONDER ---
    furl = mono(18)
    y_url = int(H*TEKST_ONDER) - onderkant(URL, furl)
    fonder = sans(28)
    y_onder = y_url - 34 - onderkant(ONDER, fonder)

    # --- de titel, gecentreerd in de ruimte die overblijft ---
    ft = serif(88)
    regelhoogte = 82
    blok = len(TITEL)*regelhoogte
    y = (onderkant_label + y_onder)//2 - blok//2 + 20

    fq = serif(150)
    wq = d.textlength("\u201c", font=fq)
    d.text((mid-wq/2, y-104), "\u201c", font=fq, fill=P["aanhaling"])
    for r in TITEL:
        cen(y, r, ft, P["titel"])
        y += regelhoogte

    cen(y_onder, ONDER, fonder, P["onder"])
    cenm(y_url, URL, furl, P["url"], 3.0)

    return kaart, merk_y, y_url, furl


def citaat(naam):
    maak = citaat_blok if SJABLONEN[SJABLOON]["ontwerp"] == "blok-onder" else citaat_over_foto
    kaart, merk_y, y_url, furl = maak(naam)

    os.makedirs(UIT, exist_ok=True)
    kaart.save(UIT+naam, quality=92, subsampling=0)

    # controlestrook: de drie vierkante uitsnedes die Instagram kan maken
    strook = Image.new("RGB", (B*3+40, B), (60, 60, 58))
    for i, box in enumerate([(0, (H-B)//2, B, (H-B)//2+B), (0, 0, B, B), (0, H-B, B, H)]):
        strook.paste(kaart.crop(box), (i*(B+20), 0))
    strook.save(UIT+"controle-alles.jpg", quality=80)

    d = ImageDraw.Draw(kaart)
    print(f"{naam}  {kaart.size}  sjabloon {SJABLOON}")
    print(f"  merkteken begint op {merk_y/H*100:.1f}% van boven")
    print(f"  laatste regel eindigt op {(y_url+d.textbbox((0,0),URL,font=furl)[3])/H*100:.1f}%")
    print(f"  onderregel: {ONDER!r}")


citaat(NAAM)

