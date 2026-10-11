# Qualitätssicherung

Alle 55 automatischen Prüfungen bestehen (Lauf vom 10.10.2026); dazu sechs aufgabenbasierte Usability-Durchläufe, alle Aufgaben in höchstens vier Interaktionen gelöst.

**Teststrategie**

- **Testserver wie Netlify** (`tests/serve.py`): liefert `site/` mit den Headern aus `netlify.toml` (inkl. Content-Security-Policy), wertet `_redirects` aus, zeigt `404.html`, simuliert Netlify Forms.
- **Mock-Sanity** (`tests/mock-sanity.mjs`): beantwortet die echten GROQ-Abfragen mit `groq-js`, Entwürfe wie bei der öffentlichen API unsichtbar.
- **Drei Datensätze** (`tests/make_fixtures.py`): *real* = die Importdaten aus Sanity; *edge* = Randfälle relativ zu heute (laufender mehrtägiger Termin, heutiger Termin, Jahreswechsel, Sonderzeichen und `<script>` im Titel, sehr lange Texte, fehlende Felder, ausgebucht, Projekt ohne Text/ohne Adresse/Entwurf, `javascript:`-Link, gepflegte Einzeldokumente); *empty* = leeres CMS.
- **Browser:** Chromium via Playwright, reduzierte Bewegung, 360 / 390 / 768 / 1366 px.

| Prüfbereich | Umfang | Ergebnis |
| --- | --- | --- |
| Layout: kein seitliches Scrollen | 8 Seiten × 4 Breiten × 3 Datensätze | bestanden |
| Tippflächen ≥ 44 px (Handy) | alle Links, Buttons, Felder | bestanden |
| Keine Konsolen- oder JS-Fehler, keine fehlgeschlagenen Anfragen, CSP-konform | alle Seitenaufrufe | bestanden |
| Keine Platzhalter wie „undefined“ im Text | alle Seitenaufrufe | bestanden |
| Barrierefreiheit axe-core (WCAG 2.1 A/AA) | 9 Seiten × 2 Breiten × 2 Datensätze | 0 Verstöße |
| Link-Crawl | 25 Adressen inkl. aller Projektseiten | alle erreichbar |
| Projekt „Mehr erfahren“ (Nutzerfehler) | jede Projektkarte auf Projekte und Akademie | jede Detailseite lädt |
| Termin-Logik | vergangene aus, laufende an, Filter, Status, Adresse | bestanden |
| Formular | Pflichtfelder, E-Mail-Prüfung, Fokus, Vorauswahl per Termin-ID, Ausgebucht-Hinweis, Erfolgsmeldung | bestanden |
| Sicherheit | `<script>` in Titeln als Text, `javascript:`-Links entfernt, kein Dialog | bestanden |
| Leeres CMS / Sanity-Ausfall | Hinweistexte statt Ladeanzeige, keine Fehler | bestanden |
| Weiterleitungen alter Jimdo-Adressen, 404-Seite | 4 Beispiele + Fantasieadresse | bestanden |
| Studio | `sanity schema validate`, `sanity build` | 0 Fehler, 0 Warnungen |

**Usability-Durchläufe (Handy, 390 px)**

| Persona · Aufgabe | Interaktionen | Ergebnis |
| --- | --- | --- |
| Sabine · Schnupper-Workshop buchen über Akademie | 3 | Termin im Formular vorausgewählt |
| Sabine · Schnupper-Workshop buchen über Startseite | 3 | Termin vorausgewählt |
| Ingrid · zweiten Montagsclub anmelden | 4 | richtiger Termin (nicht der erste gleichnamige) |
| Markus · Kosten und Modul 1 finden | 2 | gefunden |
| Alle · Projekt öffnen | 2 | Detailseite geladen |
| Spender:in · IBAN finden | 0 | in jeder Fußzeile |

Seitengewicht 157–214 kB bei 14–19 Anfragen, Gerüst lokal in unter 0,1 s fertig.

**Gefundene und behobene Fehler während der Tests:** verlorener Klick auf „Absenden“ durch Layoutsprung beim Verlassen eines Feldes; leere Polaroid-Rahmen in der Galerie; überlappendes „Ausgebucht“-Abzeichen; zerrissener Hinweis-Badge auf dem Handy; zu kleine Projekttitel-Links; aufgeklapptes Modul klappte beim Nachladen wieder zu; Kontrastfehler während Einblend-Animationen.

**Echtsystem-Test gegen das Sanity-Projekt:** am 10.10.2026 auf dem Laptop gegen das echte Sanity-Projekt durchgeführt. Website: 8 Seiten × 3 Breiten (375, 768, 1280 px) ohne JS-Fehler, ohne seitliches Überlaufen, ohne „undefined“-Texte; 26 interne Links und alle 7 Projekt-Detailseiten erreichbar; 11 kommende Termine, Vorauswahl im Anmeldeformular korrekt. Studio: Test-Termin über die Oberfläche angelegt und veröffentlicht, per API mit allen Feldern bestätigt; Test-Projekt legt Roman selbst nach Handbuch an. Gefunden und behoben: „Neues Termine/Projekte“ im Studio (jetzt „Neu: Termin“), Impressionen ohne Foto blendeten den ganzen Abschnitt aus (jetzt Textkachel), Datum auf Terminkarten zu groß und in Zierschrift (jetzt Fließtextschrift, 15 px), react/react-dom-Versionskonflikt beim Studio-Start (Versionen fest auf 19.2.8).

**SEO-Check (11.10.2026):** Grundlagen waren vorhanden; fünf Lücken wurden geschlossen.

| Prüfpunkt | Vorher | Jetzt |
| --- | --- | --- |
| Titel und Beschreibung je Seite | vorhanden, Akademie-Titel 76 Zeichen | alle unter 70 Zeichen |
| Eine H1 je Seite, `lang="de"`, Alt-Texte | erfüllt | erfüllt |
| Canonical-Adresse | fehlte | je Seite, Projektseiten per Skript |
| Vorschaubild beim Teilen (Open Graph, Twitter) | fehlte | `og-image.jpg` 1200 × 630 |
| Strukturierte Daten | fehlten | Organisation auf der Startseite, jeder Termin als `Event` |
| Bild-Dateinamen | Zufallskennung von Sanity | sprechender Name aus Titel/Bildunterschrift (Vanity Filename) |
| Nicht gefundenes Projekt | indexierbar | `noindex` |
| sitemap.xml, robots.txt | vorhanden (6 Seiten) | unverändert; Projektseiten findet Google über die Links der Projekte-Seite |

Nach dem Go-Live: Domain in der Google Search Console anmelden, Sitemap einreichen, Rich-Results-Test für die Termine-Seite laufen lassen.

## Selbstbewertung

Die Website ist technisch bereit für den Go-Live; offen sind nur Inhalte, die der Verein liefern muss (Impressum, Datenschutz, Fotos). Bewertung nach dem Ziel „keine Fehler nach diesem Run“:

| Kriterium | Bewertung | Beleg |
| --- | --- | --- |
| Funktion: Termine & Projekte pflegen | Erfüllt | Echtsystem-Test: Termin im Studio angelegt, sofort auf Termine-, Start- und Anmeldeseite |
| Keine Fehlerseiten | Erfüllt | 26 interne Links, 7 Projekt-Detailseiten, alte Jimdo-Adressen per 301 umgeleitet |
| Responsive (Handy bis Desktop) | Erfüllt | 3 Breiten × 8 Seiten ohne Überlaufen; Tippflächen ≥ 44 px |
| Barrierefreiheit | Erfüllt (WCAG 2.1 AA, automatisch) | axe-core ohne Verstöße; manueller Screenreader-Test steht aus |
| Robustheit bei leerem oder ausgefallenem CMS | Erfüllt | Datensätze „leer“ und „Sanity-Ausfall“ getestet, verständliche Hinweise statt leerer Bereiche |
| Bedienbarkeit für den Verein | Weitgehend erfüllt | Deutsches Studio, Hilfetexte an jedem Feld; Handbuch-Test durch echte Vereinsmitglieder steht aus |
| Sicherheit | Erfüllt | CSP ohne Inline-Skripte, Links aus dem CMS gefiltert, keine Schlüssel im Code |
| Rechtstexte | Nicht erfüllt | Impressum und Datenschutz sind Vorlagen und müssen vom Verein geprüft und eingetragen werden |

Selbstkritisch: Die automatischen Tests liefen gegen nachgebaute Daten; drei Fehler (Impressionen, Datumsschrift, Studio-Beschriftung) fielen erst im Echtsystem-Test auf. Echte Inhalte und echte Nutzer finden Dinge, die Testdaten nicht abbilden – deshalb vor dem Go-Live ein kurzer Durchlauf mit dem Verein.

---
Teil der [technischen Dokumentation](README.md) · Stand: 11.10.2026
