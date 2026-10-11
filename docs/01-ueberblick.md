# Überblick

Die neue Website von Erzählkunst Bayern e.V. ist technisch bereit zur Veröffentlichung, läuft aber bewusst nur lokal; online geht sie erst nach Freigabe durch Roman. Inhalte pflegt der Verein ohne Technikkenntnisse im Sanity Studio, die Website zeigt Änderungen sofort an.

| Bereich | Stand |
| --- | --- |
| Website (`site/`) | 8 Seiten + Projekt-Detailseite + 404-Seite, responsiv, barrierearm |
| Redaktionssystem (`studio/`) | 6 Inhaltstypen, deutsche Oberfläche, Prüfregeln, vorausgefüllte Akademie-Daten |
| Automatische Tests (`tests/`) | 55 Prüfungen, alle bestanden (Stand 10.10.2026) |
| Code-Verwaltung | Repo `RomanKemme/ErzaehlkunstBayern`, Branch `uiux-test` (aufbauend auf `sanity`); `main` = bisherige Decap-Version, unverändert |
| Veröffentlichung | Nicht erfolgt. Vorbereitet für Netlify (`netlify.toml`), wartet auf Romans Go |

Vor dem Go-Live fehlen nur Angaben, die der Verein liefern muss: Impressumsdaten (Anschrift, Vorstand, Vereinsregister), eine Kontakt-E-Mail und die Prüfung der Datenschutzerklärung. Details stehen in der Go-Live-Checkliste.

---
Teil der [technischen Dokumentation](README.md) · Stand: 11.10.2026
