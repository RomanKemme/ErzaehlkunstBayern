#!/usr/bin/env python3
"""
Gemeinsame Bausteine in alle Seiten unter site/ eintragen.

Jede Seite enthält Platzhalter-Kommentare:
    <!-- @@HEAD --> … <!-- @@/HEAD -->        Meta-Tags, Schrift, Stylesheet
    <!-- @@HEADER --> … <!-- @@/HEADER -->    Logo + Hauptmenü
    <!-- @@FOOTER --> … <!-- @@/FOOTER -->    Fußzeile + Anmelde-Leiste
    <!-- @@MODULE --> … <!-- @@/MODULE -->    (nur akademie.html) die 10 Module als Vorbelegung

Nach Änderungen an Menü, Fußzeile oder tools/module_defaults.json einfach ausführen:
    python tools/sync_partials.py
Das Skript schreibt außerdem studio/schemaTypes/akademieDefaults.js und site/sitemap.xml.
Keine Abhängigkeiten außer Python 3.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
STUDIO = ROOT / "studio" / "schemaTypes"

# Spätere Domain – nur für sitemap.xml/robots.txt. Beim Go-Live ggf. anpassen.
SITE_URL = "https://www.erzaehlkunst-bayern.de"

NAV = [
    ("index.html", "Home", {"index"}),
    ("akademie.html", "Akademie", {"akademie"}),
    ("projekte.html", "Projekte", {"projekte", "projekt"}),
    ("termine.html", "Termine", {"termine"}),
    ("team.html", "Über uns", {"team"}),
]
NO_STICKY = {"anmeldung", "404"}
SITEMAP_PAGES = ["index.html", "akademie.html", "termine.html", "projekte.html", "team.html", "anmeldung.html"]


# Seiten ohne feste Adresse (404) oder mit Adresse aus dem CMS (projekt) bekommen kein festes canonical
CANONICAL_SKIP = {"404", "projekt"}

ORGANISATION_LD = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Erzählkunst Bayern e.V.",
    "url": SITE_URL + "/",
    "logo": SITE_URL + "/assets/img/logo.png",
    "description": "Verein für künstlerisches Erzählen in Bayern: Grundausbildung, Workshops, Montagsclub und Erzählprojekte.",
    "areaServed": "Bayern",
}


def head(title: str, desc: str, p: str, page: str = "") -> str:
    url = f"{SITE_URL}/{'' if page == 'index' else page + '.html'}"
    canon = "" if page in CANONICAL_SKIP else f'''<link rel="canonical" href="{url}">
<meta property="og:url" content="{url}">
'''
    ld = ""
    if page == "index":
        ld = '<script type="application/ld+json">' + json.dumps(ORGANISATION_LD, ensure_ascii=False) + "</script>\n"
    return f"""
<meta name="theme-color" content="#2B3A34">
{canon}<meta property="og:image" content="{SITE_URL}/assets/img/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
{ld}<meta property="og:type" content="website">
<meta property="og:site_name" content="Erzählkunst Bayern e.V.">
<meta property="og:locale" content="de_DE">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<link rel="icon" href="{p}assets/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="{p}assets/img/apple-touch-icon.png">
<link rel="preload" href="{p}assets/fonts/assistant-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{p}assets/fonts/playfair-display-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://o1wd66uu.apicdn.sanity.io" crossorigin>
<link rel="preconnect" href="https://cdn.sanity.io">
<link rel="stylesheet" href="{p}assets/css/style.css">
"""


def header(page: str, p: str) -> str:
    links = []
    for href, label, pages in NAV:
        if page in pages:
            cur = ' aria-current="page"' if page == href.split(".")[0] else ""
            links.append(f'      <a class="navlink active"{cur} href="{p}{href}">{label}</a>')
        else:
            links.append(f'      <a class="navlink" href="{p}{href}">{label}</a>')
    cta_cur = ' aria-current="page"' if page == "anmeldung" else ""
    return f"""
<a class="skip-link" href="#inhalt">Zum Inhalt springen</a>
<header>
  <nav class="nav" aria-label="Hauptnavigation">
    <a class="logo" href="{p}index.html" aria-label="Erzählkunst Bayern e.V. – zur Startseite">
      <picture>
        <source srcset="{p}assets/img/logo.avif" type="image/avif">
        <img src="{p}assets/img/logo.png" alt="Erzählkunst Bayern e.V." width="90" height="48">
      </picture>
    </a>
    <div class="navlinks" id="hauptmenu">
{chr(10).join(links)}
    </div>
    <a class="btn btn--pink nav__cta" href="{p}anmeldung.html"{cta_cur}>Jetzt anmelden</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="hauptmenu" aria-label="Menü öffnen">
      <span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span>
    </button>
  </nav>
</header>
"""


def footer(page: str, p: str) -> str:
    sticky = "" if page in NO_STICKY else f"""
<div class="sticky-cta" id="stickyCta"><a class="btn btn--pink" href="{p}anmeldung.html">Jetzt anmelden</a></div>"""
    return f"""
<footer>
  <div class="inner">
    <div>
      <h2 class="footer__title">Erzählkunst Bayern e.V.</h2>
      <p>Ihr Verein für Erzählkunst und Erzählausbildung in München und Bayern. Mitglied im Verband der Erzählerinnen und Erzähler e.V. (VEE).</p>
      <p class="footer__spenden"><strong>Spenden:</strong><br><span data-verein="bank">Stadtsparkasse München</span><br>IBAN: <span data-verein="iban">DE03 7015 0000 1006 4878 29</span></p>
    </div>
    <nav aria-label="Schnellzugriff">
      <h2 class="footer__title">Schnellzugriff</h2>
      <ul>
        <li><a href="{p}akademie.html">Akademie &amp; Module</a></li>
        <li><a href="{p}termine.html">Termine</a></li>
        <li><a href="{p}projekte.html">Projekte</a></li>
        <li><a href="{p}team.html">Über uns</a></li>
        <li><a href="{p}anmeldung.html">Anmeldung &amp; Kontakt</a></li>
      </ul>
    </nav>
    <nav aria-label="Rechtliches">
      <h2 class="footer__title">Rechtliches</h2>
      <ul>
        <li><a href="{p}impressum.html">Impressum</a></li>
        <li><a href="{p}datenschutz.html">Datenschutz</a></li>
        <li data-verein-wrap hidden><a data-verein="kontaktEmail" href="{p}anmeldung.html">E-Mail</a></li>
      </ul>
    </nav>
  </div>
  <p class="footer__copy">© <span id="jahr">2026</span> Erzählkunst Bayern e.V.</p>
</footer>{sticky}
"""


def module_html(mods) -> str:
    out = []
    for i, m in enumerate(mods, 1):
        e = {k: html.escape(v or "") for k, v in m.items()}
        name = e["dozentin"].split(",")[0]
        meta = " · ".join(x for x in [e["zeitraum"], name] if x)
        out.append(f"""      <details class="mod">
        <summary class="mod__head"><span class="mod__dot" aria-hidden="true">{i}</span><span class="mod__title">Modul {i}: {e['titel']}</span><span class="date">{meta}</span></summary>
        <div class="mod__body-inner"><dl><dt>Inhalt</dt><dd>{e['inhalt']}</dd><dt>Dozentin</dt><dd>{e['dozentin']}</dd><dt>Kosten</dt><dd>{e['hinweis']}</dd></dl><a class="mod__cta" href="anmeldung.html">Für die Ausbildung anmelden <span aria-hidden="true">→</span></a></div>
      </details>""")
    return "\n" + "\n".join(out) + "\n"


def replace_block(text: str, name: str, content: str) -> str:
    pat = re.compile(r"(<!-- @@" + name + r" -->).*?(<!-- @@/" + name + r" -->)", re.S)
    if not pat.search(text):
        return text
    return pat.sub(lambda m: m.group(1) + content + m.group(2), text)


def main():
    mods = json.loads((ROOT / "tools" / "module_defaults.json").read_text(encoding="utf-8"))
    for f in sorted(SITE.glob("*.html")):
        page = f.stem
        t = f.read_text(encoding="utf-8")
        p = "/" if page == "404" else ""
        title = html.unescape(re.search(r"<title[^>]*>(.*?)</title>", t, re.S).group(1)).strip()
        dm = re.search(r'<meta name="description" content="([^"]*)"', t)
        desc = html.unescape(dm.group(1)) if dm else ""
        t = replace_block(t, "HEAD", head(html.escape(title), html.escape(desc), p, page))
        t = replace_block(t, "HEADER", header(page, p))
        t = replace_block(t, "FOOTER", footer(page, p))
        t = replace_block(t, "MODULE", module_html(mods))
        f.write_text(t, encoding="utf-8")
        print("aktualisiert:", f.name)

    # Vorbelegung der Module im Sanity Studio (gleiche Quelle wie die Website)
    if STUDIO.exists():
        items = [dict(_key=f"modul{i}", _type="modul", **m) for i, m in enumerate(mods, 1)]
        js = ("// Automatisch erzeugt von tools/sync_partials.py aus tools/module_defaults.json – nicht von Hand ändern.\n"
              "export const MODULE_DEFAULTS = " + json.dumps(items, ensure_ascii=False, indent=2) + "\n")
        (STUDIO / "akademieDefaults.js").write_text(js, encoding="utf-8")
        print("aktualisiert: studio/schemaTypes/akademieDefaults.js")

    urls = "\n".join(f"  <url><loc>{SITE_URL}/{'' if u == 'index.html' else u}</loc></url>" for u in SITEMAP_PAGES)
    (SITE / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + urls + "\n</urlset>\n", encoding="utf-8")
    (SITE / "robots.txt").write_text(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n", encoding="utf-8")
    print("aktualisiert: sitemap.xml, robots.txt")


if __name__ == "__main__":
    main()
