# Sanity-Testversion – Anleitung

Diese Version ist eine **parallele Kopie** der Website. Die laufende Decap-Version
(GitHub-Repo + Netlify) bleibt komplett unangetastet.

## Was ist in diesem Ordner?

- `studio-schemas/` – die Inhaltsstrukturen (Termine, Team, Seitenbilder) für Sanity Studio
- `site/` – die Website-Seiten, umgebaut auf Sanity als Datenquelle
- `import/daten.ndjson` – eure bestehenden 12 Termine + 6 Teammitglieder zum Importieren

## Schritt 1: Sanity-Projekt anlegen (einmalig, ~5 Minuten)

Voraussetzung: Node.js ab v22.12 (`node --version` prüfen).

In einem NEUEN Ordner (z. B. `Desktop/sanity-test`), im Terminal:

```
npm create sanity@latest -- --template clean --dataset production --output-path studio
```

Der Assistent führt dich durch:
- Konto erstellen/einloggen (GitHub-Login geht)
- Projektname: z. B. "Erzaehlkunst Test"
- Bei allen weiteren Fragen die Vorgaben übernehmen (TypeScript: egal, gerne "No" für Einfachheit)

**Notiere dir die Projekt-ID**, die dabei angezeigt wird (steht auch in `studio/sanity.config.js`).

## Schritt 2: Unsere Schemas einsetzen

Ersetze den Inhalt des Ordners `studio/schemaTypes/` durch die Dateien aus
`studio-schemas/` (alle 4 Dateien: index.js, termin.js, teamMitglied.js, seiten.js).

Falls dein Studio mit TypeScript angelegt wurde (`schemaTypes/index.ts`):
einfach die .ts-Dateien löschen und unsere .js-Dateien reinlegen – funktioniert genauso.

## Schritt 3: Studio starten

```
cd studio
npm run dev
```

→ http://localhost:3333 im Browser öffnen, einloggen.
Du solltest links "Termine", "Team (Über uns)" und "Seitenbilder" sehen.

## Schritt 4: Bestehende Daten importieren

Im `studio`-Ordner (Terminal), die daten.ndjson aus diesem Paket dorthin kopieren, dann:

```
npx sanity dataset import daten.ndjson production
```

→ Danach im Studio neu laden: alle 12 Termine und 6 Teammitglieder sind da.
(Bilder sind bewusst nicht dabei – die ladet ihr im Studio hoch, das ist Teil des Tests!)

## Schritt 5: Website-Seiten verbinden

1. In `site/sanity.js` die Zeile mit `HIER-PROJEKT-ID-EINTRAGEN` durch eure echte Projekt-ID ersetzen
2. CORS freigeben, damit die lokal geöffnete Seite die API abfragen darf – im studio-Ordner:

```
npx sanity cors add http://localhost:8000
```

3. Die Site lokal serven (im `site`-Ordner):

```
python -m http.server 8000
```

→ http://localhost:8000/termine.html öffnen. Die Termine kommen jetzt live aus Sanity!

## Schritt 6: Der eigentliche Test

- Im Studio (localhost:3333) einen Termin ändern → "Publish" → Website-Tab neu laden:
  Änderung ist SOFORT da. Kein Git-Commit, kein Netlify-Build, keine Credits.
- Ein Team-Foto im Studio hochladen → erscheint auf team.html
- Zwei Browser-Tabs mit dem Studio öffnen → in beiden gleichzeitig tippen → Echtzeit-Sync sehen

## Wichtig zu wissen

- **Formular**: Das Anmeldeformular sendet weiterhin über Netlify Forms – lokal
  funktioniert der Versand nicht (nur auf der deployten Netlify-Seite). Fürs
  CMS-Testen irrelevant.
- **Kosten**: Alles hier läuft im Sanity-Free-Plan und lokal – 0 €, keine Netlify-Credits.
- **Falls der Test überzeugt**: Der Umbau der echten Seite ist dann genau dieser
  Stand hier – wir müssten nur noch die Seiten aus site/ ins echte Repo übernehmen
  und das Studio für die Vereinsmitglieder deployen (sanity deploy → kostenlose
  xyz.sanity.studio-Adresse, läuft NICHT über euer Netlify-Kontingent).
