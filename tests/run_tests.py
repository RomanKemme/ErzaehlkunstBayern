#!/usr/bin/env python3
"""Automatisierte Website-Tests (Playwright + Mock-Sanity mit echter GROQ-Auswertung).

Voraussetzungen:  pip install playwright && playwright install chromium
                  cd tests && npm install      (für den Mock-Server)
                  optional: axe-core (npm) für Barrierefreiheits-Prüfung → Pfad in AXE
Start:            python tests/run_tests.py
Ergebnis:         tests/report.json und Zusammenfassung in der Konsole; Screenshots in tests/screens/
"""
import asyncio
import json
import os
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
TESTS = ROOT / "tests"
SCREENS = TESTS / "screens"
SCREENS.mkdir(exist_ok=True)
SITE_PORT, MOCK_PORT = 8765, 8790
BASE = f"http://127.0.0.1:{SITE_PORT}"
AXE = os.environ.get("AXE_JS", "/home/claude/tools-npm/node_modules/axe-core/axe.min.js")
PAGES = ["index", "akademie", "termine", "projekte", "team", "anmeldung", "impressum", "datenschutz", "agb", "widerruf"]
WIDTHS = [360, 390, 768, 1366]

# Einfaches JPEG für alle Bild-Anfragen an cdn.sanity.io
from io import BytesIO
try:
    from PIL import Image
    _b = BytesIO()
    Image.new("RGB", (1200, 600), (190, 160, 120)).save(_b, "JPEG")
    JPEG = _b.getvalue()
except Exception:  # pragma: no cover
    JPEG = b""

results = {"fehler": [], "warnungen": [], "ok": []}


def fehler(msg):
    results["fehler"].append(msg)
    print("  ✗", msg)


def ok(msg):
    results["ok"].append(msg)


def warn(msg):
    results["warnungen"].append(msg)
    print("  !", msg)


def wait_port(port, timeout=15):
    t = time.time()
    while time.time() - t < timeout:
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", port)) == 0:
                return
        time.sleep(0.2)
    raise RuntimeError(f"Port {port} nicht erreichbar")


def set_dataset(name):
    data = (TESTS / "fixtures" / f"{name}.ndjson").read_bytes()
    urllib.request.urlopen(urllib.request.Request(f"http://127.0.0.1:{MOCK_PORT}/__dataset", data=data, method="POST")).read()


async def route_external(route):
    url = route.request.url
    if ".api.sanity.io" in url or ".apicdn.sanity.io" in url:
        q = url.split("/data/query/production", 1)[1]
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{MOCK_PORT}/q{q}") as r:
                body = r.read()
            await route.fulfill(status=200, body=body, headers={"content-type": "application/json", "access-control-allow-origin": "*"})
        except urllib.error.HTTPError as e:
            await route.fulfill(status=e.code, body=e.read(), headers={"content-type": "application/json", "access-control-allow-origin": "*"})
        return
    if "cdn.sanity.io" in url:
        await route.fulfill(status=200, body=JPEG, headers={"content-type": "image/jpeg"})
        return
    await route.abort()


async def open_page(browser, path, width, height=850, bypass_csp=False):
    ctx = await browser.new_context(viewport={"width": width, "height": height}, locale="de-DE", bypass_csp=bypass_csp, reduced_motion="reduce")
    page = await ctx.new_page()
    log = {"console": [], "pageerror": [], "failed": [], "dialog": []}
    page.on("console", lambda m: log["console"].append(m.text) if m.type in ("error", "warning") else None)
    page.on("pageerror", lambda e: log["pageerror"].append(str(e)))
    page.on("requestfailed", lambda r: log["failed"].append(r.url) if "127.0.0.1" in r.url else None)
    page.on("response", lambda r: log["failed"].append(f"{r.status} {r.url}") if "127.0.0.1" in r.url and r.status >= 400 and not r.url.endswith("/favicon.ico") else None)

    async def on_dialog(d):
        log["dialog"].append(d.message)
        await d.dismiss()
    page.on("dialog", lambda d: asyncio.ensure_future(on_dialog(d)))
    await page.route(lambda u: "127.0.0.1" not in u, route_external)
    await page.goto(BASE + path, wait_until="networkidle")
    await page.wait_for_timeout(250)
    return ctx, page, log


def check_log(label, log, expect_404=False):
    errs = [c for c in log["console"] if "Failed to load resource" not in c or not expect_404]
    if errs:
        fehler(f"{label}: Konsolenmeldungen: {errs[:3]}")
    if log["pageerror"]:
        fehler(f"{label}: JavaScript-Fehler: {log['pageerror'][:3]}")
    bad = [f for f in log["failed"] if not (expect_404 and f.startswith("404"))]
    if bad:
        fehler(f"{label}: fehlgeschlagene Anfragen: {bad[:3]}")
    if log["dialog"]:
        fehler(f"{label}: Dialog geöffnet (mögliche Code-Einschleusung): {log['dialog']}")


LAYOUT_JS = """() => {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  const small = [];
  if (vw < 600) {
    document.querySelectorAll('a, button, select, input, textarea, summary').forEach(e => {
      const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
      if (!r.width || !r.height || cs.visibility === 'hidden' || e.closest('[hidden]') || e.getAttribute('tabindex') === '-1') return;
      if (e.closest('.honeypot') || e.classList.contains('skip-link')) return;
      if (e.classList.contains('proj__title-link')) return; // ganze Karte ist klickbar (::after)
      if (r.height < 44 && !(e.closest('p, li, dd') && cs.display === 'inline')) small.push((e.textContent || e.name || e.tagName).trim().slice(0, 30) + ' ' + Math.round(r.height) + 'px');
    });
  }
  const texts = [...document.querySelectorAll('main *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && /undefined|null|NaN|\\[object/.test(n.textContent))).map(e => e.textContent.trim().slice(0, 60));
  return { vw, sw, small: small.slice(0, 8), texts };
}"""


async def layout_checks(browser, dataset):
    print(f"\n[{dataset}] Layout, Konsole, Tippflächen, Platzhaltertexte")
    for p in PAGES:
        for w in WIDTHS:
            ctx, page, log = await open_page(browser, f"/{p}.html", w)
            await page.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'))")
            info = await page.evaluate(LAYOUT_JS)
            label = f"{dataset}/{p}@{w}"
            check_log(label, log)
            if info["sw"] > info["vw"]:
                fehler(f"{label}: horizontales Scrollen ({info['sw']} > {info['vw']})")
            if info["small"]:
                fehler(f"{label}: Tippflächen < 44px: {info['small']}")
            if info["texts"]:
                fehler(f"{label}: technische Platzhalter im Text: {info['texts'][:2]}")
            if w in (390, 1366) and dataset != "empty":
                await page.screenshot(path=str(SCREENS / f"{dataset}_{p}_{w}.png"), full_page=True)
            await ctx.close()
    ok(f"{dataset}: Layoutprüfung durchgelaufen")


async def axe_checks(browser, dataset):
    if not Path(AXE).exists():
        warn("axe-core nicht gefunden – Barrierefreiheitsprüfung übersprungen")
        return
    print(f"\n[{dataset}] Barrierefreiheit (axe-core, WCAG 2.1 AA)")
    axe = Path(AXE).read_text()
    for p in PAGES + ["projekt"]:
        for w in (390, 1366):
            path = f"/{p}.html" + ("?slug=projekt-mit-allem" if p == "projekt" and dataset == "edge" else "?slug=der-montagsclub---erzaehltraining" if p == "projekt" else "")
            ctx, page, log = await open_page(browser, path, w, bypass_csp=True)
            await page.evaluate("document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'))")
            await page.add_script_tag(content=axe)
            res = await page.evaluate("""async () => { const r = await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
                return r.violations.map(v => ({id: v.id, impact: v.impact, n: v.nodes.length, ziel: v.nodes.slice(0,2).map(n => n.target.join(' '))})); }""")
            for v in res:
                (fehler if v["impact"] in ("serious", "critical") else warn)(f"{dataset}/{p}@{w}: axe {v['id']} ({v['impact']}, {v['n']}×) {v['ziel']}")
            await ctx.close()
    ok(f"{dataset}: axe-Prüfung durchgelaufen")


async def link_crawl(browser):
    print("\n[real] Alle Links der Website folgen")
    seen, todo, broken = set(), ["/index.html"], []
    while todo:
        path = todo.pop()
        if path in seen:
            continue
        seen.add(path)
        ctx, page, log = await open_page(browser, path, 1366)
        status = await page.evaluate("document.title")
        if "nicht gefunden" in status.lower():
            broken.append(path)
        hrefs = await page.evaluate("""() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'))""")
        for h in hrefs:
            if h.startswith(("http", "mailto:", "tel:", "#")):
                continue
            full = await page.evaluate("(h) => new URL(h, location.href).pathname + new URL(h, location.href).search", h)
            if full not in seen:
                todo.append(full)
        await ctx.close()
    if broken:
        fehler(f"Kaputte Links: {broken}")
    else:
        ok(f"Link-Crawl: {len(seen)} Adressen, alle erreichbar")
    print(f"  {len(seen)} Adressen geprüft")


async def content_real(browser):
    print("\n[real] Inhalte mit den echten Importdaten")
    ctx, page, log = await open_page(browser, "/termine.html", 1366)
    titles = await page.eval_on_selector_all(".tcard", "els => els.map(e => e.querySelector('.tcard__date').textContent)")
    import datetime
    heute = datetime.date.today()
    if any("28. Sep 2026" in t for t in titles) and heute > datetime.date(2026, 9, 28):
        fehler("Termine: vergangener Termin (28. Sep 2026) wird angezeigt")
    else:
        ok(f"Termine: {len(titles)} kommende Termine, keine vergangenen")
    await ctx.close()

    # Verknüpfung: derselbe Termin hat überall denselben Status (Fehler aus dem Nutzertest:
    # Startseite zeigte „ausgebucht“, obwohl der Termin wieder frei war)
    ctx, page, log = await open_page(browser, "/termine.html", 1366)
    karten = await page.eval_on_selector_all(".tcard", """els => els.map(e => ({d: e.querySelector('.tcard__date').textContent,
        t: e.querySelector('h3').textContent, full: e.classList.contains('is-full')}))""")
    await ctx.close()
    ctx, page, log = await open_page(browser, "/index.html", 390)
    mini = await page.eval_on_selector_all("#naechsteTermine li", """els => els.map(e => ({t: e.textContent,
        full: !!e.querySelector('.badge-full')}))""")
    team_orte = await page.text_content("#homeTeamOrte")
    proj_text = await page.text_content("#homeProjekteLang")
    await ctx.close()
    ctx, page, log = await open_page(browser, "/anmeldung.html", 390)
    optionen = await page.eval_on_selector_all("#f-angebot option", "els => els.map(e => e.textContent)")
    await ctx.close()
    freie = [k for k in karten if not k["full"]]
    abweichung = [m["t"] for m, k in zip(mini, freie) if m["full"] or k["t"] not in m["t"]]
    (ok if not abweichung and len(mini) == min(3, len(freie)) else fehler)(f"Verknüpfung: Startseite zeigt die nächsten freien Termine der Termine-Seite {abweichung}")
    voll_im_formular = [k["t"] for k in karten if k["full"] and any(k["t"] in o and k["d"].split(" · ")[0] in o for o in optionen)]
    (ok if not voll_im_formular else fehler)(f"Verknüpfung: ausgebuchte Termine nicht im Formular {voll_im_formular}")
    (ok if proj_text.startswith("Aktuell:") and team_orte.strip() else fehler)("Verknüpfung: Startseiten-Teaser (Projekte, Team-Orte) aus dem CMS")

    # Jedes Projekt: „Mehr erfahren“ muss eine funktionierende Detailseite öffnen (Fehler aus dem Nutzertest)
    ctx, page, log = await open_page(browser, "/projekte.html", 390)
    links = await page.eval_on_selector_all(".proj__more", "els => els.map(e => e.getAttribute('href'))")
    await ctx.close()
    ctx, page, log = await open_page(browser, "/akademie.html", 390)
    links += await page.eval_on_selector_all(".proj__more", "els => els.map(e => e.getAttribute('href'))")
    await ctx.close()
    if not links:
        fehler("Projekte: keine Projektlinks gefunden")
    for href in links:
        ctx, page, log = await open_page(browser, "/" + href, 390)
        t = await page.text_content("#projektTitel")
        body = await page.text_content("#projektInhalt")
        check_log(f"projekt {href}", log)
        if not t or "nicht gefunden" in t.lower() or "geladen" in t.lower() or len(body.strip()) < 20:
            fehler(f"Projektseite {href}: Titel={t!r}")
        await ctx.close()
    ok(f"Projekte: {len(links)} Detailseiten öffnen korrekt")

    # Akademie ohne gepflegtes Einzeldokument → 10 eingebaute Module
    ctx, page, log = await open_page(browser, "/akademie.html", 390)
    n = await page.locator(".mod").count()
    (ok if n == 10 else fehler)(f"Akademie-Fallback: {n} Module")
    await page.click(".mod:nth-child(1) summary")
    vis = await page.is_visible(".mod:nth-child(1) .mod__body-inner")
    (ok if vis else fehler)("Akademie: Modul lässt sich aufklappen" if vis else "Akademie: Modul klappt nicht auf")
    await ctx.close()


async def content_edge(browser):
    print("\n[edge] Randfälle")
    ctx, page, log = await open_page(browser, "/termine.html", 390)
    txt = await page.text_content("#tcards")
    checks = {
        "vergangener Termin ausgeblendet": "VERGANGEN" not in txt,
        "laufender mehrtägiger Termin sichtbar": "läuft gerade" in txt,
        "heutiger Termin sichtbar": "Montagsclub heute" in txt,
        "Sonderzeichen als Text (kein HTML)": "<script>alert(1)</script>" in txt,
        "Jahreswechsel formatiert": "Dez" in txt and "Jan" in txt,
    }
    ticket = page.locator(".tcard:has-text('StoryJam Test') a.btn")
    checks["externer Ticket-Link statt Anmelden"] = (await ticket.get_attribute("href")) == "https://eventfrog.de/de/p/test.html" and (await ticket.get_attribute("target")) == "_blank"
    for k, v in checks.items():
        (ok if v else fehler)(f"Termine: {k}")
    voll = await page.locator(".tcard.is-full a").count()
    (ok if voll == 0 else fehler)("Termine: ausgebuchte Karten ohne Anmeldelink")
    await page.click('.chip[data-filter="offen"]')
    n_vis = await page.locator(".tcard:not(.hide)").count()
    status = await page.text_content("#filterStatus")
    (ok if str(n_vis) in status else fehler)(f"Filter: Statusanzeige stimmt ({status})")
    (ok if "filter=offen" in page.url else fehler)("Filter: steht in der Adresse (teilbar)")
    await ctx.close()

    # Anmeldung: Vorauswahl über Termin-ID (zweiter Montagsclub!)
    ctx, page, log = await open_page(browser, "/anmeldung.html?termin=t-montag-2", 390)
    val = await page.input_value("#f-angebot")
    import datetime
    d2 = (datetime.date.today() + datetime.timedelta(days=78))
    erwartet = f"{d2.day}. "
    (ok if val.startswith("Der Montagsclub") and erwartet in val else fehler)(f"Anmeldung: richtiger Montagsclub vorausgewählt ({val})")
    opts = await page.eval_on_selector_all("#f-angebot option", "els => els.map(e => e.textContent)")
    (ok if not any("Ausgebucht" in o or "VERGANGEN" in o for o in opts) else fehler)("Anmeldung: keine ausgebuchten/vergangenen Termine im Auswahlfeld")
    await ctx.close()

    ctx, page, log = await open_page(browser, "/anmeldung.html?termin=t-voll", 390)
    hint = await page.text_content("#f-angebot-hint")
    (ok if "ausgebucht" in hint else fehler)("Anmeldung: Hinweis bei ausgebuchtem Termin")
    await ctx.close()

    # Formular: Validierung und Absenden
    ctx, page, log = await open_page(browser, "/anmeldung.html", 390)
    await page.click("#f-submit")
    sichtbar = await page.is_visible("#f-angebot-err")
    fokus = await page.evaluate("document.activeElement.id")
    (ok if sichtbar and fokus == "f-angebot" else fehler)("Formular: Fehlermeldung + Fokus bei leerem Absenden")
    await page.select_option("#f-angebot", index=1)
    await page.fill("#f-name", "Test Person")
    await page.fill("#f-mail", "falsch@")
    await page.click("#f-submit")
    (ok if await page.is_visible("#f-mail-err") else fehler)("Formular: ungültige E-Mail erkannt")
    await page.fill("#f-mail", "test@example.org")
    await page.click("#f-submit")
    try:
        await page.wait_for_selector("#formOk", state="visible", timeout=4000)
        ok("Formular: Erfolgsmeldung nach Absenden")
    except Exception:
        fehler("Formular: Erfolgsmeldung nach Absenden")
    await ctx.close()

    # Akademie mit gepflegtem CMS-Dokument
    ctx, page, log = await open_page(browser, "/akademie.html", 1366)
    t = await page.text_content("main")
    for k, v in {"Jahrgang aus CMS": "2029/30" in t, "Module aus CMS": "CMS-Modul A" in t and "CMS-Modul <B>" in t,
                 "Kosten aus CMS": "2400 €" in t, "Schnupper-Termin gelistet": "ausgebucht" in (await page.text_content("#schnupperTermine")).lower()}.items():
        (ok if v else fehler)(f"Akademie: {k}")
    href = await page.get_attribute("#schnupperBtn", "href")
    (ok if href.endswith("termin=t-schnupper") else fehler)(f"Akademie: Schnupper-Button verlinkt freien Termin ({href})")
    await ctx.close()

    # Projekte: Entwürfe / ohne Adresse unsichtbar, Detailseite vollständig, böser Link entfernt
    ctx, page, log = await open_page(browser, "/projekte.html", 1366)
    t = await page.text_content("main")
    (ok if "ENTWURF" not in t and "OHNE ADRESSE" not in t else fehler)("Projekte: Entwürfe und Projekte ohne Adresse ausgeblendet")
    (ok if await page.is_visible("#abgeschlossenWrap") else fehler)("Projekte: abgeschlossene Projekte sichtbar")
    await ctx.close()
    ctx, page, log = await open_page(browser, "/projekt.html?slug=projekt-mit-allem", 390)
    html = await page.inner_html("#projektInhalt")
    for k, v in {"Liste": "<ul>" in html, "Zwischenüberschrift": "<h3>" in html, "Bild mit Alt-Text": 'alt="Bild im Text"' in html,
                 "javascript-Link entfernt": "javascript:" not in html, "externer Link": 'href="https://example.org"' in html,
                 "Link auf eigene Seite (Auswahlliste)": 'href="akademie.html"' in html}.items():
        (ok if v else fehler)(f"Projektseite: {k}")
    (ok if await page.get_attribute("#ctaButton", "href") == "termine.html" else fehler)("Projektseite: Button-Ziel aus CMS")
    await ctx.close()
    ctx, page, log = await open_page(browser, "/projekt.html?slug=gibt-es-nicht", 390)
    (ok if "nicht gefunden" in (await page.text_content("h1")).lower() else fehler)("Projektseite: freundliche Meldung bei unbekanntem Projekt")
    await ctx.close()
    ctx, page, log = await open_page(browser, "/projekt.html?slug=ohne-inhalt", 390)
    (ok if "Nur Kurzbeschreibung" in await page.text_content("#projektInhalt") else fehler)("Projektseite ohne Text zeigt Kurzbeschreibung")
    (ok if await page.get_attribute("#ctaButton", "href") == "mailto:test@example.org" else fehler)("Projektseite: älteres Button-Ziel (freie Adresse) funktioniert weiter")
    await ctx.close()

    # Team
    ctx, page, log = await open_page(browser, "/team.html", 390)
    t = await page.text_content("#teamGrid")
    (ok if "NN" in t else fehler)("Team: Initialen automatisch aus dem Namen")
    n_btn = await page.locator(".audio-btn").count()
    (ok if n_btn == 2 else fehler)(f"Team: Play-Button nur bei vorhandenem Text/Audio ({n_btn})")
    await ctx.close()

    # Verein & Impressum
    ctx, page, log = await open_page(browser, "/impressum.html", 390)
    t = await page.text_content("main")
    (ok if "Impressum aus dem CMS" in t and "Vorlage" not in t else fehler)("Impressum aus dem CMS ersetzt Vorlage")
    (ok if await page.is_visible("footer [data-verein='kontaktEmail']") else fehler)("Fußzeile: Kontakt-E-Mail sichtbar")
    await ctx.close()

    # Startseite: nur freie Termine; Formular: weder ausgebuchte noch Termine mit Fremd-Tickets
    ctx, page, log = await open_page(browser, "/index.html", 390)
    mini = await page.text_content("#naechsteTermine")
    (ok if "Ausgebucht" not in mini and "Schnuppertag Spezial" not in mini else fehler)("Startseite: ausgebuchte Termine nicht unter „Nächste Termine“")
    await ctx.close()
    ctx, page, log = await open_page(browser, "/anmeldung.html", 390)
    opts = " | ".join(await page.eval_on_selector_all("#f-angebot option", "els => els.map(e => e.textContent)"))
    (ok if "Ausgebuchter Workshop" not in opts and "Schnuppertag Spezial" not in opts and "StoryJam Test" not in opts else fehler)("Anmeldung: keine ausgebuchten und keine Fremd-Ticket-Termine im Formular")
    await ctx.close()
    # Team: ausführliche Vorstellung aufklappbar, Website-Link, Anker für alte Adressen
    ctx, page, log = await open_page(browser, "/team.html", 390)
    await page.click("#gabi-altenbach .dozentin__mehr summary")
    t = await page.text_content("#gabi-altenbach .dozentin__mehr")
    (ok if "Zweiter Absatz <b>mit HTML</b>" in t and await page.get_attribute("#gabi-altenbach .dozentin__mehr a", "href") == "https://example.org/gabi" else fehler)("Team: „Mehr über …“ mit Absätzen und Website-Link")
    await ctx.close()


async def content_empty(browser):
    print("\n[empty] Leeres CMS")
    for p, erwartet in {"termine": "keine Termine", "projekte": "in Vorbereitung", "team": "folgt in Kürze"}.items():
        ctx, page, log = await open_page(browser, f"/{p}.html", 390)
        t = (await page.text_content("main")).lower()
        (ok if erwartet.lower() in t else fehler)(f"Leer: {p} zeigt Hinweis „{erwartet}“")
        await ctx.close()
    ctx, page, log = await open_page(browser, "/index.html", 390)
    (ok if await page.is_hidden("#impressionen") else fehler)("Leer: Impressionen ausgeblendet")
    await ctx.close()


async def misc(browser):
    print("\n[allgemein] Menü, Weiterleitungen, 404, Sanity-Ausfall")
    ctx, page, log = await open_page(browser, "/index.html", 390)
    await page.click(".nav-toggle")
    (ok if await page.is_visible("#hauptmenu a[href='termine.html']") else fehler)("Menü (Handy) öffnet")
    await page.keyboard.press("Escape")
    (ok if await page.is_hidden("#hauptmenu") else fehler)("Menü schließt mit Escape")
    await ctx.close()
    for alt, neu in {"/unsere-projekte/": "/projekte.html", "/ueber-uns/katharina-ritter/": "/team.html#katharina-ritter",
                     "/unsere-projekte/der-montagsclub---erzaehltraining/": "/projekt.html?slug=der-montagsclub---erzaehltraining",
                     "/agb-s/": "/agb.html", "/widerruf/": "/widerruf.html", "/spenden-und-gutes-tun/": "/anmeldung.html#spenden",
                     "/kontakt/": "/anmeldung.html", "/admin/": "/index.html"}.items():
        ctx, page, log = await open_page(browser, alt, 1366)
        (ok if page.url.endswith(neu) else fehler)(f"Weiterleitung {alt} → {neu} ({page.url})")
        await ctx.close()
    ctx, page, log = await open_page(browser, "/gibt/es/nicht", 390)
    (ok if "nicht" in await page.text_content("h1") else fehler)("404-Seite wird angezeigt")
    check_log("404", log, expect_404=True)
    await ctx.close()
    # Sanity nicht erreichbar → freundliche Meldungen, keine JS-Fehler
    for p in ["termine", "projekte", "team", "anmeldung", "akademie", "index"]:
        ctx = await browser.new_context(viewport={"width": 390, "height": 800})
        page = await ctx.new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        await page.route(lambda u: "127.0.0.1" not in u, lambda r: r.abort())
        await page.goto(f"{BASE}/{p}.html", wait_until="networkidle")
        t = (await page.text_content("main")).lower()
        if errs:
            fehler(f"Sanity-Ausfall {p}: JS-Fehler {errs}")
        if "wird geladen" in t or "werden geladen" in t:
            fehler(f"Sanity-Ausfall {p}: Ladehinweis bleibt stehen")
        await ctx.close()
    ok("Sanity-Ausfall geprüft")


async def main():
    mock = subprocess.Popen(["node", str(TESTS / "mock-sanity.mjs"), "", str(MOCK_PORT)], stdout=subprocess.DEVNULL)
    server = subprocess.Popen([sys.executable, str(TESTS / "serve.py"), str(SITE_PORT)])
    try:
        wait_port(MOCK_PORT)
        wait_port(SITE_PORT)
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            for ds in ["real", "edge", "empty"]:
                set_dataset(ds)
                await layout_checks(browser, ds)
                if ds == "real":
                    await content_real(browser)
                    await link_crawl(browser)
                    await axe_checks(browser, ds)
                if ds == "edge":
                    await content_edge(browser)
                    await axe_checks(browser, ds)
                if ds == "empty":
                    await content_empty(browser)
            set_dataset("real")
            await misc(browser)
            await browser.close()
    finally:
        mock.terminate()
        server.terminate()
    (TESTS / "report.json").write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n=== {len(results['ok'])} bestanden, {len(results['fehler'])} Fehler, {len(results['warnungen'])} Warnungen ===")
    sys.exit(1 if results["fehler"] else 0)


if __name__ == "__main__":
    asyncio.run(main())
