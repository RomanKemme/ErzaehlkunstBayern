# Betrieb & Wartung

Im Alltag braucht die Website keine Technik: Der Verein pflegt im Studio, die Website zeigt es sofort. Entwicklungsarbeit fällt nur bei Layout- oder Strukturänderungen an.

**Lokal entwickeln**

1. Website: im Ordner `site` → `python -m http.server 8080` → http://localhost:8080 (die Adresse muss in Sanity unter CORS freigegeben sein)
2. Studio: im Ordner `studio` → `npm install` (einmalig) → `npm run dev` → http://localhost:3333
3. Menü, Fußzeile oder vorinstallierte Module geändert → `python tools/sync_partials.py`
4. Vor jedem Commit: `python tests/make_fixtures.py` und `python tests/run_tests.py` (alle Prüfungen müssen bestehen)

**Wo ändere ich was?**

| Änderung | Datei |
| --- | --- |
| Farben, Schrift, Abstände | `site/assets/css/style.css` (Variablen oben in `:root`) |
| Menü, Fußzeile | `tools/sync_partials.py`, danach Skript ausführen |
| Texte, die nicht im CMS sind | die jeweilige `site/*.html` |
| Logik einer Seite | `site/assets/js/page-*.js` |
| Neues Feld im CMS | `studio/schemaTypes/*.js` + Abfrage in der passenden `page-*.js` |
| Weiterleitungen, Sicherheits-Header | `site/_redirects`, `netlify.toml` |

**Kosten und Grenzen (Stand Oktober 2026)**

- Sanity Free: 20 Nutzerplätze, 10.000 Dokumente, 1 Mio. CDN-Anfragen und 250.000 direkte API-Anfragen pro Monat, 100 GB Speicher und Datenvolumen ([Preise](https://www.sanity.io/pricing)). Die Website nutzt das CDN; bei harten Grenzen sperrt Sanity den öffentlichen Zugriff bis Monatsende, das Studio funktioniert weiter, Warnmails kommen bei 80 % ([Kontingente](https://www.sanity.io/docs/help/understanding-quotas)).
- Eine Seitenansicht erzeugt 1–4 CDN-Anfragen; selbst 50.000 Seitenaufrufe im Monat bleiben deutlich unter dem Kontingent.
- Netlify: ohne Build-Schritt und ohne Inhalts-Builds fällt Verbrauch fast nur beim Ausliefern an. Konkrete Netlify-Konditionen vor dem Go-Live im Account prüfen.

---
Teil der [technischen Dokumentation](README.md) · Stand: 10.10.2026
