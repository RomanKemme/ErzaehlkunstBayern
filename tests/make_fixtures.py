#!/usr/bin/env python3
"""Erzeugt Testdaten für die lokalen Website-Tests (tests/fixtures/*.ndjson).

real.ndjson   – die echten Importdaten aus import/ (wie im Sanity-Projekt angelegt)
edge.ndjson   – Randfälle: lange Titel, Sonderzeichen, fehlende Felder, mehrtägig,
                laufende Termine, ausgebucht, Bilder, Rich-Text, gepflegte Einzeldokumente
empty.ndjson  – gar keine Inhalte (frisch angelegtes Projekt)
Alle Datumsangaben in edge.ndjson sind relativ zu heute, damit die Tests jederzeit gelten.
"""
import datetime as dt
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "tests" / "fixtures"
OUT.mkdir(parents=True, exist_ok=True)
heute = dt.date.today()


def d(tage):
    return (heute + dt.timedelta(days=tage)).isoformat()


def img(n):
    return {"_id": f"image-test{n}-1200x600-jpg", "_type": "sanity.imageAsset",
            "url": f"https://cdn.sanity.io/images/o1wd66uu/production/test{n}-1200x600.jpg"}


def ref(n, alt=None):
    r = {"_type": "image", "asset": {"_type": "reference", "_ref": f"image-test{n}-1200x600-jpg"}}
    if alt:
        r["alt"] = alt
    return r


def block(text, style="normal", marks=None, list_item=None, mark_defs=None, key="b"):
    b = {"_type": "block", "_key": key, "style": style, "markDefs": mark_defs or [],
         "children": [{"_type": "span", "_key": key + "s", "text": text, "marks": marks or []}]}
    if list_item:
        b["listItem"] = list_item
        b["level"] = 1
    return b


# ---------- real ----------
real = []
for f in ["daten.ndjson", "projekte.ndjson"]:
    real += [json.loads(l) for l in (ROOT / "import" / f).read_text(encoding="utf-8").splitlines() if l.strip()]

# ---------- edge ----------
LANG = "Ein ausgesprochen langer Workshoptitel über das Erzählen von Märchen, Mythen und Sagen aus aller Welt für Fortgeschrittene"
edge = [img(1), img(2), img(3)]
edge += [
    {"_id": "t-vergangen", "_type": "termin", "cat": "offen", "datum": d(-3), "title": "VERGANGEN – darf nicht erscheinen"},
    {"_id": "t-laufend", "_type": "termin", "cat": "akademie", "datum": d(-1), "enddatum": d(2),
     "title": "Erzählreise (läuft gerade)", "desc": "Mehrtägig, hat gestern begonnen.", "meta": "Seeboden, Österreich"},
    {"_id": "t-heute", "_type": "termin", "cat": "offen", "datum": d(0), "zeitVon": "19:00", "zeitBis": "21:00",
     "title": "Montagsclub heute", "desc": "Heute Abend.", "meta": "Kulturzentrum LUISE, München · 1–5 €"},
    {"_id": "t-minimal", "_type": "termin", "cat": "offen", "datum": d(5), "title": "Nur Pflichtfelder"},
    {"_id": "t-sonderzeichen", "_type": "termin", "cat": "akademie", "datum": d(8), "zeitVon": "10:00",
     "title": "Erzählen <script>alert(1)</script> & \"Zitate\"", "desc": "Text mit <b>HTML</b> & Umlauten äöüß.",
     "meta": "Ort & Kosten < 50 €"},
    {"_id": "t-schnupper", "_type": "termin", "cat": "akademie", "datum": d(14), "zeitVon": "10:00", "zeitBis": "15:00",
     "title": "Schnupper-Workshop Erzählen", "schnupper": True, "desc": "Ohne Vorkenntnisse.", "meta": "Ort folgt · 54 €"},
    {"_id": "t-schnupper-voll", "_type": "termin", "cat": "akademie", "datum": d(20), "title": "Schnuppertag Spezial",
     "schnupper": True, "full": True},
    {"_id": "t-voll", "_type": "termin", "cat": "akademie", "datum": d(30), "title": "Ausgebuchter Workshop", "full": True,
     "desc": "Leider voll.", "meta": "München · 240 €"},
    {"_id": "t-lang", "_type": "termin", "cat": "akademie", "datum": d(40), "enddatum": d(41), "title": LANG,
     "desc": "x " * 140, "meta": "Kulturzentrum mit einem sehr langen Namen, Straße 123, 80331 München · 240 € inkl. Material",
     "img": ref(1)},
    {"_id": "t-jahreswechsel", "_type": "termin", "cat": "akademie", "datum": f"{heute.year}-12-30",
     "enddatum": f"{heute.year + 1}-01-02", "title": "Über den Jahreswechsel"},
    {"_id": "t-montag-1", "_type": "termin", "cat": "offen", "datum": d(50), "zeitVon": "19:00", "zeitBis": "21:00", "title": "Der Montagsclub"},
    {"_id": "t-montag-2", "_type": "termin", "cat": "offen", "datum": d(78), "zeitVon": "19:00", "zeitBis": "21:00", "title": "Der Montagsclub"},
]
edge += [
    {"_id": "p-voll", "_type": "projekt", "title": "Projekt mit allem", "slug": {"current": "projekt-mit-allem"},
     "bereich": "projekte-laufend", "kurzbeschreibung": "Hat Bild, Zitat, Rich-Text und Button.", "reihenfolge": 1,
     "heroBild": ref(2, "Titelbild Test"), "zitat": "Erzählen heißt, jemandem die Hand reichen.", "zitatAutor": "Unbekannt",
     "ctaText": "Fragen? Hier lang!", "ctaZiel": "termine.html",
     "inhalt": [
         block("Einleitung mit fett", marks=["strong"], key="a"),
         block("Zwischenüberschrift", style="h3", key="c"),
         block("Punkt eins", list_item="bullet", key="d"),
         block("Punkt zwei", list_item="bullet", key="e"),
         block("Sicherer Link", marks=["l1"], mark_defs=[{"_key": "l1", "_type": "link", "href": "https://example.org"}], key="f"),
         block("Interner Link", marks=["l3"], mark_defs=[{"_key": "l3", "_type": "link", "seite": "akademie.html"}], key="f2"),
         block("Böser Link", marks=["l2"], mark_defs=[{"_key": "l2", "_type": "link", "href": "javascript:alert(1)"}], key="g"),
         {"_type": "image", "_key": "h", "asset": {"_type": "reference", "_ref": "image-test3-1200x600-jpg"}, "alt": "Bild im Text", "caption": "Bildunterschrift"},
         block("Schluss", key="i"),
     ]},
    {"_id": "p-ohne-inhalt", "_type": "projekt", "title": "Projekt ohne Seitentext", "slug": {"current": "ohne-inhalt"},
     "bereich": "projekte-laufend", "kurzbeschreibung": "Nur Kurzbeschreibung vorhanden.", "reihenfolge": 2,
     "ctaLink": "mailto:test@example.org"},
    {"_id": "p-lang", "_type": "projekt", "title": LANG, "slug": {"current": "langer-titel"}, "bereich": "projekte-abgeschlossen",
     "kurzbeschreibung": "y " * 120, "reihenfolge": 5},
    {"_id": "p-ohne-slug", "_type": "projekt", "title": "OHNE ADRESSE – darf nicht erscheinen", "bereich": "projekte-laufend",
     "kurzbeschreibung": "fehlt slug"},
    {"_id": "p-akademie", "_type": "projekt", "title": "Erzählreise 2027", "slug": {"current": "erzaehlreise"},
     "bereich": "akademie", "kurzbeschreibung": "Fünf Tage am See."},
    {"_id": "drafts.p-entwurf", "_type": "projekt", "title": "ENTWURF – darf nicht erscheinen", "slug": {"current": "entwurf"},
     "bereich": "projekte-laufend", "kurzbeschreibung": "unveröffentlicht"},
]
edge += [
    {"_id": "tm-1", "_type": "teamMitglied", "name": "Gabi Altenbach", "ort": "München", "fach": "Mythen & Humor",
     "intro": "Hallo, ich bin Gabi.", "reihenfolge": 1, "foto": ref(1)},
    {"_id": "tm-2", "_type": "teamMitglied", "name": "Nur Name"},
    {"_id": "tm-3", "_type": "teamMitglied", "name": "Maria-Theresia von Langenhausen-Oberwittelsbach", "ort": "Regensburg", "reihenfolge": 3,
     "intro": "Ich erzähle gern."},
]
edge += [
    {"_id": "akademie", "_type": "akademie", "jahrgang": "2029/30", "startText": "März 2029", "startKurz": "Mär 2029",
     "kosten": "2400 €", "schnupperPreis": "60 €", "teilnehmende": "6–12", "kursort": "München",
     "modulUmfang": "Module à 16 UE", "kurstageKurz": "Sa + So", "kurszeiten": "10–17 Uhr",
     "nachholerText": "CMS-Text Nachholer", "coachingText": "CMS-Text Coaching",
     "module": [{"_key": "m1", "_type": "modul", "titel": "CMS-Modul A", "zeitraum": "Mär 2029", "dozentin": "Test, Ort", "inhalt": "Inhalt A", "hinweis": "inkl."},
                {"_key": "m2", "_type": "modul", "titel": "CMS-Modul <B>", "zeitraum": "Mai 2029"}]},
    {"_id": "seiten", "_type": "seiten", "homeHero": ref(2), "homeHeroFokus": "top",
     "impressionen": [{"_key": "i1", "bild": ref(1, "Bühne"), "unterschrift": "Mit Bild"},
                      {"_key": "i2", "unterschrift": "Ohne Bild"}, {"_key": "i3", "bild": ref(3)}]},
    {"_id": "verein", "_type": "verein", "kontaktEmail": "kontakt@example.org", "bank": "Testbank", "iban": "DE00 1234 5678 9012 3456 78",
     "impressum": [block("Impressum aus dem CMS", key="x"), block("Musterstraße 1", key="y")]},
]

for name, docs in [("real", real), ("edge", edge), ("empty", [])]:
    (OUT / f"{name}.ndjson").write_text("\n".join(json.dumps(x, ensure_ascii=False) for x in docs) + "\n", encoding="utf-8")
    print(name, len(docs))
