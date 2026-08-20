"""
DE SPAANSE DROOM · beeldgrade v2
Twee profielen, één filosofie.
  NL  koel, grijs, vlak      (het vertrek)
  ES  warm, stoffig, goud    (de bestemming)
"""
import numpy as np, pillow_heif, os
from PIL import Image, ImageFilter, ImageOps
pillow_heif.register_heif_opener()

SRC = "/mnt/user-data/uploads/"
LUM = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)

PROFILES = {
    "NL": dict(target=.86, lift=.058, shoulder=.82, sat=.60,
               sh_tint=(-.004, .004, .020), hi_tint=(.004, .010, .022),
               local=.14, vign=.16, grain=.008),
    "ES": dict(target=.90, lift=.026, shoulder=.60, sat=.92,
               sh_tint=(-.006, .003, .014), hi_tint=(.044, .019, -.030),
               local=.22, vign=.15, grain=.006),
}

def tone(x, lift, shoulder):
    """zwarten liften + zachte schouder zodat luchten niet dichtklappen"""
    x = np.clip(x, 0, 1)
    x = lift + (1 - lift) * x
    return x / (1 + shoulder * np.maximum(x - .5, 0) ** 1.6)

def grade(im, p):
    a = np.asarray(im.convert("RGB"), np.float32) / 255.0

    # 1. belichting normaliseren op de 99e percentiel, zodat een set matcht
    l = a @ LUM
    hi = np.percentile(l, 99.2)
    if hi > .02:
        a = np.clip(a * (p["target"] / hi), 0, 1.4)

    # 2. toon
    a = tone(a, p["lift"], p["shoulder"])

    # 3. split toning
    l = np.clip(a @ LUM, 0, 1)[..., None]
    a = a + np.array(p["sh_tint"], np.float32) * (1 - l) ** 2
    a = a + np.array(p["hi_tint"], np.float32) * l ** 2.2
    a = np.clip(a, 0, 1)

    # 4. verzadiging
    l = (a @ LUM)[..., None]
    a = np.clip(l + (a - l) * p["sat"], 0, 1)

    # 5. lokaal contrast (geeft diepte zonder harde klap)
    img = Image.fromarray((a * 255).astype(np.uint8))
    blur = np.asarray(img.filter(ImageFilter.GaussianBlur(max(img.width, img.height) / 26)), np.float32) / 255.0
    a = np.clip(a + p["local"] * (a - blur), 0, 1)

    # 6. vignet
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    a *= (1 - p["vign"] * np.clip((r - .55) / .85, 0, 1) ** 1.7)[..., None]

    # 7. korrel
    if p["grain"]:
        rng = np.random.default_rng(7)
        a = np.clip(a + rng.normal(0, p["grain"], a.shape[:2])[..., None], 0, 1)

    return Image.fromarray((a * 255).astype(np.uint8))


def run(src, name, profile, width, crop=None, quality=64):
    im = ImageOps.exif_transpose(Image.open(SRC + src))
    if crop:
        w, h = im.size
        im = im.crop((int(w*crop[0]), int(h*crop[1]), int(w*crop[2]), int(h*crop[3])))
    g = grade(im, PROFILES[profile])
    g.thumbnail((width, width * 2), Image.LANCZOS)
    out = f"/home/claude/v2_{name}.webp"
    g.save(out, "WEBP", quality=quality, method=6)
    g.copy().resize((760, int(760 * g.height / g.width)), Image.LANCZOS).save(f"/home/claude/chk_{name}.jpg", quality=86)
    print(f"{name:10s} {profile}  {g.size}  {os.path.getsize(out)//1024} KB")


if __name__ == "__main__":
    # Spanje
    run("IMG_1737.HEIC", "hero", "ES", 1600)
    run("fb82e7c2-3853-4f8f-bb2b-baeaaf03fa19_2.JPG", "terras", "ES", 1200)
    run("IMG_1702_2.HEIC", "bus", "ES", 1200)
    run("779323bf-7b11-43a5-8563-e43a257f0d27.JPG", "mowgli", "ES", 820)
    # Nederland
    run("IMG_5159.HEIC", "dozen", "NL", 1300)
    run("IMG_5161.HEIC", "tekoop", "NL", 1100, crop=(.14, .0, .92, .78))
    run("IMG_5160.HEIC", "gang", "NL", 1100)
