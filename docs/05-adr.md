# Architekturentscheidungen (ADRs)

Leitlinie aller Entscheidungen: Der Verein muss die Website ohne Roman betreiben können. Einfachheit und Robustheit gehen vor Eleganz.

| ADR | Entscheidung | Kontext / Gründe | Konsequenzen |
| --- | --- | --- | --- |
| ADR-01 | **Sanity statt Decap** als Redaktionssystem | Decap speichert jede Änderung als Git-Commit und löst einen Netlify-Build aus; das hat das Netlify-Freikontingent aufgebraucht. Sanity speichert in der Cloud, Änderungen sind ohne Build sofort sichtbar, Oberfläche ist für Laien verständlicher. | Kein Build pro Inhaltsänderung. Abhängigkeit von Sanity (Free-Plan). Website lädt Inhalte per JavaScript nach. |
| ADR-02 | **Statisches HTML/CSS/JS ohne Framework und ohne Build-Schritt** | Geringste Wartung, läuft auf jedem Hoster, keine Abhängigkeiten, die veralten. | Kopf und Fußzeile werden per Skript (`tools/sync_partials.py`) in alle Seiten eingetragen, nicht zur Laufzeit. |
| ADR-03 | **Inhalte im Browser aus Sanity laden** (Client-Rendering) | Kein Build nötig, Änderungen sofort sichtbar. | Ohne JavaScript nur statische Texte; Suchmaschinen sehen dynamische Inhalte eingeschränkt. Darum stehen Kernaussagen und Akademie-Module zusätzlich fest im HTML. |
| ADR-04 | **Sanity API-CDN (`apicdn`)** statt direkter API | Schneller, schont das Anfragekontingent; Sanity leert den Cache bei jeder Veröffentlichung. | Änderungen erscheinen nach wenigen Sekunden. |
| ADR-05 | **Projekt-Detailseite über `projekt.html?slug=…`** statt hübscher Pfade | Hübsche Pfade (`/unsere-projekte/xyz`) brauchen Server-Umschreibungen und brachen lokal (404 beim Klick auf „Mehr erfahren“). | Funktioniert auf jedem Server identisch. Alte Jimdo-Pfade werden per `_redirects` weitergeleitet. |
| ADR-06 | **Einzeldokumente mit Vorbelegung + Fallback im HTML** (Akademie, Seitenbilder, Verein) | Eckdaten und Module waren fest im Code und für den Verein nicht änderbar. | Feste IDs, kein Löschen/Duplizieren im Studio. Solange nicht veröffentlicht, zeigt die Website den eingebauten Stand – nie eine leere Seite. |
| ADR-07 | **Vergangene Termine automatisch ausblenden** (Enddatum oder Datum vor heute) | Verein soll alte Termine nicht löschen müssen; Besucher sollen nur Gültiges sehen. | Studio trennt „Kommende“ und „Vergangene Termine“. |
| ADR-08 | **Schriften lokal statt Google Fonts**, keine Cookies, kein Tracking | DSGVO: Einbindung von Google Fonts überträgt IP-Adressen (LG München 2022). | Kein Cookie-Banner nötig. Datenschutzerklärung entsprechend schlank. |
| ADR-09 | **Netlify als späteres Hosting** inkl. Netlify Forms | Bestehender Account, Formular ohne eigenen Server, `_redirects` und Header-Konfiguration. Ohne Inhalts-Builds bleibt der Verbrauch minimal. | Formular funktioniert nur auf Netlify. Wechsel zu anderem Hoster erfordert anderen Formulardienst. |
| ADR-10 | **Strenge Content-Security-Policy**, alle Skripte als Dateien | Schutz gegen eingeschleuste Skripte; alle CMS-Texte werden zusätzlich maskiert. | Neue externe Dienste müssen in `netlify.toml` freigegeben werden. |
| ADR-11 | **Testdaten + Mock-Sanity mit echter GROQ-Auswertung** (`groq-js`) | Die echte API ist aus der Entwicklungsumgebung nicht immer erreichbar; Tests sollen reproduzierbar sein. | Abfragen werden wie bei Sanity ausgewertet; Echtsystem-Test zusätzlich manuell. |

---
Teil der [technischen Dokumentation](README.md) · Stand: 11.10.2026
