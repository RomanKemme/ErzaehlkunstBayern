# Go-Live-Checkliste

Drei Punkte blockieren die Veröffentlichung, alle drei liegen beim Verein; der Rest sind technische Handgriffe für Roman (ca. 1–2 Stunden).

**Blockierend (Verein)**

- [ ] Impressum im Studio unter „Verein & Rechtliches“ eintragen: Anschrift, vertretungsberechtigter Vorstand, Registergericht und -nummer, Kontakt
- [ ] Datenschutzerklärung prüfen lassen (Vorlage beschreibt die Technik, ersetzt keine Rechtsberatung) und im Studio veröffentlichen
- [ ] Kontakt-E-Mail im Studio eintragen

**Technisch (Roman)**

- [ ] In `netlify.toml` die Zeile `X-Robots-Tag = "noindex, nofollow"` (Vorschau-Phase) löschen
- [ ] `studio`: `npm install` (neue Pakete: deutsche Oberfläche, Icons), dann `npm run dev` prüfen
- [ ] Im Studio „Akademie“, „Seitenbilder“ und „Verein & Rechtliches“ öffnen und einmal veröffentlichen
- [ ] Branch `uiux-test` → `sanity` → `main` zusammenführen (Pull Request auf GitHub)
- [ ] Netlify: Site auf `main` mit `netlify.toml` (Veröffentlichungsordner `site`) – erst nach Go
- [ ] Netlify Forms: E-Mail-Benachrichtigung für Formular „anmeldung“ an die Vereinsadresse einrichten
- [ ] Sanity → API → CORS origins: die echte Domain und die Netlify-Adresse hinzufügen (ohne Credentials); `localhost`-Einträge dürfen bleiben
- [ ] Studio veröffentlichen: `npx sanity deploy` → Adresse `<name>.sanity.studio` an den Verein geben
- [ ] Vereinsmitglieder in Sanity einladen (sanity.io/manage → Members, Rolle „Editor“)
- [ ] Domain auf Netlify umstellen (DNS) – alte Jimdo-Adressen werden per `_redirects` weitergeleitet
- [ ] `SITE_URL` in `tools/sync_partials.py` prüfen, Skript ausführen (Sitemap)
- [ ] Nach dem Go-Live: Testanmeldung über das Formular, Weiterleitungen der alten Adressen stichprobenartig prüfen

**Danach aufräumen:** alte Decap-Reste (Netlify Identity, Git Gateway) in Netlify deaktivieren.

---
Teil der [technischen Dokumentation](README.md) · Stand: 11.10.2026
