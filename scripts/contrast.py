"""Contrastmeting voor citaatplaatje.py.

Eén regel die hier niet gebroken wordt: kaal() tekent NOOIT tekst.
Geen merkteken, geen label, geen onderregel, geen URL. Dat is precies
waar het twee keer eerder misging.
"""
import importlib.util, sys, os
import numpy as np
from PIL import Image, ImageDraw

WORTEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("c", os.path.join(WORTEL, "scripts", "citaatplaatje.py"))
m = importlib.util.module_from_spec(spec); sys.modules["c"] = m; spec.loader.exec_module(m)

B, H, INK = m.B, m.H, m.INK
PAPER, SAND, TERRA, ONDERK = (245,241,232), (217,198,165), (176,87,58), (216,210,198)

def kaal():
    """de achtergrond zoals hij onder de tekst ligt, zonder enige letter"""
    kaart = m.foto_vlak(m.FOTO, B, H, 0.46)
    d = ImageDraw.Draw(kaart, "RGBA")
    for y in range(H):
        t = y/(H-1)
        a = int(min(244, 205*max(0.0, 1-t/0.40)**1.25 + 150*max(0.0, (t-0.30)/0.70)**1.35))
        if a: d.line([(0,y),(B,y)], fill=INK+(a,))
    return kaart

def lum(c):
    c = np.where(c <= .03928, c/12.92, ((c+.055)/1.055)**2.4)
    return .2126*c[...,0] + .7152*c[...,1] + .0722*c[...,2]

def posities():
    d = ImageDraw.Draw(Image.new("RGB",(B,H)))
    ok = lambda t,f: d.textbbox((0,0), t, font=f)[3]
    fmerk, flabel = m.mono(21), m.mono(19)
    furl, fonder, ft = m.mono(18), m.sans(28), m.serif(88)
    merk_y = int(H*m.MERK_BOVEN); y_label = merk_y + 76
    y_url = int(H*m.TEKST_ONDER) - ok(m.URL, furl)
    y_onder = y_url - 34 - ok(m.ONDER, fonder)
    blok = len(m.TITEL)*82
    y0 = (y_label + ok(m.LABEL, flabel) + y_onder)//2 - blok//2 + 20
    return dict(merk=(merk_y+8, fmerk), label=(y_label, flabel),
                titel=[(y0+i*82, ft) for i in range(len(m.TITEL))],
                onder=(y_onder, fonder), url=(y_url, furl))

def zwakste(achtergrond, kleur, y, font, tekst, sp=0, venster=90):
    """laagste contrast over een venster dat langs de regel schuift"""
    a = np.asarray(achtergrond, np.float32)/255
    d = ImageDraw.Draw(Image.new("RGB",(B,H)))
    L = float(lum(np.array(kleur, np.float32)/255))
    w = (m.breed(d, tekst, font, sp)-sp) if sp else d.textlength(tekst, font=font)
    bb = d.textbbox((0,0), tekst, font=font)
    x0, x1 = int(B//2 - w/2), int(B//2 + w/2)
    laag = 99
    for x in range(x0, max(x0+1, x1-venster), 15):
        Lb = float(lum(a[y+bb[1]:y+bb[3], x:x+venster]).mean())
        laag = min(laag, (max(L,Lb)+.05)/(min(L,Lb)+.05))
    return laag


if __name__ == "__main__":
    # Draai dit na citaatplaatje.py: het meet het plaatje dat daar
    # ingesteld staat. De uitsnedes zijn er om zelf te bekijken; zie je
    # een letter, dan deugt de meting niet.
    import sys
    bg = kaal()
    uit = os.path.expanduser("~/Downloads/citaat/")
    os.makedirs(uit, exist_ok=True)
    p = posities()
    bg.crop((150, p["merk"][0]-20, 930, p["label"][0]+40)).save(uit + "vak-boven.png")
    bg.crop((150, p["titel"][0][0]-10, 930, p["titel"][-1][0]+90)).save(uit + "vak-titel.png")
    bg.crop((150, p["onder"][0]-10, 930, p["url"][0]+40)).save(uit + "vak-onder.png")

    rijen = [("WESLEY VADERS", zwakste(bg, PAPER, *p["merk"], "WESLEY VADERS", 3), 4.5),
             (f"{m.LABEL} (zand)", zwakste(bg, SAND, *p["label"], m.LABEL, 3.4), 4.0),
             (f"{m.LABEL} (terracotta)", zwakste(bg, TERRA, *p["label"], m.LABEL, 3.4), 4.0)]
    for i, (y, f) in enumerate(p["titel"]):
        rijen.append((f"kop regel {i+1}", zwakste(bg, PAPER, y, f, m.TITEL[i], 0, 110), 3.0))
    rijen += [(m.ONDER, zwakste(bg, ONDERK, *p["onder"], m.ONDER), 4.5),
              ("WESLEYVADERS.NL", zwakste(bg, SAND, *p["url"], m.URL, 3.0), 4.5)]

    print(f"{'regel':28s} {'contrast':>9s}   eis")
    slecht = 0
    for naam, c, eis in rijen:
        ok = c >= eis
        if not ok and "terracotta" not in naam:
            slecht += 1
        print(f"{naam:28s} {c:8.2f}:1   >= {eis}  {'ok' if ok else 'TE LAAG'}")
    print("\nBekijk vak-boven.png, vak-titel.png en vak-onder.png in ~/Downloads/citaat/")
    print("voordat je deze cijfers gelooft. Zie je een letter, dan is de meting ongeldig.")
    sys.exit(1 if slecht else 0)
