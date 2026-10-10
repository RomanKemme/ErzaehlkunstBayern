# Use Cases

Zehn Anwendungsfälle decken den Kern ab; die Akzeptanzkriterien sind die Grundlage der automatischen Tests (Kapitel Qualitätssicherung).

| ID | Akteur | Anwendungsfall | Ablauf (Kurzform) | Akzeptanzkriterien |
| --- | --- | --- | --- | --- |
| UC-01 | Sabine | Schnupper-Workshop finden und anmelden | Startseite → „Offene Termine ansehen“ oder Akademie → „Noch unsicher?“ → „Schnupper-Platz sichern“ → Formular | Nächster freier Schnupper-Termin ist im Formular vorausgewählt; Preis sichtbar; max. 3 Pflichtfelder |
| UC-02 | Markus | Grundausbildung prüfen | Akademie → Eckdaten-Kacheln → Module aufklappen → Konditionen | Alle 10 Module mit Zeitraum, Dozentin, Inhalt; Kosten, Kurszeiten, Teilnehmerzahl auf einen Blick |
| UC-03 | Ingrid | Nächsten Montagsclub anmelden | Termine → Filter „Offene Treffs“ → „Anmelden“ an der Karte | Nur kommende Termine; genau der gewählte Termin ist vorausgewählt (nicht der erste mit gleichem Titel); Filter bleibt in der Adresse |
| UC-04 | Alle | Ausgebuchter Termin | Terminkarte zeigt „Ausgebucht“ | Kein Anmeldelink; Termin fehlt im Formular; Direktlink erklärt Warteliste |
| UC-05 | Alle | Projekt ansehen | Projekte → Karte antippen → Detailseite | Jede Karte öffnet eine funktionierende Seite; unbekanntes Projekt zeigt freundliche Meldung mit Rückweg |
| UC-06 | Alle | Team kennenlernen | Über uns → Play | Audiodatei aus dem CMS oder Sprachausgabe des Geräts; ohne Text kein Play-Knopf |
| UC-07 | Gabi | Termin anlegen | Studio → Termine → Kommende Termine → Neu → Pflichtfelder → Veröffentlichen | Erscheint sofort auf Termine, Startseite (wenn unter den nächsten 3) und im Formular; verschwindet nach dem Termin automatisch |
| UC-08 | Gabi | Projekt anlegen | Studio → Projekte → Bereich wählen → Neu → Titel, Adresse erzeugen, Kurzbeschreibung → Veröffentlichen | Karte im gewählten Bereich, Detailseite erreichbar; ohne Adresse kann nicht veröffentlicht werden |
| UC-09 | Gabi | Neuen Ausbildungsjahrgang einpflegen | Studio → Akademie → Jahrgang, Start, Kosten, Module ändern → Veröffentlichen | Alle Stellen auf Startseite und Akademie-Seite zeigen die neuen Angaben |
| UC-10 | Gabi | Impressum/Datenschutz pflegen | Studio → Verein & Rechtliches → Texte → Veröffentlichen | Ersetzt die Vorlage auf der Website vollständig |

Ausnahmefälle für alle Use Cases: Sanity nicht erreichbar → verständliche Meldung statt endloser Ladeanzeige; leeres CMS → Hinweistexte statt leerer Flächen.

---
Teil der [technischen Dokumentation](README.md) · Stand: 10.10.2026
