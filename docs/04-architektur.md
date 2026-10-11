# Architektur

Die Website ist eine Sammlung statischer Dateien; Inhalte holt sie beim Aufruf direkt aus Sanity. Es gibt keinen Server und keinen Build-Schritt.

```mermaid
flowchart LR
  B["Besucher:in<br/>(Browser, meist Handy)"] -->|lädt Seiten| W["Website<br/>statische Dateien in site/<br/>(später Netlify)"]
  W -->|GROQ-Abfrage, nur lesen| C["Sanity API-CDN<br/>apicdn.sanity.io"]
  W -->|Bilder| I["Sanity Bild-CDN<br/>cdn.sanity.io"]
  R["Redaktion des Vereins"] -->|Login| S["Sanity Studio<br/>studio/"]
  S -->|schreibt, veröffentlicht| D[("Sanity Dataset<br/>production")]
  D --> C
  D --> I
  B -->|Anmeldeformular| F["Netlify Forms<br/>→ E-Mail an den Verein"]
```

Die Website liest nur, sie hat keinen Schlüssel und kann nichts verändern. Geschrieben wird ausschließlich im Studio mit persönlichem Login.

| Baustein | Dateien | Aufgabe |
| --- | --- | --- |
| Seiten | `site/*.html` (10) | Gerüst, feste Texte, Vorbelegung (z. B. 10 Module) |
| Gemeinsames Script | `assets/js/sanity.js`, `common.js` | Abfragen, Maskierung, Bild-URLs, Rich-Text, Menü, Datumsformat, Vereins- und Akademiedaten |
| Seiten-Scripts | `assets/js/page-*.js`, `projekt-karte.js` | je Seite die Abfrage und Darstellung |
| Gestaltung | `assets/css/style.css`, `assets/fonts/` | Design-Variablen, Schriftskala, Komponenten, lokale Schriften |
| Redaktion | `studio/schemaTypes/`, `structure.js`, `sanity.config.js` | Inhaltstypen, Menü, Rechte für Einzeldokumente |
| Werkzeuge | `tools/sync_partials.py` | Kopf/Menü/Fußzeile, Module-Vorbelegung, Sitemap |
| Tests | `tests/` | Testserver wie Netlify, Mock-Sanity, Testdaten, Testlauf |

---
Teil der [technischen Dokumentation](README.md) · Stand: 11.10.2026
