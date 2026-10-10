# Erzählkunst Bayern e.V. – Website

Statische Website (HTML/CSS/JavaScript) mit **Sanity** als Redaktionssystem.
Inhalte wie Termine, Projekte, Team und Akademie werden im Sanity Studio gepflegt
und von der Website direkt aus Sanity geladen – ohne Build und ohne erneutes Veröffentlichen.

> Ausführliche Dokumentation (Personas, Use Cases, Architekturentscheidungen, Tests)
> und das Handbuch für den Verein liegen als eigene Dokumente vor (siehe Übergabe).

## Ordner

| Ordner | Inhalt |
|---|---|
| `site/` | Die Website. Wird so, wie sie ist, ausgeliefert. |
| `site/assets/js/` | `sanity.js` (Datenzugriff), `common.js` (Menü, Datum …), je Seite ein `page-*.js` |
| `studio/` | Sanity Studio (Redaktionsoberfläche) mit allen Inhaltstypen in `schemaTypes/` |
| `tools/` | `sync_partials.py` – trägt Kopf, Menü und Fußzeile in alle Seiten ein |
| `tests/` | Automatische Tests (Playwright) mit Mock-Sanity und Testdaten |
| `import/` | Erstimport-Daten (bereits in Sanity eingespielt) |
| `netlify.toml` | Konfiguration für ein späteres Veröffentlichen auf Netlify (noch nicht aktiv) |

## Lokal ansehen

```bash
cd site
python -m http.server 8080
# → http://localhost:8080
```
Damit die Inhalte laden, muss die Adresse einmalig in Sanity freigegeben sein
(sanity.io/manage → Projekt → API → CORS origins → `http://localhost:8080`, „Allow credentials“: aus).

Das Anmeldeformular verschickt lokal nichts – das funktioniert erst auf Netlify (Netlify Forms).
Lokal erscheint dafür ein Hinweis „Lokale Vorschau“.

## Studio starten

```bash
cd studio
npm install        # einmalig bzw. nach Änderungen an package.json
npm run dev        # → http://localhost:3333
```

## Menü, Fußzeile oder Module geändert?

Kopf, Menü und Fußzeile stehen in `tools/sync_partials.py`, die vorinstallierten Akademie-Module
in `tools/module_defaults.json`. Danach einmal ausführen:

```bash
python tools/sync_partials.py
```

## Tests

```bash
pip install playwright pillow && playwright install chromium
cd tests && npm install && cd ..
python tests/make_fixtures.py
python tests/run_tests.py          # Ergebnis: tests/report.json, Screenshots: tests/screens/
```
Geprüft werden alle Seiten in 4 Bildschirmbreiten (Layout, Tippflächen, Konsolenfehler),
Barrierefreiheit (axe-core, WCAG 2.1 AA, wenn `AXE_JS` gesetzt ist), alle Links,
Randfälle (lange Texte, Sonderzeichen, fehlende Felder, ausgebucht, mehrtägig …),
leeres CMS, Sanity-Ausfall, Formular, Weiterleitungen und 404.

## Veröffentlichen (später)

Noch nicht erfolgt. Ablauf siehe Dokumentation, Kapitel „Go-Live-Checkliste“.
