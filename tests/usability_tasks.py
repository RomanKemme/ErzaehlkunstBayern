#!/usr/bin/env python3
"""Aufgabenbasierte Usability-Durchläufe aus Sicht der Personas (Handy, 390 px).
Jede Aufgabe wird wie von einem Menschen gelöst: nur sichtbare Links/Buttons anklicken.
Gemessen: Anzahl Interaktionen bis zum Ziel, ob das Ziel erreicht wurde, Seitengewicht.
Voraussetzung: tests/serve.py (Port 8765) und tests/mock-sanity.mjs (Port 8790, Datensatz edge) laufen.
"""
import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import run_tests as R  # noqa: E402
from playwright.async_api import async_playwright  # noqa: E402


async def aufgabe(browser, name, schritte, ziel):
    ctx, page, log = await R.open_page(browser, "/index.html", 390)
    n = 0
    try:
        for art, sel in schritte:
            if art == "klick":
                loc = page.locator(sel).first
                await loc.scroll_into_view_if_needed()
                await loc.click()
                n += 1
            elif art == "warte":
                await page.wait_for_timeout(int(sel))
        await page.wait_for_load_state("networkidle")
        erreicht = await ziel(page)
    except Exception as e:  # noqa: BLE001
        erreicht = f"abgebrochen: {e}"
    await ctx.close()
    return {"aufgabe": name, "interaktionen": n, "erreicht": erreicht, "js_fehler": log["pageerror"]}


async def gewicht(browser, path):
    ctx = await browser.new_context(viewport={"width": 390, "height": 800})
    page = await ctx.new_page()
    total = {"bytes": 0, "anfragen": 0}

    async def on_resp(r):
        try:
            b = await r.body()
            total["bytes"] += len(b)
            total["anfragen"] += 1
        except Exception:  # noqa: BLE001
            pass
    page.on("response", lambda r: asyncio.ensure_future(on_resp(r)))
    await page.route(lambda u: "127.0.0.1" not in u, R.route_external)
    await page.goto(R.BASE + path, wait_until="networkidle")
    await page.wait_for_timeout(500)
    t = await page.evaluate("JSON.stringify(performance.getEntriesByType('navigation')[0].toJSON())")
    nav = json.loads(t)
    await ctx.close()
    return {"seite": path, "kB": round(total["bytes"] / 1024), "anfragen": total["anfragen"], "dom_fertig_ms": round(nav["domContentLoadedEventEnd"])}


async def main():
    R.set_dataset("edge")
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ergebnisse = [
            await aufgabe(b, "Sabine: Schnupper-Workshop buchen (über Akademie)", [
                ("klick", ".nav-toggle"), ("klick", "#hauptmenu a[href='akademie.html']"), ("klick", "#schnupperBtn")],
                lambda pg: pg.input_value("#f-angebot")),
            await aufgabe(b, "Sabine: Schnupper-Workshop buchen (über Startseite)", [
                ("klick", "a.steplink[href='termine.html?filter=offen']"), ("klick", ".chip[data-filter='akademie']"),
                ("klick", ".tcard:not(.hide):has-text('Schnupper') a.btn")],
                lambda pg: pg.input_value("#f-angebot")),
            await aufgabe(b, "Ingrid: zweiten Montagsclub anmelden", [
                ("klick", ".nav-toggle"), ("klick", "#hauptmenu a[href='termine.html']"), ("klick", ".chip[data-filter='offen']"),
                ("klick", ".tcard:not(.hide):has-text('Der Montagsclub') >> nth=1 >> a.btn")],
                lambda pg: pg.input_value("#f-angebot")),
            await aufgabe(b, "Markus: Kosten und Modul 1 der Grundausbildung finden", [
                ("klick", ".hero__badge"), ("warte", "800"), ("klick", ".mod summary")],
                lambda pg: pg.evaluate("document.querySelector('#akademie').innerText.includes('2400') && document.querySelector('.mod[open]') !== null")),
            await aufgabe(b, "Alle: Projekt öffnen", [
                ("klick", ".proj a[href='projekte.html']"), ("klick", ".proj__title-link")],
                lambda pg: pg.text_content("#projektTitel")),
            await aufgabe(b, "Spender:in: IBAN finden", [],
                lambda pg: pg.evaluate("document.querySelector('footer').innerText.includes('IBAN')")),
        ]
        gewichte = [await gewicht(b, f"/{s}.html") for s in ["index", "termine", "akademie", "anmeldung"]]
        await b.close()
    out = {"aufgaben": ergebnisse, "seitengewicht": gewichte}
    (Path(__file__).parent / "usability.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps(out, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    asyncio.run(main())
