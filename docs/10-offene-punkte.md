# Offene Punkte, Risiken und Grenzen

Vor dem Go-Live müssen drei Inhalte vom Verein kommen; technisch blockiert nichts.

| Punkt | Art | Wer | Folge, wenn offen |
| --- | --- | --- | --- |
| Impressum und Datenschutz prüfen und im Studio eintragen | Blockierend | Vorstand | Abmahnrisiko; Seiten zeigen gelbe Vorlage-Hinweise |
| Testeinträge löschen („TEST – …“, „Mein Projekt“) | Blockierend | Roman | Testinhalte öffentlich sichtbar |
| Fotos für Impressionen und Team | Empfohlen | Verein | Textkacheln statt Fotos, Initialen statt Porträts |
| Netlify-Forms nach Deploy einmal mit echter Anmeldung testen | Blockierend beim Deploy | Roman | Anmeldungen könnten verloren gehen |
| CORS-Freigabe für die echte Domain in Sanity | Beim Deploy | Roman | Studio unter eigener Adresse kann nicht speichern |
| Projekttitel „Abgeschlossen: …“ kürzen | Kosmetisch | Verein | Doppelte Information auf der Karte |

Grenzen der Lösung:

- Die Website lädt Inhalte im Browser; ohne JavaScript erscheinen nur die fest eingebauten Texte, keine Termine.
- Sanity-CDN cacht bis zu etwa einer Minute: Neue Termine erscheinen nicht sekundengenau.
- Kostenlose Kontingente (Sanity Free, Netlify Free) reichen für einen Verein dieser Größe; bei starkem Wachstum prüfen.
- Anmeldungen landen als E-Mail bzw. in Netlify; es gibt keine Teilnehmerverwaltung oder Platzzählung – „Ausgebucht“ setzt der Verein von Hand.

---
Teil der [technischen Dokumentation](README.md) · Stand: 10.10.2026
